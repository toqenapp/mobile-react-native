# Contributing

Thank you for your interest in Toqen Mobile.

This repository is publicly available to support transparency and independent technical review.

## Project model

This is a source-available project.

- Access to the source code is provided for inspection and evaluation
- Usage, redistribution, and modification are governed by the repository license
- External code contributions are not accepted at this stage

## Repository purpose

This repository exists to:

- provide visibility into the mobile application architecture
- enable security review and technical evaluation
- support partners and integrators in understanding the system
- document implementation details of access-first authentication

## Reporting issues

If you identify a bug, inconsistency, or technical concern, you may open an issue.

Please include:

- clear description of the problem
- steps to reproduce
- expected and actual behavior
- environment details when relevant

## Security reporting

Do not disclose security vulnerabilities via public issues.

Report them privately:

hi@toqen.app

Refer to `SECURITY.md` for the full policy.

## Architecture overview

The project follows a modular structure:

- `screens` — application entry points
- `components` — reusable UI elements
- `services` — API communication layer
- `security` — cryptographic operations and secure storage
- `store` — application state management
- `utils` — helper functions

## Engineering principles

- minimal data exposure
- device-bound cryptographic operations
- explicit and verifiable authorization flows
- clear separation of concerns

## Development guidelines

- all network requests go through the defined API layer
- API contracts are documented in `docs/api-contracts.md`
- sensitive data must not be logged or stored in plaintext
- secrets must be stored only in secure storage

## Pull requests

Pull requests are not accepted at this stage.

The contribution model may evolve as the project develops.

## Project status

Building continues.

## Contact

For technical discussions, partnerships, or collaboration:

hi@toqen.app
