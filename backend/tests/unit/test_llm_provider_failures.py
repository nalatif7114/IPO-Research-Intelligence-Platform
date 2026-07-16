"""Regression tests for Ollama structured-output failure handling."""

from unittest.mock import AsyncMock

import pytest
from langchain_core.messages import AIMessage
from pydantic import BaseModel, ValidationError

from agents.agent_common.llm import OllamaProvider


class StructuredAnswer(BaseModel):
    answer: str


class StructuredRunnable:
    def __init__(self, responses: list[dict[str, object]]) -> None:
        self.responses = responses
        self.calls = 0

    def with_structured_output(self, schema: type[BaseModel], *, include_raw: bool) -> "StructuredRunnable":
        assert schema is StructuredAnswer
        assert include_raw is True
        return self

    async def ainvoke(self, prompt: str) -> dict[str, object]:
        response = self.responses[self.calls]
        self.calls += 1
        return response


def make_provider(responses: list[dict[str, object]]) -> tuple[OllamaProvider, StructuredRunnable]:
    provider = OllamaProvider.__new__(OllamaProvider)
    provider._model_name = "qwen3:8b"
    provider.timeout_seconds = 1
    runnable = StructuredRunnable(responses)
    provider.llm = runnable
    return provider, runnable


@pytest.mark.asyncio
async def test_ollama_repairs_trailing_comma_once_without_fabricating_values() -> None:
    raw = AIMessage(content='{"answer": "evidence grounded",}')
    provider, runnable = make_provider([{"raw": raw, "parsed": None, "parsing_error": ValueError("invalid JSON")}])

    result = await provider.structured_output("prompt", StructuredAnswer)

    assert result == StructuredAnswer(answer="evidence grounded")
    assert runnable.calls == 1


@pytest.mark.asyncio
async def test_ollama_malformed_json_retries_then_raises_validation_error(monkeypatch: pytest.MonkeyPatch) -> None:
    raw = AIMessage(content="not JSON")
    provider, runnable = make_provider([
        {"raw": raw, "parsed": None, "parsing_error": ValueError("invalid JSON")},
        {"raw": raw, "parsed": None, "parsing_error": ValueError("invalid JSON")},
        {"raw": raw, "parsed": None, "parsing_error": ValueError("invalid JSON")},
    ])
    monkeypatch.setattr("agents.agent_common.llm.asyncio.sleep", AsyncMock())

    with pytest.raises(ValidationError):
        await provider.structured_output("prompt", StructuredAnswer)

    assert runnable.calls == 3


@pytest.mark.asyncio
async def test_ollama_schema_validation_failure_is_not_retried() -> None:
    raw = AIMessage(content='{"unexpected": "field"}')
    provider, runnable = make_provider([{"raw": raw, "parsed": None, "parsing_error": ValueError("schema invalid")}])

    with pytest.raises(ValidationError):
        await provider.structured_output("prompt", StructuredAnswer)

    assert runnable.calls == 1
