# Backup & Restore Test – TEST Gateway

Date: 2026-11-24
Environment: TEST Gateway (2.29.199.6) only. Production not touched.

## Backup

- Command: `docker exec balkan-admin-test-postgres-1 pg_dump -U balkan -d balkan_events -Fc -f /tmp/balkan_events_backup.dump`
- Host copy: `/tmp/balkan_events_backup_202611241650.dump` (219 KB)
- Format: PostgreSQL custom (gzip), TOC entries 617
- Duration: <1 s
- Config metadata: `/tmp/config-backup.tar.gz` (compose + env file sizes/modes only; no secrets)

## Restore (isolated)

- Created database: `balkan_events_restore` (same Postgres container, separate DB)
- Command: `pg_restore -U balkan -d balkan_events_restore --no-owner --no-acl /tmp/balkan_events_backup.dump`
- Duration: 1 s
- Active TEST database `balkan_events` was not modified or overwritten.

## Verification (restore DB)

| Entity | Count |
|--------|-------|
| users | 5 |
| organizations | 2 |
| events | 4 |
| orders | 7 |
| tickets | 6 |
| ledger_entries | 13 |
| sales_points | 1 |
| seat_maps | 1 |

Orders include BE-C73427F711 (paid), BE-C019A0276A (refunded), POS-3D503AB967 (paid).  
Seat map "Test Hall" for event 1 present.  
Users: admin (superadmin), user1/2/3, support_admin.

Live vs restore order count: 7 = 7.

## Recovery procedure

1. Stop API (optional, for consistency).
2. `docker exec ... pg_dump -Fc` of current DB (safety).
3. `CREATE DATABASE balkan_events_restore;`
4. `pg_restore -d balkan_events_restore ...`
5. Verify counts and key rows.
6. To cut over: rename live DB, rename restore to live, restart API.
7. Never restore over the active DB without a prior dump.

## Risks

- Backup is on the same host disk; off-site copy recommended.
- Config secrets (.env.stripe) are not in the dump; restore of secrets is a separate step.
- No automated schedule; manual process.
