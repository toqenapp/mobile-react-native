# Mobile Overview

Access-first authentication infrastructure designed for secure, real-time authorization.

This document describes the Toqen.app mobile client.

## Purpose

The mobile client is the user-facing approval and signing surface for Toqen.app authorization flows.

It helps users:

- scan or open an authorization request
- review request context
- approve or deny the request
- use local authentication for sensitive actions
- produce a device-bound approval signature
- view local service and access-pass state

## What The Mobile Client Does Not Do

The mobile client keeps these responsibilities outside the app:

- final authorization decisions
- backend policy enforcement
- partner secret storage
- backend validation implementation details
- stable SDK contracts for partner integrations

Toqen.app server-side services verify requests and return final outcomes.

## Main Mobile Areas

- QR scanning and manual code entry
- request confirmation screen
- device registration and repair
- device-bound signing through the native module
- local authentication prompts
- local service and access-pass presentation cache
- settings and security controls
