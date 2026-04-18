# Flows

This document describes the main user and system flows in the Toqen Mobile application.

The flows are built around real-time authorization using device-bound cryptographic verification.

---

## Overview

The system supports several core flows:

- QR-based authorization
- Manual code authorization
- Mobile-initiated authorization
- Access confirmation (approve / deny)
- Services synchronization

Each flow follows the same principle:
authorization is only completed after explicit user action and cryptographic verification.

---

# 1. QR Authorization Flow

This is the primary access flow.

## Steps

1. User opens a service (e.g. website)
2. Service generates an authorization request
3. QR code is displayed
4. User opens Toqen Mobile
5. User scans QR
6. App extracts:
   - requestId
   - nonce
   - expires
   - service
7. App sends:
   POST /api/auth/qr/mobile/scanned
8. Server returns:
   - challenge
   - service information
   - expiration
9. App displays:
   - service name
   - location
   - description
10. User selects:

- approve
- deny

11. If approve:

- app signs challenge using device private key
- app sends POST /api/auth/qr/mobile/confirm with challengeSignature

12. If deny:

- app sends POST /api/auth/qr/mobile/confirm without a biometric signature step
- current client payload uses an empty challengeSignature value

13. Server verifies the request according to the decision
14. Server finalizes request
15. Access is granted or denied

---

## Key Properties

- QR does not grant access on its own
- User must explicitly approve
- Device must sign challenge
- Server must verify signature

---

# 2. Manual Code Flow

Fallback flow when QR is unavailable.

## Steps

1. User opens service
2. Service shows manual code
3. User opens Toqen Mobile
4. User enters code
5. App sends:
   POST /api/auth/qr/mobile/manual-code
6. Server returns:
   - request context
   - challenge
7. App displays request
8. User approves or denies
9. If approve:
   - app signs challenge
   - app sends POST /api/auth/qr/mobile/confirm with challengeSignature
10. If deny:
    - app sends POST /api/auth/qr/mobile/confirm without a biometric signature step
    - current client payload uses an empty challengeSignature value
11. Server verifies
12. Access is granted or denied

---

## Key Properties

- identical to QR flow after initialization
- manual input replaces QR scan
- same security guarantees

---

# 3. Mobile Authorization Flow

Used when the flow is initiated directly from the mobile app or mobile browser.

## Steps

1. App initiates request:
   POST /api/mobile/auth/start
2. Server returns:
   - auth_request_id
   - challenge
   - finish_token
3. App displays request context
4. User approves or denies
5. App signs challenge
6. App sends:
   POST /api/mobile/auth/confirm
7. Server verifies signature
8. Server responds with:
   - launch_mode
   - launch_url
9. App redirects or launches target

---

## Launch Modes

web:

- open URL in browser

app:

- open deep link or application

---

## Key Properties

- mobile-first flow
- does not require QR
- still uses challenge + signature
- still requires user confirmation

---

# 4. Access Confirmation Flow

This flow represents the decision point.

## Steps

1. App receives request context
2. App displays:
   - service
   - location
   - description
3. User decides:
   - approve
   - deny
4. If approve:
   - challenge is signed
   - confirm request sent
5. If deny:
   - confirm request is sent without a biometric signature prompt
   - current client payload uses an empty challengeSignature value
6. Server processes decision

---

## Key Properties

- no silent approvals
- user always involved
- decision is explicit
- approval is cryptographically bound

---

# 5. Services Sync Flow

Keeps local service catalog up to date.

## Steps

1. App sends:
   POST /api/mobile/services/sync
   with:
   - currentVersion
   - cursor
2. Server responds with:
   - upserts
   - deletes
   - nextCursor
3. App updates local storage
4. If hasMore = true:
   - repeat request with nextCursor

---

## Key Properties

- incremental updates
- version-based sync
- cursor-based pagination

---

# 6. Device Binding Flow

Occurs implicitly during authorization.

## Steps

1. Device generates key pair
2. Public key is sent to backend
3. Backend associates key with device
4. Future requests are signed using private key

---

## Key Properties

- device identity is cryptographic
- no passwords required
- identity cannot be transferred without key

---

# 7. Failure Flow

System must handle failures safely.

## Possible failures

- expired request
- invalid requestId
- invalid nonce
- invalid signature
- network timeout
- server error
- user denial

## Behavior

- no access granted
- clear error shown to user
- no undefined states

---

# 8. Flow Guarantees

Across all flows, the system guarantees:

- access requires explicit user action
- access requires valid device signature
- requests are short-lived
- requests are single-use
- backend validates all decisions

---

# 9. Flow Relationships

All flows converge to the same core pattern:

request → context → user decision → signature → verification → result

This ensures consistency and predictability across the system.

---

# Summary

The Toqen flow system is designed to:

- unify different entry points (QR, manual, mobile)
- maintain consistent security guarantees
- enforce explicit user authorization
- bind access to a specific device

Building continues.
