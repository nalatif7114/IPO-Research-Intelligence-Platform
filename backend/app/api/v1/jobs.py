"""Job management endpoints — list, detail, and steps."""

from __future__ import annotations

from datetime import datetime, timezone

import structlog
from fastapi import APIRouter

from backend.app.api.schemas.common import PaginatedResponse
from backend.app.api.schemas.job import JobResponse, JobStepResponse

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=PaginatedResponse[JobResponse])
async def list_jobs(page: int = 1, page_size: int = 20) -> PaginatedResponse[JobResponse]:
    """List background jobs with pagination.

    Args:
        page: Page number.
        page_size: Items per page.

    Returns:
        Paginated list of jobs.
    """
    now = datetime.now(tz=timezone.utc)
    mock_job = JobResponse(
        id="00000000-0000-0000-0000-000000000020",
        job_type="document_processing",
        status="completed",
        progress=100.0,
        created_at=now,
        started_at=now,
        completed_at=now,
        error_message=None,
        steps=[],
    )
    return PaginatedResponse[JobResponse](
        items=[mock_job],
        total=1,
        page=page,
        page_size=page_size,
        pages=1,
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str) -> JobResponse:
    """Get full job detail.

    Args:
        job_id: Job UUID.

    Returns:
        Complete job information.
    """
    now = datetime.now(tz=timezone.utc)
    return JobResponse(
        id=job_id,
        job_type="analysis",
        status="running",
        progress=60.0,
        created_at=now,
        started_at=now,
        completed_at=None,
        error_message=None,
        steps=[],
    )


@router.get("/{job_id}/steps", response_model=list[JobStepResponse])
async def get_job_steps(job_id: str) -> list[JobStepResponse]:
    """List all steps of a job.

    Args:
        job_id: Job UUID.

    Returns:
        Ordered list of job steps.
    """
    now = datetime.now(tz=timezone.utc)
    return [
        JobStepResponse(
            id="00000000-0000-0000-0000-000000000021",
            step_name="Document Parsing",
            step_order=1,
            status="completed",
            progress=100.0,
            started_at=now,
            completed_at=now,
            error_message=None,
        ),
        JobStepResponse(
            id="00000000-0000-0000-0000-000000000022",
            step_name="Chunking & Embedding",
            step_order=2,
            status="running",
            progress=50.0,
            started_at=now,
            completed_at=None,
            error_message=None,
        ),
    ]
