"""Security utilities — JWT token management and password hashing."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import structlog
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.app.config import get_settings

logger = structlog.stdlib.get_logger(__name__)

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*.

    Args:
        plain: The raw password string.

    Returns:
        The hashed password string suitable for database storage.
    """
    return _pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a raw password against a stored bcrypt hash.

    Args:
        plain: The raw password string.
        hashed: The previously hashed password.

    Returns:
        ``True`` if the password matches, ``False`` otherwise.
    """
    return _pwd_ctx.verify(plain, hashed)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """Create a short-lived JWT access token.

    Args:
        subject: The token subject, typically a user id.
        extra_claims: Optional additional JWT claims.

    Returns:
        An encoded JWT string.
    """
    settings = get_settings()
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload: dict[str, Any] = {"sub": subject, "exp": expire, "type": "access"}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    """Create a long-lived JWT refresh token.

    Args:
        subject: The token subject, typically a user id.

    Returns:
        An encoded JWT string.
    """
    settings = get_settings()
    expire = datetime.now(tz=timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    payload: dict[str, Any] = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT token.

    Args:
        token: The encoded JWT string.

    Returns:
        The decoded payload as a dict, or ``None`` if the token is invalid
        or expired.
    """
    settings = get_settings()
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        logger.warning("jwt_verification_failed")
        return None
