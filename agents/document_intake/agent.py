from __future__ import annotations
import uuid
import time
import structlog
from sqlalchemy import select

from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.document_intake.schemas import DocumentIntakeInput, DocumentIntakeOutput
from backend.app.database.session import async_session_factory
from backend.app.models.document import Document, ProcessingStatus

logger = structlog.stdlib.get_logger(__name__)

class DocumentIntakeAgent(BaseAgent[DocumentIntakeInput, DocumentIntakeOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="document_intake"))
        
    async def validate_input(self, input_data: DocumentIntakeInput) -> bool:
        if not input_data.job_id or not input_data.document_id:
            return False
        return True
        
    async def execute(self, input_data: DocumentIntakeInput) -> DocumentIntakeOutput:
        start_time = time.time()
        logger.info(
            "document_intake_started",
            job_id=input_data.job_id,
            document_id=input_data.document_id
        )
        
        async with async_session_factory() as session:
            try:
                doc_uuid = uuid.UUID(input_data.document_id)
                stmt = select(Document).where(Document.id == doc_uuid)
                res = await session.execute(stmt)
                doc = res.scalar_one_or_none()
                
                if not doc:
                    logger.error("document_not_found_in_db", document_id=input_data.document_id)
                    raise FileNotFoundError(f"Document record with ID '{input_data.document_id}' not found in database.")
                    
                raw_storage_path = doc.file_path
                if not raw_storage_path:
                    logger.error("empty_file_path_in_db", document_id=input_data.document_id)
                    raise ValueError(f"Document record '{input_data.document_id}' has empty file_path.")

                doc.processing_status = ProcessingStatus.PROCESSING
                await session.commit()
                
                logger.info(
                    "document_intake_completed",
                    document_id=input_data.document_id,
                    raw_storage_path=raw_storage_path,
                    filename=doc.filename,
                    file_size=doc.file_size,
                    duration_sec=round(time.time() - start_time, 4)
                )
                return DocumentIntakeOutput(raw_storage_path=raw_storage_path)
            except Exception as e:
                logger.error("document_intake_failed", document_id=input_data.document_id, error=str(e))
                raise
        
    async def handle_error(self, error: Exception) -> None:
        logger.error("document_intake_error_handler", error=str(error))
