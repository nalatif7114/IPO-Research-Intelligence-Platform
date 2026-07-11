from __future__ import annotations

from typing import Any

from agents.agent_common.base_agent import AgentStatus
import structlog

logger = structlog.get_logger()

_VALID_TRANSITIONS: dict[AgentStatus, set[AgentStatus]] = {
    AgentStatus.IDLE: {AgentStatus.ASSIGNED},
    AgentStatus.ASSIGNED: {AgentStatus.RUNNING, AgentStatus.FAILED},
    AgentStatus.RUNNING: {AgentStatus.COMPLETED, AgentStatus.FAILED, AgentStatus.RETRY},
    AgentStatus.COMPLETED: {AgentStatus.IDLE},
    AgentStatus.FAILED: {AgentStatus.RETRY, AgentStatus.ESCALATED, AgentStatus.IDLE},
    AgentStatus.RETRY: {AgentStatus.ASSIGNED, AgentStatus.ESCALATED},
    AgentStatus.ESCALATED: {AgentStatus.IDLE},
}


class AgentLifecycleManager:
    """Manages and validates state transitions for agents."""

    def __init__(self) -> None:
        self.logger = logger.bind(component="lifecycle_manager")

    def validate_transition(self, current: AgentStatus, target: AgentStatus) -> bool:
        """Return True if the transition from *current* to *target* is valid."""
        allowed = _VALID_TRANSITIONS.get(current, set())
        return target in allowed

    def transition(self, current: AgentStatus, target: AgentStatus) -> AgentStatus:
        """Perform a validated state transition, raising on invalid moves."""
        if not self.validate_transition(current, target):
            msg = f"Invalid transition: {current.value} -> {target.value}"
            self.logger.error("invalid_transition", current=current.value, target=target.value)
            raise ValueError(msg)
        self.logger.info("state_transition", from_state=current.value, to_state=target.value)
        return target

    def get_valid_transitions(self, current: AgentStatus) -> set[AgentStatus]:
        """Return the set of states reachable from *current*."""
        return _VALID_TRANSITIONS.get(current, set())

    def get_lifecycle_info(self) -> dict[str, Any]:
        """Return a serialisable description of the full state machine."""
        return {
            state.value: [t.value for t in targets]
            for state, targets in _VALID_TRANSITIONS.items()
        }
