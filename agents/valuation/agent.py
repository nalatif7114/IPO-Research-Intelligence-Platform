import os
import json
import time
from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.base_agent import AgentConfig
from agents.valuation.schemas import ValuationInput, ValuationOutput, ValuationMetric
from backend.app.config import get_settings
from agents.agent_common.provider_factory import get_llm_provider
import structlog

logger = structlog.stdlib.get_logger(__name__)

class ValuationAgent(ReasoningAgent[ValuationInput, ValuationOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="valuation"), ValuationOutput)
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
            "valuation_system.md"
        )
        with open(prompt_path, "r", encoding="utf-8") as f:
            self.system_prompt = f.read()
            
    async def validate_input(self, input_data: ValuationInput) -> bool:
        return True
        
    def _validate_citations(self, output: ValuationOutput) -> bool:
        """Returns True if all identified metrics have citations, False otherwise."""
        for field_name, metric in output.__dict__.items():
            if isinstance(metric, ValuationMetric) and metric.value != "Insufficient evidence." and metric.value != "UNKNOWN":
                if not metric.citations or len(metric.citations) == 0:
                    return False
        return True

    def _fallback_missing_citations(self, output: ValuationOutput) -> ValuationOutput:
        """Removes metrics missing citations entirely, substituting 'Insufficient evidence.'"""
        for field_name, metric in output.__dict__.items():
            if isinstance(metric, ValuationMetric) and metric.value != "Insufficient evidence." and metric.value != "UNKNOWN":
                if not metric.citations or len(metric.citations) == 0:
                    if field_name == "investment_recommendation":
                        setattr(output, field_name, ValuationMetric(
                            value="UNKNOWN",
                            confidence=0.0,
                            citations=[]
                        ))
                    elif isinstance(metric.value, list):
                        setattr(output, field_name, ValuationMetric(
                            value=[],
                            confidence=0.0,
                            citations=[]
                        ))
                    else:
                        setattr(output, field_name, ValuationMetric(
                            value="Insufficient evidence.",
                            confidence=0.0,
                            citations=[]
                        ))
        return output
        
    async def execute(self, input_data: ValuationInput) -> ValuationOutput:
        # Define a targeted query for RAG Retrieval
        rag_query = "valuation models pricing IPO cash flow discounts growth competitive thesis recommendation margin of safety"
        
        # 1. RAG Retrieval
        execution_started = time.perf_counter()
        retrieval_started = time.perf_counter()
        results = await self.retriever.retrieve(
            query=rag_query, 
            top_k=5, 
            filters={"document_id": input_data.document_id} if input_data.document_id else None
        )
        retrieval_latency_seconds = time.perf_counter() - retrieval_started
        
        # 2. Build Context
        context_window = self.context_builder.build_context(results, token_budget=3000)
        
        # 3. Construct Composite Prompt
        composite_prompt = f"""{self.system_prompt}

=== PREVIOUS AGENT ANALYSES ===
Business Analysis:
{json.dumps(input_data.business_analysis, indent=2) if input_data.business_analysis else 'None'}

Financial Analysis:
{json.dumps(input_data.financial_analysis, indent=2) if input_data.financial_analysis else 'None'}

Risk Assessment:
{json.dumps(input_data.risk_assessment, indent=2) if input_data.risk_assessment else 'None'}

Governance Analysis:
{json.dumps(input_data.governance_analysis, indent=2) if input_data.governance_analysis else 'None'}

=== RAG CONTEXT ===
{context_window.context_text}

Analyze the above data and provide the final structured valuation output.
"""
        self.logger.info(
            "reasoning_performance",
            retrieved_chunk_count=len(results),
            retrieval_latency_seconds=round(retrieval_latency_seconds, 6),
            context_characters=len(context_window.context_text),
            context_token_estimate=len(context_window.context_text) // 4,
            prompt_characters=len(composite_prompt),
            prompt_token_estimate=len(composite_prompt) // 4,
        )

        self.logger.info(
            "valuation_attempt",
            attempt=0,
            document_id=input_data.document_id,
            provider=self.llm_provider.provider_name,
            model=self.llm_provider.model_name,
        )
        # OllamaProvider owns transport retries.  A complete generation that
        # merely lacks citations is handled below instead of re-running the
        # same expensive prompt.
        output = await self.llm_provider.structured_output(composite_prompt, self.output_schema)
        if not self._validate_citations(output):
            self.logger.warning("missing_citations_in_valuation", attempt=0)
            output = self._fallback_missing_citations(output)

        self.logger.info(
            "reasoning_completed",
            execution_time_seconds=round(time.perf_counter() - execution_started, 6),
        )
        return output
        
    async def handle_error(self, error: Exception) -> None:
        self.logger.error("valuation_failed", error=str(error))
