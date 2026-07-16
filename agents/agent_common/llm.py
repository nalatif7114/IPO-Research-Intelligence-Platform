from __future__ import annotations
import abc
from typing import TypeVar, Type, Any, Literal
import os
import asyncio
import json
import re
import time
from pydantic import BaseModel, SecretStr, ValidationError
import structlog
from langchain_core.messages import BaseMessage

logger = structlog.stdlib.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)

class BaseLLMProvider(abc.ABC):
    """Abstract interface for LLM Reasoning generation."""
    
    @property
    @abc.abstractmethod
    def provider_name(self) -> str:
        """Name of the provider (e.g. GeminiProvider, OllamaProvider)."""
        pass

    @property
    @abc.abstractmethod
    def model_name(self) -> str:
        """Name of the underlying model."""
        pass
        
    @abc.abstractmethod
    def invoke(self, messages: list[BaseMessage] | str) -> Any:
        """Synchronous invocation."""
        pass

    @abc.abstractmethod
    async def ainvoke(self, messages: list[BaseMessage] | str) -> Any:
        """Asynchronous invocation."""
        pass

    @abc.abstractmethod
    async def structured_output(self, prompt: str, schema: Type[T]) -> T:
        """Generate structured output adhering to a specific Pydantic schema."""
        pass
        
    @abc.abstractmethod
    async def chat(self, prompt: str) -> str:
        """Generate unstructured text / chat response."""
        pass

    @abc.abstractmethod
    async def embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for given texts."""
        pass

class MockLLMProvider(BaseLLMProvider):
    """Mock implementation returning deterministic outputs for verification."""
    
    @property
    def provider_name(self) -> str:
        return "MockLLMProvider"

    @property
    def model_name(self) -> str:
        return "mock-model"

    def invoke(self, messages: list[BaseMessage] | str) -> Any:
        from langchain_core.messages import AIMessage
        return AIMessage(content="Mocked synchronous response.")

    async def ainvoke(self, messages: list[BaseMessage] | str) -> Any:
        from langchain_core.messages import AIMessage
        return AIMessage(content="Mocked asynchronous response.")

    def _generate_dummy_data(self, schema_cls: Type[BaseModel]) -> dict[str, Any]:
        dummy_data: dict[str, Any] = {}
        for field_name, field_info in schema_cls.model_fields.items():
            field_type = field_info.annotation
            
            from typing import get_origin, get_args
            
            origin = get_origin(field_type)
            args = get_args(field_type)
            
            # Helper to check if type is a subclass of BaseModel
            def is_model(t: Any) -> bool:
                return isinstance(t, type) and issubclass(t, BaseModel)
                
            # If the field itself is a BaseModel
            if is_model(field_type):
                from typing import cast
                model_type = cast(Type[BaseModel], field_type)
                dummy_data[field_name] = model_type(**self._generate_dummy_data(model_type))
            elif origin is Literal or field_type is Literal: # type: ignore
                dummy_data[field_name] = args[0] if args else None
            elif origin is list:
                inner_type = args[0] if args else str
                if is_model(inner_type):
                    from typing import cast
                    model_type = cast(Type[BaseModel], inner_type)
                    dummy_data[field_name] = [model_type(**self._generate_dummy_data(model_type))]
                else:
                    dummy_data[field_name] = [f"Mocked item {inner_type}"]
            elif field_type == str or origin is str:
                dummy_data[field_name] = f"Mocked {field_name} content."
            elif field_type == int or origin is int:
                dummy_data[field_name] = 42
            elif field_type == float or origin is float:
                dummy_data[field_name] = 0.85
            elif field_type == bool or origin is bool:
                dummy_data[field_name] = True
            else:
                dummy_data[field_name] = None
                
        return dummy_data

    async def structured_output(self, prompt: str, schema: Type[T]) -> T:
        """Return a mock instance of the requested schema."""
        return schema(**self._generate_dummy_data(schema))
        
    async def chat(self, prompt: str) -> str:
        return "This is a mocked LLM text response based on the provided context."

    async def embeddings(self, texts: list[str]) -> list[list[float]]:
        return [[0.0] * 768 for _ in texts]

# Global semaphore set to 1 to ensure strictly sequential Gemini API requests
_gemini_semaphore = asyncio.Semaphore(1)

FALLBACK_MODELS = [
    os.environ.get("DEFAULT_LLM_MODEL", "gemini-1.5-pro"),
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

class GeminiProvider(BaseLLMProvider):
    """Production-grade Gemini implementation with rate limit retries, model fallbacks, and single concurrency lock."""
    
    def __init__(
        self, 
        model_name: str | None = None,
        temperature: float = 0.1,
        top_p: float = 0.95,
        max_output_tokens: int = 8192,
        timeout_seconds: int = 120
    ) -> None:
        api_key_env = os.environ.get("GEMINI_API_KEY")
        self.timeout_seconds = timeout_seconds
        self.temperature = temperature
        self.top_p = top_p
        self.max_output_tokens = max_output_tokens
        self._provider_name = "GeminiProvider"
        
        base_model = model_name or os.environ.get("DEFAULT_LLM_MODEL", "gemini-1.5-pro")
        self.candidate_models: list[str] = []
        for m in [base_model] + FALLBACK_MODELS:
            if m and m not in self.candidate_models:
                self.candidate_models.append(m)
                
        self.current_model: str = base_model
        
        if not api_key_env or api_key_env == "mock" or api_key_env.startswith("YOUR_"):
            logger.warning("GEMINI_API_KEY environment variable missing or placeholder. GeminiProvider will reject requests.")
            self.api_key: SecretStr | None = None
            self.llm: Any = None
        else:
            self.api_key = SecretStr(api_key_env)
            self._init_llm(self.candidate_models[0])

    @property
    def provider_name(self) -> str:
        return self._provider_name

    @property
    def model_name(self) -> str:
        return self.current_model

    def _init_llm(self, model: str) -> None:
        from langchain_google_genai import ChatGoogleGenerativeAI
        self.current_model = model
        self.llm = ChatGoogleGenerativeAI(
            model=model,
            api_key=self.api_key,
            temperature=self.temperature,
            top_p=self.top_p,
            max_output_tokens=self.max_output_tokens,
            max_retries=0
        )

    def invoke(self, messages: list[BaseMessage] | str) -> Any:
        if not self.llm:
            raise Exception("Gemini API key is missing or invalid.")
        return self.llm.invoke(messages)

    async def ainvoke(self, messages: list[BaseMessage] | str) -> Any:
        if not self.llm:
            raise Exception("Gemini API key is missing or invalid.")
        return await self.llm.ainvoke(messages)

    def _extract_retry_delay(self, error_msg: str) -> float:
        match = re.search(r"Please retry in (\d+(?:\.\d+)?)s", error_msg, re.IGNORECASE)
        if match:
            return float(match.group(1)) + 1.0
        return 15.0

    async def _execute_with_resilience(self, func_type: str, prompt: str, schema: Type[T] | None = None) -> Any:
        if not self.llm:
            raise Exception("Gemini API key is missing or invalid.")
            
        max_attempts = 6
        model_idx = 0

        async with _gemini_semaphore:
            for attempt in range(1, max_attempts + 1):
                try:
                    current_model = self.candidate_models[model_idx]
                    if self.current_model != current_model:
                        self._init_llm(current_model)
                        
                    logger.info("gemini_call_start", model=current_model, attempt=attempt, func=func_type)
                    
                    if func_type == "structured":
                        if schema is None:
                            raise ValueError("Schema must be provided for structured output")
                        structured_llm = self.llm.with_structured_output(schema)
                        result = await asyncio.wait_for(structured_llm.ainvoke(prompt), timeout=self.timeout_seconds)
                    else:
                        res = await asyncio.wait_for(self.llm.ainvoke(prompt), timeout=self.timeout_seconds)
                        result = getattr(res, "content", str(res))

                    logger.info("gemini_call_success", model=current_model, func=func_type)
                    return result

                except Exception as e:
                    err_str = str(e)
                    logger.warning("gemini_call_warning", error=err_str, model=self.current_model, attempt=attempt)
                    
                    if "404" in err_str or "not found" in err_str.lower():
                        if model_idx + 1 < len(self.candidate_models):
                            model_idx += 1
                            next_model = self.candidate_models[model_idx]
                            logger.info("gemini_fallback_trigger", from_model=current_model, to_model=next_model)
                            continue

                    if "429" in err_str or "Quota exceeded" in err_str or "ResourceExhausted" in err_str:
                        delay = self._extract_retry_delay(err_str)
                        logger.info("gemini_rate_limit_backoff", sleep_seconds=delay, attempt=attempt)
                        await asyncio.sleep(delay)
                        continue

                    if attempt == max_attempts:
                        logger.error("gemini_call_failed_all_retries", error=err_str)
                        raise
                    
                    await asyncio.sleep(2 ** attempt)

    async def structured_output(self, prompt: str, schema: Type[T]) -> T:
        try:
            from typing import cast
            return cast(T, await self._execute_with_resilience("structured", prompt, schema))
        except Exception:
            # A schema-valid mock is indistinguishable from real analysis once it
            # reaches persistence.  Preserve the original failure instead.
            logger.exception(
                "gemini_provider_structured_failed",
                model=self.current_model,
                schema=schema.__name__,
            )
            raise

    async def chat(self, prompt: str) -> str:
        try:
            from typing import cast
            return cast(str, await self._execute_with_resilience("text", prompt))
        except Exception:
            logger.exception("gemini_provider_text_failed", model=self.current_model)
            raise

    async def embeddings(self, texts: list[str]) -> list[list[float]]:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        from typing import cast
        embeddings_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001", api_key=self.api_key)
        return cast(list[list[float]], await embeddings_model.aembed_documents(texts))


class OllamaProvider(BaseLLMProvider):
    """Production-grade Ollama implementation with retries, timeout, and structured output support."""
    
    def __init__(
        self,
        model: str = "qwen3:8b",
        base_url: str = "http://host.docker.internal:11434",
        temperature: float = 0.1,
        timeout_seconds: int = 600
    ) -> None:
        self._model_name = model
        self.base_url = base_url
        self.temperature = temperature
        self.timeout_seconds = timeout_seconds
        self._provider_name = "OllamaProvider"
        
        from langchain_ollama import ChatOllama
        self.llm: Any = ChatOllama(
            model=model,
            base_url=base_url,
            temperature=temperature
        )

    @property
    def provider_name(self) -> str:
        return self._provider_name

    @property
    def model_name(self) -> str:
        return self._model_name

    def invoke(self, messages: list[BaseMessage] | str) -> Any:
        return self.llm.invoke(messages)

    async def ainvoke(self, messages: list[BaseMessage] | str) -> Any:
        return await self.llm.ainvoke(messages)

    @staticmethod
    def _raw_response_for_logging(raw_response: Any) -> str | None:
        """Return a complete, stable representation of an Ollama response."""
        return repr(raw_response) if raw_response is not None else None

    @staticmethod
    def _extract_json_payload(raw_response: Any) -> str | None:
        """Extract JSON from content or tool-call arguments without changing data."""
        content = getattr(raw_response, "content", None)
        if isinstance(content, str) and content.strip():
            return content.strip()

        additional_kwargs = getattr(raw_response, "additional_kwargs", {}) or {}
        tool_calls = additional_kwargs.get("tool_calls", [])
        if tool_calls:
            function = tool_calls[0].get("function", {})
            arguments = function.get("arguments")
            if isinstance(arguments, str) and arguments.strip():
                return arguments.strip()
        return None

    @staticmethod
    def _validation_error_for_json(schema: Type[T], error: Exception) -> ValidationError:
        """Represent an unparseable provider payload as a Pydantic validation error."""
        return ValidationError.from_exception_data(
            schema.__name__,
            [{
                "type": "json_invalid",
                "loc": (),
                "input": None,
                "ctx": {"error": repr(error)},
            }],
        )

    @staticmethod
    def _repair_json_once(raw_json: str) -> dict[str, Any] | list[Any] | None:
        """Conservatively repair JSON syntax once; never infer or add values."""
        candidate = raw_json.strip()
        if candidate.startswith("```") and candidate.endswith("```"):
            candidate = re.sub(r"^```(?:json)?\s*|\s*```$", "", candidate, flags=re.IGNORECASE)
        candidate = re.sub(r",(\s*[}\]])", r"\1", candidate)
        try:
            repaired = json.loads(candidate)
        except json.JSONDecodeError:
            return None
        return repaired if isinstance(repaired, (dict, list)) else None

    @staticmethod
    def _is_retryable_transport_error(error: Exception) -> bool:
        """Only transport failures are eligible for an additional Ollama call."""
        try:
            import httpx
            transport_errors = (asyncio.TimeoutError, TimeoutError, ConnectionError, OSError, httpx.TimeoutException, httpx.ConnectError)
        except ImportError:
            transport_errors = (asyncio.TimeoutError, TimeoutError, ConnectionError, OSError)
        return isinstance(error, transport_errors)

    def _log_structured_failure(
        self,
        *,
        error: Exception,
        attempt: int,
        raw_response: Any = None,
        validation_errors: list[dict[str, Any]] | None = None,
        retrying: bool,
    ) -> None:
        logger.error(
            "ollama_structured_output_failed",
            model=self._model_name,
            attempt=attempt,
            exception_type=type(error).__name__,
            exception_repr=repr(error),
            raw_ollama_response=self._raw_response_for_logging(raw_response),
            validation_errors=validation_errors,
            retrying=retrying,
            exc_info=(type(error), error, error.__traceback__),
        )

    @staticmethod
    def _ollama_usage(raw_response: Any) -> dict[str, Any]:
        """Extract Ollama token and duration metadata without interpreting output."""
        metadata = getattr(raw_response, "response_metadata", {}) or {}
        usage = metadata.get("token_usage", {}) or getattr(raw_response, "usage_metadata", {}) or {}
        return {
            "prompt_tokens": usage.get("prompt_tokens", metadata.get("prompt_eval_count")),
            "completion_tokens": usage.get("completion_tokens", metadata.get("eval_count")),
            "ollama_total_duration_ns": metadata.get("total_duration"),
            "ollama_eval_duration_ns": metadata.get("eval_duration"),
        }

    async def _execute_with_resilience(self, func_type: str, prompt: str, schema: Type[T] | None = None) -> Any:
        max_attempts = 3
        
        for attempt in range(1, max_attempts + 1):
            try:
                call_started = time.perf_counter()
                logger.info("ollama_call_start", model=self._model_name, attempt=attempt, func=func_type)
                
                if func_type == "structured":
                    if schema is None:
                        raise ValueError("Schema must be provided for structured output")
                    structured_llm = self.llm.with_structured_output(schema, include_raw=True)
                    envelope = await asyncio.wait_for(structured_llm.ainvoke(prompt), timeout=self.timeout_seconds)
                    raw_response = envelope["raw"]
                    parsing_error = envelope["parsing_error"]
                    if parsing_error is None:
                        try:
                            result = schema.model_validate(envelope["parsed"])
                        except ValidationError as validation_error:
                            self._log_structured_failure(
                                error=validation_error,
                                attempt=attempt,
                                raw_response=raw_response,
                                validation_errors=validation_error.errors(),
                                retrying=False,
                            )
                            raise
                    else:
                        raw_json = self._extract_json_payload(raw_response)
                        if raw_json is None:
                            validation_error = self._validation_error_for_json(schema, parsing_error)
                            self._log_structured_failure(
                                error=parsing_error,
                                attempt=attempt,
                                raw_response=raw_response,
                                validation_errors=validation_error.errors(),
                                retrying=False,
                            )
                            raise validation_error from parsing_error

                        repaired_json = self._repair_json_once(raw_json)
                        if repaired_json is not None:
                            try:
                                result = schema.model_validate(repaired_json)
                                logger.info("ollama_json_repair_succeeded", model=self._model_name, attempt=attempt)
                            except ValidationError as validation_error:
                                self._log_structured_failure(
                                    error=validation_error,
                                    attempt=attempt,
                                    raw_response=raw_response,
                                    validation_errors=validation_error.errors(),
                                    retrying=False,
                                )
                                raise
                        else:
                            validation_error = self._validation_error_for_json(schema, parsing_error)
                            retrying = attempt < max_attempts
                            self._log_structured_failure(
                                error=parsing_error,
                                attempt=attempt,
                                raw_response=raw_response,
                                validation_errors=validation_error.errors(),
                                retrying=retrying,
                            )
                            if not retrying:
                                raise validation_error from parsing_error
                            await asyncio.sleep(2 ** attempt)
                            continue
                else:
                    res = await asyncio.wait_for(self.llm.ainvoke(prompt), timeout=self.timeout_seconds)
                    result = getattr(res, "content", str(res))

                raw_for_metrics = raw_response if func_type == "structured" else res
                logger.info(
                    "ollama_call_success",
                    model=self._model_name,
                    func=func_type,
                    ollama_latency_seconds=round(time.perf_counter() - call_started, 6),
                    **self._ollama_usage(raw_for_metrics),
                )
                return result

            except Exception as error:
                if isinstance(error, ValidationError):
                    # Validation paths above already include the raw model response.
                    raise
                retrying = self._is_retryable_transport_error(error) and attempt < max_attempts
                if func_type == "structured":
                    validation_errors = error.errors() if isinstance(error, ValidationError) else None
                    self._log_structured_failure(
                        error=error,
                        attempt=attempt,
                        validation_errors=validation_errors,
                        retrying=retrying,
                    )
                else:
                    logger.error(
                        "ollama_call_failed",
                        model=self._model_name,
                        attempt=attempt,
                        exception_type=type(error).__name__,
                        exception_repr=repr(error),
                        retrying=retrying,
                        exc_info=(type(error), error, error.__traceback__),
                    )

                if not retrying:
                    raise
                await asyncio.sleep(2 ** attempt)

    async def structured_output(self, prompt: str, schema: Type[T]) -> T:
        try:
            from typing import cast
            return cast(T, await self._execute_with_resilience("structured", prompt, schema))
        except Exception:
            # Parsing and Pydantic validation errors must fail the job.  Falling
            # back to MockLLMProvider would persist fabricated financial data.
            logger.exception(
                "ollama_provider_structured_failed",
                model=self._model_name,
                schema=schema.__name__,
            )
            raise

    async def chat(self, prompt: str) -> str:
        try:
            from typing import cast
            return cast(str, await self._execute_with_resilience("text", prompt))
        except Exception:
            logger.exception("ollama_provider_text_failed", model=self._model_name)
            raise

    async def embeddings(self, texts: list[str]) -> list[list[float]]:
        from langchain_ollama import OllamaEmbeddings
        from typing import cast
        embeddings_model = OllamaEmbeddings(model=self._model_name, base_url=self.base_url)
        return cast(list[list[float]], await embeddings_model.aembed_documents(texts))
