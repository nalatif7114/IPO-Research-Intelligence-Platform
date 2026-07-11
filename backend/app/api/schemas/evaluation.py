"""Pydantic schemas for evaluation and feedback endpoints."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class EvaluationScoreResponse(BaseModel):
    """A single evaluation metric score."""

    metric: str = Field(..., description="Evaluation metric name.")
    score: float = Field(..., description="Metric score (0.0–1.0).")
    explanation: str | None = Field(default=None)

    model_config = {"from_attributes": True}


class EvaluationResponse(BaseModel):
    """Aggregated evaluation scores for a report."""

    report_id: str = Field(..., description="Report UUID.")
    scores: list[EvaluationScoreResponse] = Field(default_factory=list)
    overall_score: float = Field(0.0, description="Weighted overall score.")
    evaluated_at: datetime = Field(...)


class FeedbackCreate(BaseModel):
    """Request body to submit user feedback."""

    report_id: str = Field(..., description="Report UUID.")
    rating: str = Field(..., description="Rating value (e.g. 'good', 'poor').")
    comment: str | None = Field(default=None, max_length=5000, description="Optional comment.")
    tags: dict | None = Field(default=None, description="Optional classification tags.")
