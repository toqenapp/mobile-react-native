# Contributing

Thank you for your interest in Toqen Mobile.

This repository is publicly available for transparency and technical review.

## Important

This is a source-available project.

- Viewing and inspecting the code is allowed
- Usage, redistribution, and modification are restricted by the license
- External contributions are currently not accepted

## Purpose of this repository

This repository exists to:

- provide visibility into the mobile application architecture
- allow security review and technical evaluation
- support partners and integrators in understanding the system
- document implementation details of access-first authentication

## Reporting issues

If you find a bug, inconsistency, or technical concern, you can open an issue.

Please include:

- clear description of the problem
- steps to reproduce
- expected vs actual behavior
- environment details (if relevant)

## Security issues

Do not report security vulnerabilities via public issues.

Instead, report them privately:

Email: hi@toqen.app

See SECURITY.md for more details.

## Code style and structure

The project follows a modular architecture:

- screens — UI entry points
- components — reusable UI elements
- services — API communication layer
- security — cryptographic and storage logic
- store — application state
- utils — helper functions

Key principles:

- minimal data exposure
- device-bound logic
- explicit flows
- clear separation of concerns

## Development notes

- All network requests go through the HTTP layer
- API contracts are defined in docs/api-contracts.md
- Sensitive data must never be logged or stored in plaintext
- Secrets must be stored only in secure storage

## Pull requests

Pull requests are not accepted at this stage.

This may change in the future as the project evolves.

## Roadmap

The project is actively evolving.

Building continues.

## Contact

For collaboration, partnerships, or technical discussions:

hi@toqen.app
