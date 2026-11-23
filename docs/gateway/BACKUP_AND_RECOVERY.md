# Backup and recovery

- No database on this host
- Back up /etc/wireguard and /etc/nginx when Nginx is added
- Rollback: systemctl stop wg-quick@wg0; ufw disable (only if locked out via console)
- Production server is independent and was not modified
