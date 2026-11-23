# Phase 14.1 – Seat Map PRO Completion

**Branch:** super-admin-dashboard  
**Commit:** 9482bf0  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45139458512](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45139458512)
- **Tests:** **81 passed, 0 failed, 0 skipped**
- Migrations 001–017: passed

## Checkout integration

- `POST /seat-maps/checkout` creates an Order from active seat reservations.
- Links `SeatReservation.order_id`.
- On `POST /orders/{id}/confirm`:
  - Issues tickets via existing Ticketing Core.
  - Assigns `Ticket.seat_id` from linked reservations.
  - Marks seats `SOLD`.
  - Uses `SELECT FOR UPDATE`; rejects if seat already sold.
- On cancel and expire: seats return to `FREE`, reservations become `RELEASED`/`EXPIRED`.

## Automatic expiry

- `POST /seat-maps/internal/expire-seat-reservations` protected by `X-Internal-Job`.
- Uses `FOR UPDATE SKIP LOCKED`.
- Scheduler (`app/scheduler.py`) calls both order and seat expiry endpoints.

## Builder

- Organizer builder supports creating map, adding Standard/VIP/Tribune sectors, adding rows, preview toggle.
- Public seat selector remains at `/events/[slug]/seats`.

## Tests added

- Seat reserve → checkout → confirm path (links ticket when internal secret matches).
- Existing double-reserve and org isolation tests still pass.

## Not finished

- Full drag-and-drop visual editor with collision detection.
- Automatic frontend checkout redirect after seat selection.
- Live screenshots (requires running stack).
- Scheduler process not started in CI (endpoint tested via protection and logic).

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 15 – POS PRO.
