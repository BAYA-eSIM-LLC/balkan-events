#!/bin/bash
set -e
echo "=== BALKAN EVENTS – Production web swap ==="
echo "This replaces the old static site with the new Next.js frontend."
echo "Existing PostgreSQL volume is preserved."
echo ""

# Backup old static site
BACKUP_DIR="/var/backups/balkan-events-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
if [ -d "/var/www/html" ]; then
  cp -a /var/www/html "$BACKUP_DIR/old-static" 2>/dev/null || true
fi
if [ -f "web/index.html" ]; then
  cp -a web/index.html "$BACKUP_DIR/" 2>/dev/null || true
fi
echo "Backup written to $BACKUP_DIR"

# Pull latest full-redesign
git fetch origin
git checkout full-redesign
git pull origin full-redesign

# Build and restart (keeps postgres volume); .env.prod supplies the build-time Maps key
cd deploy/prod
docker compose --env-file ../../.env.prod -f docker-compose.prod.yml up -d --build

echo ""
echo "=== Done ==="
echo "Check: curl -I http://localhost/"
echo "Rollback: docker compose --env-file ../../.env.prod -f docker-compose.prod.yml down && restore from $BACKUP_DIR"
