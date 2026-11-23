# Phase 23.12.4 – DNS and tunnel check

**Date:** 2026-11-23  
**Status:** Validated. No production changes.

| Check | Status | Evidence |
|---|---|---|
| admin.balkanevents.org A | PASS | Cloudflare DNS returns 2.29.199.6, TTL 300 |
| Gateway host | PASS | ubuntu-4gb-hel1-5 / 2.29.199.6 |
| WireGuard handshake | PASS | 1 minute ago, peer 10.10.0.1 |
| API via tunnel | PASS | GET http://10.10.0.1:8000/health → {"status":"healthy"} |
| System Nginx | inactive | not started |
| Production modified | no | |

DNS was changed by the owner before this step. This phase did not edit DNS.
