from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.risk_assessment.schemas import RiskAssessmentInput, RiskAssessmentOutput
import asyncio

class RiskAssessmentAgent(BaseAgent[RiskAssessmentInput, RiskAssessmentOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="risk_assessment"))
        
    async def validate_input(self, input_data: RiskAssessmentInput) -> bool:
        return True
        
    async def execute(self, input_data: RiskAssessmentInput) -> RiskAssessmentOutput:
        await asyncio.sleep(0.5)
        return RiskAssessmentOutput(identified_risks=10 if input_data.phase == 1 else 2, status="mocked")
        
    async def handle_error(self, error: Exception) -> None:
        pass
