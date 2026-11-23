from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case
from datetime import datetime, timedelta
from typing import Optional
import io, csv
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
from app.models.organization import Organization, OrganizationMember
from app.models.pos import CashTransaction, SalesPoint
from app.models.user import User, UserRole
from app.deps import get_current_user, require_role, get_org_member
from app.services.permissions import check_event_cap, has_cap

router = APIRouter(prefix="/analytics", tags=["analytics"])
admin_router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])

ADMIN_ROLES = (UserRole.ADMIN, UserRole.SUPERADMIN)


def _period_bounds(period: str, date_from: Optional[str], date_to: Optional[str]):
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "today":
        return today, now
    if period == "yesterday":
        return today - timedelta(days=1), today
    if period == "this_week":
        start = today - timedelta(days=today.weekday())
        return start, now
    if period == "last_week":
        start = today - timedelta(days=today.weekday() + 7)
        return start, start + timedelta(days=7)
    if period == "this_month":
        return today.replace(day=1), now
    if period == "last_month":
        first = today.replace(day=1)
        last_end = first
        last_start = (first - timedelta(days=1)).replace(day=1)
        return last_start, last_end
    if period == "this_year":
        return today.replace(month=1, day=1), now
    if period == "custom" and date_from and date_to:
        return datetime.fromisoformat(date_from), datetime.fromisoformat(date_to)
    return None, None


async def _org_event_ids(db: AsyncSession, organization_id: int):
    result = await db.execute(select(Event.id).where(Event.organization_id == organization_id))
    return [r[0] for r in result.all()]


@admin_router.get("/overview")
async def admin_overview(
    period: str = Query("this_month"),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: User = Depends(require_role(*ADMIN_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    start, end = _period_bounds(period, date_from, date_to)
    q = select(Order)
    if start:
        q = q.where(Order.created_at >= start)
    if end:
        q = q.where(Order.created_at < end)
    orders = (await db.execute(q)).scalars().all()

    paid = [o for o in orders if o.status == OrderStatus.PAID.value]
    cancelled = [o for o in orders if o.status == OrderStatus.CANCELLED.value]
    refunded = [o for o in orders if o.status == OrderStatus.REFUNDED.value]
    reserved = [o for o in orders if o.status == OrderStatus.RESERVED.value]

    gross = sum(float(o.total_amount or 0) for o in paid)
    pos_orders = [o for o in paid if (o.reference or "").startswith("POS-")]
    web_orders = [o for o in paid if not (o.reference or "").startswith("POS-")]
    pos_gross = sum(float(o.total_amount or 0) for o in pos_orders)
    web_gross = sum(float(o.total_amount or 0) for o in web_orders)

    ticket_count = await db.scalar(select(func.count(Ticket.id)))
    used_count = await db.scalar(select(func.count(Ticket.id)).where(Ticket.is_used == True))

    return {
        "period": period,
        "orders_total": len(orders),
        "orders_paid": len(paid),
        "orders_reserved": len(reserved),
        "orders_cancelled": len(cancelled),
        "orders_refunded": len(refunded),
        "gross_revenue": round(gross, 2),
        "pos_revenue": round(pos_gross, 2),
        "web_revenue": round(web_gross, 2),
        "mobile_revenue": 0,
        "tickets_issued": ticket_count or 0,
        "tickets_used": used_count or 0,
        "note": "Real aggregates from PostgreSQL. No estimated payouts.",
    }


@admin_router.get("/by-event")
async def admin_by_event(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Event.id, Event.title, func.count(Order.id), func.coalesce(func.sum(Order.total_amount), 0))
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(TicketType, TicketType.id == OrderItem.ticket_type_id)
        .join(Event, Event.id == TicketType.event_id)
        .where(Order.status == OrderStatus.PAID.value)
        .group_by(Event.id, Event.title)
        .order_by(func.sum(Order.total_amount).desc())
        .limit(20)
    )
    return [{"event_id": r[0], "title": r[1], "orders": r[2], "revenue": float(r[3])} for r in result.all()]


@admin_router.get("/by-organizer")
async def admin_by_organizer(user: User = Depends(require_role(*ADMIN_ROLES)), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Organization.id, Organization.name, func.count(Order.id), func.coalesce(func.sum(Order.total_amount), 0))
        .join(Event, Event.organization_id == Organization.id)
        .join(TicketType, TicketType.event_id == Event.id)
        .join(OrderItem, OrderItem.ticket_type_id == TicketType.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status == OrderStatus.PAID.value)
        .group_by(Organization.id, Organization.name)
        .order_by(func.sum(Order.total_amount).desc())
        .limit(20)
    )
    return [{"organization_id": r[0], "name": r[1], "orders": r[2], "revenue": float(r[3])} for r in result.all()]


@router.get("/organizer/{organization_id}")
async def organizer_overview(
    organization_id: int,
    period: str = Query("this_month"),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        member = await get_org_member(organization_id, user, db)
        if member and not (has_cap(member.role, "view_sales") or has_cap(member.role, "view_finance")):
            raise HTTPException(403, "Missing sales or finance capability")
    event_ids = await _org_event_ids(db, organization_id)
    # If user has event-level permissions, restrict to those events
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        from app.models.permissions import EventPermission
        eps = (await db.execute(select(EventPermission).where(
            EventPermission.user_id == user.id,
            EventPermission.organization_id == organization_id,
        ))).scalars().all()
        if eps:
            allowed = {ep.event_id for ep in eps if ep.can_view_sales or ep.can_view_finance}
            event_ids = [eid for eid in event_ids if eid in allowed]
    if not event_ids:
        return {"revenue": 0, "orders": 0, "tickets": 0, "pos_revenue": 0, "web_revenue": 0}

    start, end = _period_bounds(period, date_from, date_to)
    q = (
        select(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(TicketType, TicketType.id == OrderItem.ticket_type_id)
        .where(TicketType.event_id.in_(event_ids), Order.status == OrderStatus.PAID.value)
    )
    if start:
        q = q.where(Order.created_at >= start)
    if end:
        q = q.where(Order.created_at < end)
    orders = (await db.execute(q)).scalars().unique().all()

    gross = sum(float(o.total_amount or 0) for o in orders)
    pos = sum(float(o.total_amount or 0) for o in orders if (o.reference or "").startswith("POS-"))
    web = gross - pos

    ticket_q = select(func.count(Ticket.id)).join(TicketType, TicketType.id == Ticket.ticket_type_id).where(TicketType.event_id.in_(event_ids))
    tickets = await db.scalar(ticket_q) or 0
    used = await db.scalar(ticket_q.where(Ticket.is_used == True)) or 0

    return {
        "organization_id": organization_id,
        "period": period,
        "revenue": round(gross, 2),
        "pos_revenue": round(pos, 2),
        "web_revenue": round(web, 2),
        "orders": len(orders),
        "tickets": tickets,
        "tickets_used": used,
    }


@router.get("/organizer/{organization_id}/export.csv")
async def organizer_export_csv(
    organization_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        member = await get_org_member(organization_id, user, db)
        if member and not (has_cap(member.role, "view_sales") or has_cap(member.role, "view_finance")):
            raise HTTPException(403, "Missing sales or finance capability")
    data = await organizer_overview(organization_id, "this_year", None, None, user, db)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["metric", "value"])
    for k, v in data.items():
        w.writerow([k, v])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=analytics.csv"})
