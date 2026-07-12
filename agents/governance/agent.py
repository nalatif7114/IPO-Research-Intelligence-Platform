import os
from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.base_agent import AgentConfig
from agents.governance.schemas import GovernanceInput, GovernanceOutput, GovernanceMetric
from backend.app.config import get_settings
from agents.agent_common.llm import GeminiProvider
import structlog

logger = structlog.stdlib.get_logger(__name__)

class GovernanceAgent(ReasoningAgent[GovernanceInput, GovernanceOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="governance"), GovernanceOutput)
        settings = get_settings()
        
        self.llm_provider = GeminiProvider(
            temperature=settings.llm_temperature,
            top_p=settings.llm_top_p,
            max_output_tokens=settings.llm_max_output_tokens,
            timeout_seconds=settings.llm_timeout
        )
        self.max_retries = settings.llm_max_retries
        
        # Load prompt
        prompt_path = os.path.join(
            os.path.dirname(__file__), 
            "prompts", 
            "governance_analysis_system.md"
        )
        with open(prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()
            
    async def validate_input(self, input_data: GovernanceInput) -> bool:
        return True
        
    def _validate_citations(self, output: GovernanceOutput) -> bool:
        """Returns True if all identified metrics have citations, False otherwise."""
        for field_name, metric in output.__dict__.items():
            if isinstance(metric, GovernanceMetric) and metric.value != "Insufficient evidence." and metric.value != "UNKNOWN":
                if not metric.citations or len(metric.citations) == 0:
                    return False
        return True

    def _fallback_missing_citations(self, output: GovernanceOutput) -> GovernanceOutput:
        """Removes metrics missing citations entirely, substituting 'Insufficient evidence.'"""
        for field_name, metric in output.__dict__.items():
            if isinstance(metric, GovernanceMetric) and metric.value != "Insufficient evidence." and metric.value != "UNKNOWN":
                if not metric.citations or len(metric.citations) == 0:
                    # special case for the literal
                    if field_name == "overall_governance_quality":
                        setattr(output, field_name, GovernanceMetric(
                            value="UNKNOWN",
                            confidence=0.0,
                            citations=[]
                        ))
                    elif isinstance(metric.value, list):
                        setattr(output, field_name, GovernanceMetric(
                            value=[],
                            confidence=0.0,
                            citations=[]
                        ))
                    else:
                        setattr(output, field_name, GovernanceMetric(
                            value="Insufficient evidence.",
                            confidence=0.0,
                            citations=[]
                        ))
        return output
        
    async def execute(self, input_data: GovernanceInput) -> GovernanceOutput:
        query = self.system_prompt
        
        for attempt in range(self.max_retries + 1):
            try:
                self.logger.info(
                    "governance_analysis_attempt", 
                    attempt=attempt, 
                    document_id=input_data.document_id,
                    provider="GeminiProvider",
                    model="gemini-1.5-pro"
                )
                
                output = await self.execute_reasoning(query, input_data.document_id)
                
                if self._validate_citations(output):
                    return output
                    
                self.logger.warning("missing_citations_in_governance", attempt=attempt)
                if attempt == self.max_retries:
                    return self._fallback_missing_citations(output)
                    
            except Exception as e:
                self.logger.error("governance_analysis_execution_error", attempt=attempt, error=str(e))
                if attempt == self.max_retries:
                    raise
                    
        raise Exception("Governance analysis failed after retries.")
        
    async def handle_error(self, error: Exception) -> None:
        self.logger.error("governance_failed", error=str(error))
