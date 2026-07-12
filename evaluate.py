import asyncio
import json
import time
import os
import sys
import uuid

# Ensure backend root is in pythonpath
sys.path.append(os.path.dirname(__file__))

from agents.business_analysis.agent import BusinessAnalysisAgent
from agents.financial_analysis.agent import FinancialAnalysisAgent
from agents.risk_assessment.agent import RiskAssessmentAgent
from agents.governance.agent import GovernanceAgent
from agents.valuation.agent import ValuationAgent

from agents.business_analysis.schemas import BusinessAnalysisInput
from agents.financial_analysis.schemas import FinancialAnalysisInput
from agents.risk_assessment.schemas import RiskAssessmentInput
from agents.governance.schemas import GovernanceInput
from agents.valuation.schemas import ValuationInput

from eval.metrics import (
    calculate_recall_at_k, calculate_precision_at_k, 
    calculate_mrr, calculate_ndcg,
    calculate_citation_accuracy, calculate_hallucination_rate
)
from eval.reporter import (
    generate_json_report, generate_csv_report, 
    generate_html_dashboard, generate_markdown_summary
)

from vector_store.qdrant_client import QdrantVectorStore
from embeddings.provider import MockEmbeddingProvider
from rag.chunker import Chunk, ChunkMetadata

# --- MOCK SETUP ---
async def setup_benchmark_qdrant():
    print("Setting up Qdrant with benchmark Ground Truth chunks...")
    qdrant_store = QdrantVectorStore(host="qdrant", port=6333)
    embed_provider = MockEmbeddingProvider()
    
    with open("eval/benchmark_dataset.json", "r", encoding="utf-8") as f:
        dataset = json.load(f)
        
    vectors = []
    for prospectus in dataset["prospectuses"]:
        doc_id = prospectus["document_id"]
        for q in prospectus["questions"]:
            for expected_chunk_id, expected_cit in zip(q.get("expected_chunk_ids", []), q.get("expected_citations", [])):
                point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, expected_chunk_id))
                vectors.append({
                    "id": point_id,
                    "vector": embed_provider.embed_query(expected_cit),
                    "payload": {
                        "chunk_id": expected_chunk_id, 
                        "document_id": doc_id, 
                        "content": expected_cit
                    }
                })
    if vectors:
        await qdrant_store.upsert(collection="global_prospectus_collection", vectors=vectors)
    print(f"Upserted {len(vectors)} chunks.")


async def execute_agent(category: str, document_id: str, query: str):
    agent_output = None
    retrieved_chunks = []
    
    try:
        if category == "Business":
            agent = BusinessAnalysisAgent()
        elif category == "Financial":
            agent = FinancialAnalysisAgent()
        elif category == "Risk":
            agent = RiskAssessmentAgent()
        elif category == "Governance":
            agent = GovernanceAgent()
        elif category == "Valuation":
            agent = ValuationAgent()
            
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key or api_key == "mock" or api_key.startswith("YOUR_"):
            from agents.agent_common.llm import MockLLMProvider
            agent.llm_provider = MockLLMProvider()
            
        if category != "Valuation":
            agent_output = await agent.execute_reasoning(query, document_id)
        else:
            agent_output = await agent.execute(ValuationInput(document_id=document_id))
            
        # RAG metrics extraction
        if category != "Valuation":
            results = await agent.retriever.retrieve(query=query, top_k=5, filters={"document_id": document_id})
        else:
            results = await agent.retriever.retrieve(query="valuation models pricing IPO cash flow discounts growth competitive thesis recommendation margin of safety", top_k=5, filters={"document_id": document_id})
            
        retrieved_chunks = []
        retrieved_texts = []
        for r in results:
            if hasattr(r, 'metadata') and hasattr(r.metadata, 'chunk_id'):
                retrieved_chunks.append(r.metadata.chunk_id)
            elif hasattr(r, 'metadata') and isinstance(r.metadata, dict):
                retrieved_chunks.append(r.metadata.get('chunk_id'))
            elif isinstance(r, dict) and 'metadata' in r:
                retrieved_chunks.append(r['metadata'].get('chunk_id'))
                
            if hasattr(r, 'content'):
                retrieved_texts.append(r.content)
            elif isinstance(r, dict):
                retrieved_texts.append(r.get('content'))
        
    except Exception as e:
        print(f"Agent execution failed for {category}: {e}")
        retrieved_texts = []
        
    return agent_output, retrieved_chunks, retrieved_texts

async def run_evaluation():
    print("Starting IPO Platform Evaluation Benchmark...")
    await setup_benchmark_qdrant()
    
    with open("eval/benchmark_dataset.json", "r", encoding="utf-8") as f:
        dataset = json.load(f)
        
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "mock" or api_key.startswith("YOUR_"):
        print("WARNING: GEMINI_API_KEY is missing or mock. Evaluation will use MockLLMProvider and metrics will reflect mock outputs.")
        
    results = []
    
    for prospectus in dataset["prospectuses"]:
        doc_id = prospectus["document_id"]
        company_name = prospectus["company_name"]
        
        print(f"\nEvaluating: {company_name} ({doc_id})")
        
        for q in prospectus["questions"]:
            print(f"  -> Q: {q['query']}")
            
            start_time = time.time()
            
            agent_output, retrieved_chunk_ids, retrieved_texts = await execute_agent(q["category"], doc_id, q["query"])
            
            latency_ms = (time.time() - start_time) * 1000
            
            expected_chunk_ids = q.get("expected_chunk_ids", [])
            expected_citations = q.get("expected_citations", [])
            
            # --- Retrieval Metrics ---
            recall_5 = calculate_recall_at_k(retrieved_chunk_ids, expected_chunk_ids, k=5)
            prec_5 = calculate_precision_at_k(retrieved_chunk_ids, expected_chunk_ids, k=5)
            mrr = calculate_mrr(retrieved_chunk_ids, expected_chunk_ids)
            ndcg = calculate_ndcg(retrieved_chunk_ids, expected_chunk_ids)
            
            # --- LLM Metrics ---
            cit_acc = 0.0
            hallucination_rate = 0.0
            
            if agent_output:
                output_dict = agent_output.model_dump() if hasattr(agent_output, "model_dump") else agent_output
                
                # Extract all citations from the structured output
                generated_citations = []
                def extract_citations(obj):
                    if isinstance(obj, dict):
                        if "citations" in obj and isinstance(obj["citations"], list):
                            generated_citations.extend(obj["citations"])
                        else:
                            for k, v in obj.items():
                                extract_citations(v)
                    elif isinstance(obj, list):
                        for item in obj:
                            extract_citations(item)
                
                extract_citations(output_dict)
                cit_acc = calculate_citation_accuracy(generated_citations, expected_citations)
                hallucination_rate = calculate_hallucination_rate(output_dict, retrieved_texts)

            res = {
                "document_id": doc_id,
                "question_id": q["id"],
                "category": q["category"],
                "latency_ms": latency_ms,
                "recall_at_5": recall_5,
                "precision_at_5": prec_5,
                "mrr": mrr,
                "ndcg": ndcg,
                "citation_accuracy": cit_acc,
                "hallucination_rate": hallucination_rate
            }
            results.append(res)
            
    print("\nEvaluation completed. Generating reports...")
    
    os.makedirs("output", exist_ok=True)
    generate_json_report(results, "output/evaluation.json")
    generate_csv_report(results, "output/evaluation.csv")
    generate_html_dashboard(results, "output/evaluation.html")
    generate_markdown_summary(results, "output/summary.md")
    
    print("Reports successfully generated in /output.")

if __name__ == "__main__":
    asyncio.run(run_evaluation())
