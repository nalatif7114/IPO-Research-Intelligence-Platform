"""Analysis endpoints — start, status, detail, and cancel."""

from __future__ import annotations

from datetime import datetime, timezone

import structlog
from fastapi import APIRouter

from backend.app.api.schemas.common import MessageResponse, StatusResponse
from backend.app.api.schemas.job import JobResponse, JobStatusResponse

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/start", response_model=JobResponse)
async def start_analysis(prospectus_id: str | None = None) -> JobResponse:
    """Kick off an AI analysis job for a prospectus.

    Args:
        prospectus_id: Optional prospectus UUID to analyse.

    Returns:
        The newly created job with initial status.
    """
    now = datetime.now(tz=timezone.utc)
    logger.info("analysis_started", prospectus_id=prospectus_id)
    return JobResponse(
        id="00000000-0000-0000-0000-000000000020",
        job_type="analysis",
        status="pending",
        progress=0.0,
        created_at=now,
        started_at=None,
        completed_at=None,
        error_message=None,
        steps=[],
    )


@router.get("/{analysis_id}/status", response_model=JobStatusResponse)
async def get_analysis_status(analysis_id: str) -> JobStatusResponse:
    """Check current status of an analysis job.

    Args:
        analysis_id: Job UUID.

    Returns:
        Lightweight status response.
    """
    return JobStatusResponse(
        id=analysis_id,
        status="running",
        progress=45.0,
    )


@router.get("/{analysis_id}", response_model=JobResponse)
async def get_analysis_detail(analysis_id: str) -> JobResponse:
    """Get full details of an analysis job including steps.

    Args:
        analysis_id: Job UUID.

    Returns:
        Complete job detail with steps.
    """
    now = datetime.now(tz=timezone.utc)
    return JobResponse(
        id=analysis_id,
        job_type="analysis",
        status="running",
        progress=45.0,
        created_at=now,
        started_at=now,
        completed_at=None,
        error_message=None,
        steps=[],
    )


@router.post("/{analysis_id}/cancel", response_model=MessageResponse)
async def cancel_analysis(analysis_id: str) -> MessageResponse:
    """Cancel a running analysis job.

    Args:
        analysis_id: Job UUID.

    Returns:
        Cancellation confirmation.
    """
    logger.info("analysis_cancelled", analysis_id=analysis_id)
    return MessageResponse(message=f"Analysis {analysis_id} cancellation requested.")
