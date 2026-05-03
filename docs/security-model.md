# Mobile Security Model

This document describes mobile-client security behavior.

## Mobile Security Responsibilities

The mobile client should:

- reject malformed public QR payloads
- show request context before approval
- require explicit user action
- use local authentication, including biometrics or device credentials where supported and enabled
- sign approval challenges through the native device-key module
- verify signed server responses where required by the client
- treat local cache as presentation state

## Device Key

The mobile app uses a native device-key module so private key material is not represented as an exportable JavaScript value.

Platform protection depends on operating system and hardware support.

## Local Authentication

Sensitive approval signing requires local authentication, including biometrics or device credentials where supported and enabled by the current implementation.

If local authentication fails or is unavailable for a required action, the app should not silently approve access.

## Server-Side Authority

The app does not make final authorization decisions. Toqen.app server-side services verify requests and return outcomes.

## Residual Risk

Residual mobile risks include compromised devices, compromised operating systems, user misapproval, device backup/restore edge cases, and implementation defects.
