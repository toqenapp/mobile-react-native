# Toqen.app Mobile

Access-first authentication mobile app for secure QR-based authorization.

## Security-first design:

- Device-bound cryptography
- Challenge-response authorization
- No reusable credentials or long-lived authentication tokens
- Public threat model

## How authorization works:

- A short-lived request is created by the service
- The request is delivered to the mobile app (QR or mobile flow)
- The user explicitly approves or denies the request
- The device signs a unique challenge
- The server verifies the signature before granting access

## Why this repository is public

This repository is public to support transparency and independent technical review.

It allows developers, security engineers, and partners to inspect the architecture, understand the authorization flow, and evaluate the security model in practice.

All rights for usage, redistribution, modification, and production deployment are governed by the repository license.

## What the mobile app does

The Toqen.app mobile app is designed for secure, real-time authorization flows, including:

- QR-based access confirmation
- Device-bound cryptographic verification
- Secure local secret storage

All authorization decisions are verified by the backend.
The mobile app never acts as a source of truth.

## Documentation

- [System overview](./docs/overview.md)
- [Architecture](./docs/architecture.md)
- [Authorization flows](./docs/flows.md)
- [QR request format](./docs/qr-format.md)
- [Security model](./docs/security-model.md)
- [Secure storage](./docs/storage.md)
- [API contracts](./docs/api-contracts.md)
- [Threat model](./docs/threat-model.md)
- [Build and release](./docs/build-and-release.md)
- [Security policy](./SECURITY.md)

## Repository status

Building continues.

## License

This repository is source-available.

Viewing and reviewing the source code is allowed.
Usage, redistribution, modification, and production reuse are restricted by the license in this repository.
