# Phase 23.3 – Gateway Security Audit

**Date:** 2026-11-23  
**Host:** 2.29.199.6  
**Status:** Validated. Production not contacted.

## Checks

| Item | Result |
|---|---|
| WireGuard enabled on boot | yes |
| WireGuard active via systemd | yes (restarted under systemd) |
| Peer to production | none |
| UFW active, deny incoming | yes |
| Allowed ports | 22, 80, 443, 51820/udp |
| Listening ports | 22/tcp, 51820/udp only |
| fail2ban sshd | active, 0 bans |
| Docker | 29.10.0, no containers |
| SSH key perms | 700 dir, 600 authorized_keys |
| WireGuard key perms | 700 dir, 600 all keys |
| SSH after changes | confirmed |

## Fixes applied
- WireGuard brought under systemd (`systemctl start wg-quick@wg0`)
- Duplicate public key file tightened to 600
- Backup script `/usr/local/bin/gateway-backup.sh` + cron 03:00
- Monitor `/usr/local/bin/gateway-monitor.sh` + cron every 5 min
- Restore test: archive extracted, `wg0.conf` present

## Findings
1. Duplicate key files `gateway_private.key` / `gateway_public.key` exist beside `privatekey` / `publickey`. Permissions now 600. Safe to remove the unused pair later.
2. Ports 80 and 443 are allowed but nothing listens. Harmless until Nginx is added.
3. Backups are local only. Off-site copy is not configured.
4. No Nginx, no peer, no DNS change.

## Recovery test
Backup created, extracted to `/tmp/gw-restore-test`, config file present, temp dir removed. Live config not overwritten.

## Recommendations
- Do not add a production peer until a separate approval.
- Add Nginx only after DNS is approved.
- Copy `/var/backups/gateway` off-site once a target exists.
- Remove unused `gateway_*.key` files after confirming they are duplicates.

## Constraints honored
Only 2.29.199.6. No peer to 2.29.195.181. No DNS. No app containers. SSH keys not replaced. No secrets disclosed.
