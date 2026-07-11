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

    def _build_graph(self):
        workflow = StateGraph(ImmutableGraphState)
        
        workflow.add_node("agent_document_intake", self._node_document_intake)
        workflow.add_node("agent_parser_ocr", self._node_parser_ocr)
        workflow.add_node("agent_chunking_embedding", self._node_chunking_embedding)
        workflow.add_node("agent_business_analysis", self._node_business_analysis)
        workflow.add_node("agent_financial_analysis", self._node_financial_analysis)
        workflow.add_node("agent_risk_assessment_p1", self._node_risk_assessment_p1)
        workflow.add_node("agent_valuation", self._node_valuation)
        workflow.add_node("agent_risk_assessment_p2", self._node_risk_assessment_p2)
        workflow.add_node("agent_governance", self._node_governance)
        workflow.add_node("agent_report_generator", self._node_report_generator)
        workflow.add_node("agent_evaluation", self._node_evaluation)

        workflow.set_entry_point("agent_document_intake")
        workflow.add_edge("agent_document_intake", "agent_parser_ocr")
        workflow.add_edge("agent_parser_ocr", "agent_chunking_embedding")
        
        # Parallel Execution (Group A)
        workflow.add_edge("agent_chunking_embedding", "agent_business_analysis")
        workflow.add_edge("agent_chunking_embedding", "agent_financial_analysis")
        workflow.add_edge("agent_chunking_embedding", "agent_risk_assessment_p1")
        
        # Group B waits for Group A
        workflow.add_edge("agent_business_analysis", "agent_valuation")
        workflow.add_edge("agent_financial_analysis", "agent_valuation")
        
        workflow.add_edge("agent_risk_assessment_p1", "agent_risk_assessment_p2")
        workflow.add_edge("agent_business_analysis", "agent_risk_assessment_p2")
        workflow.add_edge("agent_financial_analysis", "agent_risk_assessment_p2")

        # Synchronization for Governance
        workflow.add_edge("agent_valuation", "agent_governance")
        workflow.add_edge("agent_risk_assessment_p2", "agent_governance")

        workflow.add_edge("agent_governance", "agent_report_generator")
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

    async def _node_risk_assessment_p2(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = RiskAssessmentAgent()
        res = await agent.run(RiskAssessmentInput(document_id=state["document_id"], phase=2))
        state["risk_assessment_final"] = res.model_dump()
        return state

    async def _node_governance(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = GovernanceAgent()
        res = await agent.run(GovernanceInput(document_id=state["document_id"]))
        state["governance_approved"] = res.approved
        state["governance_report"] = res.report
        return state

    async def _node_report_generator(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = ReportGeneratorAgent()
        res = await agent.run(ReportGeneratorInput(job_id=state["job_id"], document_id=state["document_id"]))
        state["final_report_path"] = res.final_report_path
        return state

    async def _node_evaluation(self, state: ImmutableGraphState) -> ImmutableGraphState:
        agent = EvaluationAgent()
        res = await agent.run(EvaluationInput(job_id=state["job_id"], final_report_path=state.get("final_report_path", "")))
        state["evaluation_metrics"] = {"score": res.score}
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


