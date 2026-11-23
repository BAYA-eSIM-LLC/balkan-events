#!/usr/bin/env bash
# Static validation of gateway config. Does not start services or contact production.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
fail=0
grep -q "proxy_pass http://admin_api/admin/" "$ROOT/nginx.conf" || { echo "missing admin proxy"; fail=1; }
grep -q "proxy_set_header X-Forwarded-Proto" "$ROOT/nginx.conf" || { echo "missing proto header"; fail=1; }
grep -q "profiles:" "$ROOT/docker-compose.yml" || { echo "compose not profile-gated"; fail=1; }
grep -q "10.10.0.1:8000" "$ROOT/nginx.conf" || { echo "upstream not private"; fail=1; }
if grep -q "Authorization" "$ROOT/nginx.conf"; then
  echo "Authorization header explicit"
else
  echo "NOTE: Authorization not explicit; nginx passes it by default"
fi
if [[ $fail -eq 0 ]]; then
  echo "STATIC_VALIDATION_OK"
else
  echo "STATIC_VALIDATION_FAILED"
  exit 1
fi
