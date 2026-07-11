from __future__ import annotations
import abc
from pydantic import BaseModel

class Citation(BaseModel):
    statement: str
    chunk_id: str
    page: int | None
    section: str | None
    confidence: float

class CitationManager(abc.ABC):
    """Abstract interface for citation management."""
    
    @abc.abstractmethod
    def add_citation(self, citation: Citation) -> None:
        pass
        
    @abc.abstractmethod
    def validate_citations(self, statements: list[str]) -> list[Citation]:
        pass
        
    @abc.abstractmethod
    def get_citations(self) -> list[Citation]:
        pass
