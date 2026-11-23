# Phase 23.18 production read-only audit

**Date:** 2026-11-23  
**Host:** 2.29.195.181 (ubuntu-4gb-hel1-1)  
**Access:** balkan-audit forced command only. Root SSH not used.  
**Production changes:** none.

## Results

| Check | Result |
|---|---|
| hostname | ubuntu-4gb-hel1-1 |
| docker-ps | balkan-api, image name balkan-events-prod-api, id 1ac6c644971b, Up 2 days |
| docker-inspect | sha256:5d8b9e95bdfa1553233a638a12a82d0b7dc6e09f90ecd89af2a041458cca48b9 |
| pg-version | no postgres container |
| alembic | no postgres container |
| mfa-cols | no postgres container |
| schema-tables | no postgres container |
| redis-info | no redis container |
| extra argument | Denied |
| bash | Denied |
| public /health | 200 |
| openapi paths | only / and /health |

## Comparison

- Running image: `sha256:5d8b9e95bdfa1553233a638a12a82d0b7dc6e09f90ecd89af2a041458cca48b9`
- Release image: `sha256:d9b9d0a9c86098da32d2fbaa1718de64469a1172d3ad4757091e33edc94d0acc`
- They do not match. Production is still the stub API.

## Backup

Blocked. The audit wrapper only sees a postgres container whose name contains `postgres`. None is running. No dump was taken. No volume was touched.

## Next

Alembic revision and MFA columns are unknown until postgres is reachable read-only. Migrations and deploy are not started.
