# Mobile Threat Model

This document covers threats visible at the mobile-client layer.

## Assets

The mobile client helps protect:

- user approval intent
- device-bound private key material
- local device identity state
- local presentation cache
- request context displayed to the user

## Threats

### Malformed QR Payload

The app may receive malformed or unsupported QR input.

Mitigation: reject invalid parser input and require server-side resolution before showing approval.

### User Misapproval

The user may approve the wrong request.

Mitigation: show clear service and request context before approval. This risk cannot be eliminated by the mobile client alone.

### Device Compromise

A compromised device may weaken key protection or allow unauthorized user actions.

Mitigation: use secure key storage and local authentication, including biometrics or device credentials where supported and enabled. Residual risk remains.

### Local Cache Tampering

Local access-pass or service cache may be stale or modified.

Mitigation: do not treat local cache as authorization authority.

### Response Manipulation

The client may receive manipulated responses.

Mitigation: validate schemas and verify signed response envelopes where required by the mobile client.
