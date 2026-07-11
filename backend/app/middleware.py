"""Custom ASGI middleware for request tracing, logging, and timing."""

from __future__ import annotations

import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = structlog.stdlib.get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Inject a unique ``X-Request-ID`` header into every request/response cycle.

    If the incoming request already carries the header its value is preserved;
    otherwise a new UUID4 is generated.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """Process the request and attach the request-id header."""
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log incoming requests and outgoing responses with structlog."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """Log method, path, and status code for every HTTP exchange."""
        logger.info(
            "request_started",
            method=request.method,
            path=str(request.url.path),
            client=request.client.host if request.client else None,
        )

        response = await call_next(request)

        logger.info(
            "request_completed",
            method=request.method,
            path=str(request.url.path),
            status_code=response.status_code,
        )
        return response


class TimingMiddleware(BaseHTTPMiddleware):
    """Measure request processing time and expose it via ``X-Process-Time``."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """Record elapsed wall-clock time for the request."""
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers["X-Process-Time"] = f"{elapsed_ms}ms"
        return response
