from __future__ import annotations
import abc

class PromptBuilder(abc.ABC):
    """Abstract interface for prompt construction."""
    
    @abc.abstractmethod
    def build_prompt(self, context: str, query: str, system_prompt: str) -> str:
        pass
