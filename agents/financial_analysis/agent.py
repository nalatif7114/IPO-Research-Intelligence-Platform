from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.financial_analysis.schemas import FinancialAnalysisInput, FinancialAnalysisOutput
import asyncio

class FinancialAnalysisAgent(BaseAgent[FinancialAnalysisInput, FinancialAnalysisOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="financial_analysis"))
        
    async def validate_input(self, input_data: FinancialAnalysisInput) -> bool:
        return True
        
    async def execute(self, input_data: FinancialAnalysisInput) -> FinancialAnalysisOutput:
        await asyncio.sleep(0.5)
        return FinancialAnalysisOutput(revenue=1000000, status="mocked")
        
    async def handle_error(self, error: Exception) -> None:
        pass
