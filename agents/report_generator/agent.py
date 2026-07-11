from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.report_generator.schemas import ReportInput, ReportOutput

class ReportGeneratorAgent(BaseAgent[ReportInput, ReportOutput]):
    """Agent responsible for compiling final IPO reports."""
    
    async def execute(self, input_data: ReportInput) -> ReportOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: ReportInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
