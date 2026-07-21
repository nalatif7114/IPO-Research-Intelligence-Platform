from __future__ import annotations
import abc
import time
from typing import TypeVar, Type

from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.agent_common.provider_factory import get_llm_provider
from rag.retriever import HybridRetriever, BaseRetriever
from rag.context_builder import ContextBuilder, TokenBudgetContextBuilder
from rag.citation_manager import CitationManager, RAGCitationManager
from vector_store.qdrant_client import QdrantVectorStore
from embeddings.provider import ProductionEmbeddingProvider
from backend.app.config import get_settings

InputT = TypeVar("InputT")
OutputT = TypeVar("OutputT")

class ReasoningAgent(BaseAgent[InputT, OutputT], abc.ABC):
    """Base class for intelligent agents performing RAG and LLM reasoning."""
    
    def __init__(self, config: AgentConfig, output_schema: Type[OutputT]):
        super().__init__(config)
        self.output_schema = output_schema
        self.settings = get_settings()
        
        self.vector_store = QdrantVectorStore(
            host=self.settings.qdrant_host,
            port=self.settings.qdrant_port,
            embedding_dim=self.settings.embedding_dimensions
        )
        self.embedding_provider = ProductionEmbeddingProvider()
        
        self.retriever = HybridRetriever(
            vector_store=self.vector_store,
            embedding_provider=self.embedding_provider,
            collection_name="global_prospectus_collection",
        )
        self.context_builder = TokenBudgetContextBuilder()
        self.citation_manager = RAGCitationManager()
        self.llm_provider = get_llm_provider()
        
    async def execute_reasoning(self, query: str, document_id: str) -> OutputT:
        """Executes the standard Phase 4 reasoning pipeline."""

        if self.llm_provider.provider_name == "MockLLMProvider":
            raise RuntimeError("MockLLMProvider is not permitted in production reasoning.")
        
        execution_started = time.perf_counter()
        self.logger.info("reasoning_started", query=query, document_id=document_id)
        
        # 1. RAG Retrieval
        retrieval_started = time.perf_counter()
        results = await self.retriever.retrieve(
            query=query, 
            top_k=5, 
            filters={"document_id": document_id} if document_id else None
        )
        retrieval_latency_seconds = time.perf_counter() - retrieval_started
        
        # 2. Build Context
        context_window = self.context_builder.build_context(results, token_budget=2000)
        
        # 3. Citation Validation
        citations = self.citation_manager.generate_citations_from_results(results)
        
        # 4. LLM Generation
        prompt = f"Context:\n{context_window.context_text}\n\nQuery:\n{query}\n\nProvide the structured output."
        self.logger.info(
            "reasoning_performance",
            document_id=document_id,
            retrieved_chunk_count=len(results),
            retrieval_latency_seconds=round(retrieval_latency_seconds, 6),
            context_characters=len(context_window.context_text),
            context_token_estimate=len(context_window.context_text) // 4,
            prompt_characters=len(prompt),
            prompt_token_estimate=len(prompt) // 4,
        )
        structured_output = await self.llm_provider.structured_output(prompt, self.output_schema)
        
        # We attach citations to the final output if the schema supports it.
        if hasattr(structured_output, "citations"):
            structured_output.citations = [c.statement for c in citations]
            
        self.logger.info(
            "reasoning_completed",
            document_id=document_id,
            retrieved_chunk_count=len(results),
            execution_time_seconds=round(time.perf_counter() - execution_started, 6),
        )
        return structured_output
