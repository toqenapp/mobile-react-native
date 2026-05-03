# Mobile Flows

This document covers Toqen.app mobile-client behavior.

## QR Scan Flow

1. The user scans a Toqen.app QR payload.
2. The app parses public QR fields.
3. The app resolves request context through Toqen.app services.
4. The app shows request context.
5. The user approves or denies.
6. Approval signs a challenge through the device-key module.
7. The app sends the decision through the mobile-facing client contract.

## Manual Code Flow

Manual code entry is a mobile fallback when QR scanning is unavailable. Once the request is resolved, the confirmation behavior is the same as QR.

## Mobile-Initiated Flow

The app can start or continue mobile authorization from service access actions. The user reviews context and approval requires device-bound cryptographic authorization.

## Failure Behavior

The app should fail closed on malformed QR input, missing request context, local authentication failure, user denial, network failure, invalid response schema, or invalid signed response where signature verification is required.
