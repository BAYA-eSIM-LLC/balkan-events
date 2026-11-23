#!/usr/bin/env bash
# Run MFA integration tests against a throwaway Postgres 16.
# Requires Docker. Does not touch production.
set -euo pipefail
NAME="mfa-test-pg"
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" \
  -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=mfa_test \
  -p 55432:5432 postgres:16-alpine
for i in $(seq 1 30); do
  docker exec "$NAME" pg_isready -U test && break
  sleep 1
done
export DATABASE_URL="postgresql+asyncpg://test:test@localhost:55432/mfa_test"
export MFA_ENCRYPTION_KEY="$(python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"
cd "$(dirname "$0")/../../services/api"
alembic upgrade head
python -m pytest tests/test_mfa.py tests/test_auth.py -q --tb=short
docker rm -f "$NAME"
echo "Integration run complete"
