#!/usr/bin/env bash
# Daily backup of the Super Admin database. Does not touch any other host.
set -euo pipefail
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="/var/backups/balkan-admin"
mkdir -p "$OUT"
docker compose -f "$(dirname "$0")/docker-compose.admin.yml" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-balkan_admin}" "${POSTGRES_DB:-balkan_events_admin}" \
  | gzip > "$OUT/admin-${STAMP}.sql.gz"
find "$OUT" -name 'admin-*.sql.gz' -mtime +14 -delete
echo "Backup written to $OUT/admin-${STAMP}.sql.gz"
