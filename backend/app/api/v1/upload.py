"""Document upload endpoints."""

from __future__ import annotations
import uuid
import structlog
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.schemas.upload import UploadResponse, UploadStatusResponse
from backend.app.config import get_settings
from backend.app.dependencies import get_db_session
from storage.minio_storage import MinIOStorage
from backend.app.models.company import Company
from backend.app.models.prospectus import Prospectus, ProspectusStatus
from backend.app.models.document import Document, DocumentType, ProcessingStatus
from backend.app.models.job import Job, JobType, JobStatus
from workers.tasks import process_document_task

logger = structlog.stdlib.get_logger(__name__)
router = APIRouter(prefix="/upload", tags=["upload"])
settings = get_settings()

minio_storage = MinIOStorage(
    endpoint=settings.minio_endpoint,
    access_key=settings.minio_access_key,
    secret_key=settings.minio_secret_key,
    bucket=settings.minio_bucket,
    secure=settings.minio_use_ssl,
)

@router.post("", response_model=UploadResponse)
async def upload_document(
    file: UploadFile,
    session: AsyncSession = Depends(get_db_session)
) -> UploadResponse:
    """Upload a prospectus document for processing."""
    logger.info("document_uploaded", filename=file.filename, size=file.size)
    
    # 3. Create dummy Prospectus & Company for MVP
    ticker = f"UNK-{uuid.uuid4().hex[:6].upper()}"
    new_company = Company(
        id=uuid.uuid4(),
        name="Unknown IPO Corp",
        ticker=ticker
    )
    session.add(new_company)
    await session.flush()

    prospectus = Prospectus(
        company_id=new_company.id,
        title=f"Prospectus for {file.filename}",
        status=ProspectusStatus.DRAFT,
    )
    session.add(prospectus)
    await session.flush()

    # 2. Read file & Upload to MinIO
    content = await file.read()
    file_path = f"uploads/{uuid.uuid4()}/{file.filename}"
    await minio_storage.upload(file_path, content, file.content_type)
    
    # 3. Create Document Record
    document = Document(
        prospectus_id=prospectus.id,
        filename=file.filename or "unknown",
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type,
        doc_type=DocumentType.PROSPECTUS,
        processing_status=ProcessingStatus.PENDING,
    )
    session.add(document)
    await session.flush()

    # 4. Create Job Record
    now = datetime.now(tz=timezone.utc)
    job = Job(
        job_type=JobType.DOCUMENT_PROCESSING,
        status=JobStatus.PENDING,
        started_at=now,
    )
    session.add(job)
    await session.flush()
    await session.commit()
    
    # 5. Trigger Celery Task (Orchestrator)
    process_document_task.delay(str(job.id), str(document.id), str(prospectus.id))
    
    return UploadResponse(
        document_id=str(document.id),
        filename=document.filename,
        file_size=document.file_size or 0,
        status=job.status.value,
        message="Upload successful. Orchestrator pipeline started.",
    )


@router.get("/{document_id}/status", response_model=UploadStatusResponse)
async def get_upload_status(document_id: str) -> UploadStatusResponse:
    """Check the processing status of an uploaded document."""
    now = datetime.now(tz=timezone.utc)
    return UploadStatusResponse(
        document_id=document_id,
        filename="prospectus_sample.pdf",
        processing_status="processing",
        page_count=42,
        created_at=now,
        updated_at=now,
    )

