from __future__ import annotations

class ChunkingEmbeddingService:
    """Service layer for chunking and embedding operations."""
    
    async def chunk_document(self, document_id: str, parsed_path: str) -> list:
        raise NotImplementedError
        
    async def generate_embeddings(self, chunks: list) -> list:
        raise NotImplementedError
        
    async def store_embeddings(self, document_id: str, embedded_chunks: list) -> None:
        raise NotImplementedError
