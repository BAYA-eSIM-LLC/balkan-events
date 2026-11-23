# Phase 23.18 – Final install, stop if account exists

**Date:** 2026-11-23  
**Status:** Prepared. Not run on production.

If `balkan-audit` user or group already exists, the install stops.  
Existing accounts, groups, passwords and keys are not changed.

---

## Install

```bash
set -euo pipefail
if getent passwd balkan-audit >/dev/null; then
  echo "STOP: user balkan-audit already exists"
  exit 1
fi
if getent group balkan-audit >/dev/null; then
  echo "STOP: group balkan-audit already exists"
  exit 1
fi
install -o root -g root -m 755 /dev/stdin /usr/local/sbin/audit-readonly.sh << 'EOS'
#!/bin/bash
set -euo pipefail
if [ "$#" -ne 1 ]; then
  echo "Denied"
  exit 1
fi
cmd="$1"
case "$cmd" in
  hostname) hostname ;;
  docker-ps) docker ps --format '{{.Names}} {{.Image}} {{.ID}} {{.Status}}' ;;
  docker-inspect)
    docker ps -q | while read -r id; do
      [ -n "$id" ] || continue
      docker image inspect "$(docker inspect -f '{{.Image}}' "$id")" --format '{{.Id}}'
    done ;;
  pg-version)
    cid=$(docker ps -qf name=postgres | head -1)
    [ -n "$cid" ] || { echo "no postgres container"; exit 1; }
    docker exec "$cid" psql -U postgres -c 'SELECT version();' ;;
  alembic)
    cid=$(docker ps -qf name=postgres | head -1)
    [ -n "$cid" ] || { echo "no postgres container"; exit 1; }
    docker exec "$cid" psql -U postgres -d balkan -c 'SELECT version_num FROM alembic_version;' ;;
  mfa-cols)
    cid=$(docker ps -qf name=postgres | head -1)
    [ -n "$cid" ] || { echo "no postgres container"; exit 1; }
    docker exec "$cid" psql -U postgres -d balkan -c "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name='users' AND column_name IN ('totp_secret','mfa_enabled');" ;;
  schema-tables)
    cid=$(docker ps -qf name=postgres | head -1)
    [ -n "$cid" ] || { echo "no postgres container"; exit 1; }
    docker exec "$cid" psql -U postgres -d balkan -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" ;;
  redis-info)
    cid=$(docker ps -qf name=redis | head -1)
    [ -n "$cid" ] || { echo "no redis container"; exit 1; }
    docker exec "$cid" redis-cli INFO server | head -15 ;;
  *) echo "Denied"; exit 1 ;;
esac
EOS
tmp=$(mktemp)
cat > "$tmp" << 'EOS'
Defaults:balkan-audit env_reset
Defaults:balkan-audit !env_keep
balkan-audit ALL=(root) NOPASSWD: /usr/local/sbin/audit-readonly.sh
EOS
visudo -cf "$tmp"
install -o root -g root -m 440 "$tmp" /etc/sudoers.d/balkan-audit
rm -f "$tmp"
groupadd balkan-audit
useradd -m -g balkan-audit -s /bin/bash balkan-audit
passwd -l balkan-audit
install -d -o balkan-audit -g balkan-audit -m 700 /home/balkan-audit/.ssh
printf '%s\n' 'command="sudo -n /usr/local/sbin/audit-readonly.sh \"$SSH_ORIGINAL_COMMAND\"",restrict ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' > /home/balkan-audit/.ssh/authorized_keys
chown balkan-audit:balkan-audit /home/balkan-audit/.ssh/authorized_keys
chmod 600 /home/balkan-audit/.ssh/authorized_keys
echo "INSTALL_OK"
```

`set -euo pipefail` stops on the first failure.  
User and group are checked before any file is written.

---

## After install

```bash
id -gn balkan-audit
passwd -S balkan-audit
id balkan-audit
wc -l /home/balkan-audit/.ssh/authorized_keys
grep -c 'restrict' /home/balkan-audit/.ssh/authorized_keys
```

Expected: primary group `balkan-audit`, password `L`, no sudo/docker/adm/wheel, one restricted key.

---

## Removal

```bash
set -euo pipefail
if pgrep -u balkan-audit >/dev/null 2>&1; then
  echo "STOP: balkan-audit has running processes"
  pgrep -a -u balkan-audit || true
  exit 1
fi
userdel -r balkan-audit
groupdel balkan-audit
rm -f /usr/local/sbin/audit-readonly.sh /etc/sudoers.d/balkan-audit
if getent passwd balkan-audit >/dev/null; then
  echo "STOP: user still exists"
  exit 1
fi
if getent group balkan-audit >/dev/null; then
  echo "STOP: group still exists"
  exit 1
fi
test ! -f /usr/local/sbin/audit-readonly.sh
test ! -f /etc/sudoers.d/balkan-audit
echo "REMOVE_OK"
```

If processes exist, it stops and does not kill them.  
`REMOVE_OK` is printed only after all checks pass.

---

## Not done

Nothing was run on production. No key. No user. No other account was changed.
