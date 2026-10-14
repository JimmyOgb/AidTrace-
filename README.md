# AidTrace — Transparent Aid. Verifiable Impact.

> **Target:** Tech Track Submission — Web3 for Social Good Hackathon 2026  
> **Submission Deadline:** October 25, 2026  
> **Budget Constraint:** Strictly $0.00 USD  
> **Primary Network:** **GenLayer StudioNet** (Chain ID: `61999`, RPC: `https://studio.genlayer.com/api`)  
> **Deployed Contract Address:** `0x43257a38E30eb0C522761992ee71C4Cb9f2A2338`  
> **Status:** Live & Tested (10/10 Direct Tests Passing, 19/19 Solidity Behavioral Baseline Tests Preserved, Frontend Built)

---

## 1. What is AidTrace?

**AidTrace** is a zero-cost, verifiable Web3 intelligent application engineered to solve the transparency and accountability crisis in community aid distribution. It bridges on-chain financial accounting and milestone tracking with off-chain operational evidence, verified through GenLayer intelligent consensus and authorized independent reviewers—without exposing vulnerable beneficiaries to privacy violations.

### Key Principles
- **Separation of AI Assessment and Human Attestation:** GenLayer validator consensus evaluates criteria alignment against non-sensitive evidence metadata. An AI assessment **never** equates to physical delivery. An authorized field reviewer must attest real-world completion.
- **Strict Privacy Boundaries:** Zero personally identifiable information (PII) on-chain. Beneficiary data is strictly represented in aggregate counts.
- **Fail-Closed Security:** Unauthorized callers, tampered evidence, or invalid state transitions revert with deterministic custom errors.
- **Public Auditability ($0 Requirement):** Donors, journalists, and communities can audit live on-chain project records and verify document integrity in their browser without owning crypto, paying gas, or connecting a Web3 wallet.

---

## 2. Documentation Suite

- [**GenLayer StudioNet Migration Mapping**](./docs/GENLAYER_MIGRATION_MAPPING.md): Detailed architectural translation from Solidity EVM to GenLayer Python Intelligent Contracts.
- [**Hackathon Requirements & Compliance**](./docs/HACKATHON_REQUIREMENTS.md): Rules confirmation, judging criteria mapping, confirmed facts vs. assumptions, and submission checklist.
- [**Project Scope & Problem Specification**](./docs/PROJECT_SCOPE.md): Problem definition, stakeholder user journeys, on-chain vs. off-chain boundaries, and MVP scope.
- [**Technical Architecture Specification**](./docs/TECHNICAL_ARCHITECTURE.md): System design, GenLayer network selection, data models, and fail-closed design.
- [**Implementation Plan & Roadmap**](./docs/IMPLEMENTATION_PLAN.md): Phased roadmap, automated testing criteria, and video presentation runbook.
- [**Risk Register & Mitigations**](./docs/RISK_REGISTER.md): Threat modeling across privacy, AI consensus boundaries, and zero-dollar budget compliance.

---

## 3. Technology Stack & Deployment

- **Primary Intelligent Contract:** `contracts/aid_trace.py` (GenLayer Python Intelligent Contract with pinned runner `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`).
- **Deployed StudioNet Address:** `0x43257a38E30eb0C522761992ee71C4Cb9f2A2338`
- **Behavioral Reference Contract:** `contracts/AidTraceCore.sol` (EVM Solidity baseline, 19 passing tests preserved).
- **Test Framework:** `pytest tests/direct/ -v` (10/10 passing tests via `genlayer-test`).
- **Frontend Stack:** React 19 + Vite + TypeScript + Tailwind CSS + Lucide React.
- **Client-Side Hashing:** Native Web Cryptography API (`crypto.subtle.digest`) for zero-dependency in-memory SHA-256 evidence verification.

---

## 4. Verification Commands

```bash
# Run GenLayer Intelligent Contract Direct Tests
npm run test:genlayer

# Validate contract syntax & SDK semantics
npm run lint:genlayer

# Build production web application
npm run build

# Run Solidity EVM behavioral baseline tests
npm run test:solidity
```
