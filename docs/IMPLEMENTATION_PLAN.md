# AidTrace — Implementation Plan & Verification Strategy

**Project:** AidTrace  
**Tagline:** Transparent Aid. Verifiable Impact.  
**Target Completion:** October 25, 2026  
**Status:** In Progress (Phase 1 Complete)  

---

## 1. Phased Development Roadmap

AidTrace is developed in five verifiable, sequential phases. Progression to the subsequent phase occurs only after passing all defined acceptance tests and criteria.

```
+---------------------------------------------------------------------------------------+
| PHASE 1: RESEARCH, ARCHITECTURE & SPECIFICATION                                      |
| Status: DONE                                                                          |
| Deliverables: HACKATHON_REQUIREMENTS.md, PROJECT_SCOPE.md, TECHNICAL_ARCHITECTURE.md,  |
|               IMPLEMENTATION_PLAN.md, RISK_REGISTER.md                                |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
| PHASE 2: SMART CONTRACT CORE & AUTOMATED TEST SUITE                                   |
| Status: READY TO EXECUTE                                                              |
| Deliverables: contracts/AidTraceCore.sol, test/AidTraceCore.test.ts,                  |
|               hardhat.config.ts, 100% passing tests for RBAC, funding, and evidence   |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
| PHASE 3: CLIENT APPLICATION & EVIDENCE HASHING ENGINE                                 |
| Status: PENDING PHASE 2                                                               |
| Deliverables: React + Vite + TypeScript frontend, Web Crypto API client-side hashing, |
|               Public Dashboard, Coordinator Console, Reviewer Portal                  |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
| PHASE 4: FULL-STACK INTEGRATION & LOCAL END-TO-END VERIFICATION                       |
| Status: PENDING PHASE 3                                                               |
| Deliverables: End-to-end simulation script, local Hardhat node connectivity,          |
|               Contract read/write integration, Fail-closed network error handling     |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
| PHASE 5: TESTNET DEPLOYMENT (BASE SEPOLIA) & JUDGING DEMO KIT                         |
| Status: PENDING PHASE 4                                                               |
| Deliverables: Live verified contract on Base Sepolia, BaseScan verification,          |
|               Live deployed web interface, Demo Runbook & Scripted Video Walkthrough  |
+---------------------------------------------------------------------------------------+
```

---

## 2. Phase Breakdown & Acceptance Criteria

### Phase 1: Research, Architecture & Specification (Complete)
- **Objective:** Establish problem boundaries, technical stack, $0 budget feasibility, and strict privacy/security rules.
- **Acceptance Criteria:**
  - [x] Clear definition of confirmed facts vs. assumptions.
  - [x] On-chain vs. off-chain data segregation clearly established.
  - [x] Blockchain selection justified (Base Sepolia + Local Hardhat).
  - [x] Risk register initialized with concrete mitigations.

### Phase 2: Smart Contract Core & Automated Unit Tests
- **Objective:** Implement `AidTraceCore.sol` with role-based access control, milestone lifecycle, funding accounting, and evidence submission.
- **Key Tasks:**
  1. Configure Hardhat development environment with TypeScript and Ethers v6.
  2. Implement `contracts/AidTraceCore.sol`:
     - Checks-Effects-Interactions pattern for all state mutations.
     - Custom error definitions (`UnauthorizedReviewer`, `InvalidMilestoneState`, `ZeroAddressError`, `ProjectInactive`).
     - Project registration, milestone addition, and funding tracking functions.
     - Role-based reviewer management (`grantReviewer`, `revokeReviewer`).
     - Evidence submission (`submitMilestoneEvidence`) storing `bytes32` hash.
     - Multi-state attestation (`reviewMilestoneEvidence`).
  3. Write exhaustive test suite in `test/AidTraceCore.test.ts`:
     - Test 1: Project creation with valid and invalid parameters.
     - Test 2: Direct project funding and accounting verification.
     - Test 3: Milestone definition and allocation limits.
     - Test 4: Submitting evidence hashes client-side and storing on-chain.
     - Test 5: Reviewer role access controls (only authorized reviewer can approve/reject).
     - Test 6: Preventing unauthorized users from verifying milestones.
     - Test 7: Immutability of verified milestones (cannot be overwritten).
- **Acceptance Criteria:**
  - 100% of unit tests pass via `npx hardhat test`.
  - Zero compiler warnings.

### Phase 3: Client Application & Privacy-Preserving Hashing Engine
- **Objective:** Build a responsive, accessible web application in TypeScript + React.
- **Key Tasks:**
  1. Scaffold frontend via Vite with React and Tailwind CSS.
  2. Implement Web Cryptography API module (`utils/crypto.ts`) for browser-based SHA-256 computation of local files.
  3. Build UI views:
     - **Public Transparency Hub:** View all aid projects, active funding, aggregate beneficiary progress, and audit logs.
     - **Evidence Verifier:** Drop any local document (PDF/JPG) to verify if its SHA-256 fingerprint matches the on-chain record.
     - **Coordinator Portal:** Form to create projects, milestones, and submit evidence hashes.
     - **Reviewer Portal:** Secure interface for authorized reviewers to inspect metadata and sign attestations.
- **Acceptance Criteria:**
  - Client compiles with zero TypeScript errors (`tsc --noEmit`).
  - Hashing module produces exact SHA-256 outputs identical to standard CLI `sha256sum`.
  - Application functions in read-only public mode without requiring wallet connection.

### Phase 4: Full-Stack Integration & Local End-to-End Simulation
- **Objective:** Connect frontend to local Hardhat node and execute complete operational lifecycles.
- **Key Tasks:**
  1. Write a comprehensive seeding and integration script (`scripts/seed-and-simulate.ts`).
  2. Simulate the full lifecycle:
     - Step 1: NGO creates "Clean Water Initiative - Turkana".
     - Step 2: Donor funds project with 0.5 ETH.
     - Step 3: NGO adds Milestone 1 ("Drilling 3 Boreholes") and submits SHA-256 hash of water test report.
     - Step 4: Unauthorized wallet attempts to verify -> Transaction reverts with `UnauthorizedReviewer`.
     - Step 5: Authorized field verifier reviews evidence and submits `VERIFIED` attestation.
     - Step 6: Public dashboard updates instantly reflecting verified milestone.
- **Acceptance Criteria:**
  - End-to-end automated script runs from start to finish without errors.
  - Fail-closed behavior validated when RPC is disconnected.

### Phase 5: Testnet Deployment (Base Sepolia) & Judging Demonstration
- **Objective:** Deploy contracts to Base Sepolia, verify contract source code on BaseScan, and package demo materials for submission.
- **Key Tasks:**
  1. Deploy `AidTraceCore.sol` to Base Sepolia using zero-cost faucet testnet ETH.
  2. Verify source code on BaseScan.
  3. Deploy web application to a free static hosting service (e.g. GitHub Pages or Vercel free hobby tier) or package as a 100% reproducible local run kit.
  4. Record 3-minute video walkthrough covering:
     - Problem and Mission.
     - Live on-chain verification demo.
     - Evidence integrity check in browser.
     - Code walkthrough and security boundaries.
- **Acceptance Criteria:**
  - Contract deployed and verified on BaseScan.
  - Demo runs smoothly with zero errors.

---

## 3. Demonstration & Video Runbook Structure

The final hackathon demonstration will follow a structured 3-minute script:

1. **0:00 - 0:45: The Problem & The AidTrace Solution**
   - Highlighting the $billions lost to opaque aid distribution and the danger of naive on-chain PII publication.
   - Introducing AidTrace: Transparent Aid, Verifiable Impact.
2. **0:45 - 1:45: The Core Workflow (Live Execution)**
   - Project creation and transparent fund accounting.
   - Milestone definition with aggregate beneficiary goals.
   - Field worker submits evidence: file hash generated locally in browser, committed to Base Sepolia.
3. **1:45 - 2:30: Independent Review & The Integrity Checker**
   - Authorized reviewer logs in with wallet, inspects off-chain evidence bundle, and issues an on-chain attestation.
   - Public user drops the off-chain PDF into the browser verifier: green checkmark confirms cryptographic match with BaseScan transaction link.
4. **2:30 - 3:00: Architecture, Privacy Ethics & Conclusion**
   - Summary of fail-closed security, zero-cost architecture, and data ethics principles.
