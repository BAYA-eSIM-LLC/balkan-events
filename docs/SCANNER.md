# BALKAN SCANNER – Architecture

## Overview

QR validation module for event access control.

## Models (migration 010)

- `entry_points` – named gates per event
- `scanner_assignments` – user-to-event access (role SCANNER_STAFF)
- `scan_logs` – immutable audit of every scan attempt

## QR security

- Ticket `code` is a unique opaque identifier (no PII)
- Server validates: exists, correct event, not used, order not cancelled/refunded
- Atomic `SELECT … FOR UPDATE` prevents double-entry

## Scan results

VALID, ALREADY_USED, INVALID, CANCELLED, REFUNDED, WRONG_EVENT, UNAUTHORIZED, NEEDS_REVIEW

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scanner/scan` | Validate and mark used (atomic) |
| GET | `/scanner/stats/{event_id}` | Real counts from scan_logs |
| POST | `/scanner/entry-points` | Create gate (admin) |
| POST | `/scanner/assign` | Assign scanner staff (admin) |

## Constraints

- No real ticket sales in this phase
- Tickets must be created via existing inventory/order flow or test fixtures
- Offline mode not implemented (requires explicit security design)
