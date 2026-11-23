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
