#!/usr/bin/env bash
# Copy the latest admin-related dump to off-site storage.
# Set OFFSITE_TARGET, e.g. storagebox:/backups or s3://bucket/admin
set -euo pipefail
SRC="${1:-/var/backups/balkan-admin}"
TARGET="${OFFSITE_TARGET:?set OFFSITE_TARGET}"
LATEST="$(ls -1t "$SRC"/admin-*.sql.gz 2>/dev/null | head -1 || true)"
if [[ -z "$LATEST" ]]; then
  echo "No local dump found" >&2
  exit 1
fi
if command -v rclone >/dev/null; then
  rclone copy "$LATEST" "$TARGET"
elif command -v rsync >/dev/null; then
  rsync -av "$LATEST" "$TARGET"
else
  echo "Install rclone or rsync" >&2
  exit 1
fi
echo "Copied $LATEST to $TARGET"
