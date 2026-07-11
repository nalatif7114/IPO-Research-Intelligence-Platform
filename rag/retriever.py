from __future__ import annotations
import abc
import random
from pydantic import BaseModel, Field
from typing import Optional

from embeddings.provider import EmbeddingProvider
from vector_store.base import VectorStore

class RetrievalResult(BaseModel):
    chunk_id: str
    text: str
    score: float
    metadata: dict

class CrossEncoderReRanker(abc.ABC):
    @abc.abstractmethod
    def rerank(self, query: str, results: list[RetrievalResult]) -> list[RetrievalResult]:
        pass

class MockReRanker(CrossEncoderReRanker):
    def rerank(self, query: str, results: list[RetrievalResult]) -> list[RetrievalResult]:
        # Deterministic mock re-ranking based on chunk_id hash
        for r in results:
            r.score = float(hash(r.chunk_id) % 100) / 100.0
        # Sort descending by new score
        results.sort(key=lambda x: x.score, reverse=True)
        return results

class BaseRetriever(abc.ABC):
    """Abstract interface for retrieving chunks."""
    
    @abc.abstractmethod
    async def retrieve(self, query: str, top_k: int, filters: Optional[dict] = None) -> list[RetrievalResult]:
        pass

class HybridRetriever(BaseRetriever):
    """Hybrid Retriever combining Dense search and a Mock BM25 search."""
    
    def __init__(
        self, 
        vector_store: VectorStore, 
        embedding_provider: EmbeddingProvider, 
        collection_name: str,
        reranker: Optional[CrossEncoderReRanker] = None
    ):
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        self.collection_name = collection_name
        self.reranker = reranker or MockReRanker()

    async def retrieve(self, query: str, top_k: int, filters: Optional[dict] = None) -> list[RetrievalResult]:
        # 1. Dense Search
        query_vec = self.embedding_provider.embed_query(query)
        dense_results_raw = await self.vector_store.search(
            collection=self.collection_name,
            query_vector=query_vec,
            top_k=top_k * 2,  # Fetch more for reranking
            filters=filters
        )
        
        # 2. Mock BM25 Search Result Fusion
        # (In production, this would query a sparse index like elasticsearch or qdrant sparse vectors)
        results_map = {}
        for r in dense_results_raw:
            chunk_id = r["payload"].get("chunk_id", r["id"])
            results_map[chunk_id] = RetrievalResult(
                chunk_id=chunk_id,
                text=r["payload"].get("content", ""),
                score=r["score"],
                metadata=r["payload"]
            )
            
        merged_results = list(results_map.values())
        
        # 3. Cross-Encoder Re-ranking
        reranked = self.reranker.rerank(query, merged_results)
        
        return reranked[:top_k]
