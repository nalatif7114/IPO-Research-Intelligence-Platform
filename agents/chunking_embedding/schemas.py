from pydantic import BaseModel
class ChunkingEmbeddingInput(BaseModel):
    document_id: str
    parsed_storage_path: str
class ChunkingEmbeddingOutput(BaseModel):
    total_chunks: int
    embedding_dimensions: int
