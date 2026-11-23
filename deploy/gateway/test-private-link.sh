#!/usr/bin/env bash
# Run on the gateway after WireGuard is up.
# Confirms the private path to the existing API. Does not change DNS.
set -euo pipefail
API_IP="${1:-10.10.0.1}"
echo "Pinging $API_IP ..."
ping -c 3 -W 2 "$API_IP" || { echo "WireGuard path down"; exit 1; }
echo "Checking API on private IP ..."
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" "http://${API_IP}:8000/health" || \
  curl -fsS -o /dev/null -w "HTTP %{http_code}\n" "http://${API_IP}:8000/" || \
  echo "API not responding on private IP yet"
echo "Done. Do not apply the /admin allow-list until this succeeds."
