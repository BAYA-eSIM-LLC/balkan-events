# Production deploy plan

**Release commit:** e4a599e  
**Image:** sha256:d9b9d0a9c86098da32d2fbaa1718de64469a1172d3ad4757091e33edc94d0acc  
**Status:** prepared. Not executed.

## Before deploy

1. Run `deploy/release/backup-readonly.sh` on the production host.
2. Confirm `BACKUP_OK` and the Alembic revision.
3. If the revision is not `026_totp_secret_len`, plan `alembic upgrade head` only after backup.

## Deploy

1. On the production host, check out `e4a599e`.
2. Build `services/api/Dockerfile.prod`.
3. Record the running image id.
4. Start the new API container.
5. Run `alembic upgrade head` only after the backup is confirmed.
6. Check `/health` and that `/admin/me` returns 401 without a token.

## Rollback

1. Stop the new API container.
2. Start the previous image id.
3. Do not downgrade the schema.
4. Confirm `/health` on the restored stub.

## Not done

Migrations and image replacement wait for a separate confirmation.
