from __future__ import annotations

from typing import Any, Optional, TypedDict
from pydantic import BaseModel, Field

class OrchestratorInput(BaseModel):
    """Input schema for the Orchestrator Agent."""
    job_id: str
    document_id: str
    prospectus_id: str
    requested_sections: list[str] = Field(default_factory=list)

class OrchestratorOutput(BaseModel):
    """Output schema for the Orchestrator Agent."""
    job_id: str
    status: str
    steps_completed: list[str] = Field(default_factory=list)

class ImmutableGraphState(TypedDict, total=False):
    """Production-ready immutable GraphState for the LangGraph workflow."""
    
    # Core Metadata
    job_id: str
    document_id: str
    prospectus_id: str
    
    # Stage 1: Intake & Parsing
    raw_storage_path: Optional[str]
    parsed_storage_path: Optional[str]
    parsed_sections: Optional[list[str]]
    
    # Stage 2: Chunking & Embedding
    total_chunks: Optional[int]
    embedding_dimensions: Optional[int]
    
    # Stage 3: Parallel Analysis Artifacts
    business_analysis: Optional[dict[str, Any]]
    financial_analysis: Optional[dict[str, Any]]
    risk_assessment_phase1: Optional[dict[str, Any]]
    
    # Stage 4: Valuation & Risk Phase 2
    valuation: Optional[dict[str, Any]]
    risk_assessment_final: Optional[dict[str, Any]]
    
    # Stage 5: Governance
    governance_approved: Optional[bool]
    governance_report: Optional[dict[str, Any]]
    
    # Stage 6: Report Generation & Evaluation
    final_report_path: Optional[str]
    evaluation_metrics: Optional[dict[str, Any]]
    
    # Orchestration Tracking
    errors: Optional[list[str]]
