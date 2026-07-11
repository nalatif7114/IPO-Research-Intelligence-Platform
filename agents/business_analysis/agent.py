from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.business_analysis.schemas import BusinessAnalysisInput, BusinessAnalysisOutput
import asyncio

class BusinessAnalysisAgent(BaseAgent[BusinessAnalysisInput, BusinessAnalysisOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="business_analysis"))
        
    async def validate_input(self, input_data: BusinessAnalysisInput) -> bool:
        return True
        
    async def execute(self, input_data: BusinessAnalysisInput) -> BusinessAnalysisOutput:
        await asyncio.sleep(0.5)
        return BusinessAnalysisOutput(market="tech", status="mocked")
        
    async def handle_error(self, error: Exception) -> None:
        pass
