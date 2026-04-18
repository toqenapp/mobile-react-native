# Toqen.app Mobile

Access-first authentication infrastructure for secure, real-time authorization using QR flows and device-bound cryptographic keys.

## Security principles

- Device-bound cryptographic authentication
- Challenge-response verification for every access request
- Short-lived, single-use authorization challenges
- Secure local storage for sensitive data
- Server-side verification of all authorization decisions

## Authorization flow

1. A short-lived authorization request is created by the service
2. The request is delivered to the mobile app (QR or mobile flow)
3. The user explicitly approves or denies the request
4. The device signs a unique challenge using a secure key
5. The backend verifies the signature before granting access

## Repository purpose

This repository is publicly available to support transparency and independent technical review.

It enables developers, security engineers, and partners to:

- inspect the architecture
- understand the authorization flow
- evaluate the security model in practice

## Mobile application role

The Toqen.app mobile app participates in authorization flows by:

- scanning and processing authorization requests
- performing device-bound cryptographic operations
- confirming user intent
- securely storing device secrets

All authorization decisions are enforced by the backend.
The mobile application does not act as a source of truth.

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

Access to the source code is provided for review and evaluation.
Usage, redistribution, modification, and production deployment are governed by the license in this repository.
