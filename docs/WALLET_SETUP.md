# Wallet Integration Setup

Status: BLOCKED until real certificates/credentials are provided.

## Apple Wallet (PassKit)

Required environment variables:

| Variable | Description |
|----------|-------------|
| APPLE_PASS_CERT | Pass Type ID certificate (.pem) |
| APPLE_PASS_KEY | Private key for the certificate |
| APPLE_TEAM_ID | Apple Developer Team ID |
| APPLE_PASS_TYPE_ID | Pass Type Identifier (e.g. pass.org.balkanevents.ticket) |
| APPLE_WWDR_CERT | WWDR intermediate certificate |

Steps:
1. Create Pass Type ID in Apple Developer portal.
2. Generate certificate and private key.
3. Download WWDR certificate.
4. Set environment variables on TEST Gateway.
5. Restart API container.

## Google Wallet

Required environment variables:

| Variable | Description |
|----------|-------------|
| GOOGLE_WALLET_ISSUER_ID | Issuer ID from Google Pay & Wallet Console |
| GOOGLE_WALLET_SERVICE_ACCOUNT | JSON service account key (path or content) |
| GOOGLE_WALLET_CLASS_ID | Event Ticket Class ID |

Steps:
1. Create Issuer account in Google Pay & Wallet Console.
2. Create service account with Wallet Object Issuer role.
3. Create Event Ticket Class.
4. Set environment variables on TEST Gateway.
5. Restart API container.

## Current status

Both integrations return 503 BLOCKED when credentials are missing.
Frontend shows wallet buttons only when `/wallets/status` reports `configured: true`.

## Security

- Only ticket owner can request pass/save-url.
- Refunded tickets return 400.
- QR data uses existing ticket validation format.
- Secrets are never logged or returned in API responses.
