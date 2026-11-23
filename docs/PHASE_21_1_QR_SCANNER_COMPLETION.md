# Phase 21.1 – QR Camera & Device Authentication Completion

**Branch:** super-admin-dashboard  
**Commit:** f3b1c88  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45150962014](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45150962014)
- **Tests:** **124 passed, 0 failed, 0 skipped**
- Migrations 001–023: passed (no new migration)

## Camera QR scanning

`/scanner`:
- Start camera button using `getUserMedia` (rear camera)
- `BarcodeDetector` for QR codes where supported
- Auto-validate on detection
- Dedupes repeated reads of the same code
- Manual entry remains
- Camera permission denied and unsupported device messages
- Validation result shown only after server response

## Device authentication

`POST /scanner/validate` accepts either:
- User JWT (existing path, event cap check)
- `X-Device-Token` header

Device token path:
- Looks up hashed token
- Rejects missing, revoked, or inactive devices (401)
- Checks device organization matches event organization
- Checks entry point assignment when both are set
- Updates `last_used_at`
- Logs scan with null `scanner_user_id` (device action)

## Offline

- Queue stores `client_id` and `scanned_at`
- UI labels offline results as not confirmed
- Sync endpoint still returns the concurrent-double-entry limitation

## Tests

- Device token alone validates (missing ticket → INVALID, not 401)
- Revoked token → 401
- Invalid token → 401

## Not finished

- Rate limiting on device token attempts
- Camera test on real device (BarcodeDetector availability varies)
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 22.
