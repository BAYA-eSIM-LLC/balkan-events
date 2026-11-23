#!/usr/bin/env bash
# Disable the gateway without touching the existing server.
# Public web and API keep working because they never depended on this host.
set -euo pipefail
systemctl stop wg-quick@wg0 || true
systemctl stop nginx || true
echo "Gateway services stopped."
echo "Existing API and web are unaffected."
echo "To remove this VPS, destroy it in the Hetzner console."
