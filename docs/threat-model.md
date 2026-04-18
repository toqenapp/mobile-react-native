# Threat Model

This document describes the threat model for the Toqen Mobile application and its authorization system.

The goal is to identify potential attack vectors and define how the system mitigates them.

---

## Scope

The threat model covers:

- mobile application
- QR-based authorization flow
- mobile authorization flow
- backend interaction
- device-bound identity model

---

## Assumptions

The system assumes:

- the network is untrusted
- QR codes can be intercepted
- requests can be replayed
- attackers can observe user behavior
- attackers may attempt automation
- some devices may be compromised

The system is designed to remain secure under these assumptions.

---

## Assets

The system protects the following assets:

- authorization decisions
- device identity (key pair)
- device access passes
- user intent

---

## Trust Boundaries

### Device

Trusted for:

- private key storage
- challenge signing

Not trusted for:

- final authorization decision
- policy enforcement

---

### Backend

Trusted for:

- issuing challenges
- verifying signatures
- enforcing expiration
- managing request lifecycle

Not trusted for:

- accessing private keys
- performing signing operations

---

### Network

Not trusted.

All traffic may be:

- intercepted
- modified
- replayed

---

## Attack Vectors

---

### 1. QR Interception

#### Scenario

Attacker captures a QR code via:

- screenshot
- camera
- screen recording

#### Risk

Unauthorized access attempt using intercepted QR.

#### Mitigation

- QR contains no secrets
- QR only includes request context
- authorization requires device signature
- request must be approved by user
- request expires quickly

---

### 2. Replay Attack

#### Scenario

Attacker reuses:

- previously scanned QR
- intercepted request data
- old challenge

#### Risk

Repeated unauthorized access.

#### Mitigation

- nonce per request
- short-lived challenges
- server tracks request state
- single-use lifecycle
- expired requests rejected

---

### 3. Challenge Forgery

#### Scenario

Attacker attempts to generate valid challenge response without device.

#### Risk

Bypass of authorization.

#### Mitigation

- challenge must be signed with private key
- private key never leaves device
- server verifies signature against registered public key

---

### 4. Man-in-the-Middle (MITM)

#### Scenario

Attacker intercepts or modifies network traffic.

#### Risk

Request manipulation or impersonation.

#### Mitigation

- signatures protect integrity
- modified payload invalidates signature
- server re-verifies all data
- no trust in client data alone

---

### 5. Device Compromise

#### Scenario

Attacker gains access to user device.

#### Risk

Unauthorized approvals, key extraction.

#### Mitigation

- secure storage for keys
- ability to bind new device
- minimal sensitive data stored

Residual risk:

- compromised device can approve requests

---

### 6. Unauthorized Automation

#### Scenario

Bot or script attempts to automate approval flows.

#### Risk

Mass unauthorized approvals.

#### Mitigation

- user interaction required
- device signing required
- backend verification required
- rate limiting (recommended)

---

### 7. Local Storage Extraction

#### Scenario

Attacker extracts local storage data.

#### Risk

Exposure of secrets.

#### Mitigation

- secure storage APIs
- no plaintext secrets
- minimal stored data

---

### 8. API Abuse

#### Scenario

Attacker sends crafted API requests.

#### Risk

Bypassing flow logic.

#### Mitigation

- server validates all fields
- request must exist
- nonce must match
- signature must be valid
- request must not be expired or used

---

### 9. Request State Manipulation

#### Scenario

Attacker attempts to reuse or alter request lifecycle.

#### Risk

Multiple approvals or inconsistent state.

#### Mitigation

- strict server-side state machine
- request transitions validated
- completed requests locked

---

### 10. Social Engineering

#### Scenario

User is tricked into approving malicious request.

#### Risk

Valid but unintended authorization.

#### Mitigation

- clear UI context (service, location, description)
- explicit user action required
- no silent approvals

Residual risk:

- user error cannot be fully eliminated

---

### 11. Phishing via QR

#### Scenario

Attacker displays malicious QR.

#### Risk

User approves unintended access.

#### Mitigation

- service identity displayed before approval
- backend-controlled request context
- user must confirm intent

---

### 12. Build Pipeline Compromise

#### Scenario

Malicious code injected during build or release.

#### Risk

Backdoored application.

#### Mitigation (recommended):

- controlled CI/CD pipeline
- signed builds
- restricted access to build systems

---

## Residual Risks

The system acknowledges:

- compromised device risk
- user misapproval risk
- physical access attacks
- advanced OS-level compromise

These risks are partially mitigated but cannot be fully eliminated.

---

## Security Guarantees

The system guarantees:

- authorization requires valid signature
- authorization requires user action
- requests are short-lived
- requests are single-use
- intercepted data alone is insufficient

---

## Future Improvements

Planned improvements include:

- hardware-backed key storage
- device attestation
- behavioral anomaly detection
- enhanced abuse protection

---

## Summary

The Toqen threat model assumes a hostile environment and designs for it.

Security is achieved through:

- cryptographic verification
- minimal trust assumptions
- short-lived request model
- explicit user participation

This ensures that access cannot be granted without both user intent and valid device proof.

Building continues.
