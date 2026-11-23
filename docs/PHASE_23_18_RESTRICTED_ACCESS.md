# Phase 23.18 – Restricted temporary audit access

**Date:** 2026-11-23  
**Status:** Prepared. Not applied. Waiting for you to create the limited user.

Fingerprint confirmed: `SHA256:AJWuP5Bb20kDce0HROSuzketxQU23XvjnzAO7TFdir4`

Do not add the key to root `authorized_keys`.

---

## What you run once on 2.29.195.181

```bash
install -m 755 /dev/stdin /usr/local/bin/audit-readonly.sh << 'EOS'
#!/bin/bash
set -euo pipefail
case "${SSH_ORIGINAL_COMMAND:-}" in
  hostname) hostname ;;
  docker-ps) docker ps --format '{{.Names}} {{.Image}} {{.ID}} {{.Status}}' ;;
  docker-inspect)
    docker ps -q | while read -r id; do
      docker image inspect "$(docker inspect -f '{{.Image}}' "$id")" --format '{{.Id}}' || true
    done ;;
  pg-version) docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -c 'SELECT version();' ;;
  alembic) docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -d balkan -c 'SELECT version_num FROM alembic_version;' ;;
  mfa-cols) docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -d balkan -c "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name='users' AND column_name IN ('totp_secret','mfa_enabled');" ;;
  schema-tables) docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -d balkan -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" ;;
  redis-info) docker exec "$(docker ps -qf name=redis | head -1)" redis-cli INFO server | head -15 ;;
  *) echo "Denied"; exit 1 ;;
esac
EOS
id balkan-audit >/dev/null 2>&1 || useradd -m -s /usr/sbin/nologin balkan-audit
usermod -aG docker balkan-audit
mkdir -p /home/balkan-audit/.ssh
echo 'command="/usr/local/bin/audit-readonly.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' > /home/balkan-audit/.ssh/authorized_keys
chmod 700 /home/balkan-audit/.ssh
chmod 600 /home/balkan-audit/.ssh/authorized_keys
chown -R balkan-audit:balkan-audit /home/balkan-audit/.ssh
```

Allowed commands only: `hostname`, `docker-ps`, `docker-inspect`, `pg-version`, `alembic`, `mfa-cols`, `schema-tables`, `redis-info`.

No shell. No port forward. No agent.

---

## After you confirm it is in place

I will connect as `balkan-audit@2.29.195.181` and run only those commands.

---

## Removal

```bash
userdel -r balkan-audit
rm -f /usr/local/bin/audit-readonly.sh
```

I will confirm SSH is denied again.

---

## Not done

No key added. No production change. No deploy. No migration. No firewall change.
