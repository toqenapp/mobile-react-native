# Mobile-Facing API Notes

This document describes mobile client API usage visible in this repository.

These mobile-facing contracts are not SDK-stable partner APIs.

## Transport Behavior

Current mobile client behavior:

- JSON over HTTP
- default method is `POST`
- default timeout is 30 seconds
- non-success HTTP responses are errors
- invalid JSON responses are rejected
- response schemas are validated where configured
- signed response envelopes are verified where required
- non-development builds require HTTPS base URLs

## Mobile API Groups

The mobile client currently uses these groups:

- device registration
- QR and manual authorization
- mobile-initiated authorization
- services sync

## Documentation Boundary

This page stays mobile-specific. Public protocol semantics, SDK usage, and partner integration behavior belong outside this repository.
