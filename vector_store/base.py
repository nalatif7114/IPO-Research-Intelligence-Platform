from __future__ import annotations
import abc
from typing import Optional

class VectorStore(abc.ABC):
    """Abstract interface for vector database operations."""
    
    @abc.abstractmethod
    async def upsert(self, collection: str, vectors: list[dict]) -> None:
        pass
        
    @abc.abstractmethod
    async def search(self, collection: str, query_vector: list[float], top_k: int, filters: Optional[dict] = None) -> list[dict]:
        pass
        
    @abc.abstractmethod
    async def delete(self, collection: str, ids: list[str]) -> None:
        pass
        
    @abc.abstractmethod
    async def get_by_id(self, collection: str, vector_id: str) -> dict | None:
        pass
