from __future__ import annotations

class BatchEmbedder:
    """Handles batched embedding generation for large documents."""
    
    def __init__(self, service: object, batch_size: int = 100):
        self.service = service
        self.batch_size = batch_size
        
    async def process_chunks(self, chunks: list[dict]) -> list[dict]:
        raise NotImplementedError
