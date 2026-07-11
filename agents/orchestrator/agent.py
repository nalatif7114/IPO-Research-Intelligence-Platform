from __future__ import annotations

from agents.agent_common.base_agent import AgentConfig, BaseAgent
from agents.orchestrator.schemas import OrchestratorInput, OrchestratorOutput


class OrchestratorAgent(BaseAgent[OrchestratorInput, OrchestratorOutput]):
    """Orchestrates the end-to-end IPO analysis pipeline.

    Coordinates all downstream agents, manages the DAG of tasks, and
    tracks overall job progress.
    """

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(name="orchestrator"))

    async def execute(self, input_data: OrchestratorInput) -> OrchestratorOutput:
        """Dispatch tasks to downstream agents and aggregate results."""
        raise NotImplementedError

    async def validate_input(self, input_data: OrchestratorInput) -> bool:
        """Ensure the job_id and prospectus_id are present."""
        raise NotImplementedError

    async def handle_error(self, error: Exception) -> None:
        """Log and potentially escalate orchestration failures."""
        raise NotImplementedError
