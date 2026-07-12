"""Job management endpoints — list, detail, and steps."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.schemas.common import PaginatedResponse
from backend.app.api.schemas.job import JobResponse, JobStepResponse
from backend.app.dependencies import get_db_session
from backend.app.models.job import Job, JobStep

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("", response_model=PaginatedResponse[JobResponse])
async def list_jobs(page: int = 1, page_size: int = 20, session: AsyncSession = Depends(get_db_session)) -> PaginatedResponse[JobResponse]:
    """List background jobs with pagination."""
    from sqlalchemy import func
    total = await session.scalar(select(func.count(Job.id)))
    
    stmt = select(Job).order_by(Job.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await session.execute(stmt)
    jobs = result.scalars().all()
    
    items = []
    for j in jobs:
        items.append(JobResponse(
            id=str(j.id),
            job_type=j.job_type.value,
            status=j.status.value,
            progress=j.progress,
            created_at=j.created_at,
            started_at=j.started_at,
            completed_at=j.completed_at,
            error_message=j.error_message,
            steps=[]
        ))
        
    return PaginatedResponse[JobResponse](
        items=items,
        total=total or 0,
        page=page,
        page_size=page_size,
        pages=max(1, ((total or 0) + page_size - 1) // page_size),
    )

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, session: AsyncSession = Depends(get_db_session)) -> JobResponse:
    """Get full job detail."""
    stmt = select(Job).where(Job.id == uuid.UUID(job_id))
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

@router.get("/{job_id}/result")
async def get_job_result(job_id: str, session: AsyncSession = Depends(get_db_session)):
    """Get the cached result (final state) of a job."""
    stmt = select(Job).where(Job.id == uuid.UUID(job_id))
    job = (await session.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job.result or {}

@router.get("/{job_id}/steps", response_model=list[JobStepResponse])
async def get_job_steps(job_id: str, session: AsyncSession = Depends(get_db_session)) -> list[JobStepResponse]:
    """List all steps of a job."""
    stmt = select(JobStep).where(JobStep.job_id == uuid.UUID(job_id)).order_by(JobStep.step_order)
    result = await session.execute(stmt)
    steps = result.scalars().all()
    
    return [
        JobStepResponse(
            id=str(s.id),
            step_name=s.step_name,
            step_order=s.step_order,
            status=s.status.value,
            progress=s.progress,
            started_at=s.started_at,
            completed_at=s.completed_at,
            error_message=s.error_message,
        ) for s in steps
    ]
