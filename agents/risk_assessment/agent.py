from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.risk_assessment.schemas import RiskInput, RiskOutput

class RiskAssessmentAgent(BaseAgent[RiskInput, RiskOutput]):
    """Agent responsible for identifying and evaluating risk factors."""
    
    async def execute(self, input_data: RiskInput) -> RiskOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: RiskInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
