from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.business_analysis.schemas import BusinessAnalysisInput, BusinessAnalysisOutput

class BusinessAnalysisAgent(BaseAgent[BusinessAnalysisInput, BusinessAnalysisOutput]):
    """Agent responsible for analyzing the business model and market."""
    
    async def execute(self, input_data: BusinessAnalysisInput) -> BusinessAnalysisOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: BusinessAnalysisInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
