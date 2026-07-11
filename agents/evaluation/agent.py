from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.evaluation.schemas import EvalAgentInput, EvalAgentOutput

class EvalAgent(BaseAgent[EvalAgentInput, EvalAgentOutput]):
    """Agent responsible for evaluating the generated report against quality metrics."""
    
    async def execute(self, input_data: EvalAgentInput) -> EvalAgentOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: EvalAgentInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
