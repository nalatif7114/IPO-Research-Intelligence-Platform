from __future__ import annotations
import abc
import json
import redis.asyncio as redis
from typing import Callable, Any, Coroutine

class EventBus(abc.ABC):
    """Abstract interface for the event bus (pub/sub)."""
    
    @abc.abstractmethod
    async def publish(self, topic: str, event: Any) -> None:
        pass
        
    @abc.abstractmethod
    async def subscribe(self, topic: str, handler: Callable[..., Coroutine[Any, Any, None]]) -> None:
        pass
        
    @abc.abstractmethod
    async def unsubscribe(self, topic: str, handler: Callable[..., Coroutine[Any, Any, None]]) -> None:
        pass

class RedisEventBus(EventBus):
    """Redis-backed Event Bus."""
    
    def __init__(self, redis_url: str):
        self.redis_client = redis.from_url(redis_url)
        
    async def publish(self, topic: str, event: Any) -> None:
        """Publish an event to a Redis channel."""
        # Convert pydantic model to json if applicable
        if hasattr(event, "model_dump_json"):
            message = event.model_dump_json()
        elif isinstance(event, dict):
            message = json.dumps(event)
        else:
            message = str(event)
        await self.redis_client.publish(topic, message)
        
    async def subscribe(self, topic: str, handler: Callable[..., Coroutine[Any, Any, None]]) -> None:
        """Subscribe to a Redis channel. (Simplified for demonstration)"""
        # Note: True pub/sub consumer loops are typically managed externally.
        pass
        
    async def unsubscribe(self, topic: str, handler: Callable[..., Coroutine[Any, Any, None]]) -> None:
        pass

