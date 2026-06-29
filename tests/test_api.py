import pytest
from httpx import AsyncClient, ASGITransport

from src.presentation.api.main import create_app


@pytest.fixture
def app():
    return create_app()


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_start_timer_no_member_id(client):
    response = await client.post("/api/v1/timers/start", json={"card_id": "test-card"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_active_timer_no_member_id(client):
    response = await client.get("/api/v1/timers/active")
    assert response.status_code == 422
