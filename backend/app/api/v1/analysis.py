"""Analysis endpoints — start, status, detail, and cancel."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.schemas.common import MessageResponse, StatusResponse
from backend.app.api.schemas.job import JobResponse, JobStatusResponse
from backend.app.dependencies import get_db_session
from backend.app.models.job import Job, JobStatus

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/start", response_model=JobResponse)
async def start_analysis(prospectus_id: str | None = None) -> JobResponse:
    """Kick off an AI analysis job for a prospectus. (Not used directly by upload)"""
    raise HTTPException(status_code=501, detail="Please upload a document to start analysis.")


@router.get("/{analysis_id}/status", response_model=JobStatusResponse)
async def get_analysis_status(analysis_id: str, session: AsyncSession = Depends(get_db_session)) -> JobStatusResponse:
    stmt = select(Job).where(Job.id == uuid.UUID(analysis_id))
    job = (await session.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return JobStatusResponse(
        id=analysis_id,
        status=job.status.value,
        progress=job.progress,
    )


@router.get("/{analysis_id}", response_model=JobResponse)
async def get_analysis_detail(analysis_id: str, session: AsyncSession = Depends(get_db_session)) -> JobResponse:
    stmt = select(Job).where(Job.id == uuid.UUID(analysis_id))
    job = (await session.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return JobResponse(
        id=str(job.id),
        job_type=job.job_type.value,
        status=job.status.value,
        progress=job.progress,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
        error_message=job.error_message,
        steps=[],
    )


@router.post("/{analysis_id}/cancel", response_model=MessageResponse)
async def cancel_analysis(analysis_id: str, session: AsyncSession = Depends(get_db_session)) -> MessageResponse:
    stmt = select(Job).where(Job.id == uuid.UUID(analysis_id))
    job = (await session.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job.status = JobStatus.CANCELLED
    await session.commit()
    return MessageResponse(message=f"Analysis {analysis_id} cancelled.")
