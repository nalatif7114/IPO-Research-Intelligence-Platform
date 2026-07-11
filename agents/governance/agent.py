from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.governance.schemas import GovernanceInput, GovernanceOutput

class GovernanceAgent(BaseAgent[GovernanceInput, GovernanceOutput]):
    """Agent responsible for checking outputs for hallucinations, consistency, and compliance."""
    
    async def execute(self, input_data: GovernanceInput) -> GovernanceOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: GovernanceInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
