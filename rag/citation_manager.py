from __future__ import annotations
import abc
from pydantic import BaseModel
from rag.retriever import RetrievalResult

class Citation(BaseModel):
    statement: str
    chunk_id: str
    page: int | None
    section: str | None
    heading: str | None
    document_id: str
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

class RAGCitationManager(CitationManager):
    def __init__(self):
        self._citations: list[Citation] = []
        
    def add_citation(self, citation: Citation) -> None:
        self._citations.append(citation)
        
    def generate_citations_from_results(self, results: list[RetrievalResult]) -> list[Citation]:
        """Maps retrieved context directly into citation references."""
        for r in results:
            meta = r.metadata
            cit = Citation(
                statement=r.text[:50] + "...",  # Mock mapping for statement
                chunk_id=r.chunk_id,
                page=meta.get("page"),
                section=meta.get("section"),
                heading=meta.get("heading"),
                document_id=meta.get("document_id", "unknown"),
                confidence=r.score
            )
            self.add_citation(cit)
        return self._citations

    def validate_citations(self, statements: list[str]) -> list[Citation]:
        return self._citations
        
    def get_citations(self) -> list[Citation]:
        return self._citations
