#!/usr/bin/env bash
# Simple local health check. Wire into cron.
set -euo pipefail
LOG=/var/log/gateway-monitor.log
{
  date -Is
  systemctl is-active wg-quick@wg0 || echo "wireguard down"
  systemctl is-active nginx || echo "nginx down"
  ping -c 1 -W 2 10.10.0.1 >/dev/null && echo "peer ok" || echo "peer unreachable"
} >> "$LOG" 2>&1
# Keep 7 days
find /var/log -name gateway-monitor.log -mtime +7 -delete || true
