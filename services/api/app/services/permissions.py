"""Permission matrix and helpers.
Roles map to capability sets. Backend enforces every check.
"""
from app.models.organization import OrgRole

# Capability sets per role
ROLE_CAPS = {
    OrgRole.OWNER.value: {"manage_org", "manage_team", "manage_events", "view_sales", "view_finance", "export_finance", "manage_tickets", "scan", "pos", "view"},
    OrgRole.ADMIN.value: {"manage_org", "manage_team", "manage_events", "view_sales", "view_finance", "export_finance", "manage_tickets", "scan", "pos", "view"},
    OrgRole.EVENT_MANAGER.value: {"manage_events", "view_sales", "manage_tickets", "scan", "view"},
    OrgRole.FINANCE_MANAGER.value: {"view_sales", "view_finance", "export_finance", "view"},
    OrgRole.FINANCE_VIEWER.value: {"view_sales", "view_finance", "view"},
    OrgRole.TICKET_MANAGER.value: {"manage_tickets", "view_sales", "view"},
    OrgRole.SCANNER.value: {"scan", "view"},
    OrgRole.POS_SELLER.value: {"pos", "view"},
    OrgRole.SALES_MANAGER.value: {"view_sales", "pos", "view"},
    OrgRole.STAFF.value: {"view"},
    OrgRole.VIEWER.value: {"view"},
}


def has_cap(role: str, cap: str) -> bool:
    return cap in ROLE_CAPS.get(role, set())


async def check_event_cap(db, event_id: int, user, cap: str):
    """Enforce capability for an event.
    Superadmin/admin bypass. Org role grants unless an EventPermission row
    exists and explicitly denies the matching flag.
    """
    from fastapi import HTTPException
    from sqlalchemy import select
    from app.models.event import Event
    from app.models.organization import OrganizationMember
    from app.models.permissions import EventPermission
    from app.models.user import UserRole

    if user.role in (UserRole.ADMIN.value, UserRole.SUPERADMIN.value):
        return True

    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(404, "Event not found")

    member = (await db.execute(select(OrganizationMember).where(
        OrganizationMember.organization_id == event.organization_id,
        OrganizationMember.user_id == user.id,
    ))).scalar_one_or_none()
    if not member:
        raise HTTPException(403, "Not a member of this organization")

    ep = (await db.execute(select(EventPermission).where(
        EventPermission.event_id == event_id,
        EventPermission.user_id == user.id,
    ))).scalar_one_or_none()

    flag = {
        "manage_events": "can_manage",
        "view_sales": "can_view_sales",
        "view_finance": "can_view_finance",
        "manage_tickets": "can_manage_tickets",
        "scan": "can_scan",
        "pos": "can_pos",
    }.get(cap)

    if ep and flag:
        if getattr(ep, flag):
            return True
        raise HTTPException(403, f"Event-level deny for {cap}")

    if has_cap(member.role, cap):
        return True
    raise HTTPException(403, f"Missing capability {cap} for event {event_id}")
