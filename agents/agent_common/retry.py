from __future__ import annotations

from pydantic import BaseModel, Field
import structlog

logger = structlog.get_logger()


class RetryPolicy(BaseModel):
    """Configuration for retry behaviour with exponential backoff."""

    max_retries: int = Field(default=3, ge=0, description="Maximum number of retry attempts.")
    base_delay_seconds: float = Field(default=1.0, gt=0, description="Initial delay in seconds before the first retry.")
    max_delay_seconds: float = Field(default=60.0, gt=0, description="Upper bound on the backoff delay.")
    exponential_base: float = Field(default=2.0, gt=1.0, description="Multiplier applied to the delay on each retry.")
    jitter: bool = Field(default=True, description="Whether to add random jitter to the delay.")

    def compute_delay(self, attempt: int) -> float:
        """Return the delay in seconds for a given *attempt* number (0-indexed).

        Applies exponential backoff capped by *max_delay_seconds*.  Jitter is
        **not** applied here — callers should add it themselves when
        ``self.jitter`` is ``True``.
        """
        delay = self.base_delay_seconds * (self.exponential_base ** attempt)
        return min(delay, self.max_delay_seconds)

    def should_retry(self, attempt: int) -> bool:
        """Return True if another retry is allowed for the given attempt count."""
        return attempt < self.max_retries
