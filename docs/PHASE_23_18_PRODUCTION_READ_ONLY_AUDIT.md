# Phase 23.18 – Production read-only audit

**Date:** 2026-11-23  
**Status:** BLOCKED. No production change was made.

---

## Access check

| Path | Result |
|---|---|
| SSH `root@2.29.195.181` | Permission denied (publickey) |
| `10.10.0.1:5432` from gateway | Connection refused |
| `10.10.0.1:6379` from gateway | Connection refused |
| API `http://10.10.0.1:8000/health` | 200, stub only |

Postgres and Redis are not published on the WireGuard address.  
The available deploy key is not in production `authorized_keys`.

No port was opened. No service was restarted. No query was run.

---

## What could not be read

| Item | Status |
|---|---|
| `alembic_version` | BLOCKED |
| PostgreSQL version | BLOCKED |
| Tables, columns, indexes | BLOCKED |
| MFA columns | BLOCKED |
| Redis status | BLOCKED |
| Production image digest | BLOCKED |

---

## Commands to run after access is granted

Read-only only. Do not run `upgrade`, `dump`, or any write.

```sql
SELECT version();
SELECT version_num FROM alembic_version;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1;
SELECT column_name, data_type, character_maximum_length
  FROM information_schema.columns
 WHERE table_name = 'users'
   AND column_name IN ('totp_secret', 'mfa_enabled');
SELECT to_regclass('public.mfa_pending') AS mfa_pending,
       to_regclass('public.mfa_recovery_codes') AS mfa_codes;
```

Image, still read-only:

```
docker ps --format '{{.Image}} {{.ID}} {{.Status}}'
docker image inspect <id> --format '{{.Id}} {{.RepoDigests}}'
```

Redis, still read-only:

```
redis-cli INFO server | head
```

---

## How to unblock

Add this public key to the production host, or confirm another authorized key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122
```

Fingerprint: `SHA256:AJWuP5Bb20kDce0HROSuzketxQU23XvjnzAO7TFdir4`

Do not open 5432 to the internet.

---

## Constraints honored

No `pg_dump`. No INSERT/UPDATE/DELETE/ALTER/CREATE/DROP. No Alembic. No restart. No image pull. No firewall, gateway, DNS, or TLS change. No user data read.
