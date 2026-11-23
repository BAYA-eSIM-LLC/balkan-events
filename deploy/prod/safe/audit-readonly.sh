#!/bin/bash
# Forced command for temporary audit. Read-only only.
set -euo pipefail
case "${SSH_ORIGINAL_COMMAND:-}" in
  "hostname")
    hostname
    ;;
  "docker-ps")
    docker ps --format '{{.Names}} {{.Image}} {{.ID}} {{.Status}}'
    ;;
  "docker-inspect")
    # Expect image or container id as second word via env? Keep simple: inspect running containers only.
    docker ps -q | while read -r id; do
      docker image inspect "$(docker inspect -f '{{.Image}}' "$id")" --format '{{.Id}} {{.RepoTags}}' || true
    done
    ;;
  "pg-version")
    docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -c 'SELECT version();' || \
    sudo -u postgres psql -c 'SELECT version();'
    ;;
  "alembic")
    docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -d balkan -c 'SELECT version_num FROM alembic_version;' || \
    sudo -u postgres psql -d balkan -c 'SELECT version_num FROM alembic_version;'
    ;;
  "mfa-cols")
    docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -d balkan -c "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name='users' AND column_name IN ('totp_secret','mfa_enabled');" || true
    ;;
  "schema-tables")
    docker exec "$(docker ps -qf name=postgres | head -1)" psql -U postgres -d balkan -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;" || true
    ;;
  "redis-info")
    docker exec "$(docker ps -qf name=redis | head -1)" redis-cli INFO server | head -15 || true
    ;;
  *)
    echo "Denied. Allowed: hostname docker-ps docker-inspect pg-version alembic mfa-cols schema-tables redis-info"
    exit 1
    ;;
esac
