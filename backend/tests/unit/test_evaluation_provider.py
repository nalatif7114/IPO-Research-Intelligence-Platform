"""Production-provider guarantees for EvaluationAgent reasoning."""

import pytest

from agents.agent_common.llm import MockLLMProvider, OllamaProvider
from agents.agent_common.llm_agent import ReasoningAgent
from agents.agent_common.provider_factory import get_llm_provider


class MinimalReasoningAgent(ReasoningAgent):
    async def execute(self, input_data):  # pragma: no cover - not used in this guard test
        raise NotImplementedError

    async def validate_input(self, input_data):  # pragma: no cover - not used in this guard test
        return True

    async def handle_error(self, error):  # pragma: no cover - not used in this guard test
        return None


def test_evaluation_can_force_ollama_through_provider_factory() -> None:
    provider = get_llm_provider(provider_name="ollama")

    assert isinstance(provider, OllamaProvider)
    assert provider.provider_name == "OllamaProvider"


@pytest.mark.asyncio
async def test_reasoning_rejects_mock_provider_before_retrieval() -> None:
    agent = object.__new__(MinimalReasoningAgent)
    agent.llm_provider = MockLLMProvider()

    with pytest.raises(RuntimeError, match="not permitted"):
        await agent.execute_reasoning("query", "document-id")
