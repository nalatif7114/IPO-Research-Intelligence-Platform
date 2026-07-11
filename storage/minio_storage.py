from __future__ import annotations
import os
import tempfile
from typing import BinaryIO
from datetime import timedelta
from minio import Minio
from minio.error import S3Error
from storage.base import StorageBackend

class MinIOStorage(StorageBackend):
    """MinIO implementation of StorageBackend."""
    
    def __init__(self, endpoint: str, access_key: str, secret_key: str, bucket: str, secure: bool = False):
        self.client = Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.bucket = bucket
        self._ensure_bucket()
        
    def _ensure_bucket(self) -> None:
        if not self.client.bucket_exists(self.bucket):
            self.client.make_bucket(self.bucket)
            
    async def upload(self, path: str, data: BinaryIO | bytes, content_type: str = "application/octet-stream") -> str:
        """Upload data to MinIO."""
        if isinstance(data, bytes):
            import io
            data_stream = io.BytesIO(data)
            length = len(data)
        else:
            data_stream = data
            data_stream.seek(0, os.SEEK_END)
            length = data_stream.tell()
            data_stream.seek(0)
            
        self.client.put_object(
            bucket_name=self.bucket,
            object_name=path,
            data=data_stream,
            length=length,
            content_type=content_type
        )
        return path
        
    async def download(self, path: str) -> bytes:
        """Download data from MinIO."""
        response = None
        try:
            response = self.client.get_object(self.bucket, path)
            return response.read()
        finally:
            if response:
                response.close()
                response.release_conn()
        
    async def delete(self, path: str) -> None:
        """Delete data from MinIO."""
        self.client.remove_object(self.bucket, path)
        
    async def get_url(self, path: str) -> str:
        """Get a presigned URL for the object."""
        return self.client.get_presigned_url(
            "GET",
            self.bucket,
            path,
            expires=timedelta(days=7),
        )
