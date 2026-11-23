#!/usr/bin/env bash
# Deploy Super Admin stack. Run as beadmin after bootstrap.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -f .env.admin ]]; then
  echo "Create .env.admin from .env.admin.example first" >&2
  exit 1
fi

docker compose -f docker-compose.admin.yml up -d --build
docker compose -f docker-compose.admin.yml exec -T api alembic upgrade head
echo "Stack up. Create Super Admin with:"
echo "docker compose -f docker-compose.admin.yml exec api python -m scripts.create_superadmin"
