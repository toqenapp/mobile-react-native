# Build and Release

This document describes how the Toqen Mobile application is built, versioned, and released.

The goal is to ensure transparency, reproducibility, and integrity of distributed builds.

---

## Overview

The mobile application is built using:

- React Native (Expo)
- TypeScript
- EAS (Expo Application Services)

Builds are automated and triggered by Git tags.

---

## Principles

The build and release process follows these principles:

- deterministic builds where possible
- minimal manual steps
- clear versioning
- traceable releases
- separation of environments (dev / prod)

---

## Environments

The application supports at least two environments:

### Development

- local API endpoint
- debug builds
- non-production configuration

### Production

- production API endpoint
- optimized builds
- release configuration

Environment selection is controlled by build configuration and runtime flags.

---

## Configuration

Configuration should not be hardcoded.

Recommended approach:

- environment-based configuration (env files or app config)
- separate values for dev and prod
- no secrets stored in repository
- tracked env files may contain placeholders only
- real values must come from untracked local env files, CI secrets, or EAS secrets

Examples of configurable values:

- base API URL
- feature flags
- logging level
- debug options

---

## Versioning

The application uses semantic versioning:

MAJOR.MINOR.PATCH

Example:
1.0.0

Each release must include:

- version number
- build number
- Git commit reference
- tag name

---

## Tagging Strategy

Builds are triggered by Git tags.

Recommended tag formats:

- v-android-<version>
- v-ios-<version>

Examples:

- v-android-1.0.0
- v-ios-1.0.0

Tags should be immutable once released.

---

## CI/CD

Builds are executed using GitHub Actions and EAS.

Typical pipeline:

1. Developer pushes tag
2. GitHub Actions workflow is triggered
3. EAS build is started
4. Build artifacts are generated
5. Build is optionally submitted to stores

---

## Build Types

### Android

- APK (for testing)
- AAB (for Play Store)

### iOS

- App build via EAS
- Submission to App Store

---

## Signing

Signing is required for release builds.

### Android

- signed with upload or release key
- keys must be securely stored
- keys must not be committed to repository

### iOS

- signed via Apple credentials or API key
- managed through EAS or Apple Developer account

---

## Secrets Management

Sensitive data must be stored securely.

Examples:

- EXPO_TOKEN
- Apple API keys
- signing credentials

Rules:

- never store secrets in repository
- use GitHub Secrets or EAS secrets
- restrict access to CI environment
- keep tracked `.env` files commented and non-operational

---

## Release Flow

Typical release process:

1. Update version in app config
2. Commit changes
3. Create Git tag (v-android-* or v-ios-*)
4. Push tag to repository
5. CI triggers build
6. Build completes
7. Verify build output
8. Submit to store (optional)

---

## Build Metadata

Each build should be traceable.

Recommended metadata:

- version
- build number
- Git commit hash
- tag name
- CI workflow URL

This ensures reproducibility and auditability.

---

## Verification

Before publishing:

- ensure correct environment (prod)
- verify API endpoints
- check logging settings
- validate signing configuration
- test critical flows
- confirm tracked env files contain placeholders only

---

## Rollback Strategy

In case of issues:

- previous versions must remain available
- ability to redeploy known-good build
- revoke compromised builds if necessary

---

## Transparency

To improve trust:

- builds are triggered from public repository
- versioning is visible
- release tags are public
- documentation is available

Future improvements may include:

- signed release artifacts
- reproducible build verification
- public build logs

---

## Future Improvements

Planned enhancements include:

- stricter CI validation
- automated testing in pipeline
- release signing verification
- build reproducibility checks
- artifact integrity validation

---

## Summary

The Toqen build system ensures that:

- builds are traceable
- releases are controlled
- secrets are provided outside the repository
- environments are isolated

This supports a reliable and secure release process.

Building continues.
