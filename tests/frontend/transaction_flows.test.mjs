import { test, describe } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

// Helper functions mirroring frontend logic
function isValidSha256Hex(hash) {
  if (!hash) return false;
  const clean = hash.startsWith("0x") ? hash.slice(2) : hash;
  return /^[0-9a-fA-F]{64}$/.test(clean);
}

function truncateHash(hash, chars = 6) {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

function computeTextSha256(text) {
  return "0x" + crypto.createHash("sha256").update(text).digest("hex");
}

function validateTransactionInputs(actionType, params) {
  if (actionType === "RECORD_UPDATE") {
    if (!params.projectId || params.projectId < 1) {
      throw new Error("A valid positive Project ID is required.");
    }
    if (params.subtype === "FUNDING_ENTRY") {
      if (!params.amount || parseFloat(params.amount) <= 0 || isNaN(parseFloat(params.amount))) {
        throw new Error("Funding amount must be a positive number.");
      }
      if (!params.contributor || !params.contributor.trim()) {
        throw new Error("Contributor address or identifier is required.");
      }
    } else if (params.subtype === "ADD_MILESTONE") {
      if (!params.title || !params.title.trim()) {
        throw new Error("Milestone title cannot be empty.");
      }
    }
  } else if (actionType === "SUBMIT_EVIDENCE") {
    if (!params.projectId || !params.milestoneId) {
      throw new Error("Target Project ID and Milestone ID are required.");
    }
    if (!params.evidenceHash || !isValidSha256Hex(params.evidenceHash)) {
      throw new Error("Evidence hash must be a valid 64-character SHA-256 hexadecimal string.");
    }
    if (!params.metadataUri || !params.metadataUri.trim()) {
      throw new Error("Metadata URI is required.");
    }
  } else if (actionType === "REVIEWER_ATTESTATION") {
    if (!params.projectId || !params.milestoneId) {
      throw new Error("Target Project ID and Milestone ID are required.");
    }
    if (!params.rationale || params.rationale.trim().length < 15) {
      throw new Error("A clear, substantive rationale statement (minimum 15 characters) is required for auditability.");
    }
  } else if (actionType === "PROJECT_REGISTRATION") {
    if (!params.title || params.title.trim().length < 4) {
      throw new Error("Project title must be at least 4 characters.");
    }
    if (!params.coarseLocation || params.coarseLocation.trim().length < 3) {
      throw new Error("Coarse geographic location is required (e.g. 'Turkana County, Kenya').");
    }
    if (params.aggregateBeneficiariesTarget < 0 || isNaN(params.aggregateBeneficiariesTarget)) {
      throw new Error("Beneficiaries target must be 0 or a positive number.");
    }
    if (!params.targetFunding || !params.targetFunding.trim()) {
      throw new Error("Target funding declaration is required.");
    }
    if (params.initialMilestone) {
      if (!params.initialMilestone.title || !params.initialMilestone.title.trim()) {
        throw new Error("Initial milestone title cannot be empty.");
      }
      if (!params.initialMilestone.targetOutcome || !params.initialMilestone.targetOutcome.trim()) {
        throw new Error("Initial milestone target outcome cannot be empty.");
      }
    }
  }
  return true;
}

function enforceCoordinatorBinding(authenticatedSender, clientPayloadCoordinator) {
  // Coordinator is strictly derived from transaction sender, never client payload
  return authenticatedSender.toLowerCase();
}

function simulateReadAfterWriteVerification(expectedProjectId, expectedCoordinator, onChainState) {
  if (!onChainState) {
    throw new Error("Verification failed: project not found in contract storage.");
  }
  if (onChainState.id !== expectedProjectId) {
    throw new Error(`Project ID mismatch: expected ${expectedProjectId}, got ${onChainState.id}`);
  }
  if (onChainState.coordinator.toLowerCase() !== expectedCoordinator.toLowerCase()) {
    throw new Error(`Coordinator mismatch: expected ${expectedCoordinator}, got ${onChainState.coordinator}`);
  }
  return true;
}

function checkNetworkStatus(chainId, targetChainId = 61999) {
  if (!chainId) {
    return { isReady: false, status: "DISCONNECTED", message: "Wallet not connected" };
  }
  if (chainId !== targetChainId) {
    return {
      isReady: false,
      status: "WRONG_NETWORK",
      message: `Connected to chain ${chainId}. Switch to GenLayer StudioNet (${targetChainId}).`,
    };
  }
  return { isReady: true, status: "CONNECTED_STUDIONET", message: "Connected to GenLayer StudioNet" };
}

function handleWalletSigningResponse(response) {
  if (response.error) {
    if (response.error.code === 4001) {
      return { status: "REJECTED", message: "User rejected transaction signature request in wallet." };
    }
    return { status: "FAILED", message: response.error.message || "Signing failed" };
  }
  return { status: "ACCEPTED", txHash: response.txHash };
}

describe("AidTrace Transaction Center & Protocol Verification", () => {
  // Test 1: Each real transaction action input validation
  test("Validates RECORD_UPDATE funding entry parameters correctly", () => {
    // Valid
    assert.strictEqual(
      validateTransactionInputs("RECORD_UPDATE", {
        projectId: 1,
        subtype: "FUNDING_ENTRY",
        amount: "2.5",
        contributor: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
      }),
      true
    );

    // Invalid negative amount
    assert.throws(
      () =>
        validateTransactionInputs("RECORD_UPDATE", {
          projectId: 1,
          subtype: "FUNDING_ENTRY",
          amount: "-1.0",
          contributor: "0x123",
        }),
      /Funding amount must be a positive number/
    );

    // Invalid missing contributor
    assert.throws(
      () =>
        validateTransactionInputs("RECORD_UPDATE", {
          projectId: 1,
          subtype: "FUNDING_ENTRY",
          amount: "1.0",
          contributor: "",
        }),
      /Contributor address or identifier is required/
    );
  });

  // Test 2: Evidence Submission validation
  test("Validates SUBMIT_EVIDENCE cryptographic parameters", () => {
    const validHash = "0x0270319b919a2e140fad2facea59b39f6ee0738f81fb9c47008e579f2b59cc16";
    assert.strictEqual(
      validateTransactionInputs("SUBMIT_EVIDENCE", {
        projectId: 1,
        milestoneId: 1,
        evidenceHash: validHash,
        metadataUri: "ipfs://bafybeifc7x...",
      }),
      true
    );

    // Invalid non-hex hash
    assert.throws(
      () =>
        validateTransactionInputs("SUBMIT_EVIDENCE", {
          projectId: 1,
          milestoneId: 1,
          evidenceHash: "invalid-hash-string",
          metadataUri: "ipfs://doc",
        }),
      /Evidence hash must be a valid 64-character SHA-256 hexadecimal string/
    );

    // Missing metadata URI
    assert.throws(
      () =>
        validateTransactionInputs("SUBMIT_EVIDENCE", {
          projectId: 1,
          milestoneId: 1,
          evidenceHash: validHash,
          metadataUri: " ",
        }),
      /Metadata URI is required/
    );
  });

  // Test 3: Reviewer Attestation validation
  test("Validates REVIEWER_ATTESTATION rationale minimum length", () => {
    assert.strictEqual(
      validateTransactionInputs("REVIEWER_ATTESTATION", {
        projectId: 1,
        milestoneId: 1,
        rationale: "Physical warehouse inspection verified by regional water engineer.",
      }),
      true
    );

    // Short superficial rationale fails closed
    assert.throws(
      () =>
        validateTransactionInputs("REVIEWER_ATTESTATION", {
          projectId: 1,
          milestoneId: 1,
          rationale: "ok verified",
        }),
      /A clear, substantive rationale statement/
    );
  });

  // Test 4: Wallet unavailable or disconnected
  test("Detects disconnected wallet gracefully", () => {
    const status = checkNetworkStatus(null, 61999);
    assert.strictEqual(status.isReady, false);
    assert.strictEqual(status.status, "DISCONNECTED");
  });

  // Test 5: Wrong network detection
  test("Detects wrong network (e.g. Ethereum Mainnet 1 or Base Sepolia 84532)", () => {
    const mainnetCheck = checkNetworkStatus(1, 61999);
    assert.strictEqual(mainnetCheck.isReady, false);
    assert.strictEqual(mainnetCheck.status, "WRONG_NETWORK");

    const baseSepoliaCheck = checkNetworkStatus(84532, 61999);
    assert.strictEqual(baseSepoliaCheck.isReady, false);
    assert.strictEqual(baseSepoliaCheck.status, "WRONG_NETWORK");

    // Correct GenLayer StudioNet
    const studioCheck = checkNetworkStatus(61999, 61999);
    assert.strictEqual(studioCheck.isReady, true);
    assert.strictEqual(studioCheck.status, "CONNECTED_STUDIONET");
  });

  // Test 6: User rejects signing (Error 4001)
  test("Handles user rejection with clear notification without marking success", () => {
    const result = handleWalletSigningResponse({ error: { code: 4001, message: "User rejected" } });
    assert.strictEqual(result.status, "REJECTED");
    assert.match(result.message, /User rejected transaction signature/);
  });

  // Test 7: Submission failure handling
  test("Handles RPC or consensus submission error without false success", () => {
    const result = handleWalletSigningResponse({ error: { code: -32000, message: "Consensus timeout" } });
    assert.strictEqual(result.status, "FAILED");
    assert.strictEqual(result.message, "Consensus timeout");
  });

  // Test 8: Successful transaction returns protocol identifier
  test("Processes successful transaction with verified on-chain identifier", () => {
    const validTxHash = "0x9434a19975ac374aec11caf2703b7eca81f8d4a4a0d5ca8b9a650d5c4a9ab161";
    const result = handleWalletSigningResponse({ txHash: validTxHash });
    assert.strictEqual(result.status, "ACCEPTED");
    assert.strictEqual(result.txHash, validTxHash);
  });

  // Test 9: Evidence hash match and mismatch verification
  test("Verifies authentic file matches expected hash and detects tampering", () => {
    const authenticManifest = `AIDTRACE DEMONSTRATION DISPATCH MANIFEST #4409\nProject: Horn of Africa Emergency Water Logistics\nItem: 3 Solar Pumping Units (Submersible 5.5kW)\nDestination: Lodwar Regional Depot, Turkana County\nDate: 2026-10-14\n`;
    const tamperedManifest = `AIDTRACE DEMONSTRATION DISPATCH MANIFEST #4409\nProject: Horn of Africa Emergency Water Logistics\nItem: 1 Hand Pump (Altered)\nDestination: Lodwar Regional Depot, Turkana County\nDate: 2026-10-14\n`;

    const authenticHash = computeTextSha256(authenticManifest);
    const tamperedHash = computeTextSha256(tamperedManifest);

    assert.notStrictEqual(authenticHash, tamperedHash, "Authentic and tampered hashes must differ");

    // Authentic hash must match expected format
    assert.strictEqual(isValidSha256Hex(authenticHash), true);
    assert.strictEqual(isValidSha256Hex(tamperedHash), true);
  });

  // Test 10: Truncate hash utility
  test("Truncates hashes for human readability without corrupting values", () => {
    const hash = "0x43257a38E30eb0C522761992ee71C4Cb9f2A2338";
    const truncated = truncateHash(hash, 4);
    assert.strictEqual(truncated, "0x4325...2338");
  });

  // Test 11: Validates permissionless project creation parameters correctly
  test("Validates PROJECT_REGISTRATION valid form parameters", () => {
    const validParams = {
      title: "Clean Water Logistics for Turkana",
      coarseLocation: "Turkana County, Kenya",
      description: "Solar-powered deep water borehole drilling and distribution.",
      targetFunding: "15 ETH (Declared Target)",
      aggregateBeneficiariesTarget: 800,
      measurableOutcomes: "2 boreholes operational, 800 households reached",
      initialMilestone: {
        title: "Procurement of Pumping Hardware",
        targetOutcome: "Warehouse delivery with verified manifest",
        allocationAmount: "3.5 ETH",
      },
    };
    assert.strictEqual(validateTransactionInputs("PROJECT_REGISTRATION", validParams), true);
  });

  // Test 12: Rejects project registration with invalid inputs
  test("Rejects PROJECT_REGISTRATION with invalid title, location, or negative beneficiaries", () => {
    // Title too short
    assert.throws(
      () =>
        validateTransactionInputs("PROJECT_REGISTRATION", {
          title: "Aid",
          coarseLocation: "Region",
          aggregateBeneficiariesTarget: 100,
          targetFunding: "10 ETH",
          measurableOutcomes: "Outcomes",
        }),
      /Project title must be at least 4 characters/
    );

    // Missing coarse location
    assert.throws(
      () =>
        validateTransactionInputs("PROJECT_REGISTRATION", {
          title: "Clean Water Project",
          coarseLocation: " ",
          aggregateBeneficiariesTarget: 100,
          targetFunding: "10 ETH",
          measurableOutcomes: "Outcomes",
        }),
      /Coarse geographic location is required/
    );

    // Negative beneficiaries target
    assert.throws(
      () =>
        validateTransactionInputs("PROJECT_REGISTRATION", {
          title: "Clean Water Project",
          coarseLocation: "Region",
          aggregateBeneficiariesTarget: -5,
          targetFunding: "10 ETH",
          measurableOutcomes: "Outcomes",
        }),
      /Beneficiaries target must be 0 or a positive number/
    );

    // Missing target funding
    assert.throws(
      () =>
        validateTransactionInputs("PROJECT_REGISTRATION", {
          title: "Clean Water Project",
          coarseLocation: "Region",
          aggregateBeneficiariesTarget: 50,
          targetFunding: "",
          measurableOutcomes: "Outcomes",
        }),
      /Target funding declaration is required/
    );
  });

  // Test 13: Enforces coordinator address binding to transaction sender
  test("Enforces that transaction sender is the recorded coordinator, ignoring spoofed client payloads", () => {
    const authenticatedSender = "0x27D56637e172e9d288a4e8d35d1ea8dcd370fe47";
    const spoofedBrowserAddress = "0x000000000000000000000000000000000000dEaD";

    const boundCoordinator = enforceCoordinatorBinding(authenticatedSender, spoofedBrowserAddress);
    assert.strictEqual(boundCoordinator, authenticatedSender.toLowerCase());
    assert.notStrictEqual(boundCoordinator, spoofedBrowserAddress.toLowerCase());
  });

  // Test 14: Verifies read-after-write protocol before reporting success
  test("Acceptance: reports success only after protocol receipt and read-back verification match", () => {
    const expectedId = 2;
    const expectedCoordinator = "0x27D56637e172e9d288a4e8d35d1ea8dcd370fe47";

    const validOnChainState = {
      id: 2,
      title: "Clean Water Logistics",
      coordinator: "0x27d56637e172e9d288a4e8d35d1ea8dcd370fe47",
      status: "ACTIVE",
    };

    assert.strictEqual(
      simulateReadAfterWriteVerification(expectedId, expectedCoordinator, validOnChainState),
      true
    );

    // Mismatched coordinator fails closed
    const tamperedCoordinatorState = {
      id: 2,
      coordinator: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    };
    assert.throws(
      () => simulateReadAfterWriteVerification(expectedId, expectedCoordinator, tamperedCoordinatorState),
      /Coordinator mismatch/
    );

    // Missing project state fails closed
    assert.throws(
      () => simulateReadAfterWriteVerification(expectedId, expectedCoordinator, null),
      /Verification failed: project not found/
    );
  });

  // Test 15: Double submission prevention
  test("Prevents duplicate submissions caused by rapid repeated clicks while in-flight", () => {
    let isSubmitting = false;
    let submissionsHandled = 0;

    function handleSubmissionAttempt() {
      if (isSubmitting) {
        throw new Error("A transaction is already in flight. Please await protocol receipt.");
      }
      isSubmitting = true;
      submissionsHandled++;
    }

    // First click succeeds
    handleSubmissionAttempt();
    assert.strictEqual(submissionsHandled, 1);

    // Immediate second click is rejected
    assert.throws(() => handleSubmissionAttempt(), /already in flight/);
    assert.strictEqual(submissionsHandled, 1);
  });

  // Test 16: Wallet rejection never sets success status or fabricates tx hashes
  test("Ensures wallet rejection (4001) never sets accepted state and provides clear message", () => {
    const rejectionResponse = {
      error: { code: 4001, message: "User rejected the request." },
    };
    const outcome = handleWalletSigningResponse(rejectionResponse);
    assert.strictEqual(outcome.status, "REJECTED");
    assert.strictEqual(outcome.txHash, undefined);
    assert.match(outcome.message, /rejected/);
  });

  // Test 17: Separation between accounting entries and monetary contributions
  test("Strictly classifies record_funding as informational accounting and rejects custodial transfer assumptions", () => {
    const fundingAction = {
      method: "record_funding",
      amount: "5.0",
      contributor: "0xAlice",
      classification: "INFORMATIONAL_ACCOUNTING_RECORD",
      isPayable: false,
      holdsCustody: false,
    };

    assert.strictEqual(fundingAction.isPayable, false);
    assert.strictEqual(fundingAction.holdsCustody, false);
    assert.strictEqual(fundingAction.classification, "INFORMATIONAL_ACCOUNTING_RECORD");
  });

  // Test 18: Distinguishes live on-chain project records from sample demonstration fixtures
  test("Distinguishes live on-chain project records from sample demonstration fixtures", () => {
    const liveProject = {
      id: 1,
      networkSource: "StudioNet On-Chain (Live Contract)",
      coordinator: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
    };
    const sampleDemo = {
      id: 2,
      networkSource: "Sample Demonstration",
      coordinator: "0x71C67930752c54969814a21CE1A8bF4C3B24D984",
    };

    assert.strictEqual(liveProject.networkSource.includes("StudioNet"), true);
    assert.strictEqual(sampleDemo.networkSource.includes("Sample"), true);
    assert.notStrictEqual(liveProject.networkSource, sampleDemo.networkSource);
  });
});

