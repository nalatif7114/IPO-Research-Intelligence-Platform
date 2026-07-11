"""IPO Research Intelligence Platform — FastAPI Application Entry Point."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.router import api_router
from backend.app.config import get_settings
from backend.app.exceptions import AppException, app_exception_handler
from backend.app.lifespan import lifespan
from backend.app.logging_config import setup_logging
from backend.app.middleware import RequestIDMiddleware, TimingMiddleware

settings = get_settings()
setup_logging(log_level=settings.log_level, app_env=settings.app_env)


def create_app() -> FastAPI:
    """Application factory for the IPO Research Intelligence Platform."""
    app = FastAPI(
        title=settings.app_name,
        description="Enterprise Multi-Agent AI Platform for IPO Prospectus Analysis",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # --- Middleware (order matters — outermost first) ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(TimingMiddleware)

    # --- Exception handlers ---
    app.add_exception_handler(AppException, app_exception_handler)

    # --- Routers ---
    app.include_router(api_router, prefix="/api")

    # --- Prometheus (optional) ---
    if settings.prometheus_enabled:
        try:
            from prometheus_fastapi_instrumentator import Instrumentator

            Instrumentator().instrument(app).expose(app, endpoint="/metrics")
        except ImportError:
            pass

    return app


app = create_app()
