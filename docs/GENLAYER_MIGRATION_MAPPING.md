# AidTrace — GenLayer StudioNet Migration Mapping

**Project:** AidTrace — Transparent Aid. Verifiable Impact.  
**Track:** Tech Track — Web3 for Social Good Hackathon 2026  
**Primary Target Network:** GenLayer StudioNet (`chainId: 61999`, RPC: `https://studio.genlayer.com/api`)  
**Previous Reference:** Base Sepolia EVM (`AidTraceCore.sol`, 19 passing tests preserved as behavioral baseline)  
**Budget:** Strictly $0.00 USD  

---

## 1. Executive Summary & Paradigm Shift

AidTrace has definitively transitioned its primary execution and settlement target to **GenLayer StudioNet**. 

While standard EVM networks (like Base Sepolia) only verify deterministic cryptographic state transitions, GenLayer allows intelligent contracts to run non-deterministic consensus, subjective evaluation, and natural-language criteria verification across independent validators.

In AidTrace, this unlocks **Intelligent Evidence Assessment**: validators can independently verify whether non-sensitive operational evidence metadata matches stated project milestone criteria before an authorized human auditor finalizes the attestation.

### Core Ethical Boundary: Separation of AI Assessment and Human Verification
To prevent the "automation bias" and oracle fallacy:
1. **Intelligent Assessment (`assessment_status`):** GenLayer validators run non-deterministic consensus on evidence criteria matching. An AI assessment **never** proves real-world delivery and **never** automatically authorizes fund release.
2. **Authorized Reviewer Attestation (`review_status`):** An authorized, identified human/organizational field auditor must sign the final verification decision (`VERIFIED`, `REJECTED`, or `DISPUTED`).
3. Both distinct statuses are permanently recorded in the on-chain audit trail.

---

## 2. Solidity-to-GenLayer Architectural Mapping

| Dimension | Solidity EVM Implementation (`AidTraceCore.sol`) | GenLayer Intelligent Contract (`contracts/aid_trace.py`) |
| :--- | :--- | :--- |
| **Language & VM** | Solidity `^0.8.24` (EVM byte code) | Python 3 with GenVM Intelligent Contract SDK |
| **Runner Dependency** | N/A (EVM compiler target) | Pinned runner hash: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6` |
| **Execution Model** | Deterministic state transitions only | Hybrid: Deterministic state updates + Non-deterministic AI Consensus (`gl.nondet.exec_prompt`) |
| **Network & Gas** | Base Sepolia (Test ETH faucet required) | GenLayer StudioNet (Gasless, Chain ID `61999`) |
| **Storage Architecture** | EVM storage slots / `mapping(uint => Struct)` | GenLayer persistent storage: Class annotations with `TreeMap` and `DynArray` |
| **Caller Identity** | `msg.sender` (`address`) | `gl.message.sender_address` (`Address`) |
| **Custom Errors** | `error UnauthorizedReviewer(...)` + `revert` | `raise gl.vm.UserError("[EXPECTED] Unauthorized reviewer")` |
| **Event Logging** | Solidity `emit EventName(...)` | State audit history arrays (`audit_events: DynArray[str]`) queryable via view methods |

---

## 3. Method-by-Method Capability Translation

| Capability / Function | Solidity Reference | GenLayer Intelligent Contract Implementation | Testing & Verification Strategy |
| :--- | :--- | :--- | :--- |
| **Contract Initialization** | `constructor()` sets deployer as admin & initial reviewer | `def __init__(self)` sets `self.admin = gl.message.sender_address` and authorizes deployer | Verify deployer address and authorization flag via `direct_owner` fixture |
| **Reviewer Whitelist (RBAC)** | `setReviewerAuthorization(address, bool)` | `@gl.public.write def set_reviewer_authorization(self, reviewer: str, authorized: bool)` | Test authorized addition, revocation, and rejection of non-admin calls |
| **Project Registration** | `createProject(title, desc, location, target, beneficiaries, outcomes)` | `@gl.public.write def create_project(...)` validates non-empty inputs, stores in `TreeMap`, emits audit record | Test valid creation, empty field rejection, and field retrieval |
| **Project Status Lifecycle** | `setProjectStatus(projectId, status)` | `@gl.public.write def set_project_status(self, project_id: int, status: str)` | Test coordinator permissions and status changes (`ACTIVE`, `PAUSED`, `COMPLETED`) |
| **Transparent Funding** | `fundProject(projectId) payable` | `@gl.public.write def record_funding(self, project_id: int, amount: str, contributor: str)` | Verify declared target remains static while received balance accumulates |
| **Milestone Creation** | `addMilestone(projectId, title, outcome, allocation)` | `@gl.public.write def add_milestone(...)` | Verify milestone indexing, allocation bounds, and initial `PENDING` state |
| **Evidence Submission** | `submitMilestoneEvidence(projectId, milestoneId, hash, uri)` | `@gl.public.write def submit_milestone_evidence(...)` commits `evidence_hash` and `metadata_uri` | Verify client-side hash commitment without on-chain PII |
| **Intelligent Assessment (NEW)** | *Not possible in pure EVM* | `@gl.public.write def assess_evidence_criteria(...)` executes comparative prompt consensus over criteria vs summary | Mock LLM in direct tests; test consensus pass, fail-closed on discrepancy |
| **Milestone Review Workflow** | `reviewMilestoneEvidence(projectId, milestoneId, outcome, rationaleHash)` | `@gl.public.write def review_milestone_evidence(...)` records human reviewer attestation | Test `onlyAuthorizedReviewer`, reject unauthorized, prevent overwriting `VERIFIED` |
| **Public State Queries** | `getProject`, `getMilestones`, `getVerifiedCount` | `@gl.public.view` methods returning JSON dictionaries and arrays | Test public accessibility without wallet connection |

---

## 4. Preservation of Prior Artifacts

In strict compliance with project governance:
- `contracts/AidTraceCore.sol` is preserved in the repository.
- `test/AidTraceCore.test.ts` (19 passing Hardhat unit tests) remains intact as an EVM reference implementation.
- All GenLayer contracts will be located at `contracts/aid_trace.py` and tested using `pytest tests/direct/` via the installed `gltest` framework.
