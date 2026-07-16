import os
from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.base_agent import AgentConfig
from agents.financial_analysis.schemas import FinancialAnalysisInput, FinancialAnalysisOutput, FinancialMetric
from backend.app.config import get_settings
from agents.agent_common.provider_factory import get_llm_provider
import structlog

logger = structlog.stdlib.get_logger(__name__)

class FinancialAnalysisAgent(ReasoningAgent[FinancialAnalysisInput, FinancialAnalysisOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="financial_analysis"), FinancialAnalysisOutput)
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
            "financial_analysis_system.md"
        )
        with open(prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()
            
    async def validate_input(self, input_data: FinancialAnalysisInput) -> bool:
        return True
        
    def _validate_citations(self, output: FinancialAnalysisOutput) -> bool:
        """Returns True if all fields have citations, False otherwise."""
        for field_name, metric in output.__dict__.items():
            # check if it's a FinancialMetric and not insufficient evidence
            if isinstance(metric, FinancialMetric) and metric.value != "Insufficient evidence.":
                if not metric.citations or len(metric.citations) == 0:
                    return False
        return True

    def _fallback_missing_citations(self, output: FinancialAnalysisOutput) -> FinancialAnalysisOutput:
        """Replace fields missing citations with 'Insufficient evidence.'"""
        for field_name, metric in output.__dict__.items():
            if isinstance(metric, FinancialMetric) and metric.value != "Insufficient evidence.":
                if not metric.citations or len(metric.citations) == 0:
                    setattr(output, field_name, FinancialMetric(
                        value="Insufficient evidence.",
                        confidence=0.0,
                        citations=[]
                    ))
        return output
        
    async def execute(self, input_data: FinancialAnalysisInput) -> FinancialAnalysisOutput:
        query = self.system_prompt
        
        for attempt in range(self.max_retries + 1):
            try:
                # Log metrics for verification (not logging API keys)
                self.logger.info(
                    "financial_analysis_attempt",
                    attempt=attempt,
                    document_id=input_data.document_id,
                    provider=self.llm_provider.provider_name,
                    model=self.llm_provider.model_name
                )
                
                output = await self.execute_reasoning(query, input_data.document_id)
                
                if self._validate_citations(output):
                    return output
                    
                self.logger.warning("missing_citations", attempt=attempt)
                if attempt == self.max_retries:
                    return self._fallback_missing_citations(output)
                    
            except Exception:
                self.logger.exception(
                    "financial_analysis_execution_error",
                    attempt=attempt,
                    document_id=input_data.document_id,
                    provider=self.llm_provider.provider_name,
                    model=self.llm_provider.model_name,
                )
                if attempt == self.max_retries:
                    raise
                    
        # Should not reach here
        raise Exception("Financial analysis failed after retries.")
        
    async def handle_error(self, error: Exception) -> None:
        self.logger.error("financial_analysis_failed", error=str(error))
