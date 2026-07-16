import asyncio
import json
import uuid
import structlog
import traceback
import os

from agents.business_analysis.agent import BusinessAnalysisAgent
from agents.business_analysis.schemas import BusinessAnalysisInput

from rag.loader import PDFLoader
from rag.chunker import HierarchicalChunker
from embeddings.provider import MockEmbeddingProvider
from vector_store.qdrant_client import QdrantVectorStore

logger = structlog.stdlib.get_logger(__name__)

async def setup_rag_mock_data(document_id: str):
    print("[1/3] Setting up mock prospectus in RAG Engine...")
    loader = PDFLoader(use_ocr=True)
    dummy_pdf_bytes = b"%PDF-1.4\n1 0ase obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    pages = loader.load(dummy_pdf_bytes, document_id)
    
    chunker = HierarchicalChunker()
    chunks = chunker.chunk(pages, document_id)
    
    embed_provider = MockEmbeddingProvider()
    qdrant_store = QdrantVectorStore(host="qdrant", port=6333)
    
    vectors = []
    for c in chunks:
        vectors.append({
            "id": c.metadata.chunk_id,
            "vector": embed_provider.embed_query(c.content),
            "payload": c.metadata.model_dump() | {"content": c.content}
        })
    await qdrant_store.upsert(collection="global_prospectus_collection", vectors=vectors)
    print(f"RAG Engine populated with {len(vectors)} chunks for document {document_id}.\n")

async def main():
    print("=== GeminiProvider Integration Verification ===\n")
    document_id = str(uuid.uuid4())
    
    # Check if we have an API key, otherwise skip actual Gemini invocation gracefully for testing
    has_api_key = bool(os.environ.get("GEMINI_API_KEY"))
    
    try:
        await setup_rag_mock_data(document_id)
        
        print("[2/3] Executing Business Analysis Agent...")
        agent = BusinessAnalysisAgent()
        input_data = BusinessAnalysisInput(
            document_id=document_id,
            job_id="test-job-id"
        )
        result = await agent.execute(input_data)
        
        print("\n=== Agent Output ===")
        print(f"Company Overview: {result.company_overview}")
        print(f"Business Model: {result.business_model}")
        print(f"Revenue Streams: {result.revenue_streams}")
        print(f"Competitive Advantage: {result.competitive_advantage}")
        print(f"Industry Position: {result.industry_position}")
        print(f"SWOT: {result.swot}")
            
        print(f"\n[3/3] Verification Complete! BusinessAnalysisAgent uses {agent.llm_provider.provider_name} successfully.")
    except Exception as e:
        print(f"\n[Error] Verification failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
