from __future__ import annotations
import uuid
import structlog
from typing import Optional
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, FieldCondition, Filter, MatchValue, PointStruct, VectorParams

from vector_store.base import VectorStore

logger = structlog.stdlib.get_logger(__name__)

class QdrantVectorStore(VectorStore):
    """Qdrant implementation of the VectorStore interface."""
    
    def __init__(self, host: str = "localhost", port: int = 6333, embedding_dim: int = 1024):
        self.client = AsyncQdrantClient(host=host, port=port)
        self.embedding_dim = embedding_dim
        
    async def _ensure_collection(self, collection: str):
        exists = await self.client.collection_exists(collection)
        if not exists:
            logger.info("creating_qdrant_collection", collection=collection)
            await self.client.create_collection(
                collection_name=collection,
                vectors_config=VectorParams(size=self.embedding_dim, distance=Distance.COSINE),
            )
            
    async def upsert(self, collection: str, vectors: list[dict]) -> None:
        """
        vectors should be a list of dicts:
        { "id": str, "vector": list[float], "payload": dict }
        """
        await self._ensure_collection(collection)
        points = [
            PointStruct(
                id=v.get("id", str(uuid.uuid4())), 
                vector=v["vector"], 
                payload=v.get("payload", {})
            )
            for v in vectors
        ]
        await self.client.upsert(collection_name=collection, points=points)
        
    async def search(self, collection: str, query_vector: list[float], top_k: int, filters: Optional[dict] = None) -> list[dict]:
        await self._ensure_collection(collection)
        query_filter = None
        if filters:
            query_filter = Filter(
                must=[
                    FieldCondition(key=key, match=MatchValue(value=value))
                    for key, value in filters.items()
                    if value is not None
                ]
            )
        results = await self.client.search(
            collection_name=collection,
            query_vector=query_vector,
            limit=top_k,
            query_filter=query_filter,
        )
        return [{"id": r.id, "score": r.score, "payload": r.payload} for r in results]
        
    async def delete(self, collection: str, ids: list[str]) -> None:
        await self._ensure_collection(collection)
        await self.client.delete(collection_name=collection, points_selector=ids)
        
    async def get_by_id(self, collection: str, vector_id: str) -> dict | None:
        await self._ensure_collection(collection)
        res = await self.client.retrieve(collection_name=collection, ids=[vector_id])
        if res:
            return {"id": res[0].id, "payload": res[0].payload}
        return None
