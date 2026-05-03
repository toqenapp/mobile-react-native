# Toqen.app Mobile

Access-first authentication infrastructure designed for secure, real-time authorization.

This repository contains the public Toqen.app mobile client source. The mobile client is the user-facing approval and signing surface for Toqen.app authorization flows. It scans or receives request context, shows that context to the user, collects an explicit approve or deny decision, and signs approval challenges with a device-bound key.

Platform-wide protocol, trust, privacy, and partner API documentation is maintained outside this mobile repository.

## Repository Scope

This repository owns mobile-client-specific documentation and code:

- React Native / Expo mobile app
- native device-key module
- mobile setup and run instructions
- mobile architecture notes
- mobile security and storage notes
- mobile build and release notes
- mobile-facing client contract notes

The docs in this repository stay focused on mobile behavior that reviewers can inspect in this codebase.

## Mobile Role

The mobile app is responsible for:

- scanning Toqen.app QR payloads
- accepting manual-code and mobile handoff flows
- resolving request context from Toqen.app services
- presenting request context to the user
- collecting approve or deny decisions
- invoking local authentication for sensitive actions
- signing approval challenges with a device-bound key
- storing limited local state for presentation and repair

Toqen.app server-side services verify requests and decide final authorization outcomes.

## Security Summary

The mobile client is designed around:

- explicit user approval
- device-bound cryptographic authorization
- local authentication, including biometrics or device credentials where supported and enabled
- secure key storage through the native device-key module
- rejection of malformed QR payloads
- signed server response verification where required by the client
- local cache treated as presentation state, not authorization authority
- responsible vulnerability disclosure

This reduces risk but does not eliminate it. A compromised device, compromised operating system, user misapproval, or implementation defect can still create risk.

## Documentation

Mobile-specific docs:

- [Mobile overview](./docs/overview.md)
- [Mobile architecture](./docs/architecture.md)
- [Mobile client](./docs/mobile-client.md)
- [Mobile flows](./docs/flows.md)
- [Mobile QR handling](./docs/qr-format.md)
- [Mobile-facing API notes](./docs/api-contracts.md)
- [Mobile security model](./docs/security-model.md)
- [Mobile threat model](./docs/threat-model.md)
- [Secure storage](./docs/storage.md)
- [Build and release](./docs/build-and-release.md)
- [Mobile build traceability](./docs/build-traceability.md)

Platform-wide docs live outside this mobile repository.

## Development

Install dependencies:

```sh
pnpm install
```

Run the app locally:

```sh
pnpm start
```

Run linting:

```sh
pnpm lint
```

Real production values and secrets must not be committed.

## Security Reporting

Do not open public issues for vulnerabilities.

Report security issues privately:

```text
hi@toqen.app
```

## Contribution Model

This repository is public for transparency and review. External pull requests are not accepted by default unless maintainers explicitly request them.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This repository is source-available. Usage, redistribution, modification, and production deployment are governed by the license in this repository.
