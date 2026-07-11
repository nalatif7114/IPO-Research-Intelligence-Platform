from __future__ import annotations
from typing import Optional
from vector_store.base import VectorStore

class QdrantVectorStore(VectorStore):
    """Qdrant implementation of the VectorStore interface."""
    
    async def upsert(self, collection: str, vectors: list[dict]) -> None:
        raise NotImplementedError
        
    async def search(self, collection: str, query_vector: list[float], top_k: int, filters: Optional[dict] = None) -> list[dict]:
        raise NotImplementedError
        
    async def delete(self, collection: str, ids: list[str]) -> None:
        raise NotImplementedError
        
    async def get_by_id(self, collection: str, vector_id: str) -> dict | None:
        raise NotImplementedError
