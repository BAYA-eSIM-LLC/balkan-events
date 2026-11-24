"""Apple Wallet and Google Wallet integration.

BLOCKED until real certificates/credentials are configured.
Do not invent certificates. Returns 503 with clear status when unconfigured.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.ticket import Ticket, TicketType
from app.models.event import Event
from app.models.order import Order, OrderItem
import os

router = APIRouter(prefix="/wallets", tags=["wallets"])

def _apple_configured() -> bool:
    return bool(os.getenv("APPLE_PASS_CERT") and os.getenv("APPLE_PASS_KEY") and os.getenv("APPLE_TEAM_ID"))

def _google_configured() -> bool:
    return bool(os.getenv("GOOGLE_WALLET_ISSUER_ID") and os.getenv("GOOGLE_WALLET_SERVICE_ACCOUNT"))

async def _owned_ticket(ticket_id: int, user: User, db: AsyncSession) -> Ticket:
    t = await db.get(Ticket, ticket_id)
    if not t:
        raise HTTPException(404, "Ticket not found")
    # Ownership via order
    item = await db.get(OrderItem, t.order_item_id) if t.order_item_id else None
    if not item:
        raise HTTPException(403, "Not owner")
    order = await db.get(Order, item.order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(403, "Not owner")
    if order.status == "refunded":
        raise HTTPException(400, "Refunded ticket cannot be added to wallet")
    return t

@router.get("/status")
async def wallet_status():
    return {
        "apple": {"configured": _apple_configured(), "status": "BLOCKED" if not _apple_configured() else "READY"},
        "google": {"configured": _google_configured(), "status": "BLOCKED" if not _google_configured() else "READY"},
    }

@router.get("/apple/{ticket_id}.pkpass")
async def apple_pass(ticket_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not _apple_configured():
        raise HTTPException(503, "Apple Wallet BLOCKED: certificates not configured (APPLE_PASS_CERT, APPLE_PASS_KEY, APPLE_TEAM_ID)")
    ticket = await _owned_ticket(ticket_id, user, db)
    # Real PassKit generation would go here with certificates
    raise HTTPException(501, "PassKit generation requires signed certificate. BLOCKED.")

@router.get("/google/{ticket_id}/save-url")
async def google_save_url(ticket_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not _google_configured():
        raise HTTPException(503, "Google Wallet BLOCKED: credentials not configured (GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT)")
    ticket = await _owned_ticket(ticket_id, user, db)
    raise HTTPException(501, "Google Wallet JWT signing requires service account. BLOCKED.")
