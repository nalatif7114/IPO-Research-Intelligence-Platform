"""Application-wide custom exceptions and FastAPI exception handlers."""

from __future__ import annotations

from typing import Any

import structlog
from fastapi import Request
from fastapi.responses import JSONResponse

logger = structlog.stdlib.get_logger(__name__)


# ---------------------------------------------------------------------------
# Base exception
# ---------------------------------------------------------------------------


class AppException(Exception):
    """Base exception for all application-specific errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        status_code: int = 500,
        detail: Any = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)


# ---------------------------------------------------------------------------
# Concrete exceptions
# ---------------------------------------------------------------------------


class NotFoundError(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Resource not found.", detail: Any = None) -> None:
        super().__init__(message=message, status_code=404, detail=detail)


class ValidationError(AppException):
    """Raised when request data fails domain-level validation."""

    def __init__(self, message: str = "Validation error.", detail: Any = None) -> None:
        super().__init__(message=message, status_code=422, detail=detail)


class AuthenticationError(AppException):
    """Raised when authentication credentials are missing or invalid."""

    def __init__(self, message: str = "Authentication required.", detail: Any = None) -> None:
        super().__init__(message=message, status_code=401, detail=detail)


class AuthorizationError(AppException):
    """Raised when the authenticated user lacks permission."""

    def __init__(self, message: str = "Insufficient permissions.", detail: Any = None) -> None:
        super().__init__(message=message, status_code=403, detail=detail)


class ExternalServiceError(AppException):
    """Raised when an external service call fails."""

    def __init__(self, message: str = "External service error.", detail: Any = None) -> None:
        super().__init__(message=message, status_code=502, detail=detail)


# ---------------------------------------------------------------------------
# FastAPI exception handler
# ---------------------------------------------------------------------------


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle all ``AppException`` subclasses and return a consistent JSON body."""
    logger.warning(
        "app_exception",
        status_code=exc.status_code,
        message=exc.message,
        path=str(request.url),
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "detail": exc.detail,
        },
    )


exception_handlers: dict[type[Exception], Any] = {
    AppException: app_exception_handler,
}
