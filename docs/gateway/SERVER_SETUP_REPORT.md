# Gateway VPS – Server Setup Report

**Date:** 2026-11-23  
**Target:** 2.29.199.6 (ubuntu-4gb-hel1-5)  
**Status:** Access blocked. No changes made.

## Access test

```
ssh -i ~/.ssh/id_ed25519_balkan root@2.29.199.6
→ Permission denied (publickey,password)
```

Available public key (not authorized on this host):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDE5VVU3z967V7OVifNM9XF3k3Kf0t2RbqHercTyIoGM balkan-events-deploy-20261122
SHA256:AJWuP5Bb20kDce0HROSuzketxQU23XvjnzAO7TFdir4
```

## What was not done

- No package updates
- No SSH config changes
- No firewall
- No WireGuard
- No Docker
- No connection to 2.29.195.181

## To unblock

Add the public key above to `/root/.ssh/authorized_keys` on 2.29.199.6 via the Hetzner console, or confirm which key was installed at order time.
