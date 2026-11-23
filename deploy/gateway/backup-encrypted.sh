#!/usr/bin/env bash
# Encrypt and copy a dump off-site. Requires BACKUP_GPG_RECIPIENT and OFFSITE_TARGET.
set -euo pipefail
SRC="${1:-/var/backups/balkan-admin}"
TARGET="${OFFSITE_TARGET:?set OFFSITE_TARGET}"
RECIPIENT="${BACKUP_GPG_RECIPIENT:?set BACKUP_GPG_RECIPIENT}"
LATEST="$(ls -1t "$SRC"/admin-*.sql.gz 2>/dev/null | head -1 || true)"
if [[ -z "$LATEST" ]]; then
  echo "No dump" >&2
  exit 1
fi
ENC="${LATEST}.gpg"
gpg --batch --yes --encrypt --recipient "$RECIPIENT" --output "$ENC" "$LATEST"
if command -v rclone >/dev/null; then
  rclone copy "$ENC" "$TARGET"
else
  rsync -av "$ENC" "$TARGET"
fi
# Retention: delete local encrypted files older than 14 days
find "$SRC" -name 'admin-*.sql.gz.gpg' -mtime +14 -delete
echo "Encrypted and copied $ENC"
