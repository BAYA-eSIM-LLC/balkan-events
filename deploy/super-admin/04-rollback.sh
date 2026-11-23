#!/usr/bin/env bash
# Restore the latest backup. Destructive to the admin database only.
set -euo pipefail
OUT="/var/backups/balkan-admin"
LATEST="$(ls -1t "$OUT"/admin-*.sql.gz | head -1)"
if [[ -z "${LATEST:-}" ]]; then
  echo "No backup found" >&2
  exit 1
fi
echo "Restoring $LATEST"
gunzip -c "$LATEST" | docker compose -f "$(dirname "$0")/docker-compose.admin.yml" exec -T postgres \
  psql -U "${POSTGRES_USER:-balkan_admin}" "${POSTGRES_DB:-balkan_events_admin}"
echo "Restore complete"
