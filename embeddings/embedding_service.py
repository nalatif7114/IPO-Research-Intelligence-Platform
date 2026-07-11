from __future__ import annotations
from rag.embedding_service import EmbeddingService

class EmbeddingServiceImpl(EmbeddingService):
    """Implementation of the embedding service."""
    
    def embed_text(self, text: str) -> list[float]:
        raise NotImplementedError
        
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError
