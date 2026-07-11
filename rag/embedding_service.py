from __future__ import annotations
import abc

class EmbeddingService(abc.ABC):
    """Abstract interface for embedding generation."""
    
    @abc.abstractmethod
    def embed_text(self, text: str) -> list[float]:
        pass
        
    @abc.abstractmethod
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        pass
