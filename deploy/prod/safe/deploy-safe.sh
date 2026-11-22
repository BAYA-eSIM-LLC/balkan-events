#!/bin/bash
set -euo pipefail

echo "=== SAFE web swap – frontend + nginx only ==="
echo "PostgreSQL container and volume are left untouched."
echo ""

# Required environment variables (set after discovery)
: "${COMPOSE_PROJECT:?Set COMPOSE_PROJECT}"
: "${EXISTING_NETWORK:?Set EXISTING_NETWORK}"
: "${POSTGRES_CONTAINER:?Set POSTGRES_CONTAINER}"

BACKUP_DIR="/var/backups/balkan-events-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "1. Backup current compose and web"
cp -a docker-compose.prod.yml "$BACKUP_DIR/" 2>/dev/null || true
cp -a deploy/prod/docker-compose.prod.yml "$BACKUP_DIR/" 2>/dev/null || true
if [ -d web ]; then cp -a web "$BACKUP_DIR/web"; fi
if [ -f web/index.html ]; then cp -a web/index.html "$BACKUP_DIR/"; fi

echo "2. PostgreSQL backup (must be non-empty)"
docker exec "$POSTGRES_CONTAINER" pg_dump -U balkan balkan_events > "$BACKUP_DIR/db.sql"
if [ ! -s "$BACKUP_DIR/db.sql" ]; then
  echo "ERROR: backup file is empty. Aborting."
  exit 1
fi
echo "Backup OK: $BACKUP_DIR/db.sql ($(wc -c < "$BACKUP_DIR/db.sql") bytes)"

echo "3. Stop only web and nginx (leave api + postgres running)"
docker compose -p "$COMPOSE_PROJECT" stop web nginx 2>/dev/null || true

echo "4. Build and start new web + nginx on existing network"
cd deploy/prod/safe
docker compose -p "$COMPOSE_PROJECT" -f docker-compose.prod.safe.yml up -d --build web nginx

echo ""
echo "=== Done ==="
echo "Backup: $BACKUP_DIR"
echo "Rollback:"
echo "  docker compose -p $COMPOSE_PROJECT -f deploy/prod/safe/docker-compose.prod.safe.yml down"
echo "  # restore previous compose and restart previous web"
