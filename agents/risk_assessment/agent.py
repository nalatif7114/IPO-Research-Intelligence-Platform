import os
from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.base_agent import AgentConfig
from agents.risk_assessment.schemas import RiskAssessmentInput, RiskAssessmentOutput, RiskDetail
from backend.app.config import get_settings
from agents.agent_common.provider_factory import get_llm_provider
import structlog

logger = structlog.stdlib.get_logger(__name__)

class RiskAssessmentAgent(ReasoningAgent[RiskAssessmentInput, RiskAssessmentOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="risk_assessment"), RiskAssessmentOutput)
        settings = get_settings()
        
        self.llm_provider = get_llm_provider(
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
            "risk_assessment_system.md"
        )
        with open(prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()
            
    async def validate_input(self, input_data: RiskAssessmentInput) -> bool:
        return True
        
    def _validate_citations(self, output: RiskAssessmentOutput) -> bool:
        """Returns True if all identified risks have citations, False otherwise."""
        for field_name, risk_list in output.__dict__.items():
            if isinstance(risk_list, list):
                for risk in risk_list:
                    if isinstance(risk, RiskDetail):
                        # Empty or missing citations for a defined risk fails validation
                        if not risk.citations or len(risk.citations) == 0:
                            return False
        return True

    def _fallback_missing_citations(self, output: RiskAssessmentOutput) -> RiskAssessmentOutput:
        """Removes risks missing citations entirely, or marks them insufficient."""
        for field_name, risk_list in output.__dict__.items():
            if isinstance(risk_list, list):
                valid_risks = []
                for risk in risk_list:
                    if isinstance(risk, RiskDetail):
                        if risk.citations and len(risk.citations) > 0:
                            valid_risks.append(risk)
                # Overwrite the list with only validated risks
                setattr(output, field_name, valid_risks)
        return output
        
    async def execute(self, input_data: RiskAssessmentInput) -> RiskAssessmentOutput:
        query = self.system_prompt
        
        for attempt in range(self.max_retries + 1):
            try:
                self.logger.info(
                    "risk_assessment_attempt", 
                    attempt=attempt, 
                    document_id=input_data.document_id,
                    provider=self.llm_provider.provider_name,
                    model=self.llm_provider.model_name
                )
                
                output = await self.execute_reasoning(query, input_data.document_id)
                
                if self._validate_citations(output):
                    return output
                    
                self.logger.warning("missing_citations_in_risk", attempt=attempt)
                if attempt == self.max_retries:
                    return self._fallback_missing_citations(output)
                    
            except Exception as e:
                self.logger.error("risk_assessment_execution_error", attempt=attempt, error=str(e))
                if attempt == self.max_retries:
                    raise
                    
        raise Exception("Risk assessment failed after retries.")
        
    async def handle_error(self, error: Exception) -> None:
        self.logger.error("risk_assessment_failed", error=str(error))
