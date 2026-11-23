# Security report

**Status:** No changes applied. Access was denied.

Planned after access, in order:

1. Confirm SSH works with key.
2. Install fail2ban.
3. Keep SSH port 22 and key auth unchanged.
4. Only then enable UFW: 22, 80, 443, 51820/udp.
5. Verify SSH still works before closing the session.

Firewall will not be enabled until SSH is confirmed.
