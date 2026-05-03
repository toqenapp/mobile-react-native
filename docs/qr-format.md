# Mobile QR Handling

This page documents mobile parser behavior for Toqen.app QR payloads.

## Current Mobile Parser Shape

The QR payload contains public request lookup data. It does not contain a reusable credential or private signing secret. The approval challenge is resolved through Toqen.app services before signing.

The mobile client accepts:

```text
toqenapp://auth?request_id=<request_id>&nonce=<nonce>&expires=<unix_ts>&service=<service_name>
```

## Parser Responsibilities

The mobile parser rejects:

- unsupported schemes
- missing required fields
- non-numeric expiration values
- malformed URI input
- values beyond mobile parser length limits

Parser success does not grant access. It only allows the app to ask Toqen.app services for current request context.

## Security Rules

The mobile app must not treat QR data as a credential. QR data is public request context, not proof of authorization.
