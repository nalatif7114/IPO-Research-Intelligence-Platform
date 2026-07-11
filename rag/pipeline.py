from __future__ import annotations

class RAGPipeline:
    """End-to-end RAG pipeline orchestration."""
    
    def __init__(
        self,
        loader: object,
        chunker: object,
        retriever: object,
        context_builder: object,
        embedding_service: object,
    ):
        self.loader = loader
        self.chunker = chunker
        self.retriever = retriever
        self.context_builder = context_builder
        self.embedding_service = embedding_service
        
    def run(self, query: str) -> dict:
        raise NotImplementedError
