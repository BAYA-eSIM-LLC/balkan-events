# Isolated development environment requirements

This sandbox cannot install Docker or PostgreSQL (setgroups denied).
Do not install these on the production server 2.29.195.181.

## Minimum host

- Ubuntu 24.04
- Docker Engine 24+ and Compose v2
- 2 vCPU, 4 GB RAM, 20 GB free disk
- Outbound network for image pulls
- Not the production VPS
- Not the gateway VPS until a separate approval

## Services the test script starts

- postgres:16-alpine on host port 55432
- Database `mfa_test`, user `test`, password `test`
- Throwaway container, removed at the end

## Environment

```
DATABASE_URL=postgresql+asyncpg://test:test@localhost:55432/mfa_test
MFA_ENCRYPTION_KEY=<generated at runtime, Fernet>
REDIS_URL=redis://localhost:6379/0   # optional, for multi-process rate limit
```

## Command

```
bash deploy/gateway/mfa-integration-test.sh
```

## Expected

- Alembic upgrade head through 025
- pytest on test_mfa.py and test_auth.py
- Container removed
- No production data used
