from __future__ import annotations
from storage.base import StorageBackend
from typing import BinaryIO

class MinIOStorage(StorageBackend):
    """MinIO implementation of StorageBackend."""
    
    async def upload(self, path: str, data: BinaryIO | bytes, content_type: str) -> str:
        raise NotImplementedError
        
    async def download(self, path: str) -> bytes:
        raise NotImplementedError
        
    async def delete(self, path: str) -> None:
        raise NotImplementedError
        
    async def get_url(self, path: str) -> str:
        raise NotImplementedError
