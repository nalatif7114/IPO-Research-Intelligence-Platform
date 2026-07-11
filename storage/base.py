from __future__ import annotations
import abc
from typing import BinaryIO

class StorageBackend(abc.ABC):
    """Abstract interface for object storage (e.g. S3, MinIO, Local)."""
    
    @abc.abstractmethod
    async def upload(self, path: str, data: BinaryIO | bytes, content_type: str) -> str:
        pass
        
    @abc.abstractmethod
    async def download(self, path: str) -> bytes:
        pass
        
    @abc.abstractmethod
    async def delete(self, path: str) -> None:
        pass
        
    @abc.abstractmethod
    async def get_url(self, path: str) -> str:
        pass
