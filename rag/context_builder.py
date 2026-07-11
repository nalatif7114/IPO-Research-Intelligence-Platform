from __future__ import annotations
import abc
from pydantic import BaseModel

class ContextWindow(BaseModel):
    context_text: str
    chunks_used: list[str]
    total_tokens: int

class ContextBuilder(abc.ABC):
    """Abstract interface for building context windows."""
    
    @abc.abstractmethod
    def build_context(self, chunks: list[dict], token_budget: int) -> ContextWindow:
        pass
