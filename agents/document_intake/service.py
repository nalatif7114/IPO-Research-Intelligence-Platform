from __future__ import annotations

import structlog

logger = structlog.get_logger()


class DocumentIntakeService:
    """Service layer for document ingestion operations.

    Handles file downloads, hash computation, storage uploads,
    and metadata extraction.
    """

    def __init__(self) -> None:
        self.logger = logger.bind(service="document_intake")

    async def download_from_url(self, url: str) -> bytes:
        """Download a document from a remote URL."""
        raise NotImplementedError

    async def compute_hash(self, content: bytes) -> str:
        """Compute a SHA-256 hash of the document content."""
        raise NotImplementedError

    async def store_document(self, content: bytes, document_id: str) -> str:
        """Persist document bytes to object storage and return the path."""
        raise NotImplementedError

    async def extract_metadata(self, content: bytes) -> dict:
        """Extract basic metadata (page count, MIME type) from the document."""
        raise NotImplementedError
