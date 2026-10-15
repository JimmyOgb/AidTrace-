# AidTrace — Transparent Aid. Verifiable Impact.

> **Target:** Tech Track Submission — Web3 for Social Good Hackathon 2026  
> **Submission Deadline:** October 25, 2026  
> **Budget Constraint:** Strictly $0.00 USD (No mainnet spend, zero paid SaaS)  
> **Primary Network:** **GenLayer StudioNet** (Chain ID: `61999`, RPC: `https://studio.genlayer.com/api`)  
> **Deployed Contract Address:** `0x43257a38E30eb0C522761992ee71C4Cb9f2A2338`  
> **Production App:** [https://aidtrace.vercel.app](https://aidtrace.vercel.app)  
> **GitHub Repository:** [https://github.com/JimmyOgb/AidTrace-](https://github.com/JimmyOgb/AidTrace-)  
> **Test Status:** 13/13 GenLayer Direct Tests Passing • 10/10 Frontend Transaction & Validation Tests Passing • GenVM Linter Validated • Production Vite Build Verified

---

## 1. What is AidTrace?

**AidTrace** is a zero-cost, verifiable Web3 intelligent application engineered to solve the transparency and accountability crisis in humanitarian aid distribution. It bridges immutable on-chain project tracking and cryptographic milestone evidence with GenLayer intelligent consensus and authorized independent human reviewer attestations—without exposing vulnerable beneficiaries to privacy violations.

### Key Architectural Tenets
- **Humanitarian Visual Direction:** A dignified, accessible user interface grounded in community solidarity, featuring authentic humanitarian imagery, accessible typography, and deep teal / dark navy / warm white accents.
- **Dedicated On-Chain Transaction Center:** A visible action center supporting real write operations on GenLayer StudioNet with input validation, review/confirmation screens before signing, irreversible testnet write disclosures, and dual execution routes (Browser Wallet EIP-1193 + Developer CLI Procedure).
- **Mandatory Honest Distinction Between Transaction Types:** Informational ledger entries (`record_funding`) are strictly distinguished from actual monetary transfers. A prominent disclosure clarifies that monetary escrow is not enabled in this deployment, presenting the minimal safe contract upgrade required.
- **Separation of AI Assessment and Human Attestation:** GenLayer validator consensus evaluates criteria alignment against non-sensitive evidence metadata. An AI assessment **never** equates to physical delivery. An authorized field reviewer with role-based access must attest real-world completion.
- **Strict Privacy Boundaries:** Zero personally identifiable information (PII) on-chain. Beneficiary data is strictly represented in aggregate planning targets.
- **Fail-Closed Security:** Unauthorized callers, tampered evidence, or invalid state transitions revert with deterministic custom errors.

---

## 2. On-Chain Transaction Methods & Status Matrix

| Contract Method | Action Classification | Target Network | Execution Flow | Access Guard |
| :--- | :--- | :--- | :--- | :--- |
| `record_funding` | **On-Chain Accounting Update** | StudioNet (61999) | Signed Tx (`genlayer write` / Browser wallet approval) | Public (Active projects only) |
| `add_milestone` | **Milestone Registry** | StudioNet (61999) | Signed Tx (`genlayer write` / Browser wallet approval) | Project Coordinator or Admin |
| `set_project_status`| **Lifecycle Status Update** | StudioNet (61999) | Signed Tx (`genlayer write` / Browser wallet approval) | Project Coordinator or Admin |
| `submit_milestone_evidence` | **Evidence Hash Commitment** | StudioNet (61999) | Signed Tx committing SHA-256 digest + metadata URI | Project Coordinator or Admin |
| `assess_evidence_criteria` | **Intelligent AI Assessment** | StudioNet (61999) | Non-deterministic consensus prompt evaluation | Public (Submitted/Under Review) |
| `review_milestone_evidence` | **Reviewer Attestation** | StudioNet (61999) | Signed Tx committing decision + rationale fingerprint | Authorized Reviewer (RBAC) |
| `fundProject (Escrow Transfer)` | **Monetary Contribution** | *Not Enabled* | **Explicitly Disabled in this Deployment** | Proposes Safe Multi-sig Escrow Upgrade |

---

## 3. Technology Stack & Deployment

- **Primary Intelligent Contract:** `contracts/aid_trace.py` (GenLayer Python Intelligent Contract with pinned runner `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`).
- **Deployed StudioNet Address:** `0x43257a38E30eb0C522761992ee71C4Cb9f2A2338` (Deploy Tx: `0x9434...b161`).
- **Behavioral Reference Contract:** `contracts/AidTraceCore.sol` (EVM Solidity baseline, 19 passing tests preserved).
- **Test Frameworks:**
  - `pytest tests/direct/ -v` (13/13 passing tests via `genlayer-test`).
  - `node --test tests/frontend/*.test.mjs` (10/10 passing tests via native Node test runner).
  - `genvm-lint check contracts/aid_trace.py --json` (Zero linter errors).
- **Frontend Stack:** React 19 + Vite 8 + TypeScript + Tailwind CSS + Lucide React.
- **Client-Side Hashing:** Native Web Cryptography API (`crypto.subtle.digest`) for zero-dependency in-memory SHA-256 evidence verification.

---

## 4. Verification & Testing Commands

```bash
# 1. Run GenLayer Intelligent Contract Direct Tests (13 passed)
npm run test:genlayer

# 2. Run Frontend Transaction Flow & Validation Tests (10 passed)
npm run test:frontend

# 3. Validate contract syntax & SDK semantics
npm run lint:genlayer

# 4. Verify TypeScript compilation
npm run typecheck

# 5. Build production web bundle
npm run build
```

---

## 5. Live StudioNet Verification via CLI

You can read directly from the live deployed contract on GenLayer StudioNet without gas fees or account setup:

```bash
# Query total project count on StudioNet
genlayer call 0x43257a38E30eb0C522761992ee71C4Cb9f2A2338 get_project_count

# Query Project #1 on-chain state
genlayer call 0x43257a38E30eb0C522761992ee71C4Cb9f2A2338 get_project --args 1

# Query live append-only audit trail
genlayer call 0x43257a38E30eb0C522761992ee71C4Cb9f2A2338 get_audit_trail
```
