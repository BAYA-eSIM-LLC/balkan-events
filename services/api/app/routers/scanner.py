from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
from app.models.user import User, UserRole
from app.models.scanner import ScanLog
from app.deps import get_current_user, require_role
from app.routers.admin_system import log_audit, ADMIN_ONLY, paginate

router = APIRouter(prefix="/scanner", tags=["scanner"])

class ScanRequest(BaseModel):
    qr_data: str
    event_id: int
    entry_point_id: Optional[int] = None

async def _write_log(db: AsyncSession, ticket_id: Optional[int], event_id: Optional[int], entry_point_id: Optional[int], user_id: int, result: str, reason: Optional[str] = None):
    log = ScanLog(
        ticket_id=ticket_id,
        event_id=event_id,
        entry_point_id=entry_point_id,
        scanner_user_id=user_id,
        result=result,
        reason=reason,
    )
    db.add(log)
    await db.commit()

@router.post("/validate")
async def validate_scan(data: ScanRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.qr_data == data.qr_data).with_for_update())
    ticket = result.scalar_one_or_none()
    if not ticket:
        await _write_log(db, None, data.event_id, data.entry_point_id, user.id, "INVALID", "not_found")
        return {"status": "INVALID", "reason": "not_found"}

    tt = await db.get(TicketType, ticket.ticket_type_id)
    if not tt or tt.event_id != data.event_id:
        await _write_log(db, ticket.id, data.event_id, data.entry_point_id, user.id, "WRONG_EVENT")
        return {"status": "WRONG_EVENT"}

    if ticket.is_used:
        await _write_log(db, ticket.id, data.event_id, data.entry_point_id, user.id, "ALREADY_USED")
        return {"status": "ALREADY_USED", "used_at": ticket.used_at.isoformat() if ticket.used_at else None}

    # Mark used under the same lock – concurrent scans cannot double-use
    ticket.is_used = True
    ticket.used_at = datetime.utcnow()
    ticket.used_by = str(user.id)
    await db.commit()
    await _write_log(db, ticket.id, data.event_id, data.entry_point_id, user.id, "VALID")
    await log_audit(db, user.id, "scanner.validate", "Ticket", ticket.id, {"event_id": data.event_id})
    return {"status": "VALID", "ticket_id": ticket.id}

@router.get("/logs")
async def list_scan_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    event_id: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Super Admin / Admin see all. Organizer sees only own events."""
    page, page_size = paginate(page, page_size)
    q = select(ScanLog)
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        # Organizer isolation – only events they own (via organization membership simplified)
        owned = select(Event.id).where(Event.organization_id == getattr(user, "organization_id", None))
        q = q.where(ScanLog.event_id.in_(owned))
    if event_id:
        q = q.where(ScanLog.event_id == event_id)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(ScanLog.scanned_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(q)).scalars().all()
    return {
        "total": total or 0,
        "page": page,
        "page_size": page_size,
        "items": [{
            "id": l.id,
            "ticket_id": l.ticket_id,
            "event_id": l.event_id,
            "entry_point_id": l.entry_point_id,
            "scanner_user_id": l.scanner_user_id,
            "result": l.result,
            "reason": l.reason,
            "scanned_at": l.scanned_at.isoformat() if l.scanned_at else None,
        } for l in rows],
    }
