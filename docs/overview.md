# Overview

This document provides a high-level overview of the Toqen Mobile system.

It is intended for developers, partners, and reviewers who want to quickly understand how the system works without diving into implementation details.

---

## What is Toqen

Toqen is an access-first authentication infrastructure designed for secure, real-time authorization.

Instead of relying on persistent credentials, Toqen verifies access through short-lived requests and device-bound cryptographic proofs.

The mobile application acts as a secure execution environment where users review and approve access requests.

---

## Key Idea

Authorization is not based on identity alone.

Each access request is:

- created in real time
- explicitly approved by the user
- cryptographically signed by the device
- verified by the backend

This ensures that access is always intentional, traceable, and secure.

---

## System Components

The system consists of three main parts:

### 1. Client Service

Examples:

- websites
- applications
- platforms

Responsibilities:

- initiate access requests
- display QR codes or start flows
- wait for authorization result

---

### 2. Mobile Application

The Toqen Mobile app is responsible for:

- receiving access requests
- presenting request context
- collecting user decision
- signing authorization challenges
- interacting with backend APIs
- managing local secure data

---

### 3. Backend

Responsibilities:

- generate authorization requests
- issue challenges
- verify device signatures
- enforce request lifecycle
- grant or deny access

---

## How It Works

At a high level:

1. A service creates an access request
2. The request is delivered to the mobile app (QR or mobile flow)
3. The app retrieves request context from the backend
4. The user reviews and approves or denies
5. The device signs a challenge
6. The backend verifies the signature
7. Access is granted or denied

---

## Supported Flows

The system supports multiple entry points:

- QR-based authorization
- manual code entry
- mobile-initiated authorization

All flows converge to the same core pattern:

request → context → user decision → signature → verification → result

---

## Security Model (High-Level)

The system is designed with the following guarantees:

- no secrets in QR codes
- no reusable authorization tokens
- short-lived requests
- single-use request lifecycle
- device-bound cryptographic identity
- explicit user confirmation required

The backend always performs final verification.

---

## Data Handling

The system minimizes stored and transmitted data:

- no password storage
- no long-lived credentials
- no unnecessary identifiers
- sensitive data remains on the device

Local data is stored securely and encrypted where required.

---

## Trust Model

- Device is trusted for signing
- Backend is trusted for verification
- Network is considered untrusted

This ensures that intercepted or modified traffic cannot grant access.

---

## Typical Use Cases

- secure login without passwords
- approval of sensitive actions
- secure session launch

---

## Design Philosophy

The system is built around:

- clarity of user intent
- minimal data exposure
- strong cryptographic guarantees
- explicit authorization flows
- predictable behavior

---

## Documentation Structure

For more details, see:

- architecture.md — system design
- flows.md — user and system flows
- api-contracts.md — API definitions
- qr-format.md — QR structure and rules
- security-model.md — security design
- threat-model.md — attack analysis
- storage.md — local data handling

---

## Status

Building continues.

---

## Summary

Toqen replaces implicit trust with explicit authorization.

Every access decision requires:

- user approval
- device proof
- backend verification

This ensures secure, real-time access without relying on persistent credentials.
