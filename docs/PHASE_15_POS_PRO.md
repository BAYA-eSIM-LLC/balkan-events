# Phase 15 – POS PRO

**Branch:** super-admin-dashboard  
**Commit:** 81878bd  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45140184693](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45140184693)
- **Tests:** **83 passed, 0 failed, 0 skipped**
- Migrations 001–018: passed

## Implemented

### Models
- `SalesPoint` (organization, name, address, contact, active)
- `SalesPointStaff` (SELLER / MANAGER / ADMIN)
- `CashRegister` (opening balance, close, expected, variance)
- `CashTransaction` (SALE / REFUND / ADJUSTMENT, idempotency_key)

### Migration
- `018_pos`

### API
- `POST /pos/sales-points` — create (auto-assigns creator as ADMIN)
- `GET /pos/sales-points?organization_id=`
- `POST /pos/sales-points/{id}/staff`
- `POST /pos/registers/open`
- `POST /pos/registers/{id}/close` — computes variance
- `POST /pos/sale` — cash sale, locks seats or inventory, issues tickets, records transaction
- `POST /pos/sale/{order_id}/void` — compensating REFUND, releases seats, does not delete original
- `GET /admin/pos/sales-points`
- `GET /admin/pos/registers`

### Frontend
- `/organizer/pos` — create point, open register
- `/admin/pos` — overview

### Tests
- Create point, open/close register, variance 0
- Org isolation (403)

## Not finished

- Full drag-and-drop seat map editor (Phase 14 leftover)
- Auto redirect to checkout after seat selection (Phase 14 leftover)
- PDF ticket generation
- Email send of ticket from POS
- Live screenshots
- Concurrent POS vs online last-seat stress test beyond existing seat locking

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe, no card payments.

Waiting for approval before Phase 16.
