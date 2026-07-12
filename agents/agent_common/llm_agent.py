from __future__ import annotations
import abc
from typing import TypeVar, Type

from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.agent_common.llm import LLMProvider, MockLLMProvider
from rag.retriever import HybridRetriever, BaseRetriever, MockReRanker
from rag.context_builder import ContextBuilder, TokenBudgetContextBuilder
from rag.citation_manager import CitationManager, RAGCitationManager
from vector_store.qdrant_client import QdrantVectorStore
from embeddings.provider import MockEmbeddingProvider

InputT = TypeVar("InputT")
OutputT = TypeVar("OutputT")

class ReasoningAgent(BaseAgent[InputT, OutputT], abc.ABC):
    """Base class for intelligent agents performing RAG and LLM reasoning."""
    
    def __init__(self, config: AgentConfig, output_schema: Type[OutputT]):
        super().__init__(config)
        self.output_schema = output_schema
        
        # Initialize default RAG components for Phase 4
        # In production, these should be injected via DI
        self.vector_store = QdrantVectorStore(host="qdrant", port=6333)
        self.embedding_provider = MockEmbeddingProvider()
        
        self.retriever = HybridRetriever(
            vector_store=self.vector_store,
            embedding_provider=self.embedding_provider,
            collection_name="global_prospectus_collection", # Assuming unified index
            reranker=MockReRanker()
        )
        self.context_builder = TokenBudgetContextBuilder()
        self.citation_manager = RAGCitationManager()
        self.llm_provider = MockLLMProvider()
        
    async def execute_reasoning(self, query: str, document_id: str) -> OutputT:
        """Executes the standard Phase 4 reasoning pipeline."""
        
        self.logger.info("reasoning_started", query=query)
        
        # 1. RAG Retrieval
        results = await self.retriever.retrieve(
            query=query, 
            top_k=5, 
            filters={"document_id": document_id} if document_id else None
        )
        
        # 2. Build Context
        context_window = self.context_builder.build_context(results, token_budget=2000)
        
        # 3. Citation Validation
        citations = self.citation_manager.generate_citations_from_results(results)
        
        # 4. LLM Generation
        prompt = f"Context:\n{context_window.context_text}\n\nQuery:\n{query}\n\nProvide the structured output."
        structured_output = await self.llm_provider.generate_structured(prompt, self.output_schema)
        
        # We attach citations to the final output if the schema supports it.
        if hasattr(structured_output, "citations"):
            structured_output.citations = [c.statement for c in citations]
            
        self.logger.info("reasoning_completed")
        return structured_output
