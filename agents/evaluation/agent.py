from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.base_agent import AgentConfig
from agents.agent_common.provider_factory import get_llm_provider
from agents.evaluation.schemas import EvaluationInput, EvaluationOutput

class EvaluationAgent(ReasoningAgent[EvaluationInput, EvaluationOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="evaluation"), EvaluationOutput)
        # Evaluation results are a production quality gate: always use Ollama,
        # even if another agent changes the application's default provider.
        self.llm_provider = get_llm_provider(provider_name="ollama")
        
    async def validate_input(self, input_data: EvaluationInput) -> bool:
        return True
        
    async def execute(self, input_data: EvaluationInput) -> EvaluationOutput:
        query = (
            f"Evaluate the generated output from the {input_data.target_agent} agent. "
            "Assess groundedness, faithfulness, coverage, missing evidence, "
            "citation completeness, and overall confidence against the source context."
        )
        return await self.execute_reasoning(query, input_data.document_id)
        
    async def handle_error(self, error: Exception) -> None:
        self.logger.error("evaluation_failed", error=str(error))
