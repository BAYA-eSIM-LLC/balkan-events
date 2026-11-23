# Phase 23.19 – Takeover access plan

**Date:** 2026-11-23  
**Gateway:** 2.29.199.6 — SSH as root already works.  
**Production:** 2.29.195.181 — SSH denied. WireGuard ping to 10.10.0.1 works.

## One authorization needed

Temporary root public-key on production, removed after the audit and any approved work.

Public key fingerprint: SHA256:AJWuP5Bb20kDce0HROSuzketxQU23XvjnzAO7TFdir4

One command on production as root:

```bash
mkdir -p /root/.ssh && chmod 700 /root/.ssh && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122' >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && echo KEY_ADDED
```

## After KEY_ADDED

1. Read-only production audit.
2. Backup and rollback plan.
3. Staging alignment.
4. Super Admin, MFA, RBAC completion on the branch.
5. Deploy only after a separate confirmation.
6. Remove the temporary root key and any temporary users. Confirm SSH denial.

No migrations, no database changes, no deploy without separate confirmation.
