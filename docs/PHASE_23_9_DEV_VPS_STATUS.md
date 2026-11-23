# Phase 23.9 – DEV VPS status

**Date:** 2026-11-23  
**Status:** Blocked on Hetzner credentials. No server created.

## What was done

- Ed25519 key `balkan-dev-tests` generated locally
- Public key ready to paste at order time
- Private key stays on this host only

Public key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGVFy8F2JOI7g3A2zpmrXoc5Nf8Z79HXFcTLsLnK49ab balkan-dev-tests
```

Fingerprint: `SHA256:hLACekI2pi09SrmGQJ1pcNAjnHixCpb5slGnSOsBcGc`

## Blocker

No Hetzner API token in the environment. `hcloud` is not installed.
GitHub Actions secrets are not readable (403).
I cannot order a CX22 without a token or a manual order.

## How to unblock

Option A — you order it:
1. Hetzner Cloud → Add Server
2. Location Helsinki, Ubuntu 24.04, CX22
3. Name `balkan-dev-tests`
4. Paste the public key above
5. Send me only the public IP

Option B — API token:
Create a project token with permission to create and delete servers in a non-production project.
Do not send it in chat if you can set it as `HCLOUD_TOKEN` in this environment.

## Not done

- No VPS created
- No Docker install
- No tests run
- No contact with 2.29.195.181 or 2.29.199.6
