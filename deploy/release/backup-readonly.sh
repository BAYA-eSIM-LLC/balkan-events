#!/bin/bash
# Run on the production host, as root, only after explicit approval.
# Does not open ports. Writes a local custom-format dump.
set -euo pipefail
cid=$(docker ps -qf name=postgres | head -1)
[ -n "$cid" ] || { echo "no postgres container"; exit 1; }
stamp=$(date -u +%Y%m%d-%H%M%S)
out="/var/backups/balkan-predeploy-${stamp}.dump"
mkdir -p /var/backups
# Try the compose DB name, then the older name.
if docker exec "$cid" psql -U postgres -d balkan_events -c 'SELECT 1' >/dev/null 2>&1; then
  db=balkan_events
elif docker exec "$cid" psql -U postgres -d balkan -c 'SELECT 1' >/dev/null 2>&1; then
  db=balkan
else
  echo "no known database"; exit 1
fi
docker exec "$cid" pg_dump -U postgres -d "$db" -Fc -f "/tmp/balkan.dump"
docker cp "$cid:/tmp/balkan.dump" "$out"
docker exec "$cid" rm -f /tmp/balkan.dump
ls -lh "$out"
# Integrity: list archive contents. Does not restore.
pg_restore -l "$out" >/tmp/balkan-backup.list
wc -l /tmp/balkan-backup.list
echo "BACKUP_OK $out db=$db"
echo "ALEMBIC:"
docker exec "$cid" psql -U postgres -d "$db" -c 'SELECT version_num FROM alembic_version;'
