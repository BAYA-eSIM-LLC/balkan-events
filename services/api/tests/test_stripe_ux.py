"""Additional Stripe UX and edge-case tests."""
import pytest
from httpx import AsyncClient
from unittest.mock import patch

@pytest.mark.asyncio
async def test_status_requires_auth(client: AsyncClient):
    resp = await client.get("/payments/status/1")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_my_tickets_requires_auth(client: AsyncClient):
    resp = await client.get("/payments/my-tickets")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_organizer_payments_requires_auth(client: AsyncClient):
    resp = await client.get("/payments/organizer")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_refund_webhook_idempotent(client: AsyncClient):
    with patch("stripe.Webhook.construct_event") as mock:
        event = {
            "id": "evt_refund_test_001",
            "type": "refund.updated",
            "data": {"object": {"id": "re_test"}}
        }
        mock.return_value = event
        r1 = await client.post("/payments/webhook", content=b"{}", headers={"stripe-signature": "t=1,v1=x"})
        assert r1.status_code == 200
        r2 = await client.post("/payments/webhook", content=b"{}", headers={"stripe-signature": "t=1,v1=x"})
        assert r2.json().get("status") == "already_processed"
