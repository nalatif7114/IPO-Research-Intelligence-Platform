from __future__ import annotations
from pydantic import BaseModel

class ChunkingInput(BaseModel):
    document_id: str
    parsed_path: str

class ChunkingOutput(BaseModel):
    document_id: str
    total_chunks: int
    embedding_dimensions: int
