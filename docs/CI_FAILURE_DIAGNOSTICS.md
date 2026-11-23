# CI Failure Diagnostics – super-admin-dashboard

**Date:** 2026-11-23  
**Branch:** super-admin-dashboard  
**Investigated runs:** 45131550016, 45131529527, 45131362475

## Findings

1. **All three runs fail at the same step:** `Run tests` (pytest).
2. **Migrations succeed:** the `alembic upgrade head` step completes before the test step.
3. **App import is clean:** local `from app.main import app` succeeds after installing requirements.
4. **No useful annotations:** only "Process completed with exit code 1."
5. **Logs and artifacts are inaccessible:**
   - Job logs endpoint returns 403 (admin rights required).
   - Artifact `test-results` exists but download returns 401 (authentication required).
6. **Local reproduction blocked:** sandbox cannot install/start PostgreSQL (apt setgroups restrictions).

## Likely area

The failures began after Phase 12/13 changes (PlatformSettings, scanner ScanLog, new routers). The existing `test_double_qr_scan` in `tests/test_ticketing_integration.py` exercises `/scanner/validate` and expects VALID then ALREADY_USED. The current implementation still does that under `FOR UPDATE`, but a session/commit interaction with the new ScanLog write is the most probable source of a test failure.

## What was not done

- No tests were deleted or weakened.
- No new features were added.
- No production changes.

## Required next step

Repository owner (or a token with `actions:read`) must download the job log or the `test-results` artifact from run 45131550016 to obtain the exact failing test name and traceback. Once that is available, a targeted fix can be applied.

## Constraints respected

Only `super-admin-dashboard`. No main merge, no deploy, no production DB, no Stripe changes.
