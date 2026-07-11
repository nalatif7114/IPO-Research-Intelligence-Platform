from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.retrieval.schemas import RetrievalInput, RetrievalOutput

class RetrievalAgent(BaseAgent[RetrievalInput, RetrievalOutput]):
    """Agent responsible for retrieving context chunks for other agents."""
    
    async def execute(self, input_data: RetrievalInput) -> RetrievalOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: RetrievalInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
