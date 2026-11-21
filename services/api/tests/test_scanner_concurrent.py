import asyncio
import pytest
from httpx import AsyncClient
from datetime import datetime
from app.models.user import User
from app.models.organization import Organization
from app.models.event import Event
from app.models.ticket import Ticket, TicketType
from app.models.scanner import ScanLog
from app.security import hash_password, create_access_token
from sqlalchemy import select, func

@pytest.mark.asyncio
async def test_concurrent_scan_exactly_one_valid(client: AsyncClient, db_session):
    """20 parallel scans of the same ticket: exactly 1 VALID, 19 ALREADY_USED."""
    user = User(
        email="scanner_test@example.com",
        password_hash=hash_password("test"),
        role="admin",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()

    org = Organization(name="Test Org", slug="test-org-scan")
    db_session.add(org)
    await db_session.flush()

    event = Event(
        organization_id=org.id,
        title="Scan Test Event",
        slug="scan-test-event",
        start_at=datetime.utcnow(),
        status="PUBLISHED",
    )
    db_session.add(event)
    await db_session.flush()

    tt = TicketType(event_id=event.id, name="GA", price=10, quantity_total=100)
    db_session.add(tt)
    await db_session.flush()

    ticket = Ticket(ticket_type_id=tt.id, code="CONCURRENT_CODE_001")
    db_session.add(ticket)
    await db_session.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    async def do_scan():
        r = await client.post(
            "/scanner/scan",
            json={"code": "CONCURRENT_CODE_001", "event_id": event.id},
            headers=headers,
        )
        return r.status_code, r.json() if r.status_code == 200 else None

    results = await asyncio.gather(*[do_scan() for _ in range(20)])

    valid = sum(1 for code, body in results if body and body.get("result") == "VALID")
    already = sum(1 for code, body in results if body and body.get("result") == "ALREADY_USED")

    assert valid == 1, f"Expected exactly 1 VALID, got {valid}"
    assert already == 19, f"Expected 19 ALREADY_USED, got {already}"

    # Verify scan_logs
    log_count = await db_session.scalar(
        select(func.count()).select_from(ScanLog).where(ScanLog.code_scanned == "CONCURRENT_CODE_001")
    )
    assert log_count == 20
