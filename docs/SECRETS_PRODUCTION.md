# Secrets management for production

## MFA_ENCRYPTION_KEY
- Fernet key used to encrypt `users.totp_secret` at rest.
- Must be set in the production environment (Docker secret, systemd EnvironmentFile with mode 600, or orchestrator secret).
- Never commit the key. Never log it.
- Rotation requires re-encrypting existing secrets (not automated).

## TOTP and recovery codes
- TOTP secret is encrypted with Fernet before storage.
- Recovery codes are stored only as hashes (`hash_code`).
- Plain recovery codes are returned once at setup/regenerate and must not be logged.

## Checks performed
- No `sk_live`, `sk_test`, or real Fernet keys are present in the repository.
- Frontend bundle does not receive `STRIPE_SECRET_KEY` or `MFA_ENCRYPTION_KEY`.
- Application logs do not print secrets (verified by code review of auth and payments routers).

## Production checklist
- [ ] MFA_ENCRYPTION_KEY set via secret store
- [ ] STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET set only on payment workers
- [ ] JWT SECRET_KEY different from TEST
- [ ] Database credentials not in compose files committed to git
- [ ] Audit log retention policy defined
