from __future__ import annotations

import abc
from typing import Any

from pydantic import BaseModel
import structlog

logger = structlog.get_logger()


class LLMRequest(BaseModel):
    """Schema for a single LLM invocation request."""

    model: str
    messages: list[dict[str, str]]
    temperature: float = 0.0
    max_tokens: int = 4096
    stop_sequences: list[str] | None = None
    metadata: dict[str, Any] = {}


class LLMResponse(BaseModel):
    """Schema for the response returned by the LLM."""

    content: str
    model: str
    usage: dict[str, int] = {}
    finish_reason: str | None = None
    metadata: dict[str, Any] = {}


class LLMClient(abc.ABC):
    """Abstract interface for LLM interactions.

    Concrete implementations should wrap a specific provider (OpenAI, Anthropic,
    local models, etc.) behind this uniform interface.
    """

    @abc.abstractmethod
    async def complete(self, request: LLMRequest) -> LLMResponse:
        """Send a completion request to the underlying LLM."""
        ...

    @abc.abstractmethod
    async def stream(self, request: LLMRequest) -> Any:
        """Stream a completion response token-by-token."""
        ...

    @abc.abstractmethod
    async def health_check(self) -> bool:
        """Return True if the LLM backend is reachable."""
        ...
