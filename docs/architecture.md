# Mobile Architecture

This document describes the Toqen.app mobile client architecture.

## Layers

### App Routes And Screens

Expo Router routes and screen components provide the mobile user flows:

- home and service views
- scan and manual-code entry
- confirmation
- settings
- archive and local access views

### API Client Layer

The mobile API layer wraps mobile-facing HTTP calls, response schema validation, timeouts, and signed response verification where required by the client.

These mobile-facing contracts are not SDK-stable partner APIs.

### Security Layer

The security layer handles:

- device registration
- device public key access
- approval signing
- local authentication
- signed server response verification
- device identity reset and repair

### Native Device-Key Module

The native module creates or accesses device-bound keys and signs challenges after local authentication. Private key material is intended to remain protected by platform key storage controls.

### Local State

Zustand stores and local persistence support presentation state, including access-pass and service cache. Local state is not authorization authority.

## Mobile Trust Boundary

The app is trusted to display context and request a user decision. It is not trusted to make final policy decisions.

Server-side Toqen.app services remain the authority for verification and access outcomes.
