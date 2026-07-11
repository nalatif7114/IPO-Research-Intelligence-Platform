from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.governance.schemas import GovernanceInput, GovernanceOutput
import asyncio

class GovernanceAgent(BaseAgent[GovernanceInput, GovernanceOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="governance"))
        
    async def validate_input(self, input_data: GovernanceInput) -> bool:
        return True
        
    async def execute(self, input_data: GovernanceInput) -> GovernanceOutput:
        await asyncio.sleep(0.5)
        return GovernanceOutput(approved=True, report={"status": "approved"})
        
    async def handle_error(self, error: Exception) -> None:
        pass
