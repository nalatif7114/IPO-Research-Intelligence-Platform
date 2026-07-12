import asyncio
import json
import uuid
import structlog
import traceback

from agents.business_analysis.agent import BusinessAnalysisAgent
from agents.business_analysis.schemas import BusinessAnalysisInput

from agents.financial_analysis.agent import FinancialAnalysisAgent
from agents.financial_analysis.schemas import FinancialAnalysisInput

from agents.risk_assessment.agent import RiskAssessmentAgent
from agents.risk_assessment.schemas import RiskAssessmentInput

from agents.governance.agent import GovernanceAgent
from agents.governance.schemas import GovernanceInput

from agents.valuation.agent import ValuationAgent
from agents.valuation.schemas import ValuationInput

from agents.report_generator.agent import ReportGeneratorAgent
from agents.report_generator.schemas import ReportGeneratorInput

from agents.evaluation.agent import EvaluationAgent
from agents.evaluation.schemas import EvaluationInput

# We also need to setup RAG data just like in Phase 3
from rag.loader import PDFLoader
from rag.chunker import HierarchicalChunker
from embeddings.provider import MockEmbeddingProvider
from vector_store.qdrant_client import QdrantVectorStore

logger = structlog.stdlib.get_logger(__name__)

async def setup_rag_mock_data(document_id: str):
    print("[1/9] Setting up mock prospectus in RAG Engine...")
    loader = PDFLoader(use_ocr=True)
    dummy_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
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
    print("=== Phase 4 Financial Intelligence Verification ===\n")
    document_id = str(uuid.uuid4())
    job_id = str(uuid.uuid4())
    
    try:
        await setup_rag_mock_data(document_id)
        
        # 1. Business Analysis
        print("[2/9] Executing Business Analysis Agent...")
        bus_agent = BusinessAnalysisAgent()
        bus_out = await bus_agent.run(BusinessAnalysisInput(document_id=document_id))
        print("Business Overview:", bus_out.company_overview)
        print("Citations:", bus_out.citations)
        print()
        
        # 2. Financial Analysis
        print("[3/9] Executing Financial Analysis Agent...")
        fin_agent = FinancialAnalysisAgent()
        fin_out = await fin_agent.run(FinancialAnalysisInput(document_id=document_id))
        print("Revenue Trend:", fin_out.revenue_trend)
        print("Profitability:", fin_out.profitability)
        print()
        
        # 3. Risk Assessment
        print("[4/9] Executing Risk Assessment Agent...")
        risk_agent = RiskAssessmentAgent()
        risk_out = await risk_agent.run(RiskAssessmentInput(document_id=document_id))
        print(f"Identified {len(risk_out.operational_risk)} Operational Risks.")
        if risk_out.operational_risk:
            print("Sample Risk:", risk_out.operational_risk[0].description)
        print()
        
        # 4. Governance
        print("[5/9] Executing Governance Agent...")
        gov_agent = GovernanceAgent()
        gov_out = await gov_agent.run(GovernanceInput(document_id=document_id))
        print("Board Structure:", gov_out.board_structure)
        print()
        
        # 5. Valuation
        print("[6/9] Executing Valuation Agent...")
        val_agent = ValuationAgent()
        val_out = await val_agent.run(ValuationInput(document_id=document_id))
        print("Relative PE:", val_out.relative_pe)
        print("DCF Placeholder:", val_out.dcf_placeholder)
        print()
        
        # 6. Report Generator
        print("[7/9] Executing Report Generator Agent...")
        rep_agent = ReportGeneratorAgent()
        rep_out = await rep_agent.run(ReportGeneratorInput(document_id=document_id, job_id=job_id))
        print("Final Report Size:", len(rep_out.investment_report_markdown))
        print("Preview:\n", rep_out.investment_report_markdown[:100], "...\n")
        
        # 7. Evaluation
        print("[8/9] Executing Evaluation Agent (Targeting Business Analysis)...")
        eval_agent = EvaluationAgent()
        eval_out = await eval_agent.run(EvaluationInput(document_id=document_id, target_agent="Business Analysis"))
        print(f"Evaluation Metrics:")
        print(f" - Groundedness: {eval_out.groundedness}")
        print(f" - Faithfulness: {eval_out.faithfulness}")
        print(f" - Coverage: {eval_out.coverage}")
        print(f" - Citation Completeness: {eval_out.citation_completeness}")
        print()
        
        print("[9/9] Verification Complete! All reasoning agents execute correctly through the RAG context pipeline.")
        
    except Exception as e:
        print(f"Verification Failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
