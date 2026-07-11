from __future__ import annotations

class HybridSearchEngine:
    """Orchestrates dense (vector) and sparse (BM25) search on Qdrant."""
    
    async def search(self, query: str, dense_vector: list[float], sparse_vector: dict) -> list[dict]:
        raise NotImplementedError
