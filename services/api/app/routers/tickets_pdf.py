from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import csv, io
from app.database import get_db
from app.models.ticket import Ticket, TicketType
from app.models.order import Order, OrderItem
from app.models.event import Event
from app.models.organization import Organization, OrganizationMember
from app.models.guest_list import GuestList, Guest
from app.models.user import User, UserRole
from app.models.seat_map import Seat, SeatRow, Sector
from app.deps import get_current_user, require_role, get_org_member
from app.routers.admin_system import log_audit
from app.services.pdf_tickets import generate_ticket_pdf, generate_guest_list_pdf
from app.services.email import queue_email
from app.config import SMTP_HOST

router = APIRouter(prefix="/tickets", tags=["tickets"])
guest_router = APIRouter(prefix="/guest-lists", tags=["guest-lists"])
admin_router = APIRouter(prefix="/admin", tags=["admin-tickets"])

ADMIN_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN)


async def _org_for_event(db: AsyncSession, event_id: int, user: User):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(event.organization_id, user, db)
    return event


class GuestIn(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class GuestListCreate(BaseModel):
    event_id: int
    name: str


@router.get("/{ticket_id}/pdf")
async def ticket_pdf(ticket_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Download PDF for a ticket the user owns or is authorized for."""
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    oi = await db.get(OrderItem, ticket.order_item_id)
    if not oi:
        raise HTTPException(404, "Order item not found")
    order = await db.get(Order, oi.order_id)
    if not order:
        raise HTTPException(404)
    # Owner or admin or org member of event
    tt = await db.get(TicketType, ticket.ticket_type_id)
    event = await db.get(Event, tt.event_id) if tt else None
    allowed = order.user_id == user.id or user.role in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value)
    if not allowed and event:
        try:
            await get_org_member(event.organization_id, user, db)
            allowed = True
        except HTTPException:
            pass
    if not allowed:
        raise HTTPException(403, "Not authorized")
    if order.status != "paid":
        raise HTTPException(400, "Ticket not confirmed")

    seat_label = None
    if ticket.seat_id:
        seat = await db.get(Seat, ticket.seat_id)
        if seat:
            row = await db.get(SeatRow, seat.row_id)
            sector = await db.get(Sector, row.sector_id) if row else None
            seat_label = f"{sector.name if sector else ''} {row.label if row else ''} {seat.number or ''}".strip()

    org = await db.get(Organization, event.organization_id) if event else None
    data = [{
        "code": ticket.code,
        "qr_data": ticket.qr_data or ticket.code,
        "reference": order.reference,
        "seat_label": seat_label,
        "category": tt.name if tt else None,
    }]
    pdf = generate_ticket_pdf(
        data,
        event.title if event else "Event",
        event.start_at if event else None,
        event.venue_name if event else "",
        org.name if org else "",
        user.full_name or user.email,
    )
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=ticket-{ticket.code}.pdf"})


@router.post("/{ticket_id}/email")
async def email_ticket(ticket_id: int, to_email: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Queue ticket email. Does not claim sent unless SMTP is configured and succeeds."""
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404)
    oi = await db.get(OrderItem, ticket.order_item_id)
    order = await db.get(Order, oi.order_id) if oi else None
    if not order or (order.user_id != user.id and user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value)):
        raise HTTPException(403)
    key = f"ticket-email:{ticket.id}:{to_email}"
    log = await queue_email(
        db, to_email, f"Your ticket {ticket.code}",
        f"Ticket {ticket.code} for order {order.reference}. QR: {ticket.qr_data or ticket.code}",
        "ticket_delivery", "ticket", ticket.id, key,
    )
    await db.commit()
    smtp_configured = bool(SMTP_HOST)
    return {
        "queued": log is not None,
        "smtp_configured": smtp_configured,
        "sent": False if not smtp_configured else (log.sent if log else False),
        "message": "Email queued" if smtp_configured else "SMTP not configured — email recorded but not sent",
    }


@guest_router.post("")
async def create_guest_list(data: GuestListCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    event = await _org_for_event(db, data.event_id, user)
    gl = GuestList(event_id=event.id, organization_id=event.organization_id, name=data.name, created_by=user.id)
    db.add(gl)
    await db.commit()
    await db.refresh(gl)
    await log_audit(db, user.id, "guest_list.created", "GuestList", gl.id)
    return {"id": gl.id, "name": gl.name}


@guest_router.get("/event/{event_id}")
async def list_for_event(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await _org_for_event(db, event_id, user)
    result = await db.execute(select(GuestList).where(GuestList.event_id == event_id))
    lists = result.scalars().all()
    return [{"id": g.id, "name": g.name, "created_at": g.created_at.isoformat() if g.created_at else None} for g in lists]


@guest_router.post("/{list_id}/guests")
async def add_guest(list_id: int, data: GuestIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    gl = await db.get(GuestList, list_id)
    if not gl:
        raise HTTPException(404)
    await _org_for_event(db, gl.event_id, user)
    g = Guest(guest_list_id=list_id, first_name=data.first_name, last_name=data.last_name, email=data.email, phone=data.phone, notes=data.notes)
    db.add(g)
    await db.commit()
    await db.refresh(g)
    return {"id": g.id}


@guest_router.get("/{list_id}/guests")
async def list_guests(list_id: int, q: Optional[str] = None, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    gl = await db.get(GuestList, list_id)
    if not gl:
        raise HTTPException(404)
    await _org_for_event(db, gl.event_id, user)
    query = select(Guest).where(Guest.guest_list_id == list_id)
    if q:
        like = f"%{q}%"
        query = query.where(or_(Guest.first_name.ilike(like), Guest.last_name.ilike(like), Guest.email.ilike(like)))
    result = await db.execute(query.order_by(Guest.last_name))
    guests = result.scalars().all()
    return [{"id": g.id, "first_name": g.first_name, "last_name": g.last_name, "email": g.email, "checked_in": g.checked_in} for g in guests]


@guest_router.post("/{list_id}/guests/import")
async def import_guests(list_id: int, file: UploadFile = File(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    gl = await db.get(GuestList, list_id)
    if not gl:
        raise HTTPException(404)
    await _org_for_event(db, gl.event_id, user)
    content = (await file.read()).decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    count = 0
    for row in reader:
        g = Guest(
            guest_list_id=list_id,
            first_name=row.get("first_name") or row.get("ime") or "",
            last_name=row.get("last_name") or row.get("prezime") or "",
            email=row.get("email"),
            phone=row.get("phone"),
        )
        if g.first_name and g.last_name:
            db.add(g)
            count += 1
    await db.commit()
    return {"imported": count}


@guest_router.get("/{list_id}/export.csv")
async def export_guests_csv(list_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    gl = await db.get(GuestList, list_id)
    if not gl:
        raise HTTPException(404)
    await _org_for_event(db, gl.event_id, user)
    result = await db.execute(select(Guest).where(Guest.guest_list_id == list_id))
    guests = result.scalars().all()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["first_name", "last_name", "email", "phone", "checked_in"])
    for g in guests:
        w.writerow([g.first_name, g.last_name, g.email or "", g.phone or "", g.checked_in])
    return Response(content=buf.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=guests.csv"})


@guest_router.get("/{list_id}/export.pdf")
async def export_guests_pdf(list_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    gl = await db.get(GuestList, list_id)
    if not gl:
        raise HTTPException(404)
    event = await _org_for_event(db, gl.event_id, user)
    result = await db.execute(select(Guest).where(Guest.guest_list_id == list_id))
    guests = [{"first_name": g.first_name, "last_name": g.last_name, "email": g.email, "checked_in": g.checked_in} for g in result.scalars()]
    pdf = generate_guest_list_pdf(guests, event.title, gl.name)
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=guests.pdf"})


@guest_router.post("/guests/{guest_id}/check-in")
async def check_in_guest(guest_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    g = await db.get(Guest, guest_id)
    if not g:
        raise HTTPException(404)
    gl = await db.get(GuestList, g.guest_list_id)
    await _org_for_event(db, gl.event_id, user)
    g.checked_in = True
    g.checked_in_at = datetime.utcnow()
    await db.commit()
    return {"id": g.id, "checked_in": True}


@admin_router.get("/guest-lists")
async def admin_guest_lists(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GuestList).order_by(GuestList.created_at.desc()).limit(100))
    lists = result.scalars().all()
    return [{"id": g.id, "name": g.name, "event_id": g.event_id, "organization_id": g.organization_id} for g in lists]
