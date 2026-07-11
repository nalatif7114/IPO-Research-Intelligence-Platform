from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.chunking_embedding.schemas import ChunkingEmbeddingInput, ChunkingEmbeddingOutput
import asyncio

class ChunkingEmbeddingAgent(BaseAgent[ChunkingEmbeddingInput, ChunkingEmbeddingOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="chunking_embedding"))
        
    async def validate_input(self, input_data: ChunkingEmbeddingInput) -> bool:
        return True
        
    async def execute(self, input_data: ChunkingEmbeddingInput) -> ChunkingEmbeddingOutput:
        await asyncio.sleep(0.5)
        return ChunkingEmbeddingOutput(total_chunks=100, embedding_dimensions=1024)
        
    async def handle_error(self, error: Exception) -> None:
        pass
