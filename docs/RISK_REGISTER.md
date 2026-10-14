# AidTrace — Risk Register & Mitigation Strategy

**Project:** AidTrace  
**Tagline:** Transparent Aid. Verifiable Impact.  
**Version:** 1.0.0-rc  
**Last Updated:** October 14, 2026  

---

## 1. Risk Management Framework

AidTrace operates under strict technical, ethical, and budgetary constraints. This register catalogs identified risks, quantifies their likelihood and impact, outlines proactive mitigations, and defines fallback actions.

```
Severity Matrix:
Likelihood: Low (L), Medium (M), High (H)
Impact:     Low (L), Medium (M), High (H), Critical (C)
```

---

## 2. Risk Matrix

| Risk ID | Category | Risk Description | Likelihood | Impact | Mitigations & Controls | Contingency / Fallback Plan |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **RSK-01** | **Privacy & Ethics** | **PII Leakage in Public Ledger or Transaction Metadata:** Field submitter accidentally attaches beneficiary names, home addresses, or unredacted identification documents to on-chain calls or public IPFS. | M | C | **Strict Architectural Segregation:** Smart contract only accepts `bytes32` cryptographic hashes and coarse location strings (e.g. "District 4"). The client application strips all file names and EXIF metadata before generating hashes. | If accidental exposure occurs in off-chain staging, immediately purge the off-chain staging repository. Since on-chain payload is strictly a one-way hash, preimage cannot be reversed from the hash itself. |
| **RSK-02** | **Ethics & Truthfulness** | **"Hash Fallacy" / False Sense of Security:** Donors mistake a valid cryptographic hash or confirmed transaction for proof that physical aid was delivered into beneficiaries' hands. | H | H | **Humility in Cryptography Design Principle:** The UI explicitly displays warning callouts: *"A cryptographic hash guarantees file integrity and timestamping; it does not verify real-world delivery without authorized reviewer attestation."* | Clear status badges distinguishing: `Cryptographic Hash Verified` from `Field Delivery Attested by Authorized Reviewer`. |
| **RSK-03** | **Security & Access Control** | **Reviewer Impersonation / Sybil Collusion:** Malicious actors or corrupt project coordinators self-approve fraudulent milestone completions. | M | C | **Role-Based Access Control (RBAC):** Milestones can only be transitioned to `VERIFIED` by addresses explicitly granted `REVIEWER_ROLE` in the smart contract. Reviewer address and rationale hash are permanently logged in the event stream. | Admin can revoke reviewer roles immediately upon suspicion of collusion (`revokeReviewer`). Multi-sig admin support in v2. |
| **RSK-04** | **Financial & Budget** | **Hidden or Inadvertent Costs ($0 Violation):** Incurring SaaS fees, cloud hosting charges, paid RPC bills, or mainnet gas fees violating the strict $0 budget mandate. | L | C | **Strict Zero-Cost Policy:** Utilize only free public RPCs (`https://sepolia.base.org`), local Hardhat EVM for testing, free developer testnet faucets, and client-side browser Web Cryptography API. Zero credit-card required services. | Run contracts entirely in local simulated EVM if any testnet imposes monetary barriers. |
| **RSK-05** | **Technical & Infrastructure** | **Public Testnet RPC Throttling or Outage:** Public RPC (`sepolia.base.org`) rate-limits queries (HTTP 429) during hackathon judging or testing. | M | M | **Multi-Provider Fallback & Local Demo Kit:** Client architecture supports configured fallback RPC endpoints. The prototype includes a 100% offline self-contained demonstration mode running on a local Hardhat node. | Judges can run the complete project locally in 2 commands (`npm install`, `npm run demo`) with zero external network dependency. |
| **RSK-06** | **Technical & Compatibility** | **Node.js 24 Compatibility Issues:** Newer Node.js runtime (`v24.15.0`) encountering compatibility quirks with legacy Web3 or Hardhat dependencies. | M | M | Pin modern, stable dependencies (Ethers v6, Hardhat latest, Viem) known to function cleanly on modern Node versions, or utilize standard polyfills. | Validate all build and test commands early in Phase 2 before scaffolding frontend. |
| **RSK-07** | **Security & Smart Contracts** | **Reentrancy or Fund Draining:** Reentrancy vulnerabilities in project funding or escrow release logic. | L | C | Adhere strictly to the Checks-Effects-Interactions pattern. Integrate OpenZeppelin's `ReentrancyGuard` on all state-mutating payable functions. | Comprehensive automated unit test suite specifically testing reentrancy and unauthorized transfer vectors. |
| **RSK-08** | **UX & Accessibility** | **Web3 Wallet Barrier for General Public:** Donors and journalists unable or unwilling to install MetaMask or manage testnet gas to view project transparency data. | H | M | **Read-Only Public Explorer Mode:** Default view requires NO wallet connection, NO gas, and NO Web3 browser extension. Anyone can view all data and verify file hashes client-side using standard HTTP RPC queries. | Wallet connection is strictly prompted only when an authorized reviewer submits an on-chain attestation or coordinator creates a project. |

---

## 3. Continuous Risk Monitoring Protocol

1. **Before Every Git Commit:** Verify that `.env`, private keys, seed phrases, and testnet credentials are listed in `.gitignore`.
2. **Before Contract Compilation:** Run static checks and ensure zero high-severity compiler warnings.
3. **During Frontend Development:** Test UI without any wallet extension installed to confirm 100% functionality of the public audit mode.
4. **Before Submission (October 25, 2026):** Execute dry-run demonstration using the local fallback kit and verify that all claims in submission text match actual working code.
