# Mobile Client

This repository contains the Toqen.app mobile client source.

## Responsibilities

The mobile client is responsible for:

- parsing mobile-supported QR payloads
- accepting manual-code fallback input
- receiving mobile handoff flows
- resolving request context through Toqen.app services
- showing request details to the user
- collecting approve or deny decisions
- signing approval challenges with a device-bound key
- storing local presentation cache
- repairing inconsistent local device identity state

## Device Registration

The mobile app registers a device public key with Toqen.app through a mobile registration flow.

The private key remains protected by the device-key module and is not uploaded by the mobile client.

## Approval Signing

For approval, the mobile app invokes local authentication and signs the challenge through the native device-key module.

Denial must not grant access.

## Local Cache

The mobile app may cache service and access-pass information for user experience. This cache is not proof that access is currently valid.

## Public Review Value

Public mobile client source lets reviewers inspect whether the app prompts before signing, rejects malformed QR payloads, separates local cache from authority, and verifies signed server responses where required.
