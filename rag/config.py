from __future__ import annotations
from pydantic import BaseModel

class ChunkingConfig(BaseModel):
    section_max_tokens: int = 50000
    subsection_max_tokens: int = 2000
    paragraph_max_tokens: int = 500
    overlap_tokens: int = 50

class RetrievalConfig(BaseModel):
    top_k_pre_rerank: int = 50
    top_k_post_rerank: int = 20
    similarity_threshold: float = 0.65
    token_budget: int = 80000

class RAGConfig(BaseModel):
    chunking: ChunkingConfig = ChunkingConfig()
    retrieval: RetrievalConfig = RetrievalConfig()
    embedding_model: str = "BAAI/bge-m3"
    embedding_dimensions: int = 1024
    reranker_model: str = "bge-reranker-v2-m3"
