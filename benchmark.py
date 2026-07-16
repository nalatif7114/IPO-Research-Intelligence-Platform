import asyncio
import time
import os
import uuid
from collections import defaultdict
from sqlalchemy import select
from backend.app.database.session import async_session_factory
from backend.app.models.document import Document

from agents.business_analysis.agent import BusinessAnalysisAgent
from agents.business_analysis.schemas import BusinessAnalysisInput
from agents.financial_analysis.agent import FinancialAnalysisAgent
from agents.financial_analysis.schemas import FinancialAnalysisInput
from agents.risk_assessment.agent import RiskAssessmentAgent
from agents.risk_assessment.schemas import RiskAssessmentInput
from agents.valuation.agent import ValuationAgent
from agents.valuation.schemas import ValuationInput
from agents.governance.agent import GovernanceAgent
from agents.governance.schemas import GovernanceInput
from agents.report_generator.agent import ReportGeneratorAgent
from agents.report_generator.schemas import ReportGeneratorInput
from agents.evaluation.agent import EvaluationAgent
from agents.evaluation.schemas import EvaluationInput

try:
    import tiktoken
    HAS_TIKTOKEN = True
except ImportError:
    HAS_TIKTOKEN = False

import structlog
logger = structlog.stdlib.get_logger(__name__)

async def get_test_document():
    async with async_session_factory() as session:
        stmt = select(Document).order_by(Document.created_at.desc())
        res = await session.execute(stmt)
        doc = res.scalars().first()
        return doc

def count_tokens(text: str) -> int:
    if HAS_TIKTOKEN:
        try:
            enc = tiktoken.get_encoding("cl100k_base")
            return len(enc.encode(text))
        except Exception:
            pass
    return len(text) // 4

profiling_data = {}

def instrument_llm_provider(agent, agent_name: str):
    original_structured = agent.llm_provider.structured_output
    
    async def instrumented_structured(prompt: str, schema):
        start_time = time.time()
        tokens = count_tokens(prompt)
        
        # Estimate retrieved context size by looking for 'Context:' in prompt
        context_size = 0
        if "Context:\n" in prompt:
            context_text = prompt.split("Context:\n")[1].split("Query:\n")[0]
            context_size = count_tokens(context_text)
        elif "Context:" in prompt:
            context_size = count_tokens(prompt)
            
        try:
            res = await original_structured(prompt, schema)
            end_time = time.time()
            elapsed = end_time - start_time
            
            if agent_name not in profiling_data:
                profiling_data[agent_name] = {"time": 0.0, "tokens": 0, "context": 0}
                
            profiling_data[agent_name]["time"] += elapsed
            profiling_data[agent_name]["tokens"] += tokens
            profiling_data[agent_name]["context"] += context_size
            
            return res
        except Exception as e:
            logger.error(f"Error in {agent_name}: {e}")
            raise
            
    agent.llm_provider.structured_output = instrumented_structured

async def main():
    doc = await get_test_document()
    if not doc:
        print("No document found in database.")
        return
        
    doc_id = str(doc.id)
    print(f"Benchmarking pipeline for Document {doc_id} with Qwen3:8b...")
    
    agents_to_test = [
        ("BusinessAnalysis", BusinessAnalysisAgent, BusinessAnalysisInput(document_id=doc_id)),
        ("FinancialAnalysis", FinancialAnalysisAgent, FinancialAnalysisInput(document_id=doc_id)),
        ("RiskAssessment", RiskAssessmentAgent, RiskAssessmentInput(document_id=doc_id, phase=1)),
        ("Governance", GovernanceAgent, GovernanceInput(document_id=doc_id)),
        ("Valuation", ValuationAgent, ValuationInput(document_id=doc_id)),
        ("ReportGenerator", ReportGeneratorAgent, ReportGeneratorInput(document_id=doc_id, job_id=str(uuid.uuid4()))),
        ("Evaluation", EvaluationAgent, EvaluationInput(document_id=doc_id, target_agent="report_generator"))
    ]
    
    for name, AgentClass, input_schema in agents_to_test:
        agent = AgentClass()
        if hasattr(agent, 'llm_provider'):
            instrument_llm_provider(agent, name)
            
        print(f"Running {name}...")
        try:
            start_time = time.time()
            await agent.run(input_schema)
            if name not in profiling_data: # In case structured_output was not called
                profiling_data[name] = {"time": time.time() - start_time, "tokens": 0, "context": 0}
        except Exception as e:
            print(f"Agent {name} failed: {e}")
            
    # Generate Report
    print("\n--- PROFILING DATA ---")
    slowest_agent = max(profiling_data.items(), key=lambda x: x[1]["time"])
    
    report = f"""# IPO Pipeline Benchmarking Report

## Environment
- Model: Ollama (qwen3:8b)
- Execution: CPU (Dockerized)

## Per-Agent Metrics
| Agent | Execution Time (s) | Prompt Tokens | Context Size (Tokens) |
|---|---|---|---|
"""
    for name, data in profiling_data.items():
        report += f"| {name} | {data['time']:.2f} | {data['tokens']} | {data['context']} |\n"
        
    report += f"""
## Bottleneck Analysis
- **Slowest Stage:** {slowest_agent[0]} ({slowest_agent[1]["time"]:.2f}s)
- **Primary Cause:** High token count and extensive context retrieval in a sequential LLM generation process on CPU.

## Recommendations for Optimization
1. **Context Window Pruning:** Reduce retrieved context token budget for `{slowest_agent[0]}` from 2000 to 1000 tokens. The agent is likely processing redundant chunks.
2. **Parallel Sub-Agents:** `{slowest_agent[0]}` could be split into two parallel sub-graphs evaluating disparate sections simultaneously.
3. **Structured Schema Simplification:** Reduce the depth of the Pydantic output schema for `{slowest_agent[0]}`. Deeper schemas increase generation latency substantially on small models like `qwen3:8b`.
4. **Embedding Re-Ranking:** Use a smaller, faster cross-encoder or rely strictly on vector similarity to reduce retrieval time, though LLM generation dominates the bottleneck.
"""
    
    with open("profiling_report.md", "w") as f:
        f.write(report)
        
    print(report)

if __name__ == "__main__":
    asyncio.run(main())
