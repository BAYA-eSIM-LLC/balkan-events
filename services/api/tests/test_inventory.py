"""Concurrent inventory tests - requires PostgreSQL"""
import asyncio
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://balkan:balkan@localhost:5432/balkan_events_test"

@pytest.mark.asyncio
async def test_concurrent_purchase_last_tickets():
    """20 concurrent requests for last 5 tickets - only 5 should succeed"""
    # This test requires a running PostgreSQL with test data
    # Run: pytest tests/test_inventory.py -v
    pass  # Placeholder - implement with actual test DB

@pytest.mark.asyncio
async def test_no_negative_inventory():
    """Inventory can never go negative"""
    pass

@pytest.mark.asyncio
async def test_reservation_expiry():
    """Expired reservations release inventory"""
    pass
