"""Apple Wallet and Google Wallet integration.

BLOCKED until real certificates/credentials are configured.
Do not invent certificates. Returns 503 with clear status when unconfigured.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
from app.models.order import Order, OrderItem
import os
import json
import hashlib
import zipfile
import io
from datetime import datetime

router = APIRouter(prefix="/wallets", tags=["wallets"])

def _apple_configured() -> bool:
    return bool(os.getenv("APPLE_PASS_CERT") and os.getenv("APPLE_PASS_KEY") and os.getenv("APPLE_TEAM_ID") and os.getenv("APPLE_PASS_TYPE_ID"))

def _google_configured() -> bool:
    return bool(os.getenv("GOOGLE_WALLET_ISSUER_ID") and os.getenv("GOOGLE_WALLET_SERVICE_ACCOUNT") and os.getenv("GOOGLE_WALLET_CLASS_ID"))

async def _owned_ticket(ticket_id: int, user: User, db: AsyncSession) -> tuple:
    t = await db.get(Ticket, ticket_id)
    if not t:
        raise HTTPException(404, "Ticket not found")
    item = await db.get(OrderItem, t.order_item_id) if t.order_item_id else None
    if not item:
        raise HTTPException(403, "Not owner")
    order = await db.get(Order, item.order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(403, "Not owner")
    if order.status == "refunded":
        raise HTTPException(400, "Refunded ticket cannot be added to wallet")
    if t.status not in ("valid", "issued"):
        raise HTTPException(400, f"Ticket status {t.status} cannot be added to wallet")
    tt = await db.get(TicketType, item.ticket_type_id)
    event = await db.get(Event, tt.event_id) if tt else None
    return t, order, tt, event

def _build_pass_json(ticket, order, tt, event, user) -> dict:
    return {
        "formatVersion": 1,
        "passTypeIdentifier": os.getenv("APPLE_PASS_TYPE_ID", "pass.org.balkanevents.ticket"),
        "serialNumber": ticket.ticket_code,
        "teamIdentifier": os.getenv("APPLE_TEAM_ID", ""),
        "organizationName": "BALKAN EVENTS",
        "description": event.title if event else "Ticket",
        "logoText": "BALKAN EVENTS",
        "foregroundColor": "rgb(255,255,255)",
        "backgroundColor": "rgb(109,61,245)",
        "barcode": {
            "message": ticket.qr_data or ticket.ticket_code,
            "format": "PKBarcodeFormatQR",
            "messageEncoding": "iso-8859-1"
        },
        "eventTicket": {
            "primaryFields": [{"key": "event", "label": "DOGAĐAJ", "value": event.title if event else ""}],
            "secondaryFields": [
                {"key": "date", "label": "DATUM", "value": event.start_at.strftime("%d.%m.%Y %H:%M") if event and event.start_at else ""},
                {"key": "type", "label": "KATEGORIJA", "value": tt.name if tt else ""}
            ],
            "auxiliaryFields": [
                {"key": "holder", "label": "KUPAC", "value": user.full_name or user.email},
                {"key": "ref", "label": "REFERENCA", "value": order.reference}
            ]
        }
    }

@router.get("/status")
async def wallet_status():
    return {
        "apple": {"configured": _apple_configured(), "status": "BLOCKED" if not _apple_configured() else "READY"},
        "google": {"configured": _google_configured(), "status": "BLOCKED" if not _google_configured() else "READY"},
    }

@router.get("/apple/{ticket_id}.pkpass")
async def apple_pass(ticket_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not _apple_configured():
        raise HTTPException(503, "Apple Wallet BLOCKED: certificates not configured")
    ticket, order, tt, event = await _owned_ticket(ticket_id, user, db)
    # PassKit signing requires real certificate – structure is ready
    raise HTTPException(501, "PassKit signing requires real certificate. Structure ready. BLOCKED.")

@router.get("/google/{ticket_id}/save-url")
async def google_save_url(ticket_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not _google_configured():
        raise HTTPException(503, "Google Wallet BLOCKED: credentials not configured")
    ticket, order, tt, event = await _owned_ticket(ticket_id, user, db)
    # JWT signing requires real service account – structure is ready
    raise HTTPException(501, "Google Wallet JWT signing requires real service account. Structure ready. BLOCKED.")
