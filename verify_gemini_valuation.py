import asyncio
import os
import uuid
import structlog
import traceback
import sys

# Ensure backend root is in pythonpath
sys.path.append(os.path.dirname(__file__))

from agents.valuation.agent import ValuationAgent
from agents.valuation.schemas import ValuationInput, ValuationOutput, ValuationMetric

from rag.chunker import Chunk, ChunkMetadata
from embeddings.provider import MockEmbeddingProvider
from vector_store.qdrant_client import QdrantVectorStore

logger = structlog.stdlib.get_logger(__name__)

async def setup_rag_data(document_id: str):
    print("[1/3] Setting up prospectus in RAG Engine...")
    
    qdrant_store = QdrantVectorStore(host="qdrant", port=6333)
    embed_provider = MockEmbeddingProvider()
    
    chunks = [
        Chunk(
            content="Berdasarkan analisis arus kas, Perseroan diproyeksikan mencetak Free Cash Flow sebesar Rp 500 miliar tahun depan. Valuasi saat ini ditawarkan pada PBV 1.5x, yang relatif murah dibandingkan industri sejenis di level 2.2x. Profil risiko stabil meskipun ada ancaman regulasi.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000030", document_id=document_id, page=1, hierarchy_level="paragraph")
        ),
        Chunk(
            content="Kekuatan kompetitif utama adalah dominasi pangsa pasar sebesar 40% di segmen e-commerce rural. Manajemen menargetkan pertumbuhan EBITDA 20% per tahun selama 3 tahun ke depan.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000031", document_id=document_id, page=2, hierarchy_level="paragraph")
        )
    ]
        
    vectors = []
    for c in chunks:
        vectors.append({
            "id": c.metadata.chunk_id,
            "vector": embed_provider.embed_query(c.content),
            "payload": c.metadata.model_dump() | {"content": c.content}
        })
    await qdrant_store.upsert(collection="global_prospectus_collection", vectors=vectors)
    print(f"RAG Engine populated with {len(vectors)} chunks for document {document_id}.\n")

def print_metric(name: str, metric: ValuationMetric):
    print(f"--- {name} ---")
    print(f"Value:      {metric.value}")
    print(f"Confidence: {metric.confidence}")
    if metric.citations:
        print("Citations:")
        for cit in metric.citations:
            print(f"  - {cit}")
    else:
        print("Citations:  None")
    print()

async def main():
    print("=== Production Valuation Agent Verification ===\n")
    document_id = str(uuid.uuid4())
    
    await setup_rag_data(document_id)
    
    has_api_key = bool(os.environ.get("GEMINI_API_KEY"))
    
    print("[2/3] Simulating prior agent outputs and executing Valuation Agent...")
    
    mock_business = {"market_share": "40%", "competitive_advantage": "Dominates rural e-commerce"}
    mock_financial = {"ebitda_growth_target": "20% per year"}
    mock_risk = {"regulatory_risk": "High"}
    mock_governance = {"overall_governance_quality": "GOOD"}
    
    agent = ValuationAgent()
    
    if not has_api_key:
        print("WARNING: GEMINI_API_KEY is not set.")
        print("To verify structure, bypassing actual LLM call and mocking output.")
        from agents.agent_common.llm import MockLLMProvider
        agent.llm_provider = MockLLMProvider()
        
    try:
        val_input = ValuationInput(
            document_id=document_id,
            business_analysis=mock_business,
            financial_analysis=mock_financial,
            risk_assessment=mock_risk,
            governance_analysis=mock_governance
        )
        output = await agent.run(val_input)
        
        print("\n[3/3] Verification Complete! Output sample:\n")
        
        print_metric("Investment Recommendation", output.investment_recommendation)
        print_metric("Investment Thesis", output.investment_thesis)
        print_metric("IPO Pricing Attractiveness", output.ipo_pricing_attractiveness)
        print_metric("Major Risks", output.major_risks)
        
    except Exception as e:
        print(f"Verification Failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
