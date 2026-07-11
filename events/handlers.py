from __future__ import annotations
import abc

class EventHandler(abc.ABC):
    """Abstract interface for event handlers."""
    
    @abc.abstractmethod
    async def handle(self, event: object) -> None:
        pass
