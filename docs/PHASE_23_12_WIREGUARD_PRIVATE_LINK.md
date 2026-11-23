# Phase 23.12 – WireGuard private link

**Date:** 2026-11-23  
**Status:** Stopped. Production SSH denied. No changes made.

---

## Host confirmation

| Host | Hostname | IP | SSH |
|---|---|---|---|
| Gateway | ubuntu-4gb-hel1-5 | 2.29.199.6 | OK |
| Production | not reached | 2.29.195.181 | Permission denied (publickey) |

Gateway `wg0` is active at 10.10.0.2/24, listening on 51820/udp, no peer.

---

## What was not done

- No backup on production
- No WireGuard install on production
- No keys generated on production
- No peer added on the gateway
- No firewall change
- No API, Docker, database, SSH, or Nginx change
- No DNS, TLS, or allow-list

---

## Blocker

The only available keys are `id_ed25519_balkan` and `id_ed25519_dev_tests`.
Neither is authorized on 2.29.195.181.

Public key that would need to be added, or confirmation of the existing production key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122
```

Fingerprint: `SHA256:AJWuP5Bb20kDce0HROSuzketxQU23XvjnzAO7TFdir4`

---

## Rollback

Not required. No configuration was changed on either host.

---

## Constraints honored

Production not modified. Gateway peer not added. Private keys not exposed.
