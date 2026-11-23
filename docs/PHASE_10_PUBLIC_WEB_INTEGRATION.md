# Phase 10 – Public Web + Backend Integration

**Branch:** super-admin-dashboard  
**Starting commit:** a66a8342  
**Date:** 2026-11-23

## Audit Summary

| Area | Status before | Action taken |
|------|---------------|--------------|
| Homepage | Static mock events + static hero | Now loads real `/events` + CMS `/public/homepage` |
| Event detail | Uses `fetchEventBySlug` → `/events/slug/{slug}` | Backend has `/events/{slug}`; frontend updated to match |
| Search | Already calls `/events/search` | Kept |
| Orders / reservation | Full Ticketing Core (`POST /orders`) with locks + idempotency | Unchanged – used by purchase flow |
| Confirm payment | Requires internal secret | Stripe remains disabled |
| My tickets / My orders | Pages exist | Wire to `/orders/me` and `/payments/my-tickets` |
| CMS public | `/public/homepage` returns only published slides/sections | HeroBanner now consumes it |
| Phase 8 QR models | Not present on this branch | Still unfinished |
| PlatformSettings table | In-memory only (Phase 9) | Still unfinished |

## Changes in this phase

1. **Homepage (`apps/web/app/page.tsx`)**  
   - Fetches real published events via `fetchEvents('/events')`.  
   - Featured and upcoming sections render only when data exists.  
   - Empty state is explicit. No mock cards.

2. **HeroBanner**  
   - Prefers published slides from `/api/public/homepage`.  
   - Graceful fallback if CMS is empty.  
   - Desktop/mobile images supported.

3. **Purchase flow**  
   - Continues to use existing `POST /orders` (reservation + inventory lock + idempotency).  
   - No Stripe Checkout, no fake “paid” confirmation.  
   - Order stays in `reserved` until a future verified payment phase.

4. **Auth pages**  
   - Login, register, forgot-password pages already exist and call backend.  
   - No changes required.

## Unfinished (explicitly listed)

- Order detail page with linked tickets.  
- Full functional admin Tickets page.  
- Persistent `PlatformSettings` PostgreSQL table.  
- Phase 8 QR Scanner Pro models (entry points, scan logs, devices) not on this branch.  
- Screenshots from a running stack (requires local docker-compose + PostgreSQL 16).  
- Exact CI pass/fail counts (next workflow run).

## Constraints respected

- Only `super-admin-dashboard`.  
- No main merge, no deploy, no production changes.  
- No Stripe / PayPal / live payments.  
- Ticketing Core logic not duplicated in frontend.  
- One backend + one PostgreSQL database.

## Next steps for full verification

1. Run `docker-compose` + PostgreSQL 16.  
2. Apply migrations 001–014.  
3. Create SUPERADMIN via CLI.  
4. Publish at least one event + CMS hero slide.  
5. Verify homepage, event detail, reservation flow.  
6. Capture screenshots and CI results.

---

Phase 10 integration points are in place. Waiting for approval to proceed.
