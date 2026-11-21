import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
from app.models.scanner import ScannerAssignment, ScanLog
from app.models.user import User
from app.security import create_access_token

@pytest.mark.asyncio
async def test_scan_valid_and_already_used(client: AsyncClient, db_session, admin_user, event_factory):
    event = await event_factory(status="published")
    tt = TicketType(event_id=event.id, name="GA", price=10, quantity_total=10)
    db_session.add(tt)
    await db_session.commit()
    ticket = Ticket(ticket_type_id=tt.id, code="TESTCODE123")
    db_session.add(ticket)
    await db_session.commit()

    token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role})
    headers = {"Authorization": f"Bearer {token}"}

    r1 = await client.post("/scanner/scan", json={"code": "TESTCODE123", "event_id": event.id}, headers=headers)
    assert r1.status_code == 200
    assert r1.json()["result"] == "VALID"

    r2 = await client.post("/scanner/scan", json={"code": "TESTCODE123", "event_id": event.id}, headers=headers)
    assert r2.status_code == 200
    assert r2.json()["result"] == "ALREADY_USED"

@pytest.mark.asyncio
async def test_scan_invalid(client: AsyncClient, admin_user):
    token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role})
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/scanner/scan", json={"code": "NOTEXIST", "event_id": 1}, headers=headers)
    assert r.status_code == 200
    assert r.json()["result"] == "INVALID"

@pytest.mark.asyncio
async def test_scan_unauthorized(client: AsyncClient, db_session, normal_user, event_factory):
    event = await event_factory(status="published")
    token = create_access_token({"sub": str(normal_user.id), "role": normal_user.role})
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/scanner/scan", json={"code": "ANY", "event_id": event.id}, headers=headers)
    assert r.status_code == 200
    assert r.json()["result"] == "UNAUTHORIZED"
