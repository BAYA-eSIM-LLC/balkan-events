#!/usr/bin/env bash
# Restore the latest dump into a throwaway database to verify the backup.
# Does not touch the live database.
set -euo pipefail
DUMP="${1:?path to .sql.gz}"
docker run --rm -d --name pg-restore-test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=restore_test postgres:16-alpine
sleep 5
gunzip -c "$DUMP" | docker exec -i pg-restore-test psql -U postgres restore_test
docker exec pg-restore-test psql -U postgres -d restore_test -c '\dt' | head
docker rm -f pg-restore-test
echo "Restore test complete. Throwaway container removed."
