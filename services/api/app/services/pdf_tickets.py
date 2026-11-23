"""PDF ticket and guest list generation.
Uses reportlab. QR codes embedded when qrcode is available.
"""
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white
from datetime import datetime


def _draw_qr(c, data: str, x, y, size=40 * mm):
    try:
        import qrcode
        qr = qrcode.QRCode(box_size=4, border=1)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        from reportlab.lib.utils import ImageReader
        c.drawImage(ImageReader(buf), x, y, size, size)
    except Exception:
        c.setFont("Helvetica", 8)
        c.drawString(x, y + 10, "QR unavailable")


def generate_ticket_pdf(tickets: list, event_title: str, event_start, venue_name: str, organizer_name: str, buyer_name: str = "") -> bytes:
    """Generate a multi-ticket PDF. Each ticket gets a page section."""
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    gold = HexColor("#C9A227")
    dark = HexColor("#1a1a1a")

    for i, t in enumerate(tickets):
        if i > 0:
            c.showPage()
        # Header bar
        c.setFillColor(dark)
        c.rect(0, height - 40 * mm, width, 40 * mm, fill=1, stroke=0)
        c.setFillColor(gold)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(15 * mm, height - 18 * mm, "BALKAN EVENTS")
        c.setFillColor(white)
        c.setFont("Helvetica", 10)
        c.drawString(15 * mm, height - 28 * mm, "Official Ticket")

        # Event info
        c.setFillColor(black)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(15 * mm, height - 55 * mm, event_title[:60])
        c.setFont("Helvetica", 11)
        start_str = event_start.strftime("%Y-%m-%d %H:%M") if event_start else ""
        c.drawString(15 * mm, height - 65 * mm, f"{venue_name or ''}  {start_str}")
        c.drawString(15 * mm, height - 75 * mm, f"Organizer: {organizer_name or ''}")
        if buyer_name:
            c.drawString(15 * mm, height - 85 * mm, f"Holder: {buyer_name}")

        # Ticket details
        c.setFont("Helvetica-Bold", 12)
        c.drawString(15 * mm, height - 105 * mm, f"Ticket: {t.get('code', '')}")
        c.setFont("Helvetica", 10)
        c.drawString(15 * mm, height - 115 * mm, f"Order: {t.get('reference', '')}")
        if t.get('seat_label'):
            c.drawString(15 * mm, height - 125 * mm, f"Seat: {t['seat_label']}")
        if t.get('category'):
            c.drawString(15 * mm, height - 135 * mm, f"Category: {t['category']}")

        # QR
        _draw_qr(c, t.get('qr_data') or t.get('code', ''), width - 60 * mm, height - 140 * mm, 45 * mm)

        # Footer
        c.setFillColor(HexColor("#666666"))
        c.setFont("Helvetica", 8)
        c.drawString(15 * mm, 15 * mm, "This ticket is valid only with matching QR scan. Non-transferable without organizer approval.")

    c.save()
    return buf.getvalue()


def generate_guest_list_pdf(guests: list, event_title: str, list_name: str) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica-Bold", 16)
    c.drawString(15 * mm, height - 20 * mm, f"Guest List: {list_name}")
    c.setFont("Helvetica", 11)
    c.drawString(15 * mm, height - 30 * mm, event_title)
    y = height - 45 * mm
    c.setFont("Helvetica", 9)
    for g in guests:
        if y < 20 * mm:
            c.showPage()
            y = height - 20 * mm
        status = "IN" if g.get("checked_in") else "—"
        line = f"{g.get('last_name', '')}, {g.get('first_name', '')}  {g.get('email', '')}  [{status}]"
        c.drawString(15 * mm, y, line[:90])
        y -= 6 * mm
    c.save()
    return buf.getvalue()
