from __future__ import annotations
import abc
from typing import TypeVar, Type, Any
import os
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
from pydantic import BaseModel
import structlog
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

logger = structlog.stdlib.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)

class LLMProvider(abc.ABC):
    """Abstract interface for LLM Reasoning generation."""
    
    @abc.abstractmethod
    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        """Generate structured output adhering to a specific Pydantic schema."""
        pass
        
    @abc.abstractmethod
    async def generate_text(self, prompt: str) -> str:
        """Generate unstructured text."""
        pass

class MockLLMProvider(LLMProvider):
    """Mock implementation returning deterministic outputs for verification."""
    
    def _generate_dummy_data(self, schema_cls):
        dummy_data = {}
        for field_name, field_info in schema_cls.model_fields.items():
            field_type = field_info.annotation
            
            from typing import get_origin, get_args, Literal
            
            origin = get_origin(field_type)
            args = get_args(field_type)
            
            # Helper to check if type is a subclass of BaseModel
            def is_model(t):
                return isinstance(t, type) and issubclass(t, BaseModel)
                
            # If the field itself is a BaseModel
            if is_model(field_type):
                dummy_data[field_name] = self._generate_dummy_data(field_type)
            elif origin is Literal or field_type is Literal:
                dummy_data[field_name] = args[0] if args else None
            elif origin is list:
                inner_type = args[0] if args else str
                if is_model(inner_type):
                    dummy_data[field_name] = [self._generate_dummy_data(inner_type)]
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
                
        return schema_cls(**dummy_data)

    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        """Return a mock instance of the requested schema."""
        return self._generate_dummy_data(schema)
        
    async def generate_text(self, prompt: str) -> str:
        return "This is a mocked LLM text response based on the provided context."

import asyncio
import os
from typing import TypeVar, Type
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog
from langchain_google_genai import ChatGoogleGenerativeAI

logger = structlog.stdlib.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)

import asyncio
import os
import re
from typing import TypeVar, Type
from pydantic import BaseModel
import structlog
from langchain_google_genai import ChatGoogleGenerativeAI

logger = structlog.stdlib.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)

# Global semaphore set to 1 to ensure strictly sequential Gemini API requests
_gemini_semaphore = asyncio.Semaphore(1)

# Preferred candidate models in order of fallback suitability
FALLBACK_MODELS = [
    os.environ.get("DEFAULT_LLM_MODEL", "gemini-1.5-pro"),
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

class GeminiProvider(LLMProvider):
    """Production-grade Gemini implementation with rate limit retries, model fallbacks, and single concurrency lock."""
    
    def __init__(
        self, 
        model_name: str | None = None,
        temperature: float = 0.1,
        top_p: float = 0.95,
        max_output_tokens: int = 8192,
        timeout_seconds: int = 120
    ):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.timeout_seconds = timeout_seconds
        self.temperature = temperature
        self.top_p = top_p
        self.max_output_tokens = max_output_tokens
        
        # Build prioritized list of model candidates without duplicates
        base_model = model_name or os.environ.get("DEFAULT_LLM_MODEL", "gemini-1.5-pro")
        self.candidate_models = []
        for m in [base_model] + FALLBACK_MODELS:
            if m and m not in self.candidate_models:
                self.candidate_models.append(m)
                
        if not self.api_key or self.api_key == "mock" or self.api_key.startswith("YOUR_"):
            logger.warning("GEMINI_API_KEY environment variable missing or placeholder. GeminiProvider will fall back to mock data.")
            self.llm = None
        else:
            self._init_llm(self.candidate_models[0])

    def _init_llm(self, model: str):
        self.current_model = model
        self.llm = ChatGoogleGenerativeAI(
            model=model,
            google_api_key=self.api_key,
            temperature=self.temperature,
            top_p=self.top_p,
            max_output_tokens=self.max_output_tokens,
            max_retries=0  # Handled explicitly with dynamic sleep and fallback
        )

    def _extract_retry_delay(self, error_msg: str) -> float:
        """Extract recommended retry delay from 429 error message if available."""
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
                    
                    if func_type == "structured" and schema is not None:
                        structured_llm = self.llm.with_structured_output(schema)
                        result = await asyncio.wait_for(structured_llm.ainvoke(prompt), timeout=self.timeout_seconds)
                    else:
                        res = await asyncio.wait_for(self.llm.ainvoke(prompt), timeout=self.timeout_seconds)
                        result = res.content

                    logger.info("gemini_call_success", model=current_model, func=func_type)
                    return result

                except Exception as e:
                    err_str = str(e)
                    logger.warning("gemini_call_warning", error=err_str, model=self.current_model, attempt=attempt)
                    
                    # 1. Handle Model 404 (deprecated / not found) -> fallback to next candidate
                    if "404" in err_str or "not found" in err_str.lower():
                        if model_idx + 1 < len(self.candidate_models):
                            model_idx += 1
                            next_model = self.candidate_models[model_idx]
                            logger.info("gemini_fallback_trigger", from_model=current_model, to_model=next_model)
                            continue

                    # 2. Handle 429 Rate Limit / Quota Exceeded -> parse sleep delay
                    if "429" in err_str or "Quota exceeded" in err_str or "ResourceExhausted" in err_str:
                        delay = self._extract_retry_delay(err_str)
                        logger.info("gemini_rate_limit_backoff", sleep_seconds=delay, attempt=attempt)
                        await asyncio.sleep(delay)
                        continue

                    # 3. Handle general failure or timeout
                    if attempt == max_attempts:
                        logger.error("gemini_call_failed_all_retries", error=err_str)
                        raise
                    
                    # Default exponential wait
                    await asyncio.sleep(2 ** attempt)

    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        try:
            return await self._execute_with_resilience("structured", prompt, schema)
        except Exception as e:
            logger.error("gemini_provider_structured_failed", error=str(e))
            # Graceful degradation: return mock schema payload if Gemini fails completely
            mock_fallback = MockLLMProvider()
            return await mock_fallback.generate_structured(prompt, schema)

    async def generate_text(self, prompt: str) -> str:
        try:
            return await self._execute_with_resilience("text", prompt)
        except Exception as e:
            logger.error("gemini_provider_text_failed", error=str(e))
            mock_fallback = MockLLMProvider()
            return await mock_fallback.generate_text(prompt)

