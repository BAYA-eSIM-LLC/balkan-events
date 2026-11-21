from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.ticket import Ticket, TicketType
from app.models.order import Order, OrderItem, OrderStatus
from app.models.scanner import EntryPoint, ScannerAssignment, ScanLog, ScanResult
from app.models.event import Event

router = APIRouter(prefix="/scanner", tags=["scanner"])

class ScanRequest(BaseModel):
    code: str
    event_id: int
    entry_point_id: int | None = None

class ScanResponse(BaseModel):
    result: str
    message: str
    ticket_id: int | None = None

async def _check_assignment(user: User, event_id: int, db: AsyncSession) -> ScannerAssignment | None:
    if user.role in ("admin", "superadmin"):
        return True
    result = await db.execute(
        select(ScannerAssignment).where(
            ScannerAssignment.user_id == user.id,
            ScannerAssignment.event_id == event_id,
            ScannerAssignment.is_active == True
        )
    )
    return result.scalar_one_or_none()

@router.post("/scan", response_model=ScanResponse)
async def scan_ticket(data: ScanRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    assignment = await _check_assignment(user, data.event_id, db)
    if not assignment:
        await db.execute(select(1))  # noop
        log = ScanLog(event_id=data.event_id, entry_point_id=data.entry_point_id, scanner_user_id=user.id, result=ScanResult.UNAUTHORIZED.value, code_scanned=data.code[:50])
        db.add(log)
        await db.commit()
        return ScanResponse(result=ScanResult.UNAUTHORIZED.value, message="Nemate dozvolu za ovaj događaj")

    # Atomic lock on ticket
    result = await db.execute(
        select(Ticket).where(Ticket.code == data.code).with_for_update()
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        log = ScanLog(event_id=data.event_id, entry_point_id=data.entry_point_id, scanner_user_id=user.id, result=ScanResult.INVALID.value, code_scanned=data.code[:50])
        db.add(log)
        await db.commit()
        return ScanResponse(result=ScanResult.INVALID.value, message="Karta nije pronađena")

    tt = await db.get(TicketType, ticket.ticket_type_id)
    if not tt or tt.event_id != data.event_id:
        log = ScanLog(ticket_id=ticket.id, event_id=data.event_id, entry_point_id=data.entry_point_id, scanner_user_id=user.id, result=ScanResult.WRONG_EVENT.value, code_scanned=data.code[:50])
        db.add(log)
        await db.commit()
        return ScanResponse(result=ScanResult.WRONG_EVENT.value, message="Karta pripada drugom događaju", ticket_id=ticket.id)

    if ticket.is_used:
        log = ScanLog(ticket_id=ticket.id, event_id=data.event_id, entry_point_id=data.entry_point_id, scanner_user_id=user.id, result=ScanResult.ALREADY_USED.value, code_scanned=data.code[:50])
        db.add(log)
        await db.commit()
        return ScanResponse(result=ScanResult.ALREADY_USED.value, message="Karta je već iskorištena", ticket_id=ticket.id)

    # Check order status if linked
    if ticket.order_item_id:
        oi = await db.get(OrderItem, ticket.order_item_id)
        if oi:
            order = await db.get(Order, oi.order_id)
            if order:
                if order.status == OrderStatus.CANCELLED:
                    log = ScanLog(ticket_id=ticket.id, event_id=data.event_id, entry_point_id=data.entry_point_id, scanner_user_id=user.id, result=ScanResult.CANCELLED.value, code_scanned=data.code[:50])
                    db.add(log)
                    await db.commit()
                    return ScanResponse(result=ScanResult.CANCELLED.value, message="Narudžba je otkazana", ticket_id=ticket.id)
                if order.status == OrderStatus.REFUNDED:
                    log = ScanLog(ticket_id=ticket.id, event_id=data.event_id, entry_point_id=data.entry_point_id, scanner_user_id=user.id, result=ScanResult.REFUNDED.value, code_scanned=data.code[:50])
                    db.add(log)
                    await db.commit()
                    return ScanResponse(result=ScanResult.REFUNDED.value, message="Narudžba je refundirana", ticket_id=ticket.id)

    # Mark used atomically
    ticket.is_used = True
    ticket.used_at = datetime.utcnow()
    ticket.used_by = str(user.id)
    log = ScanLog(ticket_id=ticket.id, event_id=data.event_id, entry_point_id=data.entry_point_id, scanner_user_id=user.id, result=ScanResult.VALID.value, code_scanned=data.code[:50])
    db.add(log)
    await db.commit()
    return ScanResponse(result=ScanResult.VALID.value, message="Ulaz dozvoljen", ticket_id=ticket.id)

@router.get("/stats/{event_id}")
async def event_stats(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    assignment = await _check_assignment(user, event_id, db)
    if not assignment:
        raise HTTPException(403, "Nemate dozvolu")
    from sqlalchemy import func
    result = await db.execute(
        select(ScanLog.result, func.count()).where(ScanLog.event_id == event_id).group_by(ScanLog.result)
    )
    counts = {row[0]: row[1] for row in result.all()}
    return {"event_id": event_id, "counts": counts, "valid": counts.get("VALID", 0), "already_used": counts.get("ALREADY_USED", 0)}

@router.post("/entry-points")
async def create_entry_point(event_id: int, name: str, location: str = None, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in ("admin", "superadmin"):
        raise HTTPException(403, "Samo admin")
    ep = EntryPoint(event_id=event_id, name=name, location=location)
    db.add(ep)
    await db.commit()
    await db.refresh(ep)
    return {"id": ep.id, "name": ep.name}

@router.post("/assign")
async def assign_scanner(user_id: int, event_id: int, entry_point_id: int = None, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in ("admin", "superadmin"):
        raise HTTPException(403, "Samo admin")
    a = ScannerAssignment(user_id=user_id, event_id=event_id, entry_point_id=entry_point_id)
    db.add(a)
    await db.commit()
    return {"status": "assigned"}
