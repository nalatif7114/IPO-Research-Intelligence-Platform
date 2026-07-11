from __future__ import annotations

from pydantic import BaseModel, Field


class OrchestratorInput(BaseModel):
    """Input schema for the Orchestrator Agent."""

    job_id: str
    prospectus_id: str
    requested_sections: list[str] = Field(default_factory=list)


class OrchestratorOutput(BaseModel):
    """Output schema for the Orchestrator Agent."""

    job_id: str
    status: str
    steps_completed: list[str] = Field(default_factory=list)
