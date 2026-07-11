from __future__ import annotations

import pytest
from httpx import AsyncClient, ASGITransport

from backend.app.main import app

@pytest.fixture
async def async_client() -> AsyncClient:
    """Provide an async test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        yield client
