#!/usr/bin/env bash
# Firewall for the gateway VPS. Idempotent.
set -euo pipefail
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 51820/udp comment 'WireGuard'
ufw --force enable
ufw status verbose
