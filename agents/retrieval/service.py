from __future__ import annotations
from typing import Optional

class RetrievalService:
    """Service layer for retrieving document chunks."""
    
    async def dense_search(self, query: str, document_ids: list[str], top_k: int, section_filter: Optional[str]) -> list:
        raise NotImplementedError
        
    async def sparse_search(self, query: str, document_ids: list[str], top_k: int, section_filter: Optional[str]) -> list:
        raise NotImplementedError
        
    async def hybrid_search(self, query: str, document_ids: list[str], top_k: int, section_filter: Optional[str]) -> list:
        raise NotImplementedError
        
    async def rerank(self, query: str, chunks: list, top_k: int) -> list:
        raise NotImplementedError
