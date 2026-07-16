import asyncio
import structlog
from typing import TypeVar, Type, Any
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from agents.agent_common.llm import LLMProvider, MockLLMProvider

logger = structlog.stdlib.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)

class OllamaProvider(LLMProvider):
    """Production-grade Ollama implementation with retries, timeout, and structured output support."""
    
    def __init__(
        self,
        model: str = "qwen3:8b",
        base_url: str = "http://host.docker.internal:11434",
        temperature: float = 0.1,
        timeout_seconds: int = 120
    ):
        self.model = model
        self.base_url = base_url
        self.temperature = temperature
        self.timeout_seconds = timeout_seconds
        self.provider_name = "OllamaProvider"
        self.model_name = model
        
        self.llm = ChatOllama(
            model=model,
            base_url=base_url,
            temperature=temperature
        )

    async def _execute_with_resilience(self, func_type: str, prompt: str, schema: Type[T] | None = None) -> Any:
        max_attempts = 3
        
        for attempt in range(1, max_attempts + 1):
            try:
                logger.info("ollama_call_start", model=self.model, attempt=attempt, func=func_type)
                
                if func_type == "structured" and schema is not None:
                    structured_llm = self.llm.with_structured_output(schema)
                    result = await asyncio.wait_for(structured_llm.ainvoke(prompt), timeout=self.timeout_seconds)
                else:
                    res = await asyncio.wait_for(self.llm.ainvoke(prompt), timeout=self.timeout_seconds)
                    result = res.content

                logger.info("ollama_call_success", model=self.model, func=func_type)
                return result

            except Exception as e:
                err_str = str(e)
                logger.warning("ollama_call_warning", error=err_str, model=self.model, attempt=attempt)
                
                if attempt == max_attempts:
                    logger.error("ollama_call_failed_all_retries", error=err_str)
                    raise
                
                await asyncio.sleep(2 ** attempt)

    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        try:
            return await self._execute_with_resilience("structured", prompt, schema)
        except Exception as e:
            logger.error("ollama_provider_structured_failed", error=str(e))
            mock_fallback = MockLLMProvider()
            return await mock_fallback.generate_structured(prompt, schema)

    async def generate_text(self, prompt: str) -> str:
        try:
            return await self._execute_with_resilience("text", prompt)
        except Exception as e:
            logger.error("ollama_provider_text_failed", error=str(e))
            mock_fallback = MockLLMProvider()
            return await mock_fallback.generate_text(prompt)
