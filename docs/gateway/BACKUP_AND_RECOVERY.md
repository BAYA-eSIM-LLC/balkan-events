# Backup and recovery

**Status:** Nothing to back up yet. Server not configured.

Once configured:

- Gateway has no database.
- Back up `/etc/wireguard` and `/etc/nginx` off-site, encrypted.
- Rollback: `systemctl stop wg-quick@wg0 nginx` on this host only.
- Existing production server is never modified by these steps.
