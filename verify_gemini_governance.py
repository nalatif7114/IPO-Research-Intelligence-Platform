import asyncio
import os
import uuid
import structlog
import traceback
import urllib.request
import sys

# Ensure backend root is in pythonpath
sys.path.append(os.path.dirname(__file__))

from agents.governance.agent import GovernanceAgent
from agents.governance.schemas import GovernanceInput, GovernanceOutput, GovernanceMetric

from rag.loader import PDFLoader
from rag.chunker import Chunk, ChunkMetadata
from embeddings.provider import MockEmbeddingProvider
from vector_store.qdrant_client import QdrantVectorStore

logger = structlog.stdlib.get_logger(__name__)

async def setup_rag_data(document_id: str):
    print("[1/3] Setting up prospectus in RAG Engine...")
    
    qdrant_store = QdrantVectorStore(host="qdrant", port=6333)
    embed_provider = MockEmbeddingProvider()
    
    # Fallback chunks focusing on governance structure
    chunks = [
        Chunk(
            content="Dewan Komisaris (Board of Commissioners) terdiri dari 5 orang, dengan 3 di antaranya merupakan Komisaris Independen (Independent Commissioners) yang telah memenuhi kualifikasi OJK. Ini mencerminkan komitmen kuat terhadap tata kelola perusahaan yang transparan.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000020", document_id=document_id, page=1, hierarchy_level="paragraph")
        ),
        Chunk(
            content="Komite Audit (Audit Committee) diketuai oleh Bpk. Budi Santoso, seorang akuntan publik bersertifikat, dan terdiri dari 3 anggota independen. Komite Nominasi dan Remunerasi (Nomination and Remuneration Committee) juga telah dibentuk dan beroperasi secara terpisah.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000021", document_id=document_id, page=2, hierarchy_level="paragraph")
        ),
        Chunk(
            content="Terdapat Transaksi Benturan Kepentingan (Conflict of Interest) yang melibatkan penyewaan aset properti dari entitas yang dikendalikan oleh pemegang saham mayoritas. Transaksi Afiliasi (Related Party Transactions) ini menyumbang 10% dari total beban operasional.",
            metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000022", document_id=document_id, page=3, hierarchy_level="paragraph")
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

def print_metric(name: str, metric: GovernanceMetric):
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
    print("=== Production Governance Analysis Agent Verification ===\n")
    document_id = str(uuid.uuid4())
    
    await setup_rag_data(document_id)
    
    has_api_key = bool(os.environ.get("GEMINI_API_KEY"))
    
    print("[2/3] Executing Governance Analysis Agent...")
    agent = GovernanceAgent()
    
    if not has_api_key:
        print("WARNING: GEMINI_API_KEY is not set.")
        print("To verify structure, bypassing actual LLM call and mocking output.")
        from agents.agent_common.llm import MockLLMProvider
        agent.llm_provider = MockLLMProvider()
        
    try:
        output = await agent.run(GovernanceInput(document_id=document_id))
        
        print("\n[3/3] Verification Complete! Output sample:\n")
        
        print_metric("Board of Commissioners", output.board_of_commissioners)
        print_metric("Independent Commissioners", output.independent_commissioners)
        print_metric("Audit Committee", output.audit_committee)
        print_metric("Related Party Transactions", output.related_party_transactions)
        print_metric("Governance Red Flags", output.governance_red_flags)
        print_metric("Overall Governance Quality", output.overall_governance_quality)
        
    except Exception as e:
        print(f"Verification Failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
