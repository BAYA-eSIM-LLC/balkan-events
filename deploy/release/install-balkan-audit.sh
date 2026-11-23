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

# Flags mark only resources this run confirmed it created.
WRAPPER_CREATED=0
SUDOERS_CREATED=0
GROUP_CREATED=0
USER_CREATED=0
SSHDIR_CREATED=0
SUCCESS=0
tmp=""
wrap_stage=""
sudo_stage=""

cleanup_tmp() {
  if [ -n "${tmp:-}" ] && [ -f "$tmp" ]; then
    rm -f "$tmp" || echo "WARN: could not remove temp sudoers $tmp"
  fi
  if [ -n "${wrap_stage:-}" ] && [ -f "$wrap_stage" ]; then
    rm -f "$wrap_stage" || echo "WARN: could not remove staged wrapper $wrap_stage"
  fi
  if [ -n "${sudo_stage:-}" ] && [ -f "$sudo_stage" ]; then
    rm -f "$sudo_stage" || echo "WARN: could not remove staged sudoers $sudo_stage"
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

  if [ "$WRAPPER_CREATED" -eq 0 ] && [ -e /usr/local/sbin/audit-readonly.sh ]; then
    echo "RACE/UNEXPECTED: wrapper exists but was not created by this run. Not deleted."
    leftover=1
  fi
  if [ "$SUDOERS_CREATED" -eq 0 ] && [ -e /etc/sudoers.d/balkan-audit ]; then
    echo "RACE/UNEXPECTED: sudoers exists but was not created by this run. Not deleted."
    leftover=1
  fi
  if [ "$GROUP_CREATED" -eq 0 ] && getent group balkan-audit >/dev/null; then
    echo "RACE/UNEXPECTED: group exists but was not created by this run. Not deleted."
    leftover=1
  fi
  if [ "$USER_CREATED" -eq 0 ] && getent passwd balkan-audit >/dev/null; then
    echo "RACE/UNEXPECTED: user exists but was not created by this run. Not deleted."
    leftover=1
  fi
  if [ "$SSHDIR_CREATED" -eq 0 ] && [ -e /home/balkan-audit/.ssh ]; then
    echo "RACE/UNEXPECTED: .ssh exists but was not created by this run. Not deleted."
    leftover=1
  fi

  if [ "$leftover" -eq 1 ]; then
    echo "ROLLBACK INCOMPLETE or RACE DETECTED. Manual verification required."
    exit 1
  fi
  echo "ROLLBACK COMPLETE. Only resources created by this run were removed."
  exit 1
}

trap rollback EXIT

# 1. Wrapper: stage in the same directory, then atomic ln (fails if target exists).
wrap_stage=$(mktemp -p /usr/local/sbin audit-readonly.stage.XXXXXX)
cat > "$wrap_stage" << 'EOS'
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
chmod 755 "$wrap_stage"
# ln without -f fails atomically if the target already exists. It does not overwrite.
ln "$wrap_stage" /usr/local/sbin/audit-readonly.sh
WRAPPER_CREATED=1
rm -f "$wrap_stage"
wrap_stage=""

# 2. sudoers: stage, validate, then atomic ln.
sudo_stage=$(mktemp -p /etc/sudoers.d balkan-audit.stage.XXXXXX)
cat > "$sudo_stage" << 'EOS'
Defaults:balkan-audit env_reset
Defaults:balkan-audit !env_keep
balkan-audit ALL=(root) NOPASSWD: /usr/local/sbin/audit-readonly.sh
EOS
chmod 440 "$sudo_stage"
visudo -cf "$sudo_stage"
ln "$sudo_stage" /etc/sudoers.d/balkan-audit
SUDOERS_CREATED=1
rm -f "$sudo_stage"
sudo_stage=""

# 3. Group and user. Commands fail if the name already exists.
groupadd balkan-audit
GROUP_CREATED=1
useradd -m -g balkan-audit -s /bin/bash balkan-audit
USER_CREATED=1
passwd -l balkan-audit

# 4. .ssh: mkdir without -p. Success means this run created the directory.
mkdir -m 700 /home/balkan-audit/.ssh
SSHDIR_CREATED=1
chown balkan-audit:balkan-audit /home/balkan-audit/.ssh
printf '%s\n' 'command="sudo -n /usr/local/sbin/audit-readonly.sh \"$SSH_ORIGINAL_COMMAND\"",restrict ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' > /home/balkan-audit/.ssh/authorized_keys
chown balkan-audit:balkan-audit /home/balkan-audit/.ssh/authorized_keys
chmod 600 /home/balkan-audit/.ssh/authorized_keys

SUCCESS=1
trap - EXIT
echo "INSTALL_OK"
```
```bash
set -euo pipefail

if pgrep -u balkan-audit >/dev/null 2>&1; then
  echo "STOP: balkan-audit has running processes. Manual approval required."
  pgrep -a -u balkan-audit || true
  exit 1
fi

if getent passwd balkan-audit >/dev/null; then
  userdel -r balkan-audit
fi
if getent group balkan-audit >/dev/null; then
  groupdel balkan-audit
fi
rm -f /usr/local/sbin/audit-readonly.sh
rm -f /etc/sudoers.d/balkan-audit

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
