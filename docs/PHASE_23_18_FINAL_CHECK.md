# Phase 23.18 – Final security check before activation

**Date:** 2026-11-23  
**Commit base:** 1fdddc7  
**Status:** Prepared. Nothing was run on production.

---

## 1. Primary group

If the user already exists, `useradd` does nothing. Primary group must be `balkan-audit`, not `sudo`, `docker`, `adm` or `wheel`.

```bash
getent group balkan-audit >/dev/null || groupadd balkan-audit
id balkan-audit >/dev/null 2>&1 || useradd -m -g balkan-audit -s /bin/bash balkan-audit
usermod -g balkan-audit -s /bin/bash balkan-audit
passwd -l balkan-audit
for g in sudo docker adm wheel; do gpasswd -d balkan-audit "$g" 2>/dev/null || true; done
id -gn balkan-audit
# must print: balkan-audit
id balkan-audit
# must not list sudo, docker, adm, wheel
```

---

## 2. SSH

```bash
wc -l /home/balkan-audit/.ssh/authorized_keys
# 1
grep -c '^command=' /home/balkan-audit/.ssh/authorized_keys
# 1
grep -c 'restrict' /home/balkan-audit/.ssh/authorized_keys
# 1
ls /home/balkan-audit/.ssh
# only authorized_keys
```

The only line:

```
command="sudo -n /usr/local/sbin/audit-readonly.sh \"$SSH_ORIGINAL_COMMAND\"",restrict ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122
```

`restrict` blocks interactive shell, port forwarding, agent forwarding, X11 and user-rc.  
Password is locked, so there is no password login.

---

## 3. sudoers and wrapper

sudoers file `/etc/sudoers.d/balkan-audit`:

```
Defaults:balkan-audit env_reset
Defaults:balkan-audit !env_keep
balkan-audit ALL=(root) NOPASSWD: /usr/local/sbin/audit-readonly.sh
```

Only that path. No other root command.

Wrapper starts with:

```bash
if [ "$#" -ne 1 ]; then
  echo "Denied"
  exit 1
fi
```

Then `case` allows only: `hostname`, `docker-ps`, `docker-inspect`, `pg-version`, `alembic`, `mfa-cols`, `schema-tables`, `redis-info`.

Local tests already run:

| Input | Result |
|---|---|
| `hostname extra` | Denied |
| `hostname /bin/bash` | Denied |
| `docker-ps extra` | Denied |
| `bash -c id` | Denied |
| empty | Denied |
| eight names | accepted by the gate |

---

## 4. Removal

```bash
userdel -r balkan-audit
groupdel balkan-audit 2>/dev/null || true
rm -f /usr/local/sbin/audit-readonly.sh /etc/sudoers.d/balkan-audit
getent passwd balkan-audit || echo user_gone
test ! -f /etc/sudoers.d/balkan-audit && echo sudoers_gone
test ! -f /usr/local/sbin/audit-readonly.sh && echo wrapper_gone
ssh -i ~/.ssh/id_ed25519_balkan -o BatchMode=yes -o ConnectTimeout=8 balkan-audit@2.29.195.181 hostname
# must be Permission denied
```

---

## 5. Final install block

```bash
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
getent group balkan-audit >/dev/null || groupadd balkan-audit
id balkan-audit >/dev/null 2>&1 || useradd -m -g balkan-audit -s /bin/bash balkan-audit
usermod -g balkan-audit -s /bin/bash balkan-audit
passwd -l balkan-audit
for g in sudo docker adm wheel; do gpasswd -d balkan-audit "$g" 2>/dev/null || true; done
install -d -o balkan-audit -g balkan-audit -m 700 /home/balkan-audit/.ssh
printf '%s\n' 'command="sudo -n /usr/local/sbin/audit-readonly.sh \"$SSH_ORIGINAL_COMMAND\"",restrict ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' > /home/balkan-audit/.ssh/authorized_keys
chown balkan-audit:balkan-audit /home/balkan-audit/.ssh/authorized_keys
chmod 600 /home/balkan-audit/.ssh/authorized_keys
```

---

## Constraints honored

No production access. No key installed. No user created. No database, Docker, firewall, WireGuard, migration or deploy change. No merge to main.
