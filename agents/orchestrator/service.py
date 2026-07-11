from __future__ import annotations

import structlog

logger = structlog.get_logger()


class OrchestratorService:
    """Service layer for the Orchestrator Agent.

    Handles coordination logic such as building the task DAG,
    dispatching work to downstream agents, and monitoring progress.
    """

    def __init__(self) -> None:
        self.logger = logger.bind(service="orchestrator")

    async def build_execution_plan(self, requested_sections: list[str]) -> list[str]:
        """Build a task execution plan based on requested sections."""
        raise NotImplementedError

    async def dispatch_agent(self, agent_name: str, payload: dict) -> str:
        """Dispatch a task to a specific downstream agent."""
        raise NotImplementedError

    async def check_job_status(self, job_id: str) -> dict:
        """Query the current status of an orchestration job."""
        raise NotImplementedError
