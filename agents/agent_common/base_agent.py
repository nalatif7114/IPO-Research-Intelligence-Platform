from __future__ import annotations

import abc
import datetime
import uuid
from enum import Enum
from typing import Any, Generic, TypeVar

from pydantic import BaseModel
import structlog

from backend.app.config import get_settings
from events.bus import RedisEventBus
from events.models import BaseEvent

logger = structlog.get_logger()
settings = get_settings()


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
        self.bus = RedisEventBus(settings.redis_url)

    async def _emit_event(self, status: str, payload: Any = None) -> None:
        """Emit a lifecycle event to the event bus."""
        event = BaseEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.datetime.utcnow(),
            correlation_id=self.config.name
        )
        await self.bus.publish(f"agent.{self.config.name}.{status}", event)

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
            await self._emit_event("STARTED")
            
            result = await self.execute(input_data)
            
            self.status = AgentStatus.COMPLETED
            self.logger.info("agent_completed")
            await self._emit_event("COMPLETED", result)
            return result
        except Exception as e:
            self.status = AgentStatus.FAILED
            self.logger.error("agent_failed", error=str(e))
            await self._emit_event("FAILED", str(e))
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
