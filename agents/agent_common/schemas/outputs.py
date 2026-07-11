from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ConfidenceScore(BaseModel):
    """A numeric confidence score with an optional explanation."""

    score: float = Field(ge=0.0, le=1.0, description="Confidence value between 0 and 1.")
    label: str = ""
    explanation: str = ""


class CitedStatement(BaseModel):
    """A statement with provenance information for governance traceability."""

    text: str
    source_chunk_ids: list[str] = []
    page_numbers: list[int] = []
    confidence: ConfidenceScore | None = None


class BaseAgentOutput(BaseModel):
    """Common base for all agent outputs."""

    agent_name: str
    job_id: str
    source_citations: list[CitedStatement] = []
    metadata: dict[str, Any] = {}
