"""Email service for payment notifications.
Records emails in EmailLog. Real SMTP can be wired later via env.
Prevents double-send via idempotency_key.
Never sends real customer emails unless SMTP is explicitly configured.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.email_log import EmailLog
from app.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
from datetime import datetime
import smtplib
from email.message import EmailMessage
import logging

logger = logging.getLogger(__name__)

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

    # Optional real send – only if SMTP is configured. Never in CI by default.
    if SMTP_HOST and SMTP_USER:
        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = SMTP_FROM
            msg["To"] = to_email
            msg.set_content(body)
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
            log.sent = True
            await db.commit()
        except Exception as e:
            logger.warning("SMTP send failed (queued only): %s", e)

    return log

def payment_success_body(reference: str, tickets: list[str], amount: float = 0, currency: str = "EUR", event_name: str = "", event_date: str = "") -> str:
    lines = [
        f"Narudžba {reference} je uspješno plaćena.",
        "",
        f"Iznos: {amount:.2f} {currency}",
    ]
    if event_name:
        lines.append(f"Događaj: {event_name}")
    if event_date:
        lines.append(f"Datum: {event_date}")
    lines.append("")
    lines.append("Vaše ulaznice:")
    for t in tickets:
        lines.append(f"- {t}")
        lines.append(f"  Link: https://balkanevents.org/ticket/{t}")
    lines.append("")
    lines.append("QR kod možete prikazati otvaranjem linka ili u sekciji Moje ulaznice.")
    lines.append("")
    lines.append("---")
    lines.append("BALKAN EVENTS")
    lines.append("https://balkanevents.org")
    return "\n".join(lines)

def payment_failed_body(reference: str) -> str:
    return f"Plaćanje za narudžbu {reference} nije uspjelo. Možete pokušati ponovo."

def refund_body(reference: str, amount: float) -> str:
    return f"Refundacija od {amount:.2f} EUR za narudžbu {reference} je obrađena."
