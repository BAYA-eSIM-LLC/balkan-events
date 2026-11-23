# Super Admin MFA recovery

Do not enforce MFA until the Postgres 16 integration suite has passed.

## Normal recovery
1. Admin logs in and receives `mfa_token`.
2. Admin submits a one-time recovery code to `POST /auth/mfa/confirm`.
3. Code is marked used. It cannot be reused.

## Lost authenticator and recovery codes
1. A SUPERADMIN with database access runs a one-off SQL update:
   `UPDATE users SET mfa_enabled = false WHERE email = 'admin@balkanevents.org';`
2. Admin logs in without MFA, runs `/auth/mfa/setup`, stores the new recovery codes offline, then `/auth/mfa/enable`.
3. This SQL step is a break-glass action. Record it in the audit log manually.

## Key loss
If `MFA_ENCRYPTION_KEY` is lost, existing TOTP secrets cannot be decrypted.
Disable MFA for affected admins as above and re-enroll.
