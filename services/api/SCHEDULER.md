# Reservation Expiry Scheduler

## Development

```bash
export INTERNAL_API_SECRET="your-dev-secret"
export EXPIRE_INTERVAL_SECONDS=60
export INTERNAL_API_URL="http://127.0.0.1:8000"
cd services/api
python -m app.scheduler
```

## Stop / Restart

- Stop: Ctrl+C or kill the process
- Restart: re-run the same command
- Multiple instances: avoid; use a single process or lock (future improvement)

## Production (not active)

- Run as a systemd service or container
- Use a unique `INTERNAL_API_SECRET`
- Set `EXPIRE_INTERVAL_SECONDS` (recommended 30–60)
- Do not run more than one scheduler without distributed lock

## Secret rotation

1. Generate new secret
2. Update environment on API and scheduler
3. Restart both processes
4. Old secret is immediately invalid
