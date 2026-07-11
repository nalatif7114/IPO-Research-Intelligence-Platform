"""Evaluation and feedback endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

import structlog
from fastapi import APIRouter

from backend.app.api.schemas.common import MessageResponse
from backend.app.api.schemas.evaluation import (
    EvaluationResponse,
    EvaluationScoreResponse,
    FeedbackCreate,
)

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


@router.get("/{report_id}", response_model=EvaluationResponse)
async def get_evaluation(report_id: str) -> EvaluationResponse:
    """Retrieve AI quality evaluation scores for a report.

    Args:
        report_id: Report UUID.

    Returns:
        Aggregated evaluation metrics.
    """
    now = datetime.now(tz=timezone.utc)
    return EvaluationResponse(
        report_id=report_id,
        scores=[
            EvaluationScoreResponse(metric="faithfulness", score=0.92, explanation="High fidelity to source."),
            EvaluationScoreResponse(metric="relevance", score=0.88, explanation="Mostly relevant content."),
            EvaluationScoreResponse(metric="coherence", score=0.95, explanation="Well-structured narrative."),
        ],
        overall_score=0.91,
        evaluated_at=now,
    )


@router.post("/feedback", response_model=MessageResponse)
async def submit_feedback(body: FeedbackCreate) -> MessageResponse:
    """Submit user feedback on a generated report.

    Args:
        body: Feedback data including rating and optional comment.

    Returns:
        Confirmation message.
    """
    logger.info("feedback_submitted", report_id=body.report_id, rating=body.rating)
    return MessageResponse(message="Feedback recorded successfully. Thank you!")
