from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.base_agent import AgentConfig
from agents.agent_common.provider_factory import get_llm_provider
from agents.business_analysis.schemas import BusinessAnalysisInput, BusinessAnalysisOutput

class BusinessAnalysisAgent(ReasoningAgent[BusinessAnalysisInput, BusinessAnalysisOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="business_analysis"), BusinessAnalysisOutput)
        self.llm_provider = get_llm_provider()
        
    async def validate_input(self, input_data: BusinessAnalysisInput) -> bool:
        return True
        
    async def execute(self, input_data: BusinessAnalysisInput) -> BusinessAnalysisOutput:
        query = (
            "Provide a comprehensive business analysis of the company. "
            "Include the company overview, business model, revenue streams, "
            "competitive advantage, industry position, SWOT analysis, growth drivers, and business risks. "
            "IMPORTANT: If the provided context does not contain enough information to make an analytical conclusion "
            "for a specific field, you MUST output 'Insufficient evidence' for that specific field."
        )
        return await self.execute_reasoning(query, input_data.document_id)
        
    async def handle_error(self, error: Exception) -> None:
        self.logger.error("business_analysis_failed", error=str(error))
