# Stripe TEST MODE Setup (TEST Gateway only)

## Secure key entry (do not paste in chat)

On the TEST Gateway, a one-time script is ready:

```bash
ssh root@2.29.199.6
cd /opt/balkan-admin-test
./setup-stripe-test.sh
```

The script:
- Prompts for `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (input hidden)
- Rejects anything that is not `pk_test_`, `sk_test_`, `whsec_`
- Writes `/opt/balkan-admin-test/.env.stripe` with mode 600
- Restarts only the API container
- Prints only key prefixes for confirmation

## Webhook endpoint

Register in Stripe Dashboard (TEST mode) → Developers → Webhooks:

```
https://admin.balkanevents.org/api/payments/webhook
```

Events the backend handles:
- `checkout.session.completed` — order → PAID, issues QR tickets, ledger, email
- `checkout.session.expired` — reserved order → EXPIRED
- `payment_intent.payment_failed` — payment → FAILED
- `charge.refunded` / `refund.updated` — sync refund status

## After keys are set

1. Confirm API sees keys (prefix only):
   ```bash
   docker exec balkan-admin-test-api-1 printenv STRIPE_SECRET_KEY | cut -c1-12
   ```
2. Create a reserved order, then `POST /payments/checkout/{order_id}` should return a Checkout Session URL (not 503).
3. Complete payment with Stripe test card `4242 4242 4242 4242`.
4. Verify webhook delivery and ticket issuance.

## Do not
- Use live keys
- Commit `.env.stripe`
- Point webhook at production
