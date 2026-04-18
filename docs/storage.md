# Storage

This document describes how sensitive data is stored in the Toqen Mobile application.

The storage model is designed to minimize risk in case of device compromise or data extraction.

---

## Principles

The storage system follows these principles:

- store only what is strictly required
- never store secrets in plaintext
- isolate sensitive data
- rely on OS-level secure storage
- avoid unnecessary persistence

---

## Storage Layers

The application uses two storage layers:

### 1. Secure Storage

Used for:

- cryptographic material
- secrets
- keys

Examples:

- iOS Keychain
- Android Keystore / Encrypted storage

---

### 2. Local Storage

Used for:

- non-sensitive data
- cached metadata
- UI state

Examples:

- AsyncStorage or similar

---

## Stored Data

The application stores the following data locally:

---

### device_private_key

Description:
Private key generated on the device.

Purpose:
Used to sign authorization challenges.

Requirements:

- must never leave the device
- must be stored only in secure storage
- must never be logged or exposed

---

### device_id

Description:
Unique identifier of the device instance.

Purpose:
Used to associate device with backend.

Storage:

- stored in secure storage

---

### app_instance_id

Description:
Random install-bound application instance identifier.

Purpose:
Used to bind auth and registration flows to the current app installation.

Storage:

- stored in secure storage
- generated once per installation
- reused between launches
- deleted when the device key is reset or repaired

---

### Environment Configuration

Tracked `.env` files in the repository are placeholders only.

Real environment values:

- must not be committed
- must be injected through untracked local env files, CI secrets, or EAS secrets

---

### Access Pass Storage

DeviceAccessPass stored in AsyncStorage is considered an untrusted local cache.

It:

- can be outdated
- can be modified locally
- must not be used as a source of truth

All critical access decisions are validated by the server.

Local data is used for UI rendering only.

Current date format in this cache:

- access pass dates are stored as ISO 8601 strings
- UI applies locale formatting only when rendering
- local archive/restore updates write ISO 8601 timestamps, not locale strings

---

## Data That Must Not Be Stored

The application must never store:

- raw passwords
- session tokens
- refresh tokens
- backend secrets
- private keys of other systems

---

## Logging Rules

Strict logging rules apply:

- do not log private keys
- do not log full request payloads
- do not log secrets or tokens

Allowed logging:

- request identifiers
- status flags
- non-sensitive metadata

---

## Memory Handling

Sensitive data must:

- exist in memory only when needed
- be cleared after use if possible
- never be cached unnecessarily

---

## Access Control

Access to sensitive data must be limited to:

- security layer
- controlled parts of application logic

UI and general components must not directly access secrets.

---

## Backup and Restore

Considerations:

- secure storage may not be included in backups
- device-bound identity should not be blindly restored

---

## Device Loss Scenario

If device is lost:

- attacker may attempt to access stored data
- secure storage provides baseline protection
- new device must be registered

---

## Rooted / Jailbroken Devices

Risk:

- OS-level protections may be bypassed
- secure storage may be weakened

Mitigation (recommended):

- detect compromised devices where possible
- warn users
- restrict sensitive operations if needed

---

## Data Lifecycle

Data must follow a controlled lifecycle:

- created when device is initialized
- updated during sync or auth flows
- deleted when no longer needed

---

## Sync Interaction

Sensitive data should not be synced in plaintext.

Rules:

- server stores only encrypted blobs if needed
- decryption happens only on device

---

## Future Improvements

Planned enhancements include:

- hardware-backed key storage
- device attestation checks
- secure enclave usage where available

---

## Summary

The storage model ensures that:

- secrets remain on the device
- sensitive data is encrypted
- exposure risk is minimized
- compromise impact is limited

The system prioritizes local control and minimal data exposure.

Building continues.
