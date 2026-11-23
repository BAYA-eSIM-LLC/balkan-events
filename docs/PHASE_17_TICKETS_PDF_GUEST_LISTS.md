# Phase 17 – Tickets, PDF & Guest Lists PRO

**Branch:** super-admin-dashboard  
**Commit:** f46bc0c  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45141394644](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45141394644)
- **Tests:** **88 passed, 0 failed, 0 skipped**
- Migrations 001–019: passed

## Implemented

### PDF Tickets
- `GET /tickets/{id}/pdf` — premium PDF with BALKAN EVENTS header, QR code, ticket code, order reference, event title, venue, date, organizer, seat label when present, category
- Only for paid orders; owner, admin, or org member
- QR data comes from existing `Ticket.qr_data`

### Ticket email
- `POST /tickets/{id}/email?to_email=` — queues via existing `queue_email` (idempotent)
- Returns `smtp_configured` and does not claim sent when SMTP is not set

### Guest Lists
- `POST /guest-lists` — create for event (org isolation)
- `GET /guest-lists/event/{event_id}`
- `POST /guest-lists/{id}/guests` — manual add
- `GET /guest-lists/{id}/guests?q=` — search
- `POST /guest-lists/{id}/guests/import` — CSV upload
- `GET /guest-lists/{id}/export.csv`
- `GET /guest-lists/{id}/export.pdf`
- `POST /guest-lists/guests/{id}/check-in`
- `GET /admin/guest-lists` — super admin view

### Models / Migration
- `GuestList`, `Guest`
- `019_guest_lists`

### Frontend
- `/organizer/guest-lists`

### Tests
- PDF generation returns valid PDF
- Guest list CRUD, search, CSV and PDF export
- Org isolation (403 for non-member)

## Not finished

- Group multi-ticket PDF in one request (single ticket PDF works; multi can be extended)
- Print dialog integration in POS UI
- Automatic PDF attachment in email (email body contains QR text; attachment not yet)
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect
- Phase 15 leftover: full POS print flow UI

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 18.
