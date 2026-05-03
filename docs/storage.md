# Mobile Secure Storage

This document covers mobile-local storage only.

## Storage Principles

- keep private key material out of JavaScript storage
- use secure storage for local identity markers
- treat AsyncStorage data as untrusted presentation cache
- avoid logging secrets or full sensitive payloads
- reset or repair inconsistent local device identity state

## Device Key Material

The native device-key module manages device-bound signing keys.

The public key can be exported for registration and request flows. The private key remains protected by platform security controls where available and is not uploaded by the mobile client.

## SecureStore Data

The app uses secure storage for local device identity markers, public key material, registration markers, and app instance identity.

These values are not sufficient by themselves to grant access.

## AsyncStorage Data

The app uses AsyncStorage for local presentation state, including access-pass and service cache.

This cache:

- may be stale
- may be modified locally on compromised devices
- must not be treated as authorization authority

## Data That Must Not Be Stored

The mobile app must not store backend secrets, partner client secrets, raw passwords, or reusable server-only credentials.
