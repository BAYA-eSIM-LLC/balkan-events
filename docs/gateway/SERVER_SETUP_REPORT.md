# Gateway VPS – Server Setup Report

**Date:** 2026-11-23  
**Host:** 2.29.199.6 (ubuntu-4gb-hel1-5)  
**Status:** Configured. Production server not touched.

## System
- Ubuntu 24.04.5 LTS
- 4 GB RAM, 75 GB disk (2 GB used)
- Packages updated

## Installed
- WireGuard tools
- fail2ban (sshd jail active)
- Docker Engine 29.10.0
- Docker Compose v5.8.0

## SSH
- Port 22 unchanged
- Key auth works after UFW
- PasswordAuthentication left as default (not changed)

## Firewall
- UFW active
- Allow: 22/tcp, 80/tcp, 443/tcp, 51820/udp
- SSH verified after enable

## Directories
- /opt/balkan-gateway/{nginx,wireguard,monitoring}
