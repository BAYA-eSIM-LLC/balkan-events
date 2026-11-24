# Stripe TEST MODE Setup (TEST Gateway only)

## Current status
- Implementation: `services/api/app/routers/payments.py` (Checkout Session, webhook with signature verification, StripeEvent idempotency, refund, ledger).
- Env vars expected (from `app/config.py`):
  - `STRIPE_SECRET_KEY` (sk_test_...)
  - `STRIPE_WEBHOOK_SECRET` (whsec_...)
  - `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
  - `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL`
- TEST Gateway currently has **no Stripe keys**. Checkout returns 503.

## What is missing to run end-to-end
1. A Stripe **test mode** account (Dashboard → Developers → API keys).
2. Restricted or secret test key (`sk_test_...`) set only on the TEST Gateway API container.
3. Webhook endpoint registered in Stripe Dashboard pointing at the TEST Gateway public URL for `/payments/webhook` (or internal path used by the stack).
4. Webhook signing secret (`whsec_...`) set on the API container.
5. Success/cancel URLs that resolve to the TEST frontend.

## Secure setup (do not paste secrets in chat)
1. On the TEST Gateway host, create a file readable only by root:
   ```bash
   sudo install -m 600 /dev/null /opt/balkan-admin-test/.env.stripe
   sudo nano /opt/balkan-admin-test/.env.stripe
   ```
2. Put only the test keys:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Reference them in `docker-compose.test.yml` under the `api` service `env_file:` (or `environment:` with variable substitution).
4. Restart only the API container.
5. Confirm with `curl` that `/payments/checkout/{order_id}` no longer returns 503.

## Webhook events the code handles
- `checkout.session.completed` → marks order PAID, issues tickets, writes ledger, queues email
- `checkout.session.expired` → expires reserved order
- `payment_intent.payment_failed` → marks payment failed
- `charge.refunded` / `refund.updated` → syncs refund status

## Idempotency
`StripeEvent.event_id` is unique. Duplicate webhook deliveries return `already_processed` without re-issuing tickets.

## Refund
`POST /payments/refund` exists and is role-protected (SUPERADMIN/ADMIN/FINANCE_ADMIN). It calls Stripe Refund.create and writes a Refund row. Requires a completed Payment with `provider_id`.

## Do not
- Use live keys (`sk_live_`, `pk_live_`).
- Commit any key to the repository.
- Point the webhook at production.
