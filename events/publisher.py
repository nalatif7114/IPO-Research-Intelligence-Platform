from __future__ import annotations

class EventPublisher:
    """Handles publishing events to the bus."""
    
    def __init__(self, bus: object):
        self.bus = bus
        
    async def publish_event(self, topic: str, event_data: object) -> None:
        raise NotImplementedError
