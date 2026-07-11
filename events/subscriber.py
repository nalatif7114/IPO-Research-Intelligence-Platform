from __future__ import annotations

class EventSubscriber:
    """Handles subscribing to events from the bus."""
    
    def __init__(self, bus: object):
        self.bus = bus
        
    async def subscribe_event(self, topic: str, handler: callable) -> None:
        raise NotImplementedError
