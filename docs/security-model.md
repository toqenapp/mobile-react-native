# Mobile Security Model

This document describes mobile-client security behavior.

## Mobile Security Responsibilities

The mobile client should:

- reject malformed public QR payloads
- show request context before approval
- require explicit user action
- require strong biometric authentication where supported and enrolled
- sign approval challenges through the native device-key module
- verify signed server responses where required by the client
- treat local cache as presentation state

## Device Key

The mobile app uses a native device-key module so private key material is not represented as an exportable JavaScript value.

Platform protection depends on operating system and hardware support.

## Local Authentication

Sensitive approval signing requires strong biometric authentication (Face ID or Touch ID on iOS, fingerprint on Android) where supported and enrolled. PIN or passcode fallback is explicitly disabled; if strong biometrics are unavailable the app blocks access rather than falling back to a weaker credential.

If local authentication fails or is unavailable for a required action, the app does not silently approve access.

## Server-Side Authority

The app does not make final authorization decisions. Toqen.app server-side services verify requests and return outcomes.

## Residual Risk

Residual mobile risks include compromised devices, compromised operating systems, user misapproval, device backup/restore edge cases, and implementation defects.
