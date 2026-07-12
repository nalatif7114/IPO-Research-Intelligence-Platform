import asyncio
import os
import uuid
import structlog
import traceback
import urllib.request
import tempfile
import sys

# Ensure backend root is in pythonpath
sys.path.append(os.path.dirname(__file__))

from agents.financial_analysis.agent import FinancialAnalysisAgent
from agents.financial_analysis.schemas import FinancialAnalysisInput, FinancialAnalysisOutput, FinancialMetric

from rag.loader import PDFLoader
from rag.chunker import HierarchicalChunker
from embeddings.provider import MockEmbeddingProvider
from vector_store.qdrant_client import QdrantVectorStore

logger = structlog.stdlib.get_logger(__name__)

async def download_prospectus() -> bytes:
    """Downloads a real Indonesian IPO prospectus (or uses a cached local one)."""
    local_path = "prospektus_goto.pdf"
    if os.path.exists(local_path):
        print(f"Using local prospectus: {local_path}")
        with open(local_path, "rb") as f:
            return f.read()
            
    print("Downloading a sample Indonesian IPO Prospectus...")
    # This is a sample URL for an Indonesian public document, 
    # we'll use a small proxy or public PDF if the main one is too large or protected.
    # For verification purposes, we'll write a realistic text into a PDF in memory 
    # if the download fails to prevent the test from hanging on network issues.
    
    url = "https://www.idx.co.id/Portals/0/StaticData/Information/ForInvestor/e-IPO/Prospektus%20GOTO.pdf" 
    
    try:
        # We simulate a fast timeout so it doesn't hang if IDX blocks it
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            pdf_bytes = response.read()
            with open(local_path, "wb") as f:
                f.write(pdf_bytes)
            return pdf_bytes
    except Exception as e:
        print(f"Failed to download from IDX ({e}). Generating a realistic RAG mock buffer for verification.")
        # Fallback to realistic Indonesian financial text if network fails
        mock_text = """
        PROSPEKTUS PENAWARAN UMUM PERDANA SAHAM PT TEKNOLOGI NUSANTARA TBK
        
        Kinerja Keuangan:
        Pendapatan bersih Perseroan pada tahun 2022 mencapai Rp 15.5 triliun, mencerminkan pertumbuhan pendapatan (Revenue Growth) sebesar 35% dibandingkan tahun 2021 yang tercatat sebesar Rp 11.4 triliun.
        Laba Kotor (Gross Profit) Perseroan meningkat menjadi Rp 4.2 triliun dengan marjin laba kotor (Gross Margin) sebesar 27%.
        Rugi usaha (Operating Profit) masih tercatat sebesar Rp (1.5) triliun, yang menunjukkan marjin operasional negatif akibat beban pemasaran yang tinggi.
        EBITDA disesuaikan Perseroan pada tahun 2022 adalah negatif Rp 800 miliar.
        
        Arus Kas dan Likuiditas:
        Arus kas dari aktivitas operasi (Operating Cash Flow) tercatat negatif Rp 1.2 triliun. Free Cash Flow juga masih berada di area negatif.
        Likuiditas perusahaan terjaga dengan rasio lancar (Current Ratio) sebesar 2.5x, dan kas setara kas mencapai Rp 5 triliun pada akhir tahun.
        
        Struktur Utang (Debt Structure):
        Total utang bank Perseroan tercatat sebesar Rp 2 triliun, menghasilkan rasio utang terhadap ekuitas (Debt to Equity/Leverage) sebesar 0.4x.
        
        Faktor Risiko (Financial Red Flags):
        Risiko utama meliputi ketidakpastian profitabilitas di masa depan, persaingan harga yang ketat, dan burn rate kas operasional yang tinggi.
        """
        
        # Create a simple PDF containing this text using ReportLab if available, or just mock bytes
        # Since pypdf needs a valid PDF, we'll write a minimal valid PDF structure:
        # Note: We rely on the PDFLoader's OCR fallback if it fails, or we can just mock the chunks directly.
        pass
        
    return None

async def setup_rag_data(document_id: str, pdf_bytes: bytes):
    print("[1/3] Setting up prospectus in RAG Engine...")
    
    qdrant_store = QdrantVectorStore(host="qdrant", port=6333)
    embed_provider = MockEmbeddingProvider()
    
    if pdf_bytes:
        loader = PDFLoader(use_ocr=False)
        pages = loader.load(pdf_bytes, document_id)
        chunker = HierarchicalChunker()
        chunks = chunker.chunk(pages, document_id)
    else:
        # Fallback chunks
        from rag.chunker import Chunk, ChunkMetadata
        chunks = [
            Chunk(
                content="Pendapatan bersih Perseroan pada tahun 2022 mencapai Rp 15.5 triliun, mencerminkan pertumbuhan pendapatan (Revenue Growth) sebesar 35%. Laba Kotor mencapai Rp 4.2 triliun dengan marjin 27%.",
                metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000001", document_id=document_id, page=1, hierarchy_level="paragraph")
            ),
            Chunk(
                content="Arus kas dari aktivitas operasi tercatat negatif Rp 1.2 triliun. Likuiditas terjaga dengan current ratio 2.5x.",
                metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000002", document_id=document_id, page=2, hierarchy_level="paragraph")
            ),
            Chunk(
                content="Risiko utama meliputi ketidakpastian profitabilitas di masa depan, persaingan ketat, dan burn rate tinggi. Total utang bank sebesar Rp 2 triliun dengan rasio leverage 0.4x.",
                metadata=ChunkMetadata(chunk_id="00000000-0000-0000-0000-000000000003", document_id=document_id, page=3, hierarchy_level="paragraph")
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

def print_metric(name: str, metric: FinancialMetric):
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
    print("=== Production Financial Analysis Agent Verification ===\n")
    document_id = str(uuid.uuid4())
    
    pdf_bytes = await download_prospectus()
    await setup_rag_data(document_id, pdf_bytes)
    
    has_api_key = bool(os.environ.get("GEMINI_API_KEY"))
    
    print("[2/3] Executing Financial Analysis Agent...")
    agent = FinancialAnalysisAgent()
    
    if not has_api_key:
        print("WARNING: GEMINI_API_KEY is not set.")
        print("To verify structure, bypassing actual LLM call and mocking output.")
        from agents.agent_common.llm import MockLLMProvider
        agent.llm_provider = MockLLMProvider()
        
    try:
        output = await agent.run(FinancialAnalysisInput(document_id=document_id))
        
        print("\n[3/3] Verification Complete! Output sample:\n")
        
        print_metric("Revenue Trend", output.revenue_trend)
        print_metric("Liquidity", output.liquidity)
        print_metric("Debt Analysis", output.debt_structure)
        print_metric("Profitability", output.profitability)
        print_metric("Red Flags", output.financial_red_flags)
        
    except Exception as e:
        print(f"Verification Failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
