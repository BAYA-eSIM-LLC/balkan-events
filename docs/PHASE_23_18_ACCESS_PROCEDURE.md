# Phase 23.18 – Temporary SSH access procedure

**Date:** 2026-11-23  
**Status:** Prepared. Key not added. Waiting for fingerprint confirmation.

---

## Public key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122
```

Fingerprint: `SHA256:AJWuP5Bb20kDce0HROSuzketxQU23XvjnzAO7TFdir4`  
Type: ED25519

Confirm this fingerprint before adding the key. The private key is not shown and will not be sent.

---

## What you need to run (only if you approve)

On the production host, as root. One line. No other change.

```
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' >> /root/.ssh/authorized_keys
```

Do not open 5432 or 6379. Do not change UFW, SSH port, or Docker.

---

## What I will run after you confirm

Read-only only:

```
hostname
docker ps --format '{{.Names}} {{.Image}} {{.ID}} {{.Status}}'
docker image inspect <running-id> --format '{{.Id}}'
psql -c 'SELECT version();'
psql -c 'SELECT version_num FROM alembic_version;'
psql -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name IN ('totp_secret','mfa_enabled');"
redis-cli INFO server | head
```

No `pg_dump`. No INSERT/UPDATE/DELETE/ALTER. No `alembic upgrade`. No restart. No pull. No build.

---

## Removal after the audit

You run, or I run if still authorized:

```
sed -i '/balkan-events-deploy-20261122/d' /root/.ssh/authorized_keys
```

Then I confirm SSH is denied again.

---

## Constraints

No deploy. No service restart. No image pull or build. No migration. No firewall change. No gateway, DNS, or TLS change. No user data read.
