from __future__ import annotations
import abc
from pydantic import BaseModel
from typing import Optional

class ChunkMetadata(BaseModel):
    document_id: str
    section: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None

class BaseChunker(abc.ABC):
    """Abstract interface for chunking documents."""
    
    @abc.abstractmethod
    def chunk(self, document: dict) -> list[dict]:
        pass
