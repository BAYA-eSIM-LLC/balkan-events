# Safe production web swap – verification required first

Do NOT run any deploy until the discovery commands below have been run
and the volume/network/project names have been confirmed.

## Discovery commands (run on the production server)

```bash
echo "=== Compose projects ==="
docker compose ls

echo "=== Running containers ==="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo "=== Volumes ==="
docker volume ls
docker volume ls -q | grep -i postgres || true

echo "=== Networks ==="
docker network ls

echo "=== Port usage ==="
ss -tlnp | grep -E ':80|:443' || netstat -tlnp | grep -E ':80|:443' || true

echo "=== Current compose project name ==="
# Look for the directory where the existing compose was started
find / -name "docker-compose*.yml" -type f 2>/dev/null | head -20
```

Record the exact values for:
- COMPOSE_PROJECT
- POSTGRES_CONTAINER
- POSTGRES_VOLUME
- NETWORK
- Existing nginx/reverse-proxy container or host process
