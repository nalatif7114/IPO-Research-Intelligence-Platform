"""Pydantic schemas for job-related endpoints."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    """Request body to create a new background job."""

    job_type: str = Field(..., description="Type of job to create.")
    parameters: dict | None = Field(default=None, description="Job parameters.")


class JobStepResponse(BaseModel):
    """Representation of a single job step."""

    id: str = Field(..., description="Step UUID.")
    step_name: str = Field(..., description="Name of the step.")
    step_order: int = Field(..., description="Execution order.")
    status: str = Field(..., description="Step status.")
    progress: float = Field(0.0, description="Step progress percentage.")
    started_at: datetime | None = Field(default=None)
    completed_at: datetime | None = Field(default=None)
    error_message: str | None = Field(default=None)

    model_config = {"from_attributes": True}


class JobResponse(BaseModel):
    """Full job detail response."""

    id: str = Field(..., description="Job UUID.")
    job_type: str = Field(..., description="Type of job.")
    status: str = Field(..., description="Overall job status.")
    progress: float = Field(0.0, description="Overall progress percentage.")
    created_at: datetime = Field(..., description="Job creation time.")
    started_at: datetime | None = Field(default=None)
    completed_at: datetime | None = Field(default=None)
    error_message: str | None = Field(default=None)
    steps: list[JobStepResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class JobStatusResponse(BaseModel):
    """Lightweight job status check response."""

    id: str = Field(..., description="Job UUID.")
    status: str = Field(..., description="Current job status.")
    progress: float = Field(0.0)
