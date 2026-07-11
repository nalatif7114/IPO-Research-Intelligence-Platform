from __future__ import annotations

class CollectionManager:
    """Manages Qdrant collections (creation, schemas, indexing)."""
    
    async def create_collection(self, name: str, dimension: int) -> None:
        raise NotImplementedError
        
    async def delete_collection(self, name: str) -> None:
        raise NotImplementedError
        
    async def list_collections(self) -> list[str]:
        raise NotImplementedError
