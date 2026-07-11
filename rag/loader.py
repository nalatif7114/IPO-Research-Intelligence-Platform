from __future__ import annotations
import abc

class DocumentLoader(abc.ABC):
    """Abstract interface for loading documents."""
    
    @abc.abstractmethod
    def load(self, path: str) -> list[dict]:
        pass
        
    @abc.abstractmethod
    def load_batch(self, paths: list[str]) -> list[list[dict]]:
        pass
