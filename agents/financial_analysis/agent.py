from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.financial_analysis.schemas import FinancialAnalysisInput, FinancialAnalysisOutput

class FinancialAnalysisAgent(BaseAgent[FinancialAnalysisInput, FinancialAnalysisOutput]):
    """Agent responsible for analyzing financial statements and ratios."""
    
    async def execute(self, input_data: FinancialAnalysisInput) -> FinancialAnalysisOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: FinancialAnalysisInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
