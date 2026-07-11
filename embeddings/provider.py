from __future__ import annotations
import abc
import numpy as np

class EmbeddingProvider(abc.ABC):
    """Abstract interface for embedding generation."""
    
    @abc.abstractmethod
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        pass
        
    @abc.abstractmethod
    def embed_query(self, text: str) -> list[float]:
        pass
        
class MockEmbeddingProvider(EmbeddingProvider):
    """Mock implementation returning deterministic dense vectors."""
    
    def __init__(self, dimension: int = 1024):
        self.dimension = dimension
        
    def _generate_mock_vector(self, text: str) -> list[float]:
        # Hash text to seed random for deterministic mock embeddings
        seed = sum(ord(c) for c in text)
        np.random.seed(seed)
        vec = np.random.randn(self.dimension)
        vec = vec / np.linalg.norm(vec)
        return vec.tolist()
        
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._generate_mock_vector(t) for t in texts]
        
    def embed_query(self, text: str) -> list[float]:
        return self._generate_mock_vector(text)
