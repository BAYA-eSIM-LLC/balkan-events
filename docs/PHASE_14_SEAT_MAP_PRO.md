# Phase 14 – Seat Map PRO

**Branch:** super-admin-dashboard  
**Commit:** e73768c  
**Date:** 2026-11-23

## CI Result (PostgreSQL 16)

- **Run:** [45138866190](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45138866190)
- **Tests:** **80 passed, 0 failed, 0 skipped**
- Migrations 001–017: passed
- Schema verify: passed

## What was implemented

### Models
- `SeatMap` (event + organization)
- `Sector` (STANDARD/VIP/TRIBUNE/STANDING/SPECIAL, numbered or unnumbered, base price, capacity)
- `SeatRow`
- `Seat` (number, status FREE/RESERVED/SOLD, price_override, optional x/y)
- `SeatReservation` (ACTIVE/CONFIRMED/EXPIRED/RELEASED, expires_at, idempotency_key)
- Optional `Ticket.seat_id` (does not break existing tickets)

### Migration
- `017_seat_map` (revises `016_scanner`)

### API
- `POST /seat-maps` — create map (org isolation)
- `GET /seat-maps/event/{event_id}` — public map with statuses and prices
- `GET /seat-maps/{id}` — organizer/admin view
- `POST /seat-maps/{id}/sectors`
- `POST /seat-maps/sectors/{id}/rows` — creates numbered seats
- `POST /seat-maps/reserve` — `SELECT FOR UPDATE`, 409 on conflict, idempotency
- `POST /seat-maps/reservations/{id}/release`
- `POST /seat-maps/internal/expire-seat-reservations`
- `GET /admin/seat-maps` and `GET /admin/seat-maps/{id}`

### Frontend
- `/organizer/seat-maps` — builder (create map, add sector)
- `/admin/seat-maps` — list
- `/events/[slug]/seats` — public interactive selector

### Tests
- Create map + reserve
- Double reserve same seat → 409
- Organization isolation (403)

## Not finished (honest)

- Full visual drag-and-drop builder
- Unnumbered sector quantity reservation UI
- Checkout integration that converts seat reservation into Order/Ticket (core order flow still ticket-type based)
- Auto-expire job wired into scheduler
- Live screenshots (requires running stack)
- Mobile-optimized seat map polish

## Constraints respected

Only `super-admin-dashboard`. No main merge, no deploy, no production DB, no Stripe.

**Status:** Core Seat Map PRO backend and basic UI are in place and tested. Waiting for approval before Phase 15.
