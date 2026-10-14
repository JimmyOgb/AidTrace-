# AidTrace — Transparent Aid. Verifiable Impact.

> **Target:** Tech Track Submission — Web3 for Social Good Hackathon 2026  
> **Submission Deadline:** October 25, 2026  
> **Budget Constraint:** Strictly $0.00 USD  
> **Current Status:** Phase 1 Complete (Research, Scope, & Architecture Finalized)

---

## 1. What is AidTrace?

**AidTrace** is a zero-cost, verifiable Web3 application engineered to solve the transparency and accountability crisis in community aid distribution. It bridges on-chain financial accounting and milestone tracking with off-chain operational evidence, verified through authorized independent reviewers—without exposing vulnerable beneficiaries to privacy violations.

### Key Principles
- **No "Garbage-In, Garbage-Out":** File hashes and blockchain transactions establish data integrity and timestamps; they do **not** magically prove physical aid delivery. Verification requires authorized independent human/organizational attestations.
- **Strict Privacy Boundaries:** Zero personally identifiable information (PII) on-chain or on public IPFS nodes. Beneficiary data is strictly represented in aggregate counts.
- **Fail-Closed Security:** In the event of network disruption, authorization failure, or corrupted data, the application halts state transitions and visibly alerts users rather than assuming success.
- **Public Auditability ($0 Wallet Requirement):** Donors, journalists, and the general public can audit live on-chain project records and verify document integrity in their browser without owning crypto, paying gas, or connecting a Web3 wallet.

---

## 2. Documentation Suite

Full technical specifications, threat models, and research reports are available in the [`docs/`](./docs) directory:

- [**Hackathon Requirements & Compliance**](./docs/HACKATHON_REQUIREMENTS.md): Confirmation of rules, judging criteria mapping, confirmed facts vs. assumptions, and submission checklist.
- [**Project Scope & Problem Specification**](./docs/PROJECT_SCOPE.md): Problem definition, stakeholder user journeys, on-chain vs. off-chain boundaries, and MVP scope.
- [**Technical Architecture Specification**](./docs/TECHNICAL_ARCHITECTURE.md): System architecture, blockchain selection (Base Sepolia + Local Hardhat EVM), data models, smart contract interface, and frontend design.
- [**Implementation Plan & Roadmap**](./docs/IMPLEMENTATION_PLAN.md): 5-phase execution plan, automated testing acceptance criteria, and judging video runbook.
- [**Risk Register & Mitigations**](./docs/RISK_REGISTER.md): Threat modeling across privacy, smart contracts, RPC availability, and budget constraints.

---

## 3. Technology Stack & Blockchain Selection

- **Smart Contract Layer:** Solidity `^0.8.24` (OpenZeppelin security patterns, ReentrancyGuard, RBAC).
- **Target Network:** **Base Sepolia** (Ethereum L2, Chain ID `84532`, 2s block times, micro-cent test fees, reliable public RPC `https://sepolia.base.org`).
- **Local Testing Environment:** Hardhat EVM (`chainId: 31337`) with TypeScript & Ethers v6.
- **Client Application:** React 18 + Vite + TypeScript + Tailwind CSS.
- **Client-Side Verification:** Native Web Cryptography API (`crypto.subtle.digest`) for zero-dependency SHA-256 evidence hashing in the browser.

---

## 4. Next Phase: Phase 2 Kickoff

With Phase 1 research and documentation completed, the project proceeds to **Phase 2: Smart Contract Core & Automated Unit Tests**.
