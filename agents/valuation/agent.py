from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.valuation.schemas import ValuationInput, ValuationOutput
import asyncio

class ValuationAgent(BaseAgent[ValuationInput, ValuationOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="valuation"))
        
    async def validate_input(self, input_data: ValuationInput) -> bool:
        return True
        
    async def execute(self, input_data: ValuationInput) -> ValuationOutput:
        await asyncio.sleep(0.5)
        return ValuationOutput(dcf=5000000, status="mocked")
        
    async def handle_error(self, error: Exception) -> None:
        pass
