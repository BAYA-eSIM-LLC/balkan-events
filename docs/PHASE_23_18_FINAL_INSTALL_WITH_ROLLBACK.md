# Phase 23.18 – Final install with pre-checks and controlled rollback

**Date:** 2026-11-23  
**Status:** Prepared. Not run on production.  
**Server:** 2.29.195.181 (do not execute yet)

If the user, group, wrapper, sudoers file or home directory already exist, the install stops.  
Existing content is never overwritten, modified or deleted.  
On failure, a trap removes only the resources this run created.

---

## Complete install block

```bash
set -euo pipefail

# Stop if any dedicated resource already exists. Do not touch it.
if getent passwd balkan-audit >/dev/null; then
  echo "STOP: user balkan-audit already exists"
  exit 1
fi
if getent group balkan-audit >/dev/null; then
  echo "STOP: group balkan-audit already exists"
  exit 1
fi
if [ -e /usr/local/sbin/audit-readonly.sh ]; then
  echo "STOP: /usr/local/sbin/audit-readonly.sh already exists"
  exit 1
fi
if [ -e /etc/sudoers.d/balkan-audit ]; then
  echo "STOP: /etc/sudoers.d/balkan-audit already exists"
  exit 1
fi
if [ -e /home/balkan-audit ]; then
  echo "STOP: /home/balkan-audit already exists"
  exit 1
fi

# Track only what this run creates.
WRAPPER_CREATED=0
SUDOERS_CREATED=0
GROUP_CREATED=0
USER_CREATED=0
SSHDIR_CREATED=0
SUCCESS=0
tmp=""

cleanup_tmp() {
  if [ -n "${tmp:-}" ] && [ -f "$tmp" ]; then
    rm -f "$tmp" || echo "WARN: could not remove temp sudoers $tmp"
  fi
}

rollback() {
  local rc=$?
  cleanup_tmp
  if [ "$SUCCESS" -eq 1 ]; then
    return 0
  fi
  echo "INSTALL FAILED (exit $rc). Starting controlled rollback of this run only."
  local leftover=0

  if [ "$SSHDIR_CREATED" -eq 1 ]; then
    if [ -d /home/balkan-audit/.ssh ]; then
      rm -rf /home/balkan-audit/.ssh || { echo "ROLLBACK FAIL: .ssh dir remains"; leftover=1; }
    fi
  fi

  if [ "$USER_CREATED" -eq 1 ]; then
    if getent passwd balkan-audit >/dev/null; then
      userdel -r balkan-audit 2>/dev/null || { echo "ROLLBACK FAIL: user balkan-audit remains"; leftover=1; }
    fi
  fi

  if [ "$GROUP_CREATED" -eq 1 ]; then
    if getent group balkan-audit >/dev/null; then
      groupdel balkan-audit 2>/dev/null || { echo "ROLLBACK FAIL: group balkan-audit remains"; leftover=1; }
    fi
  fi

  if [ "$SUDOERS_CREATED" -eq 1 ]; then
    if [ -f /etc/sudoers.d/balkan-audit ]; then
      rm -f /etc/sudoers.d/balkan-audit || { echo "ROLLBACK FAIL: sudoers file remains"; leftover=1; }
    fi
  fi

  if [ "$WRAPPER_CREATED" -eq 1 ]; then
    if [ -f /usr/local/sbin/audit-readonly.sh ]; then
      rm -f /usr/local/sbin/audit-readonly.sh || { echo "ROLLBACK FAIL: wrapper remains"; leftover=1; }
    fi
  fi

  if [ "$leftover" -eq 1 ]; then
    echo "ROLLBACK INCOMPLETE. Manual verification required for any item marked ROLLBACK FAIL above."
    echo "Do not assume the account is clean."
    exit 1
  fi

  echo "ROLLBACK COMPLETE. Only resources created by this run were removed."
  exit 1
}

trap rollback EXIT

# 1. Wrapper (root-owned)
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
WRAPPER_CREATED=1

# 2. Temporary sudoers, validate, then install
tmp=$(mktemp)
cat > "$tmp" << 'EOS'
Defaults:balkan-audit env_reset
Defaults:balkan-audit !env_keep
balkan-audit ALL=(root) NOPASSWD: /usr/local/sbin/audit-readonly.sh
EOS
visudo -cf "$tmp"
install -o root -g root -m 440 "$tmp" /etc/sudoers.d/balkan-audit
cleanup_tmp
SUDOERS_CREATED=1

# 3. Group and user (only after files are ready)
groupadd balkan-audit
GROUP_CREATED=1
useradd -m -g balkan-audit -s /bin/bash balkan-audit
USER_CREATED=1
passwd -l balkan-audit

# 4. Single restricted key
install -d -o balkan-audit -g balkan-audit -m 700 /home/balkan-audit/.ssh
SSHDIR_CREATED=1
printf '%s\n' 'command="sudo -n /usr/local/sbin/audit-readonly.sh \"$SSH_ORIGINAL_COMMAND\"",restrict ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' > /home/balkan-audit/.ssh/authorized_keys
chown balkan-audit:balkan-audit /home/balkan-audit/.ssh/authorized_keys
chmod 600 /home/balkan-audit/.ssh/authorized_keys

SUCCESS=1
trap - EXIT
echo "INSTALL_OK"
```

Pre-checks stop if the wrapper, sudoers file or home directory already exist.  
`cleanup_tmp` runs from the trap, so `$tmp` is removed even if `visudo -cf` fails.  
Rollback removes only items this run marked with flags. It never touches pre-existing content.

---

## Complete removal procedure (after audit)

```bash
set -euo pipefail

# Do not kill processes automatically.
if pgrep -u balkan-audit >/dev/null 2>&1; then
  echo "STOP: balkan-audit has running processes. Manual approval required."
  pgrep -a -u balkan-audit || true
  exit 1
fi

# Remove only the dedicated account and its files.
if getent passwd balkan-audit >/dev/null; then
  userdel -r balkan-audit
fi
if getent group balkan-audit >/dev/null; then
  groupdel balkan-audit
fi
rm -f /usr/local/sbin/audit-readonly.sh
rm -f /etc/sudoers.d/balkan-audit

# Confirm nothing remains. Fail if anything is still present.
if getent passwd balkan-audit >/dev/null; then
  echo "STOP: user still exists"
  exit 1
fi
if getent group balkan-audit >/dev/null; then
  echo "STOP: group still exists"
  exit 1
fi
if [ -f /usr/local/sbin/audit-readonly.sh ]; then
  echo "STOP: wrapper still exists"
  exit 1
fi
if [ -f /etc/sudoers.d/balkan-audit ]; then
  echo "STOP: sudoers still exists"
  exit 1
fi
if [ -d /home/balkan-audit ]; then
  echo "STOP: home directory still exists"
  exit 1
fi

echo "REMOVE_OK"
echo "Confirm SSH denial:"
echo "ssh -i ~/.ssh/id_ed25519_balkan -o BatchMode=yes -o ConnectTimeout=8 balkan-audit@2.29.195.181 hostname"
echo "Expected: Permission denied"
```

`REMOVE_OK` is printed only after all existence checks pass.

---

## After-install verification (you run)

```bash
id -gn balkan-audit
passwd -S balkan-audit
id balkan-audit
wc -l /home/balkan-audit/.ssh/authorized_keys
grep -c 'restrict' /home/balkan-audit/.ssh/authorized_keys
grep -c '^command=' /home/balkan-audit/.ssh/authorized_keys
```

Expected:
- primary group `balkan-audit`
- password status `L`
- not in sudo, docker, adm, wheel
- exactly one line in authorized_keys
- that line contains `command=` and `restrict`

---

## Constraints honored

Nothing was executed on 2.29.195.181.  
No key was installed.  
No user was created.  
No other accounts, groups, SSH keys, Docker, database, firewall, WireGuard, API or migrations were touched.  
No merge to main.
