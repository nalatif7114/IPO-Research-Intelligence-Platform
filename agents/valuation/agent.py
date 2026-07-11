from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.valuation.schemas import ValuationInput, ValuationOutput

class ValuationAgent(BaseAgent[ValuationInput, ValuationOutput]):
    """Agent responsible for performing financial valuation (DCF, Relative)."""
    
    async def execute(self, input_data: ValuationInput) -> ValuationOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: ValuationInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
