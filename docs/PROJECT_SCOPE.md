# AidTrace — Project Scope & Problem Specification

**Project:** AidTrace  
**Tagline:** Transparent Aid. Verifiable Impact.  
**Version:** 1.0.0-rc  
**Last Updated:** October 14, 2026  

---

## 1. Problem Statement

Humanitarian and community aid initiatives channel billions of dollars annually into crisis relief, poverty alleviation, and community infrastructure. However, the existing ecosystem suffers from severe structural flaws:

1. **The "Black Box" Allocation Deficit:**
   Donors typically donate to large intermediaries or local campaigns with zero line-of-sight into how funds are utilized. Financial reporting is delayed by months or years, aggregated into broad organizational overhead categories, and vulnerable to diversion or misstatement.

2. **The "Garbage-In, Garbage-Out" Fallacy in Web3:**
   Early Web3 charity experiments often claimed "100% transparency" simply by sending ERC-20 tokens or ETH to an address. Moving crypto to a wallet does **not** prove that food arrived at an IDP camp, that a water well was dug, or that medical supplies were handed to patients. A successful blockchain transaction proves only that private keys signed a transfer—not that real-world impact occurred.

3. **Privacy Vulnerability & Humanitarian Harm:**
   Naive attempts at public proof frequently publish sensitive personal identifiable information (PII)—including names, biometric data, photo documentation of vulnerable refugees, or exact GPS coordinates of marginalized communities—onto immutable ledgers or public IPFS nodes. This exposes beneficiaries to physical harm, state persecution, discrimination, or fraud.

4. **Lack of Independent Verification & Accountable Review:**
   When aid delivery is claimed, verification is often either self-attested by the recipient NGO or not validated at all. When dispute arises, there is no immutable audit trail detailing who approved what milestone, against which specific cryptographic evidence bundle, and at what timestamp.

---

## 2. AidTrace Mission & Core Value Proposition

**AidTrace** establishes an open, auditable, and privacy-preserving protocol for community aid projects. It bridges on-chain financial and milestone accounting with off-chain operational evidence, verified through authorized independent reviewers.

```
       +--------------------------------------------------------------+
       |                        AidTrace Core                         |
       +--------------------------------------------------------------+
                                       |
          +----------------------------+----------------------------+
          |                                                         |
          v                                                         v
  [ On-Chain Layer ]                                      [ Off-Chain Layer ]
  - Project Registry                                      - Detailed Evidence Files
  - Milestone Declarations                                - PII / Beneficiary Rosters
  - Cryptographic Evidence Hashes                         - High-Res Field Documentation
  - Role-Based Reviewer Authorization                    - Local Verification Tooling
  - Multi-State Attestations                              - Client-Side Hash Generation
  - Public Event Audit Log                                - Aggregated Impact Metrics
```

---

## 3. Stakeholder Personas & User Journeys

AidTrace serves four primary actor classes:

### 3.1 Project Coordinator / Community Lead
- **Role:** Initiates an aid campaign, defines objectives, declares budget milestones, and requests funding.
- **Workflow:**
  1. Connects wallet and registers an Aid Project specifying:
     - Title, brief description, coarse location (Country / Region / District; no street-level coordinates).
     - Target funding amount in wei / native tokens.
     - Aggregated beneficiary targets (e.g., "500 farming households").
     - Measurable outcome indicators (e.g., "1,000 grain silos distributed").
  2. Creates structured Milestones (e.g., Milestone 1: "Procurement", Milestone 2: "Logistical Transport", Milestone 3: "Distribution & Verification").
  3. Executes project stages and submits evidence bundles (computing SHA-256 hash client-side before committing).

### 3.2 Independent Reviewer / Field Verifier
- **Role:** Authorized technical auditor, field NGO partner, or community monitor who inspects evidence and attests to its validity.
- **Workflow:**
  1. Granted reviewer authorization on-chain by the platform authority or multi-sig registry.
  2. Inspects submitted evidence hash, metadata, and off-chain documentation (e.g., delivery manifests, vendor invoices, spot-check audit reports).
  3. Submits an on-chain attestation:
     - `VERIFIED`: Evidence satisfactorily corroborates milestone completion.
     - `REJECTED`: Evidence is fraudulent, insufficient, or contradicts reported targets.
     - `DISPUTED`: Conflicting claims require escalation or secondary review.
  4. Reviewer identity (address/pseudonym) and rationale hash are permanently recorded in the event log.

### 3.3 Public Donor & Community Watchdog
- **Role:** Individuals, philanthropic foundations, and journalists tracking fund deployment.
- **Workflow:**
  1. Accesses the public AidTrace dashboard without needing a Web3 wallet or gas tokens.
  2. Views real-time project status: Declared Target vs. Actual Funds Received, Completed Milestones, Evidence Commitments, and Reviewer Attestations.
  3. Verifies file integrity independently: Uploads any off-chain evidence document into the browser verifier to confirm its SHA-256 matches the on-chain immutable hash.
  4. Observes clear visual indicators distinguishing verified real-world impacts from pending claims.

### 3.4 Protected Beneficiary (Non-Interacting Stakeholder)
- **Role:** Recipients of aid assistance.
- **Safety Guarantee:** Beneficiaries never interact directly with the blockchain and have zero PII exposed. All beneficiary metrics are strictly represented in aggregate counts.

---

## 4. Privacy, Authorization & Verification Boundaries

| Dimension | On-Chain (Public & Immutable) | Off-Chain (Private / Ephemeral) |
| :--- | :--- | :--- |
| **Project Details** | Project ID, Coordinator Address, Coarse Region (e.g., "Turkana County, Kenya"), Title, Outcome Indicators, Creation Timestamp. | Detailed project narratives, vendor contacts, internal operational communications. |
| **Funding Data** | Declared Target Amount, Actual Received Balance, Milestone Allocation Tranches. | Bank account routing info, fiat on-ramp KYC records, exchange credentials. |
| **Beneficiary Data** | Strictly aggregated demographic counts (e.g., "300 school kits"). | Beneficiary rosters, names, national ID numbers, personal biometric data, facial photographs. |
| **Evidence Data** | Cryptographic hash (`bytes32 sha256`), Evidence Category, Submitter Address, Submission Timestamp, Milestone ID. | Raw receipts, high-resolution photographs, shipping manifests, audit field notes. |
| **Review & Audit** | Reviewer Address, Attestation State (`SUBMITTED`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `DISPUTED`), Attestation Timestamp. | Detailed reviewer commentary, private dispute deliberations. |

### 4.1 Critical Distinction: Cryptographic Hash vs. Physical Truth
AidTrace explicitly adopts the **Humility in Cryptography** principle:
- A cryptographic hash on-chain guarantees **Data Integrity** (the exact file presented today is byte-for-byte identical to the file committed at block $N$).
- A cryptographic hash on-chain guarantees **Temporal Order** (the file existed at or before block $N$).
- A cryptographic hash **DOES NOT** guarantee real-world truth. A digitally authentic photo of empty boxes does not prove food delivery. Physical veracity relies entirely on the reputation, authorization, and verifiable attestation of authorized human or organizational reviewers. AidTrace never obfuscates this boundary.

---

## 5. Scope Boundaries: MVP vs. Explicit Exclusions

### 5.1 In-Scope for Hackathon MVP
1. **Aid Project Registry Smart Contract:**
   - Registration of projects with title, description, coarse location, target budget, and aggregate beneficiary targets.
   - Milestone creation and status tracking (`DRAFT`, `ACTIVE`, `COMPLETED`, `PAUSED`).
   - Direct transparent funding tracking (declared target vs. actual received on-chain funds).
2. **Evidence Submission & Attestation Smart Contract:**
   - Client-side cryptographic hashing of evidence bundles using SHA-256.
   - Recording of evidence hashes linked to specific project milestones.
   - Role-Based Access Control (`REVIEWER_ROLE`, `ADMIN_ROLE`) managing who can issue verifications.
   - Multi-state review workflow: `SUBMITTED` -> `UNDER_REVIEW` -> `VERIFIED` / `REJECTED` / `DISPUTED`.
   - Immutable event emission for every lifecycle event.
3. **Public Transparency & Verification Web App:**
   - Built with TypeScript and React.
   - Read-only public exploration mode (no wallet needed).
   - Project dashboard displaying live funding metrics, milestone status, and evidence logs.
   - Independent Evidence Integrity Checker: client-side drag-and-drop hash calculator to verify any off-chain file against the on-chain record.
   - Reviewer Portal with wallet connection to approve/reject milestones.
4. **Automated Test Suite:**
   - End-to-end unit tests covering all smart contract functions, edge cases, access violations, and state machine integrity.

### 5.2 Explicit Exclusions (Out of Scope)
- ❌ **Biometric Beneficiary Tracking:** No facial recognition or iris scanning (violates humanitarian data ethics).
- ❌ **Complex DeFi Integrations:** No token swapping, yield farming, or multi-pool liquidity logic (adds financial risk and distraction from core mission).
- ❌ **Paid Third-Party SaaS Oracles:** No Chainlink Functions or commercial oracles requiring paid subscriptions or fiat payment rails.
- ❌ **Centralized Closed-Source KYC Portals:** No paid identity verification APIs (Veriff, Jumio) that break the $0 budget mandate.
