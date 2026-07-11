from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class BaseEvent(BaseModel):
    """Base schema for all events flowing through the platform."""

    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    agent_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payload: dict[str, Any] = {}


class AgentTaskEvent(BaseEvent):
    """Event published when a task is dispatched to an agent."""

    task_type: str = ""
    priority: int = 0


class AgentResultEvent(BaseEvent):
    """Event published when an agent completes (or fails) a task."""

    success: bool = True
    error_message: str | None = None
    duration_seconds: float | None = None
