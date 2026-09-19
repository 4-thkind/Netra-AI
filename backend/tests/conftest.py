import pytest_asyncio

from backend.app.core.database import Base, engine
from backend.app.data.synthetic_generator import seed_synthetic_data


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _create_schema_and_seed():
    """ASGITransport bypasses FastAPI lifespan, so tables/seed must be set up here."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_synthetic_data()
    yield
