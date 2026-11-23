# Phase 23.18 – Restricted audit access, no docker group

**Date:** 2026-11-23  
**Status:** Prepared. Not applied. Do not run until approved.

Fingerprint: `SHA256:AJWuP5Bb20kDce0HROSuzketxQU23XvjnzAO7TFdir4`

`balkan-audit` is not added to the `docker` group.  
Root is used only by one root-owned wrapper, via a single sudoers line.

---

## 1. Install command (do not run yet)

```bash
install -o root -g root -m 755 /dev/stdin /usr/local/sbin/audit-readonly.sh << 'EOS'
#!/bin/bash
set -euo pipefail
cmd="${1:-}"
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
install -o root -g root -m 440 /dev/stdin /etc/sudoers.d/balkan-audit << 'EOS'
Defaults:balkan-audit env_reset
Defaults:balkan-audit !env_keep
balkan-audit ALL=(root) NOPASSWD: /usr/local/sbin/audit-readonly.sh
EOS
visudo -cf /etc/sudoers.d/balkan-audit
id balkan-audit >/dev/null 2>&1 || useradd -m -s /usr/sbin/nologin balkan-audit
gpasswd -d balkan-audit docker 2>/dev/null || true
install -d -o balkan-audit -g balkan-audit -m 700 /home/balkan-audit/.ssh
printf '%s\n' 'command="sudo -n /usr/local/sbin/audit-readonly.sh \"$SSH_ORIGINAL_COMMAND\"",restrict ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' > /home/balkan-audit/.ssh/authorized_keys
chown balkan-audit:balkan-audit /home/balkan-audit/.ssh/authorized_keys
chmod 600 /home/balkan-audit/.ssh/authorized_keys
```

`restrict` means: no port forwarding, no agent forwarding, no X11, no PTY, no user-rc.

---

## 2. Script

`/usr/local/sbin/audit-readonly.sh`, root:root, mode 755.  
Content is the `install` block above. Argument must be one of the eight names. Anything else prints `Denied` and exits 1.  
SQL strings are fixed. No environment is printed. `docker inspect` format is only `{{.Id}}`.

---

## 3. authorized_keys

```
command="sudo -n /usr/local/sbin/audit-readonly.sh \"$SSH_ORIGINAL_COMMAND\"",restrict ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122
```

---

## 4. sudoers

File: `/etc/sudoers.d/balkan-audit`, mode 440.

```
Defaults:balkan-audit env_reset
Defaults:balkan-audit !env_keep
balkan-audit ALL=(root) NOPASSWD: /usr/local/sbin/audit-readonly.sh
```

Only that one binary. No docker group. No other sudo.

---

## 5. Local wrapper tests (not on production)

| Input | Result |
|---|---|
| `bash -c id` | Denied |
| empty | Denied |
| `docker run` | Denied |
| `hostname` | allowed |
| `docker-inspect` | allowed, Id only |

---

## 6. SSH tests after you install (you run these)

```bash
ssh -i ~/.ssh/id_ed25519_balkan balkan-audit@2.29.195.181 hostname
ssh -i ~/.ssh/id_ed25519_balkan balkan-audit@2.29.195.181 docker-ps
ssh -i ~/.ssh/id_ed25519_balkan -N -L 5432:127.0.0.1:5432 balkan-audit@2.29.195.181
# tunnel must fail
ssh -i ~/.ssh/id_ed25519_balkan balkan-audit@2.29.195.181 'bash -c id'
# must print Denied
```

---

## 7. Removal

```bash
userdel -r balkan-audit
rm -f /usr/local/sbin/audit-readonly.sh /etc/sudoers.d/balkan-audit
getent passwd balkan-audit || echo user_gone
```

Then SSH as `balkan-audit` must be denied.

---

## Not done

Nothing was run on production. No key added. No user created. No docker, database, firewall, or service change.
