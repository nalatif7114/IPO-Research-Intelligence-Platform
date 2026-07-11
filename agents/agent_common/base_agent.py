from __future__ import annotations

import abc
from enum import Enum
from typing import Any, Generic, TypeVar

from pydantic import BaseModel
import structlog

logger = structlog.get_logger()


class AgentStatus(str, Enum):
    """Possible states an agent can be in during its lifecycle."""

    IDLE = "idle"
    ASSIGNED = "assigned"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"
    ESCALATED = "escalated"


class AgentConfig(BaseModel):
    """Configuration for an individual agent instance."""

    name: str
    max_retries: int = 3
    timeout_seconds: int = 300
    enabled: bool = True


InputT = TypeVar("InputT", bound=BaseModel)
OutputT = TypeVar("OutputT", bound=BaseModel)


class BaseAgent(abc.ABC, Generic[InputT, OutputT]):
    """Abstract base class for all IPO Research Intelligence Platform agents."""

    def __init__(self, config: AgentConfig) -> None:
        self.config = config
        self.status = AgentStatus.IDLE
        self.logger = logger.bind(agent=config.name)

    @abc.abstractmethod
    async def execute(self, input_data: InputT) -> OutputT:
        """Execute the agent's main task."""
        ...

    @abc.abstractmethod
    async def validate_input(self, input_data: InputT) -> bool:
        """Validate the input data before execution."""
        ...

    @abc.abstractmethod
    async def handle_error(self, error: Exception) -> None:
        """Handle errors during execution."""
        ...

    async def run(self, input_data: InputT) -> OutputT:
        """Run the agent with full lifecycle management."""
        self.status = AgentStatus.ASSIGNED
        self.logger.info("agent_assigned")
        try:
            await self.validate_input(input_data)
            self.status = AgentStatus.RUNNING
            self.logger.info("agent_running")
            result = await self.execute(input_data)
            self.status = AgentStatus.COMPLETED
            self.logger.info("agent_completed")
            return result
        except Exception as e:
            self.status = AgentStatus.FAILED
            self.logger.error("agent_failed", error=str(e))
            await self.handle_error(e)
            raise

    def get_status(self) -> AgentStatus:
        """Return the current agent status."""
        return self.status

    async def health_check(self) -> dict[str, Any]:
        """Return health information for monitoring."""
        return {
            "agent": self.config.name,
            "status": self.status.value,
            "enabled": self.config.enabled,
        }
