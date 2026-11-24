# Wallet Integration Setup

Status: BLOCKED until real certificates/credentials are provided.
Structure is ready. Signing requires real credentials.

## Apple Wallet (PassKit)

### Required environment variables

| Variable | Description |
|----------|-------------|
| APPLE_PASS_CERT | Pass Type ID certificate (.pem) |
| APPLE_PASS_KEY | Private key for the certificate |
| APPLE_TEAM_ID | Apple Developer Team ID |
| APPLE_PASS_TYPE_ID | Pass Type Identifier |
| APPLE_WWDR_CERT | WWDR intermediate certificate |

### Steps (Apple Developer)

1. Log in to developer.apple.com.
2. Certificates, Identifiers & Profiles → Identifiers → Pass Type IDs.
3. Create Pass Type ID: `pass.org.balkanevents.ticket`.
4. Create certificate for the Pass Type ID.
5. Download certificate and export private key.
6. Download WWDR certificate from Apple.
7. Set environment variables on TEST Gateway.
8. Restart API container.

## Google Wallet

### Required environment variables

| Variable | Description |
|----------|-------------|
| GOOGLE_WALLET_ISSUER_ID | Issuer ID from Google Pay & Wallet Console |
| GOOGLE_WALLET_SERVICE_ACCOUNT | JSON service account key (path) |
| GOOGLE_WALLET_CLASS_ID | Event Ticket Class ID |

### Steps (Google Wallet Console)

1. Go to pay.google.com/business/console.
2. Create or select Issuer account.
3. Note the Issuer ID.
4. Create service account in Google Cloud Console.
5. Grant Wallet Object Issuer role.
6. Download JSON key.
7. Create Event Ticket Class.
8. Set environment variables on TEST Gateway.
9. Restart API container.

## Current status

Both integrations return 503 BLOCKED when credentials are missing.
Pass structure and ownership checks are implemented.
Signing is BLOCKED until real credentials are provided.

## Security

- Only ticket owner can request pass/save-url.
- Refunded tickets return 400.
- Invalid ticket status returns 400.
- QR data uses existing ticket validation format.
- Secrets are never logged or returned in API responses.
- Private keys are never committed to Git.
