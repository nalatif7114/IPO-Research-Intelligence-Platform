from __future__ import annotations

class ParserOCRService:
    """Service layer for Parser & OCR operations."""
    
    async def parse_document(self, document_id: str, storage_path: str) -> dict:
        raise NotImplementedError
        
    async def perform_ocr(self, document_id: str, storage_path: str) -> dict:
        raise NotImplementedError
        
    async def extract_tables(self, document_id: str) -> list:
        raise NotImplementedError
