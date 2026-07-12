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

# Global semaphore to limit Gemini API concurrency (e.g., 2 max parallel requests for free tier)
_gemini_semaphore = asyncio.Semaphore(2)

class GeminiProvider(LLMProvider):
    """Production-ready Gemini implementation with retries and structured output."""
    
    def __init__(
        self, 
        model_name: str = os.environ.get("DEFAULT_LLM_MODEL", "gemini-1.5-pro"),
        temperature: float = 0.1,
        top_p: float = 0.95,
        max_output_tokens: int = 8192,
        timeout_seconds: int = 120
    ):
        api_key = os.environ.get("GEMINI_API_KEY")
        self.timeout_seconds = timeout_seconds
        if not api_key:
            logger.warning("GEMINI_API_KEY environment variable not set. GeminiProvider will fail if executed.")
            self.llm = None
        else:
            self.llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key,
                temperature=temperature,
                top_p=top_p,
                max_output_tokens=max_output_tokens,
                max_retries=0  # Handled by tenacity
            )

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, min=5, max=30))
    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        if not self.llm:
            raise Exception("Cannot generate structured output: GEMINI_API_KEY is missing.")
        structured_llm = self.llm.with_structured_output(schema)
        
        async def _invoke():
            async with _gemini_semaphore:
                res = await structured_llm.ainvoke(prompt)
                return res
            
        try:
            return await asyncio.wait_for(_invoke(), timeout=self.timeout_seconds)
        except asyncio.TimeoutError:
            logger.error("gemini_provider_timeout", timeout=self.timeout_seconds)
            raise Exception("LLM call timed out.")
        except Exception as e:
            logger.error("gemini_provider_error", error=str(e))
            raise

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, min=5, max=30))
    async def generate_text(self, prompt: str) -> str:
        if not self.llm:
            raise Exception("Cannot generate text: GEMINI_API_KEY is missing.")
            
        async def _invoke():
            async with _gemini_semaphore:
                res = await self.llm.ainvoke(prompt)
                return res.content
            
        try:
            return await asyncio.wait_for(_invoke(), timeout=self.timeout_seconds)
        except asyncio.TimeoutError:
            logger.error("gemini_provider_timeout", timeout=self.timeout_seconds)
            raise Exception("LLM call timed out.")
        except Exception as e:
            logger.error("gemini_provider_error", error=str(e))
            raise
