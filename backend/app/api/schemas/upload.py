"""Pydantic schemas for document upload endpoints."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    """Response after a successful document upload."""

    document_id: str = Field(..., description="Newly created document UUID.")
    filename: str = Field(..., description="Original filename.")
    file_size: int = Field(..., description="File size in bytes.")
    status: str = Field(default="pending", description="Initial processing status.")
    message: str = Field(default="Upload successful.")


class UploadStatusResponse(BaseModel):
    """Current processing status of an uploaded document."""

    document_id: str = Field(..., description="Document UUID.")
    filename: str = Field(...)
    processing_status: str = Field(..., description="Current pipeline status.")
    page_count: int | None = Field(default=None)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)

    model_config = {"from_attributes": True}
