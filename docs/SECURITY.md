# Security Audit – CORE 1H

## Findings

| Severity | Issue | Status |
|----------|-------|--------|
| MEDIUM | Tokens stored in localStorage (XSS exposure) | Known – planned httpOnly cookies |
| LOW | No rate limiting on auth endpoints | Known – add later |
| LOW | CORS allows all origins (`*`) | Acceptable for current phase |
| INFO | No CSRF tokens (JWT in Authorization header mitigates) | OK |
| INFO | LedgerEntry immutable via DB trigger | OK |
| INFO | debug_token not exposed | OK |

## Recommendations

1. Move refresh tokens to httpOnly secure cookies before production.
2. Add rate limiting on `/auth/login` and `/auth/register`.
3. Restrict CORS to known origins in production.
4. Add Content-Security-Policy headers.

## No CRITICAL or HIGH issues found in current review.
