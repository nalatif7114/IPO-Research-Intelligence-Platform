import asyncio
import os
import uuid
import structlog
import traceback
import urllib.request
import sys

# Ensure backend root is in pythonpath
sys.path.append(os.path.dirname(__file__))

from agents.risk_assessment.agent import RiskAssessmentAgent
from agents.risk_assessment.schemas import RiskAssessmentInput, RiskAssessmentOutput, RiskDetail

from rag.loader import PDFLoader
from rag.chunker import Chunk, ChunkMetadata
from embeddings.provider import MockEmbeddingProvider
from vector_store.qdrant_client import QdrantVectorStore

logger = structlog.stdlib.get_logger(__name__)

async def setup_rag_data(document_id: str):
    print("[1/3] Setting up prospectus in RAG Engine...")
    
    qdrant_store = QdrantVectorStore(host="qdrant", port=6333)
    embed_provider = MockEmbeddingProvider()
    
    # Fallback chunks focusing on operational and financial risks
    chunks = [
        Chunk(
            content="Risiko Operasional (Operational Risk): Perseroan sangat bergantung pada kelancaran operasional pusat distribusi. Setiap gangguan, seperti bencana alam atau kegagalan sistem TI, dapat berdampak material pada kemampuan kami untuk memenuhi pesanan pelanggan. Mitigasi: Perseroan telah membangun fasilitas cadangan di lokasi terpisah.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000010", document_id=document_id, page=1, hierarchy_level="paragraph")
        ),
        Chunk(
            content="Risiko Keuangan (Financial Risk): Kenaikan suku bunga acuan dapat meningkatkan beban bunga atas utang berjalan sebesar Rp 2 triliun, yang dapat berdampak buruk pada profitabilitas Perseroan di masa mendatang. Likuiditas saat ini memadai namun tetap rentan terhadap gejolak pasar.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000011", document_id=document_id, page=2, hierarchy_level="paragraph")
        ),
        Chunk(
            content="Risiko Hukum (Legal Risk): Terdapat satu gugatan hukum yang sedang berjalan terkait sengketa hak paten perangkat lunak utama kami. Jika putusan pengadilan tidak berpihak kepada Perseroan, kami berpotensi membayar denda hingga Rp 50 miliar.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000012", document_id=document_id, page=3, hierarchy_level="paragraph")
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

def print_risk(category_name: str, risks: list[RiskDetail]):
    print(f"--- {category_name.upper()} ---")
    if not risks:
        print("No risks identified or insufficient evidence.")
    for i, risk in enumerate(risks):
        print(f"Risk {i+1}:")
        print(f"  Description: {risk.description}")
        print(f"  Severity:    {risk.severity}")
        print(f"  Likelihood:  {risk.likelihood}")
        print(f"  Impact:      {risk.impact}")
        print(f"  Mitigation:  {risk.mitigation}")
        print(f"  Confidence:  {risk.confidence}")
        if risk.citations:
            print("  Citations:")
            for cit in risk.citations:
                print(f"    - {cit}")
        else:
            print("  Citations:   None")
    print()

async def main():
    print("=== Production Risk Assessment Agent Verification ===\n")
    document_id = str(uuid.uuid4())
    
    await setup_rag_data(document_id)
    
    has_api_key = bool(os.environ.get("GEMINI_API_KEY"))
    
    print("[2/3] Executing Risk Assessment Agent...")
    agent = RiskAssessmentAgent()
    
    if not has_api_key:
        print("WARNING: GEMINI_API_KEY is not set.")
        print("To verify structure, bypassing actual LLM call and mocking output.")
        from agents.agent_common.llm import MockLLMProvider
        agent.llm_provider = MockLLMProvider()
        
    try:
        output = await agent.run(RiskAssessmentInput(document_id=document_id))
        
        print("\n[3/3] Verification Complete! Output sample:\n")
        
        print_risk("Operational Risk", output.operational_risk)
        print_risk("Financial Risk", output.financial_risk)
        print_risk("Legal Risk", output.legal_risk)
        print_risk("Market Risk", output.market_risk) # Expect empty or mocked empty
        
    except Exception as e:
        print(f"Verification Failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
