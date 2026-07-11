from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.evaluation.schemas import EvaluationInput, EvaluationOutput
import asyncio

class EvaluationAgent(BaseAgent[EvaluationInput, EvaluationOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="evaluation"))
        
    async def validate_input(self, input_data: EvaluationInput) -> bool:
        return True
        
    async def execute(self, input_data: EvaluationInput) -> EvaluationOutput:
        await asyncio.sleep(0.5)
        return EvaluationOutput(score=95)
        
    async def handle_error(self, error: Exception) -> None:
        pass
