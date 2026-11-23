# Phase 7.2 – Stripe Real TEST MODE Validation & Payment Security

**Branch:** super-admin-dashboard  
**Status:** Code hardened and ready for real TEST MODE validation  
**Constraints respected:** TEST MODE only, no live keys, no Connect, no real charges, no production deploy, no main merge.

## 1. Connecting Real Stripe TEST MODE Account

Set these environment variables **only on the server / local**. Never commit them.

```bash
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export STRIPE_PUBLISHABLE_KEY=pk_test_...
export PLATFORM_FEE_PERCENT=5.0
export STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success
export STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel
```

### Stripe CLI for webhook testing

```bash
stripe login
stripe listen --forward-to localhost:8000/payments/webhook
# Use the printed whsec_... as STRIPE_WEBHOOK_SECRET
```

## 2. Checkout Security (implemented)

- Backend loads order and amount **only from database**.
- Ownership check: user can pay only own order.
- Status check: only `reserved` orders can create Checkout Session.
- Expired / cancelled / paid / mismatched orders are rejected.
- Frontend no longer trusts `amount`, `qty`, `event` from URL – it fetches real status from `/payments/status/{id}`.
- Amount mismatch in webhook sets `payment_mismatch` and does not issue tickets.
- Checkout Session expires after 30 minutes.

## 3. Real TEST MODE Transactions to Perform

Use test cards from Stripe docs:

| Scenario              | Card                     | Expected Result                  |
|-----------------------|--------------------------|----------------------------------|
| Success               | 4242 4242 4242 4242      | Order → paid, QR issued, ledger, email queued |
| Decline               | 4000 0000 0000 0002      | payment_intent.payment_failed, no tickets |
| Insufficient funds    | 4000 0000 0000 9995      | Failed                           |
| Session expiry        | Let session expire       | order status → expired            |
| Repeated webhook      | Replay same event        | already_processed, no double QR / ledger |
| Late webhook          | After inventory released | payment_late, no tickets         |
| Full refund           | POST /payments/refund    | Refund record + ledger entry     |
| Partial refund        | amount < remaining       | Partial ledger                   |
| Payment after expiry  | Try checkout on expired  | 400 Order is not payable         |

## 4. Email

- Emails are always queued in `email_logs` with idempotency_key.
- Double-send is prevented.
- Optional real SMTP via:

```bash
export SMTP_HOST=smtp.example.com
export SMTP_PORT=587
export SMTP_USER=...
export SMTP_PASSWORD=...
export SMTP_FROM=noreply@balkan-events.test
```

**Do not send real customer emails during validation.** Leave SMTP empty or use a test inbox.

## 5. Finance

- Gross = order.total_amount
- Platform fee = 5% (configurable)
- Organizer net = gross - platform_fee
- Stripe fee is stored **only when retrieved** from BalanceTransaction (never invented).
- Refunds create negative ledger entries with unique idempotency_key.
- No double booking thanks to StripeEvent and ledger idempotency.

## 6. Proofs Required from Owner (real TEST MODE)

Please attach after running the tests:

- Screenshot of successful Checkout Session (Stripe Dashboard)
- Webhook delivery log (Stripe CLI or Dashboard)
- Database proof of QR ticket issued (`tickets` table)
- Refund proof (Stripe + local `refunds` + ledger)
- PostgreSQL 16 CI results (already green on previous commits)

## Remaining Issues / Next Steps

- Real TEST MODE keys and Stripe CLI run must be executed by the project owner (keys never leave the owner's environment).
- SMTP is optional and off by default.
- No Stripe Connect / payouts (by design).
- CI uses dummy keys and mocks; full end-to-end requires local Stripe CLI.

**Phase 7.2 code changes are complete and committed to `super-admin-dashboard`. Waiting for owner approval after real TEST MODE validation.**
