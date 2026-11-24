from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
from app.models.user import User, UserRole
from app.models.organization import OrganizationMember
from app.models.scanner import ScanLog
from app.deps import get_current_user, require_role
from app.services.permissions import check_event_cap
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_optional_bearer = HTTPBearer(auto_error=False)


async def _optional_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer), db: AsyncSession = Depends(get_db)) -> Optional[User]:
    if not creds:
        return None
    from app.security import decode_token
    payload = decode_token(creds.credentials)
    if not payload or "sub" not in payload:
        return None
    user = await db.get(User, int(payload["sub"]))
    return user if user and user.is_active else None
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

async def _resolve_scanner(request_user: Optional[User], device_token: Optional[str], db: AsyncSession):
    """Accept either a user session or a device token. Device token must be active."""
    if device_token:
        th = _hash(device_token)
        tok = (await db.execute(select(ScannerDeviceToken).where(ScannerDeviceToken.token_hash == th))).scalar_one_or_none()
        if not tok or tok.revoked_at:
            raise HTTPException(401, "Invalid or revoked device token")
        dev = await db.get(ScannerDevice, tok.device_id)
        if not dev or not dev.is_active:
            raise HTTPException(401, "Device inactive")
        tok.last_used_at = datetime.utcnow()
        await db.commit()
        return None, dev
    if request_user:
        return request_user, None
    raise HTTPException(401, "Authentication required")


@router.post("/validate")
async def validate_scan(
    data: ScanRequest,
    user: Optional[User] = Depends(_optional_user),
    device_token: Optional[str] = Header(None, alias="X-Device-Token"),
    db: AsyncSession = Depends(get_db),
):
    scanner_user, device = await _resolve_scanner(user, device_token, db)
    if scanner_user:
        await check_event_cap(db, data.event_id, scanner_user, "scan")
    elif device:
        # Device must belong to the event's organization
        event = await db.get(Event, data.event_id)
        if not event or event.organization_id != device.organization_id:
            raise HTTPException(403, "Device not authorized for this event")
        if device.entry_point_id and data.entry_point_id and device.entry_point_id != data.entry_point_id:
            raise HTTPException(403, "Device not assigned to this entry point")
    actor_id = scanner_user.id if scanner_user else None
    result = await db.execute(select(Ticket).where(Ticket.qr_data == data.qr_data).with_for_update())
    ticket = result.scalar_one_or_none()
    if not ticket:
        await _write_log(db, None, data.event_id, data.entry_point_id, actor_id, "INVALID", "not_found")
        return {"status": "INVALID", "reason": "not_found"}

    tt = await db.get(TicketType, ticket.ticket_type_id)
    if not tt or tt.event_id != data.event_id:
        await _write_log(db, ticket.id, data.event_id, data.entry_point_id, actor_id, "WRONG_EVENT")
        return {"status": "WRONG_EVENT"}

    # Check if order is refunded
    if ticket.order_item_id:
        from app.models.order import OrderItem, Order, OrderStatus
        oi = await db.get(OrderItem, ticket.order_item_id)
        if oi:
            order = await db.get(Order, oi.order_id)
            if order and order.status in (OrderStatus.REFUNDED.value, "partially_refunded"):
                # For partial, still allow scan unless fully refunded
                if order.status == OrderStatus.REFUNDED.value:
                    await _write_log(db, ticket.id, data.event_id, data.entry_point_id, actor_id, "REFUNDED", "order_refunded")
                    return {"status": "REFUNDED", "reason": "order_refunded"}

    if ticket.is_used:
        await _write_log(db, ticket.id, data.event_id, data.entry_point_id, actor_id, "ALREADY_USED")
        return {"status": "ALREADY_USED", "used_at": ticket.used_at.isoformat() if ticket.used_at else None}

    ticket.is_used = True
    ticket.used_at = datetime.utcnow()
    ticket.used_by = str(actor_id)
    await db.commit()
    await _write_log(db, ticket.id, data.event_id, data.entry_point_id, actor_id, "VALID")
    if scanner_user:
        await log_audit(db, scanner_user.id, "scanner.validate", "Ticket", ticket.id, {"event_id": data.event_id})
    return {"status": "VALID", "ticket_id": ticket.id}

@router.get("/logs")
async def list_scan_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    event_id: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """SUPERADMIN/ADMIN see all. Others see only events of organizations they belong to."""
    page, page_size = paginate(page, page_size)
    q = select(ScanLog)

    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        # Proper membership-based isolation
        member_orgs = select(OrganizationMember.organization_id).where(
            OrganizationMember.user_id == user.id
        )
        owned_events = select(Event.id).where(Event.organization_id.in_(member_orgs))
        q = q.where(ScanLog.event_id.in_(owned_events))

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


import secrets, hashlib
from app.models.scanner import EntryPoint, ScannerDevice, ScannerDeviceToken
from app.deps import get_org_member
from app.routers.admin_system import log_audit


def _hash(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()


class DeviceCreate(BaseModel):
    name: str
    organization_id: int
    entry_point_id: Optional[int] = None


class EntryPointCreate(BaseModel):
    event_id: int
    name: str


@router.post("/entry-points")
async def create_entry_point(data: EntryPointCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await check_event_cap(db, data.event_id, user, "manage_events")
    ep = EntryPoint(event_id=data.event_id, name=data.name)
    db.add(ep)
    await db.commit()
    await db.refresh(ep)
    await log_audit(db, user.id, "entry_point.created", "EntryPoint", ep.id)
    return {"id": ep.id, "name": ep.name}


@router.get("/entry-points")
async def list_entry_points(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await check_event_cap(db, event_id, user, "scan")
    result = await db.execute(select(EntryPoint).where(EntryPoint.event_id == event_id, EntryPoint.is_active == True))
    return [{"id": e.id, "name": e.name} for e in result.scalars()]


@router.post("/devices")
async def register_device(data: DeviceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(data.organization_id, user, db)
    token = secrets.token_urlsafe(32)
    dev = ScannerDevice(name=data.name, organization_id=data.organization_id, entry_point_id=data.entry_point_id, is_active=True)
    db.add(dev)
    await db.flush()
    db.add(ScannerDeviceToken(device_id=dev.id, token_hash=_hash(token)))
    await db.commit()
    await log_audit(db, user.id, "scanner.device.registered", "ScannerDevice", dev.id)
    return {"id": dev.id, "token": token}


@router.post("/devices/{device_id}/revoke")
async def revoke_device(device_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dev = await db.get(ScannerDevice, device_id)
    if not dev:
        raise HTTPException(404)
    if user.role not in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        await get_org_member(dev.organization_id, user, db)
    dev.is_active = False
    tokens = (await db.execute(select(ScannerDeviceToken).where(ScannerDeviceToken.device_id == device_id))).scalars().all()
    for t in tokens:
        t.revoked_at = datetime.utcnow()
    await db.commit()
    await log_audit(db, user.id, "scanner.device.revoked", "ScannerDevice", device_id)
    return {"status": "revoked"}


@router.get("/attendance")
async def attendance(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await check_event_cap(db, event_id, user, "scan")
    valid = await db.scalar(select(func.count(ScanLog.id)).where(ScanLog.event_id == event_id, ScanLog.result == "VALID"))
    already = await db.scalar(select(func.count(ScanLog.id)).where(ScanLog.event_id == event_id, ScanLog.result == "ALREADY_USED"))
    invalid = await db.scalar(select(func.count(ScanLog.id)).where(ScanLog.event_id == event_id, ScanLog.result == "INVALID"))
    by_point = await db.execute(
        select(ScanLog.entry_point_id, func.count(ScanLog.id)).where(ScanLog.event_id == event_id, ScanLog.result == "VALID").group_by(ScanLog.entry_point_id)
    )
    return {
        "event_id": event_id,
        "scanned": valid or 0,
        "already_used": already or 0,
        "invalid": invalid or 0,
        "by_entry_point": [{"entry_point_id": r[0], "count": r[1]} for r in by_point.all()],
    }


@router.get("/export.csv")
async def export_scans(event_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await check_event_cap(db, event_id, user, "scan")
    from fastapi.responses import StreamingResponse
    import io
    result = await db.execute(select(ScanLog).where(ScanLog.event_id == event_id).order_by(ScanLog.scanned_at))
    buf = io.StringIO()
    buf.write("id,ticket_id,entry_point_id,result,reason,scanned_at\n")
    for l in result.scalars():
        buf.write(f"{l.id},{l.ticket_id or ''},{l.entry_point_id or ''},{l.result},{l.reason or ''},{l.scanned_at}\n")
    buf.seek(0)
    return StreamingResponse(buf, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=scans-{event_id}.csv"})


class OfflineScan(BaseModel):
    qr_data: str
    event_id: int
    entry_point_id: Optional[int] = None


@router.post("/offline/sync")
async def offline_sync(scans: list[OfflineScan], user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Accept offline scans for later reconciliation.
    Limitation: without a central connection, concurrent double-entry across
    devices cannot be prevented. Offline validation is not a guaranteed check.
    """
    accepted = 0
    conflicts = 0
    for s in scans:
        event_id = s.event_id
        qr = s.qr_data
        if not event_id or not qr:
            continue
        await check_event_cap(db, event_id, user, "scan")
        existing = (await db.execute(select(Ticket).where(Ticket.qr_data == qr))).scalar_one_or_none()
        if not existing:
            await _write_log(db, None, event_id, s.entry_point_id, user.id, "INVALID", "offline_not_found")
            continue
        if existing.is_used:
            await _write_log(db, existing.id, event_id, s.entry_point_id, user.id, "ALREADY_USED", "offline_conflict")
            conflicts += 1
            continue
        existing.is_used = True
        existing.used_at = datetime.utcnow()
        await _write_log(db, existing.id, event_id, s.entry_point_id, user.id, "VALID", "offline_sync")
        accepted += 1
    return {
        "accepted": accepted,
        "conflicts": conflicts,
        "limitation": "Offline mode cannot guarantee prevention of concurrent double entry across devices.",
    }
