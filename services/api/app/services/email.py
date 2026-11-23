"""Email service for payment notifications.
Records emails in EmailLog. Real SMTP can be wired later via env.
Prevents double-send via idempotency_key.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.email_log import EmailLog
from datetime import datetime

async def queue_email(
    db: AsyncSession,
    to_email: str,
    subject: str,
    body: str,
    template: str,
    reference_type: str,
    reference_id: int,
    idempotency_key: str,
) -> EmailLog | None:
    existing = await db.execute(select(EmailLog).where(EmailLog.idempotency_key == idempotency_key))
    if existing.scalar_one_or_none():
        return None  # already queued
    log = EmailLog(
        to_email=to_email,
        subject=subject,
        body=body,
        template=template,
        reference_type=reference_type,
        reference_id=reference_id,
        idempotency_key=idempotency_key,
        sent=False,
    )
    db.add(log)
    await db.commit()
    return log

def payment_success_body(reference: str, tickets: list[str]) -> str:
    lines = [f"Narudžba {reference} je uspješno plaćena.", "", "Vaše ulaznice:"]
    for t in tickets:
        lines.append(f"- {t}")
    lines.append("")
    lines.append("QR kodovi su dostupni u sekciji Moje ulaznice.")
    return "\n".join(lines)

def payment_failed_body(reference: str) -> str:
    return f"Plaćanje za narudžbu {reference} nije uspjelo. Možete pokušati ponovo."

def refund_body(reference: str, amount: float) -> str:
    return f"Refundacija od {amount:.2f} EUR za narudžbu {reference} je obrađena."
