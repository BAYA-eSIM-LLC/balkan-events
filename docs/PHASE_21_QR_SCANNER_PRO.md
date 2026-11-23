# Phase 21 – QR Scanner PRO

**Branch:** super-admin-dashboard  
**Commit:** aaa5f8f  
**Date:** 2026-11-23

## CI (PostgreSQL 16)

- **Run:** [45148939989](https://github.com/BAYA-eSIM-LLC/balkan-events/actions/runs/45148939989)
- **Tests:** **122 passed, 0 failed, 0 skipped**
- Migrations 001–023: passed

## Implemented

### Device management
- `POST /scanner/devices` — register, returns token once (stored hashed)
- `POST /scanner/devices/{id}/revoke` — deactivates device and revokes tokens
- Audit log on register and revoke

### Entry points
- `POST /scanner/entry-points` — requires `manage_events`
- `GET /scanner/entry-points?event_id=` — requires `scan`

### Validation
- Existing `POST /scanner/validate` with `check_event_cap(..., "scan")`
- Results: VALID, ALREADY_USED, WRONG_EVENT, INVALID
- FOR UPDATE on ticket

### Attendance & export
- `GET /scanner/attendance?event_id=` — scanned, already_used, invalid, by entry point
- `GET /scanner/export.csv?event_id=` — CSV of scans

### Offline sync
- `POST /scanner/offline/sync` — accepts queued scans
- Marks tickets used, logs VALID or ALREADY_USED
- Response includes limitation text

### Frontend
- `/scanner` — manual entry, offline queue, sync, large result
- `/organizer/scanner/devices`
- `/organizer/scanner/entry-points`
- `/organizer/scanner/attendance`

### Tests
- Device register returns token, revoke works
- Entry point create and attendance
- Offline sync returns limitation message

## Offline limitation

Without a central connection, concurrent double-entry across devices cannot be prevented. Offline validation is not a guaranteed central check. The API response states this explicitly.

## Not finished
- Camera QR scanning (manual entry provided)
- Device token authentication on validate (user JWT still required)
- Live screenshots
- Phase 14 leftovers: drag-and-drop seat editor, auto checkout redirect

## Constraints

Only `super-admin-dashboard`. No main merge, no deploy, no production, no Stripe.

Waiting for approval before Phase 22.
