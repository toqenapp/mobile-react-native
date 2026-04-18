# Architecture

This document describes the architecture of the Toqen Mobile application.

The system is built around an access-first model, where authorization is performed through real-time, device-bound verification instead of persistent credentials.

---

## High-Level Overview

The mobile application is responsible for:

- receiving access requests (QR or manual)
- validating and presenting request context
- signing authorization challenges using a device key
- confirming or rejecting access

The app does not act as a source of truth.
All authorization decisions are verified by the server.

---

## Core Principles

- Access-first authorization
- Device-bound identity
- Minimal data exposure
- Short-lived authorization context
- Explicit user confirmation
- Cryptographic verification

---

## System Components

### 1. Screens

User-facing entry points of the application.

Examples:

- Home screen
- QR Scan screen
- Confirm Access screen
- Settings screen

Responsibilities:

- display request context
- collect user decision (approve / deny)
- trigger flows

---

### 2. Components

Reusable UI building blocks.

Examples:

- QR scanner
- access card
- confirmation buttons
- loaders and status indicators

Responsibilities:

- encapsulate UI logic
- ensure consistent rendering

---

### 3. Services (API Layer)

Handles all communication with the backend.

Defined in:

- api/\*
- http.ts

Responsibilities:

- send requests to backend
- map payloads and responses
- handle errors and timeouts

All network calls go through a single HTTP abstraction.

---

### 4. Security Layer

Handles all sensitive operations.

Responsibilities:

- device key generation
- challenge signing
- secure storage access
- cryptographic operations

Key properties:

- private key never leaves the device
- all signatures are generated locally
- no secrets are transmitted in plaintext

---

### 5. Storage Layer

Responsible for local data persistence.

Data stored:

- device_private_key
- device_id

Requirements:

- use secure storage (e.g. OS-provided secure storage)
- never store secrets in plaintext
- never log sensitive data

---

### 6. State Management

Responsible for application state.

Responsibilities:

- current auth session
- services list
- device state
- UI state

State must remain predictable and isolated from side effects.

---

### 7. Navigation Layer

Controls application flow between screens.

Responsibilities:

- transition between states (scan → confirm → result)
- handle deep links (QR / auth links)
- manage flow lifecycle

---

## Authorization Flow (QR)

1. User scans QR code
2. App extracts request data (requestId, nonce, etc.)
3. App sends `/auth/qr/scanned`
4. Server returns challenge and context
5. App displays service, location, and request info
6. User approves or denies
7. App signs challenge using device private key
8. App sends `/auth/qr/confirm`
9. Server verifies signature
10. Access is granted or denied

---

## Authorization Flow (Mobile Start)

1. App initiates `/mobile/auth/start`
2. Server returns challenge and request context
3. App displays request info
4. User approves or denies
5. App signs challenge
6. App sends `/mobile/auth/confirm`
7. Server verifies signature
8. App receives launch instruction (web/app)

---

## Trust Boundaries

### Device

Trusted for:

- private key storage
- signature generation

Not trusted for:

- final authorization decision

---

### Backend

Trusted for:

- verifying signatures
- issuing challenges
- granting access

Not trusted for:

- storing private keys
- accessing raw secrets

---

### Network

Assumed to be untrusted.

Protections:

- short-lived challenges
- signature verification
- no reusable tokens

---

## Data Flow

- QR → mobile app → backend → response → user decision → signed request → backend verification

No sensitive data is transmitted without cryptographic protection.

---

## Security Considerations

- QR codes do not contain secrets
- challenges are short-lived
- requests are single-use
- signatures bind request to device
- replay attacks are mitigated by nonce and expiration
- private keys are never transmitted

---

## Failure Scenarios

Handled cases include:

- expired request
- invalid signature
- network timeout
- user denial
- device mismatch

The app must always handle failure gracefully and avoid undefined states.

---

## Summary

The Toqen Mobile application is designed as a secure execution environment for authorization decisions.

It ensures that:

- the user explicitly confirms access
- the device cryptographically proves intent
- the server validates every action

Building continues.
