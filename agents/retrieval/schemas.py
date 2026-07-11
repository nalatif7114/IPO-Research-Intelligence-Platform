from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

class RetrievalInput(BaseModel):
    query: str
    document_ids: list[str]
    top_k: int = 20
    section_filter: Optional[str] = None
    token_budget: int = 80000

class RetrievalOutput(BaseModel):
    chunks: list[dict]
    total_tokens: int
