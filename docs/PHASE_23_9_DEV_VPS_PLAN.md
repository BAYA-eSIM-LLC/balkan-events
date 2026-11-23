# Phase 23.9 – Temporary DEV VPS Plan

**Date:** 2026-11-23  
**Status:** Plan only. No VPS created. Waiting for approval.

---

## Purpose

Run the 12 blocked integration tests from Phase 23.8 on a disposable host.
Not a gateway. Not production. Destroyed after the report.

---

## Proposed host

| Item | Value |
|---|---|
| Provider | Hetzner Cloud |
| Type | CX22 or CPX22 |
| CPU | 2 vCPU |
| RAM | 4 GB |
| Disk | 40 GB (CX22) or 80 GB (CPX22) |
| OS | Ubuntu 24.04 |
| Location | Helsinki or Falkenstein |
| Name | `balkan-dev-tests` |
| Lifetime | Hours, then destroy |

CX22 is enough. CPX22 matches the gateway size if you prefer one type.

---

## Cost

| Option | Monthly | For a few hours |
|---|---|---|
| CX22 | ~€4–5 | well under €1 |
| CPX22 | ~€9–12 | about €1 |

Hetzner bills hourly. Destroy the server after the report.

---

## Access

1. Generate a new Ed25519 key named `balkan-dev-tests` on the iPhone or reuse the existing deploy key.
2. Paste only the public key at order time.
3. SSH as root. Do not enable password login.
4. This key is not used on 2.29.195.181 or 2.29.199.6.

---

## Install plan (after approval and order)

1. `apt-get update && apt-get upgrade -y`
2. Install Docker Engine 24+ and Compose plugin
3. Clone `super-admin-dashboard` (read-only use of the repo)
4. Run `bash deploy/gateway/mfa-integration-test.sh`
5. The script starts `postgres:16-alpine` on port 55432, runs Alembic and pytest, then removes the container
6. Optional: start a throwaway Redis only if the multi-process rate-limit test is extended
7. Collect logs with secrets redacted
8. Destroy the VPS

---

## What will not be done

- No connection to 2.29.195.181
- No use of 2.29.199.6
- No WireGuard peer
- No Nginx
- No DNS
- No TLS certificate
- No production data or secrets
- No MFA enforcement on production
- No Stripe
- No merge to main

---

## Tests to run

| # | Test | Pass rule |
|---|---|---|
| 1 | Alembic 001–025 | upgrade head exits 0 |
| 2 | MFA login / TOTP | confirm returns tokens |
| 3 | MFA refresh protection | refresh returns 401 |
| 4 | Recovery one-time | second use fails |
| 5 | Pending expiry | expired token rejected |
| 6 | 5 failed attempts | 6th rejected |
| 7 | SUPERADMIN / ADMIN / USER | role checks hold |
| 8 | Redis multi-process | shared counter if Redis is up |
| 9 | Nginx Authorization | static check only; Nginx not started |
| 10 | /health | body is status only |
| 11 | Unauthorized /admin | 401/403 |
| 12 | Docker ports | only 55432 published, then removed |

Any test not executed stays BLOCKED, never PASS.

---

## Approval needed

Reply with approval to order the CX22 (or CPX22) in Helsinki.
I will not create the server until you approve.
