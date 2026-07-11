from __future__ import annotations
from pydantic import BaseModel

class GovernanceInput(BaseModel):
    all_agent_outputs: dict
    source_chunks: list[dict]

class GovernanceOutput(BaseModel):
    hallucination_flags: list[dict]
    consistency_issues: list[dict]
    citation_gaps: list[dict]
    compliance_warnings: list[str]
    overall_confidence: float
    approved: bool
