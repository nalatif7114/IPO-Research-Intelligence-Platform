from __future__ import annotations
import abc
from pydantic import BaseModel
from typing import Optional

class RetrievalResult(BaseModel):
    chunk_id: str
    text: str
    score: float
    metadata: dict

class BaseRetriever(abc.ABC):
    """Abstract interface for retrieving chunks."""
    
    @abc.abstractmethod
    def retrieve(self, query: str, top_k: int, filters: Optional[dict] = None) -> list[RetrievalResult]:
        pass
