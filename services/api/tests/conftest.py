import pytest
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_db

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://test_user:test_password@localhost:5432/balkan_events_test",
)


@pytest.fixture
async def db_session():
    engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session
    await engine.dispose()


async def override_get_db():
    engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        try:
            yield session
        finally:
            await session.close()
    await engine.dispose()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
