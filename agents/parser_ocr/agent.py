from __future__ import annotations
import asyncio
import json
import time
import structlog
from typing import Any

from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.parser_ocr.schemas import ParserOcrInput, ParserOcrOutput
from backend.app.config import get_settings
from storage.minio_storage import MinIOStorage
from rag.loader import PDFLoader

logger = structlog.stdlib.get_logger(__name__)

class ParserOcrAgent(BaseAgent[ParserOcrInput, ParserOcrOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="parser_ocr"))
        self.settings = get_settings()
        self.storage = MinIOStorage(
            endpoint=self.settings.minio_endpoint,
            access_key=self.settings.minio_access_key,
            secret_key=self.settings.minio_secret_key,
            bucket=self.settings.minio_bucket,
            secure=self.settings.minio_use_ssl,
        )
        self.loader = PDFLoader(use_ocr=True)
        
    async def validate_input(self, input_data: ParserOcrInput) -> bool:
        if not input_data.document_id or not input_data.raw_storage_path:
            return False
        return True
        
    async def execute(self, input_data: ParserOcrInput) -> ParserOcrOutput:
        start_time = time.time()
        logger.info(
            "parser_ocr_agent_started",
            document_id=input_data.document_id,
            bucket=self.settings.minio_bucket,
            raw_storage_path=input_data.raw_storage_path,
        )
        
        # 1. Download raw PDF with rich error reporting
        try:
            download_start = time.time()
            raw_pdf_bytes = await self.storage.download(input_data.raw_storage_path)
            download_duration = round(time.time() - download_start, 4)
            logger.info(
                "pdf_download_success",
                document_id=input_data.document_id,
                bucket=self.settings.minio_bucket,
                raw_storage_path=input_data.raw_storage_path,
                size_bytes=len(raw_pdf_bytes),
                duration_sec=download_duration,
            )
        except Exception as e:
            logger.error(
                "pdf_download_failed",
                document_id=input_data.document_id,
                bucket=self.settings.minio_bucket,
                raw_storage_path=input_data.raw_storage_path,
                error_type=type(e).__name__,
                error_details=str(e),
            )
            raise FileNotFoundError(
                f"Failed to download object '{input_data.raw_storage_path}' from MinIO bucket '{self.settings.minio_bucket}' for document '{input_data.document_id}': {e}"
            ) from e
            
        # 2. Extract text via PDFLoader
        try:
            parse_start = time.time()
            # PDFLoader uses pypdf which is CPU bound, run in a separate thread
            pages = await asyncio.to_thread(self.loader.load, raw_pdf_bytes, input_data.document_id)
            parse_duration = round(time.time() - parse_start, 4)
            logger.info(
                "pdf_parsing_success",
                document_id=input_data.document_id,
                total_pages=len(pages),
                duration_sec=parse_duration,
            )
        except Exception as e:
            logger.error(
                "pdf_parsing_failed",
                document_id=input_data.document_id,
                error_type=type(e).__name__,
                error_details=str(e),
            )
            raise
            
        # 3. Extract sections dynamically
        parsed_sections = set()
        for page in pages:
            paragraphs = [p.strip() for p in page.text.split("\n\n") if p.strip()]
            for p in paragraphs:
                if p.isupper() and len(p) < 60:
                    parsed_sections.add(p)
                    
        sections_list = list(parsed_sections)
        logger.info(
            "sections_extracted",
            document_id=input_data.document_id,
            total_sections=len(sections_list),
            sample_sections=sections_list[:5],
        )

        # 4. Serialize to JSON & Upload
        try:
            upload_start = time.time()
            pages_dict_list = [page.model_dump() for page in pages]
            parsed_json = json.dumps(pages_dict_list)
            parsed_storage_path = f"parsed/{input_data.document_id}.json"
            
            await self.storage.upload(parsed_storage_path, parsed_json.encode("utf-8"), "application/json")
            upload_duration = round(time.time() - upload_start, 4)
            logger.info(
                "json_upload_success",
                document_id=input_data.document_id,
                bucket=self.settings.minio_bucket,
                parsed_storage_path=parsed_storage_path,
                json_size_bytes=len(parsed_json),
                duration_sec=upload_duration,
            )
        except Exception as e:
            logger.error(
                "json_serialization_or_upload_failed",
                document_id=input_data.document_id,
                error_type=type(e).__name__,
                error_details=str(e),
            )
            raise
            
        total_duration = round(time.time() - start_time, 4)
        logger.info(
            "parser_ocr_agent_completed",
            document_id=input_data.document_id,
            parsed_storage_path=parsed_storage_path,
            total_pages=len(pages),
            total_sections=len(sections_list),
            total_duration_sec=total_duration,
        )
        
        return ParserOcrOutput(
            parsed_storage_path=parsed_storage_path,
            parsed_sections=sections_list
        )
        
    async def handle_error(self, error: Exception) -> None:
        logger.error("parser_ocr_agent_error_handler", error=str(error))
