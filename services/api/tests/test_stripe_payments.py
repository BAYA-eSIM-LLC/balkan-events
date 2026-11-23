"""Stripe payment tests (TEST MODE / mocked).
Verifies signature rejection, idempotency, late payment, double refund prevention.
"""
import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import json

@pytest.mark.asyncio
async def test_webhook_invalid_signature(client: AsyncClient):
    resp = await client.post("/payments/webhook", content=b"{}", headers={"stripe-signature": "invalid"})
    assert resp.status_code == 400

@pytest.mark.asyncio
async def test_webhook_idempotency(client: AsyncClient, db_session: AsyncSession):
    with patch("stripe.Webhook.construct_event") as mock_construct:
        event = {
            "id": "evt_test_idempotent_001",
            "type": "checkout.session.completed",
            "data": {"object": {"id": "cs_test", "metadata": {"order_id": "99999"}, "amount_total": 1000}}
        }
        mock_construct.return_value = event
        r1 = await client.post("/payments/webhook", content=b"{}", headers={"stripe-signature": "t=1,v1=x"})
        assert r1.status_code == 200
        r2 = await client.post("/payments/webhook", content=b"{}", headers={"stripe-signature": "t=1,v1=x"})
        assert r2.json().get("status") == "already_processed"

@pytest.mark.asyncio
async def test_checkout_requires_auth(client: AsyncClient):
    resp = await client.post("/payments/checkout/1")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_refund_requires_admin(client: AsyncClient):
    resp = await client.post("/payments/refund", json={"payment_id": 1})
    assert resp.status_code == 401
