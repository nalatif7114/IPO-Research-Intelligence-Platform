"""Document retrieval endpoint."""
from __future__ import annotations

import uuid
import structlog
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.dependencies import get_db_session
from backend.app.models.document import Document
from backend.app.config import get_settings
from storage.minio_storage import MinIOStorage

logger = structlog.stdlib.get_logger(__name__)
router = APIRouter(prefix="/documents", tags=["documents"])
settings = get_settings()

minio_storage = MinIOStorage(
    endpoint=settings.minio_endpoint,
    access_key=settings.minio_access_key,
    secret_key=settings.minio_secret_key,
    bucket=settings.minio_bucket,
    secure=settings.minio_use_ssl,
)

@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    session: AsyncSession = Depends(get_db_session)
):
    """Securely stream a document PDF from MinIO."""
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID format")

    stmt = select(Document).where(Document.id == doc_uuid)
    document = (await session.execute(stmt)).scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    try:
        # Stream the file using the MinIOStorage abstraction
        return StreamingResponse(
            minio_storage.stream(document.file_path),
            media_type=document.mime_type or "application/pdf",
            headers={"Content-Disposition": f'inline; filename="{document.filename}"'}
        )
    except Exception as e:
        logger.error("document_stream_error", error=str(e), document_id=document_id)
        raise HTTPException(status_code=500, detail="Failed to stream document")

@router.get("/{document_id}")
async def get_document_metadata(
    document_id: str,
    session: AsyncSession = Depends(get_db_session)
):
    """Get metadata for a document."""
    try:
        doc_uuid = uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID format")

    stmt = select(Document).where(Document.id == doc_uuid)
    document = (await session.execute(stmt)).scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "id": str(document.id),
        "filename": document.filename,
        "page_count": document.page_count,
        "processing_status": document.processing_status.value
    }
