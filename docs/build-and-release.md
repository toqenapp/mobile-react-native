# Mobile Build And Release

This document covers Toqen.app mobile build and release behavior.

## Stack

The mobile app uses:

- React Native
- Expo
- TypeScript
- EAS build workflows
- pnpm lockfile-managed dependencies

## Release Workflows

The repository includes platform-specific release workflows:

- Android tags matching `v-android-*`
- iOS tags matching `v-ios-*`

Workflows install dependencies with the frozen pnpm lockfile, invoke EAS, and generate build metadata.

## Build Metadata

Mobile builds include metadata for:

- Git commit hash
- release tag
- workflow URL

This supports traceability. It is not the same as full reproducibility.

## Secrets

Production values, signing credentials, and release secrets must not be committed.

## Verification

Before release, maintainers should check:

- production base URL uses HTTPS
- no real secrets are committed
- dependency lockfile is current
- critical mobile flows are tested
- build metadata is present
- signing configuration is correct
