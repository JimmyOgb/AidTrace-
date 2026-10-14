# AidTrace — Technical Architecture Specification

**Project:** AidTrace  
**Tagline:** Transparent Aid. Verifiable Impact.  
**Version:** 1.0.0-rc  
**Last Updated:** October 14, 2026  

---

## 1. Architectural Overview & System Design

AidTrace is engineered as a zero-cost, verifiable decentralized application (dApp). It combines EVM-based smart contracts for immutable state, accounting, and cryptographic attestation with a client-side TypeScript application for privacy-preserving evidence processing and public transparency dashboards.

```
+---------------------------------------------------------------------------------------------------------+
|                                              AIDTRACE CLIENT                                            |
|                                         (TypeScript + React + Vite)                                     |
|                                                                                                         |
|  +---------------------------+  +-------------------------------+  +---------------------------------+  |
|  | Public Project Dashboard  |  |   Evidence Integrity Checker  |  |    Reviewer Portal (RBAC)       |  |
|  | - Declared vs Received    |  | - Client-side SHA-256 Hashing |  | - EIP-1193 Wallet Connection    |  |
|  | - Milestone Lifecycle     |  | - File Integrity Check vs L2  |  | - State Transitions (Approve/   |  |
|  | - Verifiable Impact Stats |  | - Zero PII Transmission       |  |   Reject / Dispute)             |  |
|  +---------------------------+  +-------------------------------+  +---------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
                                    |                                         ^
              Read-Only RPC Queries | (Public Fallback Provider)              | Signed Transactions
                                    v                                         | (MetaMask / Injected Wallet)
+---------------------------------------------------------------------------------------------------------+
|                                    BLOCKCHAIN LAYER (Base Sepolia L2)                                    |
|                                      Public RPC: https://sepolia.base.org                               |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | AidTraceCore.sol (Unified Modular Smart Contract)                                                 |  |
|  |                                                                                                   |  |
|  | [1] Project Registry Module                                                                       |  |
|  |     - createProject(title, description, coarseLocation, targetFunding, aggregateBeneficiaries)    |  |
|  |     - addMilestone(projectId, title, allocationAmount, targetOutcome)                             |  |
|  |     - fundProject(projectId) {payable} -> ledger tracking & balances                              |  |
|  |                                                                                                   |  |
|  | [2] Evidence & Attestation Module                                                                 |  |
|  |     - submitMilestoneEvidence(projectId, milestoneId, bytes32 evidenceHash, string metadataUri)   |  |
|  |     - reviewMilestoneEvidence(projectId, milestoneId, ReviewStatus status, bytes32 rationaleHash) |  |
|  |                                                                                                   |  |
|  | [3] Role-Based Access Control (RBAC)                                                              |  |
|  |     - Owner / Admin role (grant/revoke reviewers)                                                 |  |
|  |     - Authorized Reviewer role                                                                    |  |
|  |     - Project Coordinator role                                                                    |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Blockchain Selection & Justification

### 2.1 Selected Target: Base Sepolia (Ethereum L2) + Local Hardhat EVM
AidTrace deploys to **Base Sepolia** (`chainId: 84532`) for public demonstration and uses a local **Hardhat EVM** (`chainId: 31337`) for zero-cost automated unit testing and offline development.

### 2.2 Comparative Evaluation Matrix

| Criteria | Base Sepolia (Selected) | Ethereum Sepolia (L1) | Arbitrum Sepolia | Polygon Amoy |
| :--- | :--- | :--- | :--- | :--- |
| **Transaction Fees** | Micro-cents (< $0.0001 equivalent in test ETH) | High gas spikes; test ETH scarcity | Micro-cents | Low |
| **Block Confirmation** | ~2 seconds (Sub-second UX) | ~12 seconds | ~1 second | ~2 seconds |
| **Faucet Availability ($0)** | Abundant (Superchain faucet, Coinbase dev faucet, Google Cloud faucet) | High friction; requires PoW mining or mainnet balance | Moderate | Moderate |
| **Public RPC Reliability** | Official unmetered RPC (`https://sepolia.base.org`) | Dynamic rate limits; frequent 429s on public nodes | Official RPC available | Occasional RPC drops |
| **Developer Ecosystem** | Standard EVM; full OpenZeppelin & Ethers/Viem support | Standard EVM | Standard EVM | EVM compatible |
| **Block Explorer** | BaseScan (Free, clean verified source code display) | Etherscan | Arbiscan | PolygonScan |

**Decision:** Base Sepolia provides the lowest gas footprint, predictable 2-second block times, and generous zero-cost faucet options, satisfying the strict $0 budget mandate while maintaining standard EVM compatibility.

---

## 3. On-Chain vs. Off-Chain Separation Model

To uphold data privacy, legal compliance (GDPR/humanitarian data protection), and cost efficiency, data is partitioned deliberately:

```
+------------------------------------+      +-----------------------------------------+
|        ON-CHAIN (PUBLIC)           |      |          OFF-CHAIN (PRIVATE)            |
+------------------------------------+      +-----------------------------------------+
| - Project ID & Title               |      | - Full Beneficiary Lists / Rosters      |
| - Coarse Geographic Label          |      | - Street-level addresses / GPS points   |
| - Declared Target (in wei)         |      | - Vendor Invoices & Bank Wire Receipts  |
| - Actual Received Funds (in wei)   |      | - Unredacted ID photos / Personal docs  |
| - Milestone Target Metrics         |      | - Detailed field inspection raw notes   |
| - Evidence Hash (bytes32 SHA-256)  |      | - Operational staff personal details    |
| - Reviewer Address & Attestation   |      |                                         |
| - Lifecycle State Machine Flags    |      |                                         |
+------------------------------------+      +-----------------------------------------+
```

---

## 4. Smart Contract Architecture: `AidTraceCore.sol`

To avoid unnecessary contract deployment complexity and gas overhead, AidTrace uses a cohesive, audited modular contract: `AidTraceCore.sol`.

### 4.1 State Machine & Data Models

#### Enums
```solidity
enum ProjectStatus { DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED }
enum MilestoneStatus { PENDING, EVIDENCE_SUBMITTED, UNDER_REVIEW, VERIFIED, REJECTED, DISPUTED }
```

#### Structs
```solidity
struct Project {
    uint256 id;
    address coordinator;
    string title;
    string description;
    string coarseLocation; // e.g. "Turkana County, Kenya"
    uint256 targetFunding;  // in wei
    uint256 totalReceived;  // in wei
    uint256 aggregateBeneficiariesTarget; // e.g. 500
    ProjectStatus status;
    uint256 createdAt;
    uint256 milestoneCount;
}

struct Milestone {
    uint256 id;
    uint256 projectId;
    string title;
    uint256 targetOutcome; // e.g. 1000 kits
    uint256 allocationAmount; // in wei
    bytes32 evidenceHash;   // SHA-256 fingerprint of evidence bundle
    string metadataUri;     // Public reference (e.g. IPFS CID or schema pointer)
    address reviewer;       // Address that performed the attestation
    bytes32 rationaleHash;  // Optional hash of reviewer's evaluation notes
    MilestoneStatus status;
    uint256 submittedAt;
    uint256 reviewedAt;
}
```

#### Events
```solidity
event ProjectCreated(uint256 indexed projectId, address indexed coordinator, string title, uint256 targetFunding);
event ProjectFunded(uint256 indexed projectId, address indexed donor, uint256 amount, uint256 newTotal);
event MilestoneAdded(uint256 indexed projectId, uint256 indexed milestoneId, string title, uint256 allocationAmount);
event EvidenceSubmitted(uint256 indexed projectId, uint256 indexed milestoneId, bytes32 evidenceHash, address indexed submitter);
event EvidenceReviewed(uint256 indexed projectId, uint256 indexed milestoneId, MilestoneStatus status, address indexed reviewer, bytes32 rationaleHash);
event ReviewerRoleUpdated(address indexed account, bool isAuthorized);
```

### 4.2 Security & Access Control Architecture
1. **Role-Based Access Control (RBAC):**
   - `admin`: Manages reviewer authorizations and critical emergency controls.
   - `authorizedReviewers`: Authorized addresses permitted to call `reviewMilestoneEvidence()`.
   - `coordinator`: Only the project creator can add milestones and submit evidence.
2. **Reentrancy Protection:** All fund-handling operations follow the Checks-Effects-Interactions pattern and implement OpenZeppelin's `ReentrancyGuard`.
3. **Immutability of Finalized Records:** Once a milestone is marked `VERIFIED`, its evidence hash and approval record cannot be overwritten or deleted.
4. **Fail-Closed Verification:** Only explicitly whitelisted reviewer addresses can transition milestones from `EVIDENCE_SUBMITTED` or `UNDER_REVIEW` to `VERIFIED`.

---

## 5. Frontend & Client Architecture

### 5.1 Tech Stack
- **Framework:** React 18 + Vite + TypeScript (Strict mode enabled).
- **Styling:** Tailwind CSS (Accessible, clean, high-contrast, responsive).
- **Web3 Interface:** Viem / Ethers v6 for lightweight, type-safe contract bindings.
- **Client-Side Hashing:** Web Cryptography API (`crypto.subtle.digest("SHA-256", buffer)`) ensuring zero third-party dependencies for document verification.

### 5.2 Key User Interface Views
1. **Public Impact & Transparency Explorer:**
   - Global metrics: Total declared targets, total funds received, verified milestones ratio.
   - Project cards displaying lifecycle state badges, aggregate beneficiary metrics, and funding progress bars.
   - Milestone timeline with verified timestamps and reviewer attribution.
2. **Independent Evidence Verifier (Zero-Knowledge / Privacy-Preserving):**
   - User drags and drops any off-chain PDF, image, or CSV document.
   - Client calculates SHA-256 hash locally in memory without transmitting any data over the network.
   - Queries contract on Base Sepolia to check whether the hash matches the on-chain milestone commitment.
   - Shows green match banner or mismatch warning with exact timestamps.
3. **Reviewer Portal:**
   - Displays milestones pending verification.
   - Form to inspect off-chain evidence bundle, input evaluation rationale, and execute on-chain attestation (`VERIFY` or `REJECT`).
4. **Project Coordinator Dashboard:**
   - Project initialization form.
   - Milestone budget and outcome indicator setup.
   - Evidence submission uploader (hashes file client-side and initiates contract write).

---

## 6. Resilience & Fail-Closed Error Handling

1. **Unreachable RPC / Network Down:**
   - If the public Base Sepolia RPC is unreachable, the client displays a persistent warning banner: *"Network connection unavailable. Operating in offline mode. Live on-chain status cannot be verified."*
   - Never falls back to fabricated data or cached success states without explicit labeling.
2. **Unauthorized Review Attempt:**
   - UI detects wallet address and disables verification actions for non-whitelisted addresses.
   - Smart contract enforces `onlyAuthorizedReviewer` modifier, reverting unauthorized transactions with custom error `UnauthorizedReviewer(msg.sender)`.
3. **Invalid File or Empty Hash:**
   - Client validates `evidenceHash != bytes32(0)` before transaction submission.
   - Prevents zero-value submissions at the contract level.
