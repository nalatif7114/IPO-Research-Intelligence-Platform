"""Interactive chat endpoint using RAG and Cached analysis."""

from __future__ import annotations

import json
import uuid
import structlog
import os
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import get_settings
from backend.app.dependencies import get_db_session
from backend.app.models.job import Job
from backend.app.models.document import Document
from agents.agent_common.llm import GeminiProvider, MockLLMProvider
from rag.retriever import HybridRetriever, MockReRanker
from rag.context_builder import TokenBudgetContextBuilder
from vector_store.qdrant_client import QdrantVectorStore
from embeddings.provider import MockEmbeddingProvider

logger = structlog.stdlib.get_logger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    document_id: str
    query: str

class ChatResponse(BaseModel):
    response: str
    citations: list[str]

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest, session: AsyncSession = Depends(get_db_session)):
    settings = get_settings()
    
    # Check if document exists
    doc = (await session.execute(select(Document).where(Document.id == uuid.UUID(request.document_id)))).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Get associated completed job for cached results
    job = (await session.execute(
        select(Job).where(
            Job.job_type == "document_processing"
        ).order_by(Job.created_at.desc())
    )).scalars().first()
    
    cached_context = "{}"
    if job and job.result:
        cached_context = json.dumps(job.result, indent=2)
        
    # RAG Retrieval
    vector_store = QdrantVectorStore(host="qdrant", port=6333)
    embedding_provider = MockEmbeddingProvider()
    
    retriever = HybridRetriever(
        vector_store=vector_store,
        embedding_provider=embedding_provider,
        collection_name="global_prospectus_collection",
        reranker=MockReRanker()
    )
    context_builder = TokenBudgetContextBuilder()
    
    results = await retriever.retrieve(
        query=request.query,
        top_k=5,
        filters={"document_id": request.document_id}
    )
    
    context_window = context_builder.build_context(results, token_budget=3000)
    
    # Build prompt
    prompt = f"""You are a specialized IPO Financial Analyst Chatbot.
Your task is to answer the user's question based strictly on the provided RAG CONTEXT and PREVIOUS AGENT ANALYSES.

=== PREVIOUS AGENT ANALYSES CACHE ===
{cached_context}

=== RAG CONTEXT ===
{context_window.context_text}

User Question: {request.query}

Instructions:
1. Answer the question accurately using ONLY the provided data.
2. If the answer is not in the data, say "I don't have enough evidence to answer that."
3. Cite your sources implicitly or explicitly where possible.
"""

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "mock" or api_key.startswith("YOUR_"):
        llm_provider = MockLLMProvider()
    else:
        llm_provider = GeminiProvider(
            temperature=settings.llm_temperature,
            top_p=settings.llm_top_p,
            max_output_tokens=settings.llm_max_output_tokens,
            timeout_seconds=settings.llm_timeout
        )
    
    try:
        class ChatStruct(BaseModel):
            response: str
            citations: list[str]
            
        output = await llm_provider.generate_structured(prompt, ChatStruct)
        return ChatResponse(response=output.response, citations=output.citations)
    except Exception as e:
        logger.error("chat_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Chat generation failed")
