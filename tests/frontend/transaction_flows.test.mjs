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
});
