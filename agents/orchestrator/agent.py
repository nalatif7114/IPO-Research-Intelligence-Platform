from __future__ import annotations
import asyncio
from typing import cast
from langgraph.graph import StateGraph, END

from agents.agent_common.base_agent import AgentConfig, BaseAgent
from agents.orchestrator.schemas import OrchestratorInput, OrchestratorOutput, ImmutableGraphState
from events.bus import RedisEventBus
from backend.app.config import get_settings

# Import all agents and their inputs
from agents.document_intake.agent import DocumentIntakeAgent
from agents.document_intake.schemas import DocumentIntakeInput
from agents.parser_ocr.agent import ParserOcrAgent
from agents.parser_ocr.schemas import ParserOcrInput
from agents.chunking_embedding.agent import ChunkingEmbeddingAgent
from agents.chunking_embedding.schemas import ChunkingEmbeddingInput
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

settings = get_settings()

class OrchestratorAgent(BaseAgent[OrchestratorInput, OrchestratorOutput]):
    """Orchestrates the end-to-end IPO analysis pipeline using LangGraph DAG."""

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(name="orchestrator"))
        self.bus = RedisEventBus(settings.redis_url)
        self.graph = self._build_graph()


    async def _update_job_step(self, job_id: str, step_name: str, step_order: int, status: str, result: dict = None):
        from backend.app.database.session import async_session_factory
        from backend.app.models.job import JobStep, JobStatus, Job
        from sqlalchemy import select, func
        from datetime import datetime, timezone
        import uuid
        
        async with async_session_factory() as session:
            error_message = result.get("error") if status == "failed" and result else None
            stmt = select(JobStep).where(JobStep.job_id == uuid.UUID(job_id), JobStep.step_name == step_name)
            step = (await session.execute(stmt)).scalar_one_or_none()
            
            if not step:
                step = JobStep(
                    job_id=uuid.UUID(job_id),
                    step_name=step_name,
                    step_order=step_order,
                    status=JobStatus(status),
                    started_at=datetime.now(timezone.utc) if status == "running" else None,
                    progress=50.0 if status == "running" else (100.0 if status == "completed" else 0.0),
                    result=result,
                    error_message=error_message,
                )
                session.add(step)
            else:
                step.status = JobStatus(status)
                if status == "completed":
                    step.completed_at = datetime.now(timezone.utc)
                    step.progress = 100.0
                if result:
                    step.result = result
                if status == "failed":
                    step.error_message = error_message
            
            if status == "completed":
                stmt_job = select(Job).where(Job.id == uuid.UUID(job_id))
                job = (await session.execute(stmt_job)).scalar_one_or_none()
                if job:
                    completed_steps_stmt = select(func.count(JobStep.id)).where(
                        JobStep.job_id == uuid.UUID(job_id),
                        JobStep.status == JobStatus.COMPLETED,
                    )
                    total_steps = 10
                    completed_steps = (await session.execute(completed_steps_stmt)).scalar() or 0
                    job.progress = round((completed_steps / total_steps) * 100, 2)

            if status == "failed":
                stmt_job = select(Job).where(Job.id == uuid.UUID(job_id))
                job = (await session.execute(stmt_job)).scalar_one_or_none()
                if job:
                    job.status = JobStatus.FAILED
                    job.error_message = error_message
            
            await session.commit()

    def _wrap_node(self, step_name: str, step_order: int, node_func):
        async def wrapper(state: dict) -> dict:
            await self._update_job_step(state["job_id"], step_name, step_order, "running")
            try:
                new_state = await node_func(state)
                await self._update_job_step(state["job_id"], step_name, step_order, "completed")
                return new_state
            except Exception as e:
                await self._update_job_step(state["job_id"], step_name, step_order, "failed", {"error": str(e)})
                raise
        return wrapper

    def _build_graph(self):
        workflow = StateGraph(ImmutableGraphState)
        
        workflow.add_node("agent_document_intake", self._wrap_node("Document Intake", 1, self._node_document_intake))
        workflow.add_node("agent_parser_ocr", self._wrap_node("Document Parsing", 2, self._node_parser_ocr))
        workflow.add_node("agent_chunking_embedding", self._wrap_node("Chunking & Embedding", 3, self._node_chunking_embedding))
        workflow.add_node("agent_business_analysis", self._wrap_node("Business Analysis", 4, self._node_business_analysis))
        workflow.add_node("agent_financial_analysis", self._wrap_node("Financial Analysis", 5, self._node_financial_analysis))
        workflow.add_node("agent_risk_assessment_p1", self._wrap_node("Risk Assessment Phase 1", 6, self._node_risk_assessment_p1))
        workflow.add_node("agent_valuation", self._wrap_node("Valuation Modeling", 7, self._node_valuation))
        workflow.add_node("agent_governance", self._wrap_node("Governance Analysis", 9, self._node_governance))
        workflow.add_node("agent_report_generator", self._wrap_node("Report Synthesis", 10, self._node_report_generator))
        workflow.add_node("agent_evaluation", self._wrap_node("Quality Check", 11, self._node_evaluation))

        workflow.set_entry_point("agent_document_intake")
        workflow.add_edge("agent_document_intake", "agent_parser_ocr")
        workflow.add_edge("agent_parser_ocr", "agent_chunking_embedding")
        workflow.add_edge("agent_chunking_embedding", "agent_business_analysis")
        workflow.add_edge("agent_business_analysis", "agent_financial_analysis")
        workflow.add_edge("agent_financial_analysis", "agent_risk_assessment_p1")
        workflow.add_edge("agent_risk_assessment_p1", "agent_governance")
        workflow.add_edge("agent_governance", "agent_valuation")
        workflow.add_edge("agent_valuation", "agent_report_generator")
        workflow.add_edge("agent_report_generator", "agent_evaluation")
        workflow.add_edge("agent_evaluation", END)
        
        return workflow.compile()

    async def _node_document_intake(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = DocumentIntakeAgent()
        res = await agent.run(DocumentIntakeInput(job_id=state["job_id"], document_id=state["document_id"]))
        state["raw_storage_path"] = res.raw_storage_path
        return state

    async def _node_parser_ocr(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = ParserOcrAgent()
        res = await agent.run(ParserOcrInput(document_id=state["document_id"], raw_storage_path=state.get("raw_storage_path", "")))
        state["parsed_storage_path"] = res.parsed_storage_path
        state["parsed_sections"] = res.parsed_sections
        return state

    async def _node_chunking_embedding(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = ChunkingEmbeddingAgent()
        res = await agent.run(ChunkingEmbeddingInput(document_id=state["document_id"], parsed_storage_path=state.get("parsed_storage_path", "")))
        state["total_chunks"] = res.total_chunks
        state["embedding_dimensions"] = res.embedding_dimensions
        return state

    async def _node_business_analysis(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = BusinessAnalysisAgent()
        res = await agent.run(BusinessAnalysisInput(document_id=state["document_id"]))
        state["business_analysis"] = res.model_dump()
        return state

    async def _node_financial_analysis(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = FinancialAnalysisAgent()
        res = await agent.run(FinancialAnalysisInput(document_id=state["document_id"]))
        state["financial_analysis"] = res.model_dump()
        return state

    async def _node_risk_assessment_p1(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = RiskAssessmentAgent()
        res = await agent.run(RiskAssessmentInput(document_id=state["document_id"], phase=1))
        state["risk_assessment_phase1"] = res.model_dump()
        return state

    async def _node_valuation(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = ValuationAgent()
        res = await agent.run(ValuationInput(document_id=state["document_id"]))
        state["valuation"] = res.model_dump()
        return state

    async def _node_governance(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = GovernanceAgent()
        res = await agent.run(GovernanceInput(document_id=state["document_id"]))
        state["governance_analysis"] = res.model_dump()
        return state

    async def _node_report_generator(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = ReportGeneratorAgent()
        res = await agent.run(ReportGeneratorInput(job_id=state["job_id"], document_id=state["document_id"]))
        state["investment_report_markdown"] = res.investment_report_markdown
        state["report_citations"] = res.citations
        return state

    async def _node_evaluation(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = EvaluationAgent()
        res = await agent.run(EvaluationInput(document_id=state["document_id"], target_agent="report_generator"))
        state["evaluation_metrics"] = res.model_dump()
        return state

    async def execute(self, input_data: OrchestratorInput) -> OrchestratorOutput:
        """Run the LangGraph workflow."""
        initial_state: ImmutableGraphState = {
            "job_id": input_data.job_id,
            "document_id": input_data.document_id,
            "prospectus_id": input_data.prospectus_id,
        }
        
        # Invoke the LangGraph workflow
        final_state = await self.graph.ainvoke(initial_state)
        
        from backend.app.database.session import async_session_factory
        from backend.app.models.job import Job, JobStatus
        from sqlalchemy import select
        import uuid
        from datetime import datetime, timezone
        
        async with async_session_factory() as session:
            stmt = select(Job).where(Job.id == uuid.UUID(input_data.job_id))
            job = (await session.execute(stmt)).scalar_one_or_none()
            if job:
                # Store final_state in result for caching
                job.result = dict(final_state)
                job.status = JobStatus.COMPLETED
                job.progress = 100.0
                job.completed_at = datetime.now(timezone.utc)
            await session.commit()
            
        return OrchestratorOutput(
            job_id=input_data.job_id,
            status="completed",
            steps_completed=["all"]
        )

    async def validate_input(self, input_data: OrchestratorInput) -> bool:
        """Ensure the job_id and prospectus_id are present."""
        return True

    async def handle_error(self, error: Exception) -> None:
        """Log and potentially escalate orchestration failures."""
        self.logger.error("orchestrator_failed", error=str(error))