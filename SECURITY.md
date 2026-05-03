# Security Policy

This file covers the Toqen.app mobile client repository.

Toqen.app follows responsible vulnerability disclosure for mobile client security reports.

## Reporting A Vulnerability

Report mobile client security concerns privately:

```text
hi@toqen.app
```

Do not open public issues for vulnerabilities.

## Mobile Scope

In scope for this repository:

- QR and manual-code parsing in the mobile client
- mobile approval and denial handling
- device-bound signing behavior exposed by the mobile client
- local authentication behavior
- secure storage and local cache behavior
- signed server response verification in the mobile client
- mobile build and release integrity
- mobile documentation that could mislead users or integrators

Please report privately if a concern involves:

- backend validation behavior
- private provider routes
- database schemas
- edge abuse-control implementation
- deployment topology
- production secrets or environment values

## Disclosure Expectations

Please coordinate disclosure with maintainers. Do not publish exploit instructions, private implementation details, or sensitive screenshots while a report is under review.

## Mobile Security Docs

- [Mobile security model](./docs/security-model.md)
- [Mobile threat model](./docs/threat-model.md)
- [Secure storage](./docs/storage.md)
- [Build and release](./docs/build-and-release.md)
