# Contributing

Thank you for your interest in the Toqen.app mobile client.

This repository is public to support transparency, review, and mobile-client-specific technical evaluation. It is source-available, and use of the source is governed by the repository license.

## Contribution Model

External pull requests are not accepted by default at this stage unless maintainers explicitly request them.

Useful contributions include:

- mobile bug reports
- mobile documentation corrections
- mobile build or release observations
- private security reports
- questions that identify unclear mobile-client behavior

## Repository Boundary

This repository should document only the mobile client.

Platform-wide architecture, public protocol, SDK, backend, provider, edge, database, privacy, and organization-level security docs are maintained outside this mobile repository.

## Security Issues

Do not report vulnerabilities publicly.

Email:

```text
hi@toqen.app
```

## Development

Install dependencies:

```sh
pnpm install
```

Run locally:

```sh
pnpm start
```

Run linting:

```sh
pnpm lint
```

Real secrets and production environment values must not be committed.
