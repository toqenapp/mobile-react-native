# Mobile Build Traceability

This document covers mobile build traceability and the current reproducibility status.

## Reproducibility Status

The mobile repository provides build traceability through:

- public mobile source
- lockfile-managed dependencies
- tag-triggered release workflows
- generated build metadata

It does not document a complete independent procedure for reproducing App Store or Play Store artifacts bit for bit.

## Reviewer Guidance

Reviewers can inspect release workflow configuration, lockfile usage, release tags, and build metadata.

Do not treat traceability as full reproducibility until artifact comparison instructions, checksums, or attestations are published.
