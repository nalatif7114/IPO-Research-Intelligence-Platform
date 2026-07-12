from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.base_agent import AgentConfig
from agents.report_generator.schemas import ReportGeneratorInput, ReportGeneratorOutput

class ReportGeneratorAgent(ReasoningAgent[ReportGeneratorInput, ReportGeneratorOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="report_generator"), ReportGeneratorOutput)
        
    async def validate_input(self, input_data: ReportGeneratorInput) -> bool:
        return True
        
    async def execute(self, input_data: ReportGeneratorInput) -> ReportGeneratorOutput:
        query = (
            "Generate a comprehensive, structured Markdown investment report "
            "based on the business overview, financial health, risk assessment, "
            "corporate governance, and valuation of the company. "
            "Every analytical statement MUST be supported by citations."
        )
        return await self.execute_reasoning(query, input_data.document_id)
        
    async def handle_error(self, error: Exception) -> None:
        self.logger.error("report_generator_failed", error=str(error))
