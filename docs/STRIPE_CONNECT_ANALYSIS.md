# Stripe Connect Analysis – BALKAN EVENTS

## Current State (Phase 7)

- Platform collects all payments via Stripe Checkout (TEST MODE).
- Platform fee (configurable, default 5%) is recorded in LedgerEntry as a negative amount against the organizer.
- Net amount is recorded as `organizer_net`.
- No real payouts. No bank accounts connected. No Connect accounts created.

## Why Stripe Connect May Be Needed Later

For a multi-organizer marketplace, Stripe Connect allows:

1. **Separate balances** – each organizer has their own Stripe account (or Express/Custom account).
2. **Automatic splits** – platform fee deducted at charge time; remainder goes to organizer.
3. **Regulatory compliance** – organizer KYC, tax forms (1099 / local equivalents) handled by Stripe.
4. **Payouts** – organizer can receive funds to their own bank without platform acting as intermediary for the full amount.

## Recommended Future Model (not implemented)

| Component | Recommendation |
|-----------|----------------|
| Account type | Stripe Connect Express (easiest onboarding) or Custom (full control) |
| Charge type | Destination charges or Separate charges and transfers |
| Platform fee | `application_fee_amount` on the PaymentIntent |
| Currency | EUR (current), expand later |
| Payout schedule | Manual or daily/weekly via Stripe |
| Onboarding | Stripe-hosted or embedded onboarding flow |

## Risks of Implementing Connect Now

- Requires real organizer identity verification.
- Additional compliance (PSD2, local money transmitter rules if applicable).
- More complex webhook surface (account.updated, payout.paid, etc.).
- Not needed while platform holds funds and records net liability in the ledger.

## Decision

**Do not implement Stripe Connect in Phase 7.**

Document the liability in the ledger (`organizer_net` entries). Future phase can migrate to Connect once volume and legal requirements justify it. No real bank accounts or payouts will be activated without separate approval.

## Commission Model (current)

- Gross = order.total_amount
- Platform fee = gross * PLATFORM_FEE_PERCENT / 100
- Stripe fee = only recorded when Stripe returns the actual balance transaction fee (never invented)
- Net to organizer = gross - platform fee - (stripe fee if known)

All amounts are stored in LedgerEntry with unique idempotency keys to prevent double booking.
