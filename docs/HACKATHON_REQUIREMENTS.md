# AidTrace — Hackathon Requirements & Compliance Specification

**Project:** AidTrace  
**Tagline:** Transparent Aid. Verifiable Impact.  
**Track:** Tech Track — Web3 for Social Good Hackathon 2026  
**Submission Deadline:** October 25, 2026  
**Budgetary Constraint:** Strictly $0.00 USD (No paid APIs, no commercial SaaS dependencies, no paid gas/credits)  

---

## 1. Hackathon Overview & Scope Alignment

The **Web3 for Social Good Hackathon 2026 (Tech Track)** focuses on applying decentralized technologies, cryptographic verification, and open architectures to humanitarian, environmental, and social challenges.

AidTrace addresses the transparency, accountability, and verification deficit in community aid and disaster relief distribution. Traditional aid distribution relies heavily on opaque centralized self-reporting, creating trust deficits among donors, inefficiencies in allocation, and vulnerabilities to corruption or diversion. 

AidTrace establishes an auditable, verifiable, and privacy-preserving bridge between declared aid funding, field-level execution evidence, and independent verification attestations.

---

## 2. Confirmed Facts vs. Working Assumptions

To maintain intellectual honesty and technical integrity, project requirements are partitioned into verified facts and baseline assumptions.

### 2.1 Confirmed Facts
1. **Submission Deadline:** October 25, 2026. All source code, smart contracts, test suites, and demonstration workflows must be finalized and reproducible prior to this date.
2. **Zero-Dollar Budget Mandate:** All development, testing, contract deployments, hosting, and demonstrations must execute strictly without incurring financial costs or requiring paid subscription tiers.
3. **Core Functional Mandate:**
   - On-chain aid project registry with coarse geographic demarcation and aggregated beneficiary metrics.
   - Explicit separation between declared funding targets and actual funds received.
   - Evidence submission with cryptographic hashing (e.g., SHA-256 / keccak256).
   - Strict off-chain segregation of private and personal data (PII).
   - Cryptographic access control for reviewers preventing unauthorized approvals or state manipulation.
   - Truthful reporting: file hashes or transaction receipts must **never** be misrepresented as physical proof of aid delivery.
   - Fail-closed system behavior under network, RPC, or authorization failures.
4. **Toolchain Availability in Local Environment:**
   - Node.js `v24.15.0`
   - npm `11.12.1`
   - Git `2.55.0`
   - Python `3.12.10`
   - OS: Windows 11 (PowerShell terminal environment)

### 2.2 Working Assumptions & Verification Status
| Assumption | Rationale | Risk Level | Validation / Fallback |
| :--- | :--- | :--- | :--- |
| **Base Sepolia Testnet Availability** | Base Sepolia (`chainId: 84532`) offers a free public RPC (`https://sepolia.base.org`), fast block times (~2s), and well-established open block explorers (BaseScan). | Low | Validated via network probing. Fallback: Local Hardhat/Anvil node for offline evaluation. |
| **Public RPC Rate Limits** | Public RPC endpoints have dynamic throttling without SLA guarantees. | Medium | App architecture includes fallback RPC endpoints and handles HTTP 429 errors gracefully with UI alerts. |
| **Browser Wallet Compatibility** | Standard EIP-1193 injected providers (MetaMask, Coinbase Wallet, Rabby) operate without custom infrastructure. | Low | Direct Ethers/Viem integration with fallback read-only RPC provider so non-wallet users can fully audit the platform. |
| **Zero-Cost Storage Strategy** | Fully decentralized storage (IPFS/Arweave) either requires paid gateways, credit cards for pinning services, or runs locally. | High | Evidence hashes and structured metadata are cryptographically calculated client-side. Metadata bundles can be exported/stored locally or on free open endpoints without requiring paid Pinata/Filecoin subscriptions. |

---

## 3. Evaluation Criteria & AidTrace Alignment

Judges in the Tech Track evaluate projects across five core dimensions:

### 3.1 Technical Execution & Solidity/Smart Contract Security (Weight: 30%)
- **Standard:** Clean, modular smart contracts following standard EVM conventions (e.g., OpenZeppelin contracts where appropriate, checks-effects-interactions pattern, explicit custom errors).
- **AidTrace Implementation:**
  - `AidProjectRegistry.sol`: Immutable registry of aid campaigns, milestone definitions, target metrics, and fund accounting.
  - `AidVerificationHub.sol`: Role-based access control (RBAC) for field verifiers, cryptographic commitment of evidence hashes (`bytes32`), state machine transitions, and tamper-resistant audit logs.
  - 100% automated test coverage across state transitions, edge conditions, reentrancy guards, and access-control violations.

### 3.2 Real-World Social Impact & Problem Relevance (Weight: 25%)
- **Standard:** Solving an authentic humanitarian bottleneck rather than using blockchain for its own sake.
- **AidTrace Implementation:**
  - Directly tackles the "black box" of NGO overhead and phantom deliveries.
  - Introduces milestone-locked aid distribution, ensuring funds are accounted for before subsequent tranches are approved.
  - Protects vulnerable beneficiaries by forbidding PII on public ledgers while enabling verifiable claims.

### 3.3 Privacy & Data Ethics (Weight: 20%)
- **Standard:** Protecting vulnerable populations from surveillance capitalism and doxxing.
- **AidTrace Implementation:**
  - Aggregation-only beneficiary tracking (e.g., "450 households provided emergency water purification kits in District 4", never individual names or biometric tags).
  - Cryptographic evidence hashing offloads raw documents (receipts, manifests, surveyor photos) to private off-chain verification vaults, committing only the SHA-256 fingerprint on-chain.

### 3.4 Truthful Reporting & Failure Modes (Weight: 15%)
- **Standard:** Transparency regarding what blockchain can and cannot verify (avoiding the "garbage-in, garbage-out" blockchain oracle fallacy).
- **AidTrace Implementation:**
  - Explicit UI disclaimers distinguishing **Cryptographic Integrity** (file unchanged) from **Real-World Veracity** (attested by verified reviewer).
  - Visual badges distinguishing On-Chain Verified Facts vs. Unverified Field Submissions vs. Simulated Demonstrations.
  - Fail-closed UI: When the RPC is disconnected, the app never shows fabricated or cached "success" states.

### 3.5 User Experience & Accessibility (Weight: 10%)
- **Standard:** Intuitive interface for donors, project managers, and field verifiers.
- **AidTrace Implementation:**
  - Responsive TypeScript + React frontend.
  - Read-only public audit mode requiring zero wallet connection or Web3 knowledge for general public and donors.
  - Interactive verification console for authorized reviewers with live signature prompts.

---

## 4. Hackathon Submission Deliverables Checklist

- [ ] Open-source Git repository with clean commit history.
- [ ] Comprehensive documentation in `/docs` (Architecture, Scope, Security, Implementation).
- [ ] Fully tested smart contracts with automated test run scripts.
- [ ] Verified deployment on public testnet (Base Sepolia) with verified contract source code on BaseScan.
- [ ] Working web frontend with read-only audit dashboard and wallet-connected reviewer workflow.
- [ ] High-fidelity demonstration runbook with sample projects and honest evidence verification walkthrough.
- [ ] Recorded 3-minute video demonstration covering problem, solution, code architecture, and live execution.
