# Security Model

This document describes the security model of the Toqen Mobile application and its interaction with backend services.

The system is designed around access-first authorization, where each access request is verified in real time using device-bound cryptographic proofs.

---

## Core Security Principles

- No long-lived authentication secrets
- No static or reusable authorization tokens
- Device-bound identity
- Explicit user approval
- Short-lived authorization context
- Cryptographic verification of every request

---

## Threat Model Overview

The system assumes that:

- the network is untrusted
- QR codes can be intercepted or shared
- requests may be replayed
- devices may be compromised
- attackers may attempt to automate flows

The system is designed to remain secure under these conditions.

---

## Device Identity

Each device generates a cryptographic key pair:

- private key (stored locally, never leaves the device)
- public key (registered with the backend)

Properties:

- private key is used to sign authorization challenges
- public key is used by the server to verify signatures
- keys are unique per device instance

---

## Authorization Model

Authorization is based on a challenge-response mechanism.

Flow:

1. server generates a short-lived challenge
2. challenge is delivered to the mobile app
3. user explicitly approves or denies the request
4. device signs the challenge using private key
5. server verifies the signature
6. access is granted or denied

No authorization decision is made without a valid signature.

---

## Challenge Properties

Challenges must be:

- unique per request
- short-lived (time-limited)
- bound to requestId and nonce
- non-reusable

This ensures that:

- replay attacks are prevented
- intercepted challenges cannot be reused
- each authorization is independent

---

## QR Security Model

QR codes are designed to be safe even if:

- captured via screenshot
- shared between users
- observed by third parties

QR contains:

- request identifier
- nonce
- metadata (service, optional context)

QR does NOT contain:

- secrets
- tokens
- credentials

Security guarantees:

- QR alone is insufficient for authorization
- only a valid device signature can complete the flow

---

## Replay Protection

Replay attacks are mitigated by:

- short-lived challenges
- nonce usage
- server-side tracking of request state
- single-use request lifecycle

Once a request is completed:

- it cannot be reused
- further attempts must be rejected

---

## Man-in-the-Middle (MITM)

The system assumes the network is not trusted.

Mitigations:

- all sensitive actions require cryptographic signature
- server verifies every request independently
- intercepted requests cannot be modified without invalidating signature

Even if traffic is intercepted:

- attacker cannot forge a valid signature
- attacker cannot escalate privileges

---

## Device Compromise

If a device is compromised:

Risks:

- private key exposure
- unauthorized approvals

Mitigations:

- ability to bind new device
- isolation of device identity

Future enhancements:

- device attestation
- hardware-backed key storage
- anomaly detection

---

## Secure Storage

Sensitive data stored locally:

- device_private_key

Requirements:

- must be stored using secure OS storage
- must never be logged
- must never be exposed via UI or debug tools

---

## Data Minimization

The system minimizes stored and transmitted data.

Principles:

- only required data is processed
- no unnecessary identifiers
- persistent identifiers are limited to install-bound values required for device binding
- no credential storage

This reduces the impact of:

- data breaches
- device compromise
- backend leaks

---

## Server Trust Model

Server responsibilities:

- issue challenges
- verify signatures
- enforce expiration and replay rules
- grant or deny access

Server does NOT:

- store private keys
- perform signing operations
- rely on client trust alone

---

## Access Decision Integrity

Final authorization decision is made only if:

- request is valid
- challenge is valid
- signature is valid
- request is not expired
- request is not already used

Any violation results in rejection.

---

## Logging and Observability

Rules:

- never log private keys
- never log raw secrets
- avoid logging full payloads
- log only minimal metadata for debugging

---

## Future Security Enhancements

Planned improvements include:

- hardware-backed key storage
- device attestation
- anomaly detection (behavior-based)
- rate limiting and abuse detection

---

## Summary

The Toqen security model ensures that:

- access is always explicitly approved
- authorization is cryptographically verified
- requests are short-lived and non-reusable
- sensitive data remains on the device

The system is designed to remain secure even in hostile environments.

Building continues.
