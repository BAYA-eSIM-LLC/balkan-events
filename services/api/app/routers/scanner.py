from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.ticket import Ticket, TicketType
from app.models.user import User
from app.deps import get_current_user
from app.routers.admin_system import log_audit

router = APIRouter(prefix="/scanner", tags=["scanner"])

class ScanRequest(BaseModel):
    qr_data: str
    event_id: int

@router.post("/validate")
async def validate_scan(data: ScanRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Only scanner or higher org roles
    result = await db.execute(select(Ticket).where(Ticket.qr_data == data.qr_data).with_for_update())
    ticket = result.scalar_one_or_none()
    if not ticket:
        return {"status": "INVALID", "reason": "not_found"}
    tt = await db.get(TicketType, ticket.ticket_type_id)
    if not tt or tt.event_id != data.event_id:
        return {"status": "WRONG_EVENT"}
    if ticket.is_used:
        return {"status": "ALREADY_USED", "used_at": ticket.used_at.isoformat() if ticket.used_at else None}
    ticket.is_used = True
    ticket.used_at = datetime.utcnow()
    ticket.used_by = str(user.id)
    await db.commit()
    await log_audit(db, user.id, "scanner.validate", "Ticket", ticket.id, {"event_id": data.event_id})
    return {"status": "VALID", "ticket_id": ticket.id}
