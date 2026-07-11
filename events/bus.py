from __future__ import annotations
import abc

class EventBus(abc.ABC):
    """Abstract interface for the event bus (pub/sub)."""
    
    @abc.abstractmethod
    async def publish(self, topic: str, event: object) -> None:
        pass
        
    @abc.abstractmethod
    async def subscribe(self, topic: str, handler: callable) -> None:
        pass
        
    @abc.abstractmethod
    async def unsubscribe(self, topic: str, handler: callable) -> None:
        pass
