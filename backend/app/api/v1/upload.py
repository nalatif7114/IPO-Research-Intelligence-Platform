"""Document upload endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, UploadFile

from backend.app.api.schemas.upload import UploadResponse, UploadStatusResponse

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("", response_model=UploadResponse)
async def upload_document(file: UploadFile) -> UploadResponse:
    """Upload a prospectus document for processing.

    Args:
        file: The uploaded file.

    Returns:
        Upload confirmation with document ID and initial status.
    """
    logger.info("document_uploaded", filename=file.filename, size=file.size)
    return UploadResponse(
        document_id="00000000-0000-0000-0000-000000000010",
        filename=file.filename or "unknown",
        file_size=file.size or 0,
        status="pending",
        message="Upload successful. Processing will begin shortly.",
    )


@router.get("/{document_id}/status", response_model=UploadStatusResponse)
async def get_upload_status(document_id: str) -> UploadStatusResponse:
    """Check the processing status of an uploaded document.

    Args:
        document_id: Document UUID.

    Returns:
        Current processing status details.
    """
    now = datetime.now(tz=timezone.utc)
    return UploadStatusResponse(
        document_id=document_id,
        filename="prospectus_sample.pdf",
        processing_status="processing",
        page_count=42,
        created_at=now,
        updated_at=now,
    )
