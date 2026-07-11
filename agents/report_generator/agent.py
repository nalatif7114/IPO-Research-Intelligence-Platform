from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.report_generator.schemas import ReportGeneratorInput, ReportGeneratorOutput
import asyncio

class ReportGeneratorAgent(BaseAgent[ReportGeneratorInput, ReportGeneratorOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="report_generator"))
        
    async def validate_input(self, input_data: ReportGeneratorInput) -> bool:
        return True
        
    async def execute(self, input_data: ReportGeneratorInput) -> ReportGeneratorOutput:
        await asyncio.sleep(0.5)
        return ReportGeneratorOutput(final_report_path=f"reports/{input_data.job_id}.pdf")
        
    async def handle_error(self, error: Exception) -> None:
        pass
