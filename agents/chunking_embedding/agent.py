from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.chunking_embedding.schemas import ChunkingInput, ChunkingOutput

class ChunkingEmbeddingAgent(BaseAgent[ChunkingInput, ChunkingOutput]):
    """Agent responsible for chunking documents and generating embeddings."""
    
    async def execute(self, input_data: ChunkingInput) -> ChunkingOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: ChunkingInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
