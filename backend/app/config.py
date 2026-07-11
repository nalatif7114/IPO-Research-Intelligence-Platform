"""Application configuration via pydantic-settings."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Centralised application settings loaded from environment variables."""

    # Application
    app_name: str = "IPO Research Intelligence Platform"
    app_env: str = "development"
    app_debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_secret_key: str = "change-me-in-production"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/ipo_platform"
    database_echo: bool = False

    # Redis
    redis_url: str = "redis://redis:6379/0"
    celery_broker_url: str = "redis://redis:6379/1"
    celery_result_backend: str = "redis://redis:6379/2"

    # Vector Database
    qdrant_host: str = "qdrant"
    qdrant_port: int = 6333
    qdrant_api_key: str = ""

    # LLM
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    default_llm_provider: str = "openai"
    default_llm_model: str = "gpt-4.1"

    # Embedding
    embedding_model: str = "BAAI/bge-m3"
    embedding_dimensions: int = 1024

    # Storage
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "ipo-documents"
    minio_use_ssl: bool = False

    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # Monitoring
    prometheus_enabled: bool = True
    log_level: str = "INFO"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


def get_settings() -> Settings:
    """Return a cached ``Settings`` instance."""
    return Settings()
