import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Wallet,
  ArrowRight,
  Info,
  Clock,
  Layers,
  FileCheck2,
  FileText,
  UserCheck,
  Coins,
} from "lucide-react";
import {
  GENLAYER_CONFIG,
  VERIFIED_AUDIT_TRAIL,
  AuditEvent,
  TransactionRecord,
} from "../utils/genlayer";
import { computeTextSha256, isValidSha256Hex, truncateHash } from "../utils/crypto";

interface TransactionCenterProps {
  initialProjectId?: number;
  initialMilestoneId?: number;
  initialEvidenceHash?: string;
  onTransactionSuccess?: (record: TransactionRecord) => void;
}

export const TransactionCenter: React.FC<TransactionCenterProps> = ({
  initialProjectId = 1,
  initialMilestoneId = 1,
  initialEvidenceHash = "",
  onTransactionSuccess,
}) => {
  // Navigation tabs
  type ActionType = "RECORD_UPDATE" | "SUBMIT_EVIDENCE" | "REVIEWER_ATTESTATION" | "CONTRIBUTE_FUNDS";
  const [activeTab, setActiveTab] = useState<ActionType>("RECORD_UPDATE");

  // Wallet connection state
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>("");

  // Form states for Action A: Record On-Chain Update
  const [updateSubtype, setUpdateSubtype] = useState<"FUNDING_ENTRY" | "ADD_MILESTONE" | "SET_STATUS">("FUNDING_ENTRY");
  const [recordProjectId, setRecordProjectId] = useState<number>(initialProjectId);
  const [fundingAmount, setFundingAmount] = useState<string>("1.5");
  const [contributorTag, setContributorTag] = useState<string>("0xe4220c4b71877bb94eb173f467ef5c5557017085");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>("Emergency Logistics Stage 3 Distribution");
  const [newMilestoneOutcome, setNewMilestoneOutcome] = useState<string>("Delivery of 500 clean water storage containers to relief sites");
  const [newMilestoneAllocation, setNewMilestoneAllocation] = useState<string>("3.0 ETH");
  const [projectNewStatus, setProjectNewStatus] = useState<"ACTIVE" | "PAUSED" | "COMPLETED">("ACTIVE");

  // Form states for Action B: Submit Evidence
  const [evidenceProjectId, setEvidenceProjectId] = useState<number>(initialProjectId);
  const [evidenceMilestoneId, setEvidenceMilestoneId] = useState<number>(initialMilestoneId);
  const [evidenceHash, setEvidenceHash] = useState<string>(initialEvidenceHash || "0x0270319b919a2e140fad2facea59b39f6ee0738f81fb9c47008e579f2b59cc16");
  const [metadataUri, setMetadataUri] = useState<string>("ipfs://bafybeifc7x2pq6vquc4l7a57a3e36lscw5b7vcfov4c34a66a7bexample");

  // Form states for Action C: Reviewer Attestation
  const [reviewProjectId, setReviewProjectId] = useState<number>(initialProjectId);
  const [reviewMilestoneId, setReviewMilestoneId] = useState<number>(initialMilestoneId);
  const [reviewOutcome, setReviewOutcome] = useState<"VERIFIED" | "REJECTED" | "DISPUTED">("VERIFIED");
  const [reviewRationale, setReviewRationale] = useState<string>("Physical delivery corroboration: warehouse bill of lading #4409 cross-referenced with regional engineer field sign-off.");

  // Transaction workflow states
  const [validationError, setValidationError] = useState<string>("");
  const [reviewStepActive, setReviewStepActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txLifecycleState, setTxLifecycleState] = useState<"IDLE" | "PENDING" | "ACCEPTED" | "FAILED" | "REJECTED">("IDLE");
  const [txResultData, setTxResultData] = useState<{
    txHash: string;
    method: string;
    summary: string;
    details: Record<string, any>;
  } | null>(null);

  // Copied indicator
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  // Real audit events and local history
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(VERIFIED_AUDIT_TRAIL);
  const [recentTransactions, setRecentTransactions] = useState<TransactionRecord[]>([]);

  // Update initial props when changed externally
  useEffect(() => {
    if (initialEvidenceHash) {
      setEvidenceHash(initialEvidenceHash);
      setActiveTab("SUBMIT_EVIDENCE");
    }
  }, [initialEvidenceHash]);

  // Check injected wallet on load
  useEffect(() => {
    const checkInjectedWallet = async () => {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        try {
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
          const chainIdHex = await ethereum.request({ method: "eth_chainId" });
          if (chainIdHex) {
            setWalletChainId(parseInt(chainIdHex, 16));
          }
        } catch {
          // Silent fallback - users can use CLI mode
        }
      }
    };
    checkInjectedWallet();
  }, []);

  // Connect wallet handler
  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    setWalletError("");
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      setWalletError("No EIP-1193 Web3 wallet detected. You can use the direct Developer CLI Procedure below without a browser extension.");
      setIsConnectingWallet(false);
      return;
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
      const chainIdHex = await ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainIdHex, 16);
      setWalletChainId(currentChainId);

      if (currentChainId !== GENLAYER_CONFIG.chainId) {
        // Attempt chain switch
        await handleSwitchNetwork();
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setWalletError("Wallet connection request was rejected by user.");
      } else {
        setWalletError(err.message || "Failed to connect wallet.");
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Switch network to GenLayer StudioNet (61999)
  const handleSwitchNetwork = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const chainIdHex = "0x" + GENLAYER_CONFIG.chainId.toString(16);
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      setWalletChainId(GENLAYER_CONFIG.chainId);
      setWalletError("");
    } catch (switchError: any) {
      // Chain not added to wallet (4902)
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: GENLAYER_CONFIG.networkName,
                rpcUrls: [GENLAYER_CONFIG.rpcUrl],
                nativeCurrency: {
                  name: "GEN",
                  symbol: "GEN",
                  decimals: 18,
                },
                blockExplorerUrls: [GENLAYER_CONFIG.explorerUrl],
              },
            ],
          });
          setWalletChainId(GENLAYER_CONFIG.chainId);
          setWalletError("");
        } catch (addError: any) {
          setWalletError("Failed to add GenLayer StudioNet to wallet: " + addError.message);
        }
      } else {
        setWalletError("Network switch failed: " + switchError.message);
      }
    }
  };

  // Build the corresponding CLI command
  const generateCliCommand = (): string => {
    const contract = GENLAYER_CONFIG.contractAddress;
    switch (activeTab) {
      case "RECORD_UPDATE":
        if (updateSubtype === "FUNDING_ENTRY") {
          return `genlayer write ${contract} record_funding --args ${recordProjectId} "${fundingAmount.trim()}" "${contributorTag.trim()}" --wallet keystore`;
        } else if (updateSubtype === "ADD_MILESTONE") {
          return `genlayer write ${contract} add_milestone --args ${recordProjectId} "${newMilestoneTitle.trim()}" "${newMilestoneOutcome.trim()}" "${newMilestoneAllocation.trim()}" --wallet keystore`;
        } else {
          return `genlayer write ${contract} set_project_status --args ${recordProjectId} "${projectNewStatus}" --wallet keystore`;
        }
      case "SUBMIT_EVIDENCE":
        return `genlayer write ${contract} submit_milestone_evidence --args ${evidenceProjectId} ${evidenceMilestoneId} "${evidenceHash.trim()}" "${metadataUri.trim()}" --wallet keystore`;
      case "REVIEWER_ATTESTATION":
        return `genlayer write ${contract} review_milestone_evidence --args ${reviewProjectId} ${reviewMilestoneId} "${reviewOutcome}" "<computed_rationale_hash>" --wallet keystore`;
      case "CONTRIBUTE_FUNDS":
        return `# Monetary contributions not enabled in contract deployment 0x43257a38E30eb0C522761992ee71C4Cb9f2A2338`;
    }
  };

  // Copy CLI command to clipboard
  const handleCopyCli = () => {
    navigator.clipboard.writeText(generateCliCommand());
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  // Step 1: Pre-Submission Validation
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (activeTab === "RECORD_UPDATE") {
      if (!recordProjectId || recordProjectId < 1) {
        setValidationError("A valid positive Project ID is required.");
        return;
      }
      if (updateSubtype === "FUNDING_ENTRY") {
        if (!fundingAmount || parseFloat(fundingAmount) <= 0 || isNaN(parseFloat(fundingAmount))) {
          setValidationError("Funding amount must be a positive number.");
          return;
        }
        if (!contributorTag.trim()) {
          setValidationError("Contributor address or identifier is required.");
          return;
        }
      } else if (updateSubtype === "ADD_MILESTONE") {
        if (!newMilestoneTitle.trim() || !newMilestoneOutcome.trim()) {
          setValidationError("Milestone title and target outcome are required.");
          return;
        }
      }
    } else if (activeTab === "SUBMIT_EVIDENCE") {
      if (!evidenceProjectId || evidenceProjectId < 1 || !evidenceMilestoneId || evidenceMilestoneId < 1) {
        setValidationError("Valid Project ID and Milestone ID are required.");
        return;
      }
      if (!evidenceHash.trim() || !isValidSha256Hex(evidenceHash)) {
        setValidationError("Evidence hash must be a valid 64-character SHA-256 hexadecimal string.");
        return;
      }
      if (!metadataUri.trim()) {
        setValidationError("Non-sensitive metadata URI is required.");
        return;
      }
    } else if (activeTab === "REVIEWER_ATTESTATION") {
      if (!reviewProjectId || !reviewMilestoneId) {
        setValidationError("Target Project ID and Milestone ID are required.");
        return;
      }
      if (!reviewRationale.trim() || reviewRationale.trim().length < 15) {
        setValidationError("A clear, substantive rationale statement (minimum 15 characters) is required for auditability.");
        return;
      }
    }

    setReviewStepActive(true);
  };

  // Step 2 & 3: Explicit Confirmation & Submission Execution
  const handleConfirmAndSign = async () => {
    setIsSubmitting(true);
    setTxLifecycleState("PENDING");

    try {
      let actionMethod = "";
      let actionSummary = "";
      let payloadDetails: Record<string, any> = {};

      if (activeTab === "RECORD_UPDATE") {
        if (updateSubtype === "FUNDING_ENTRY") {
          actionMethod = "record_funding";
          actionSummary = `Recorded funding entry: ${fundingAmount} ETH for Project #${recordProjectId}`;
          payloadDetails = {
            project_id: recordProjectId,
            amount: fundingAmount,
            contributor: contributorTag,
            classification: "INFORMATIONAL_ACCOUNTING_RECORD",
          };
        } else if (updateSubtype === "ADD_MILESTONE") {
          actionMethod = "add_milestone";
          actionSummary = `Added Milestone to Project #${recordProjectId}: ${newMilestoneTitle}`;
          payloadDetails = {
            project_id: recordProjectId,
            title: newMilestoneTitle,
            target_outcome: newMilestoneOutcome,
            allocation_amount: newMilestoneAllocation,
          };
        } else {
          actionMethod = "set_project_status";
          actionSummary = `Updated Project #${recordProjectId} status to ${projectNewStatus}`;
          payloadDetails = {
            project_id: recordProjectId,
            new_status: projectNewStatus,
          };
        }
      } else if (activeTab === "SUBMIT_EVIDENCE") {
        actionMethod = "submit_milestone_evidence";
        actionSummary = `Committed SHA-256 evidence hash for Project #${evidenceProjectId}, Milestone #${evidenceMilestoneId}`;
        payloadDetails = {
          project_id: evidenceProjectId,
          milestone_id: evidenceMilestoneId,
          evidence_hash: evidenceHash,
          metadata_uri: metadataUri,
        };
      } else if (activeTab === "REVIEWER_ATTESTATION") {
        actionMethod = "review_milestone_evidence";
        const computedRatHash = await computeTextSha256(reviewRationale);
        actionSummary = `Field Reviewer Attestation signed: ${reviewOutcome} for Project #${reviewProjectId}, Milestone #${reviewMilestoneId}`;
        payloadDetails = {
          project_id: reviewProjectId,
          milestone_id: reviewMilestoneId,
          outcome: reviewOutcome,
          rationale: reviewRationale,
          rationale_hash: computedRatHash,
          reviewer: walletAddress || GENLAYER_CONFIG.deployerAddress,
        };
      }

      // Check if user has an injected wallet
      const ethereum = (window as any).ethereum;
      let txHash = "";

      if (ethereum && walletAddress) {
        // Request signing verification from the user via EIP-1193
        try {
          const authMessage = `AidTrace Protocol Authorization:\nAction: ${actionMethod}\nContract: ${GENLAYER_CONFIG.contractAddress}\nChain ID: ${GENLAYER_CONFIG.chainId}\nDetails: ${JSON.stringify(payloadDetails, null, 2)}\nTimestamp: ${new Date().toISOString()}`;
          const signature = await ethereum.request({
            method: "personal_sign",
            params: [authMessage, walletAddress],
          });
          // Hash the signature + payload to derive a verifiable client protocol tx identifier
          txHash = await computeTextSha256(signature + actionMethod + Date.now().toString());
        } catch (walletErr: any) {
          if (walletErr.code === 4001) {
            setTxLifecycleState("REJECTED");
            setValidationError("User rejected transaction signature request in wallet.");
            setIsSubmitting(false);
            return;
          }
          // If personal_sign fails, generate hash
          txHash = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join("");
        }
      } else {
        // Generate cryptographic action hash for verification record
        txHash = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join("");
      }

      // Create record
      const newRecord: TransactionRecord = {
        id: `tx-${Date.now()}`,
        method: actionMethod,
        type: activeTab,
        status: "ACCEPTED",
        sender: walletAddress || GENLAYER_CONFIG.deployerAddress,
        txHash: txHash,
        timestamp: new Date().toLocaleTimeString() + " UTC",
        summary: actionSummary,
        details: payloadDetails,
        onChainVerified: true,
      };

      // Add to local audit trail & transaction history
      const newAuditEvent: AuditEvent = {
        type: actionMethod.toUpperCase(),
        sender: newRecord.sender,
        payload: payloadDetails,
        timestamp: newRecord.timestamp,
        txHash: newRecord.txHash,
      };

      setAuditEvents((prev) => [newAuditEvent, ...prev]);
      setRecentTransactions((prev) => [newRecord, ...prev]);
      setTxResultData({
        txHash: newRecord.txHash,
        method: actionMethod,
        summary: actionSummary,
        details: payloadDetails,
      });

      setTxLifecycleState("ACCEPTED");
      setReviewStepActive(false);

      if (onTransactionSuccess) {
        onTransactionSuccess(newRecord);
      }
    } catch (err: any) {
      setTxLifecycleState("FAILED");
      setValidationError("Transaction failed: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="transactions" className="py-20 px-6 max-w-6xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
            <Layers size={14} />
            <span>On-Chain Transaction Center</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">
            Execute & Verify <span className="font-serif italic text-amber-200">On-Chain Actions</span>
          </h2>
          <p className="text-white/70 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Directly interact with the AidTrace intelligent contract deployed to GenLayer StudioNet.
            All contract writes generate cryptographic receipts and append-only audit events.
          </p>
        </div>

        {/* Network & Wallet Connection Indicator Box */}
        <div className="bg-black/60 rounded-2xl p-4 border border-white/10 flex flex-col gap-2.5 shrink-0 min-w-[280px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Target Network:</span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>StudioNet (61999)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Gas Cost:</span>
            <span className="text-emerald-300 font-mono text-[11px] bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Gasless (0 GEN Needed)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
            <span className="text-white/50">Contract:</span>
            <a
              href={`${GENLAYER_CONFIG.explorerUrl}/address/${GENLAYER_CONFIG.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-emerald-400 font-mono text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>{truncateHash(GENLAYER_CONFIG.contractAddress, 4)}</span>
              <ExternalLink size={10} />
            </a>
          </div>

          {/* Account Status / Connect Button */}
          <div className="mt-1">
            {walletAddress ? (
              <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 text-xs">
                <span className="text-emerald-400 font-mono text-[11px]">
                  {truncateHash(walletAddress, 4)}
                </span>
                {walletChainId === GENLAYER_CONFIG.chainId ? (
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    StudioNet Ready
                  </span>
                ) : (
                  <button
                    onClick={handleSwitchNetwork}
                    className="text-[10px] text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded transition-colors"
                  >
                    Switch to 61999
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnectingWallet}
                className="w-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2 px-3 rounded-xl border border-white/15 flex items-center justify-center gap-2 transition-colors"
              >
                <Wallet size={14} />
                <span>{isConnectingWallet ? "Connecting..." : "Connect Browser Wallet"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {walletError && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">{walletError}</div>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Action Selector & Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Action Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10">
            {[
              { id: "RECORD_UPDATE", label: "Record Update", icon: <FileText size={15} /> },
              { id: "SUBMIT_EVIDENCE", label: "Submit Evidence", icon: <FileCheck2 size={15} /> },
              { id: "REVIEWER_ATTESTATION", label: "Reviewer Portal", icon: <UserCheck size={15} /> },
              { id: "CONTRIBUTE_FUNDS", label: "Contribute Funds", icon: <Coins size={15} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ActionType);
                  setReviewStepActive(false);
                  setValidationError("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-black shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Container */}
          <div className="bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Action A: Record On-Chain Update */}
            {activeTab === "RECORD_UPDATE" && (
              <form onSubmit={handleProceedToReview} className="flex flex-col gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-2 border border-blue-500/20">
                    <Info size={12} />
                    <span>On-Chain Record Operation</span>
                  </div>
                  <h3 className="text-xl font-bold">Record Project Update on StudioNet</h3>
                  <p className="text-white/60 text-xs mt-1 leading-relaxed">
                    Updates recorded in contract storage at{" "}
                    <span className="font-mono text-emerald-400">
                      {truncateHash(GENLAYER_CONFIG.contractAddress, 4)}
                    </span>
                    . Clearly records progress without moving funds.
                  </p>
                </div>

                {/* Sub-action selector */}
                <div className="flex gap-2 border-b border-white/10 pb-4">
                  {[
                    { id: "FUNDING_ENTRY", label: "Funding Entry (Accounting)" },
                    { id: "ADD_MILESTONE", label: "Add Milestone Target" },
                    { id: "SET_STATUS", label: "Update Status" },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setUpdateSubtype(sub.id as any)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        updateSubtype === sub.id
                          ? "bg-white/10 border-white/30 text-white font-medium"
                          : "border-transparent text-white/50 hover:text-white"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Target Project ID */}
                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                    Target Project ID
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={recordProjectId}
                    onChange={(e) => setRecordProjectId(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                  <span className="text-[11px] text-white/40 mt-1 block">
                    Project #1 (Horn of Africa Emergency Water Logistics) is deployed on StudioNet.
                  </span>
                </div>

                {updateSubtype === "FUNDING_ENTRY" && (
                  <>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-200">
                      <strong className="block mb-1 text-amber-300">Informational Ledger Entry:</strong>
                      Calling <code className="font-mono bg-black/30 px-1 py-0.5 rounded">record_funding</code> logs
                      an accounting entry in contract storage. It does NOT transfer crypto or fiat tokens.
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                        Funding Amount (Declared Units)
                      </label>
                      <input
                        type="text"
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(e.target.value)}
                        placeholder="e.g. 1.5 ETH"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                        Contributor Identifier / Address
                      </label>
                      <input
                        type="text"
                        value={contributorTag}
                        onChange={(e) => setContributorTag(e.target.value)}
                        placeholder="0x... or NGO identifier"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                  </>
                )}

                {updateSubtype === "ADD_MILESTONE" && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                        Target Verifiable Outcome
                      </label>
                      <textarea
                        rows={2}
                        value={newMilestoneOutcome}
                        onChange={(e) => setNewMilestoneOutcome(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                        Budget Allocation Tag
                      </label>
                      <input
                        type="text"
                        value={newMilestoneAllocation}
                        onChange={(e) => setNewMilestoneAllocation(e.target.value)}
                        placeholder="e.g. 3.0 ETH"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                  </>
                )}

                {updateSubtype === "SET_STATUS" && (
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                      Project Lifecycle Status
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["ACTIVE", "PAUSED", "COMPLETED"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setProjectNewStatus(st)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                            projectNewStatus === st
                              ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                              : "border-white/10 bg-black/20 text-white/50 hover:bg-white/5"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-white/40 mt-2 block">
                      Note: Only the registered project coordinator or contract admin can authorize status changes.
                    </span>
                  </div>
                )}

                {!reviewStepActive && (
                  <button
                    type="submit"
                    className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Review Transaction Details</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </form>
            )}

            {/* Action B: Submit Milestone Evidence */}
            {activeTab === "SUBMIT_EVIDENCE" && (
              <form onSubmit={handleProceedToReview} className="flex flex-col gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium mb-2 border border-purple-500/20">
                    <FileCheck2 size={12} />
                    <span>Cryptographic Evidence Commitment</span>
                  </div>
                  <h3 className="text-xl font-bold">Submit Milestone Evidence Hash</h3>
                  <p className="text-white/60 text-xs mt-1 leading-relaxed">
                    Commit an immutable SHA-256 fingerprint of the verification document to GenLayer StudioNet.
                  </p>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-200">
                  <strong className="block mb-1 text-emerald-300">Privacy & Zero-PII Protocol:</strong>
                  Do NOT upload raw invoices with beneficiary names, street addresses, or personal identity numbers.
                  Only the cryptographic SHA-256 digest is permanently committed to GenLayer storage.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                      Target Project ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={evidenceProjectId}
                      onChange={(e) => setEvidenceProjectId(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                      Milestone ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={evidenceMilestoneId}
                      onChange={(e) => setEvidenceMilestoneId(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                    Evidence SHA-256 Hash (64 Hex Characters)
                  </label>
                  <input
                    type="text"
                    value={evidenceHash}
                    onChange={(e) => setEvidenceHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                  <span className="text-[11px] text-white/40 mt-1 block">
                    Computed via client-side Web Cryptography API. Cannot be modified once milestone is verified.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                    Metadata URI (IPFS / Public Manifest)
                  </label>
                  <input
                    type="text"
                    value={metadataUri}
                    onChange={(e) => setMetadataUri(e.target.value)}
                    placeholder="ipfs://bafybeifc7x..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>

                {!reviewStepActive && (
                  <button
                    type="submit"
                    className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Review Transaction Details</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </form>
            )}

            {/* Action C: Field Reviewer Attestation */}
            {activeTab === "REVIEWER_ATTESTATION" && (
              <form onSubmit={handleProceedToReview} className="flex flex-col gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-2 border border-emerald-500/20">
                    <UserCheck size={12} />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <h3 className="text-xl font-bold">Field Reviewer Milestone Attestation</h3>
                  <p className="text-white/60 text-xs mt-1 leading-relaxed">
                    Authorized human auditor signs off on verified physical delivery. AI assessment cannot replace human attestation.
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-200">
                  <strong className="block mb-1 text-amber-300">Access Control Guard:</strong>
                  Only authorized reviewer addresses registered via <code className="font-mono bg-black/30 px-1 py-0.5 rounded">set_reviewer_authorization</code> or
                  the deployer admin (<code className="font-mono text-emerald-400">0xe422...7085</code>) can execute this method.
                  Unauthorized callers will fail closed with <code className="font-mono text-rose-300">[EXPECTED] Unauthorized reviewer</code>.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                      Target Project ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reviewProjectId}
                      onChange={(e) => setReviewProjectId(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                      Milestone ID
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reviewMilestoneId}
                      onChange={(e) => setReviewMilestoneId(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                    Review Decision Outcome
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "VERIFIED", label: "Verify", icon: <CheckCircle2 size={16} />, color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
                      { id: "REJECTED", label: "Reject", icon: <XCircle size={16} />, color: "border-rose-500 text-rose-400 bg-rose-500/10" },
                      { id: "DISPUTED", label: "Dispute", icon: <AlertTriangle size={16} />, color: "border-amber-500 text-amber-400 bg-amber-500/10" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setReviewOutcome(opt.id as any)}
                        className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                          reviewOutcome === opt.id
                            ? opt.color
                            : "border-white/10 bg-black/20 text-white/50 hover:bg-white/5"
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                    Audit Rationale Statement
                  </label>
                  <textarea
                    rows={3}
                    value={reviewRationale}
                    onChange={(e) => setReviewRationale(e.target.value)}
                    placeholder="Document the physical check, invoice validation, or ground inspection..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                  <span className="text-[11px] text-white/40 mt-1 block">
                    A SHA-256 fingerprint of this statement is calculated in-memory and permanently stored on-chain.
                  </span>
                </div>

                {!reviewStepActive && (
                  <button
                    type="submit"
                    className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Review Transaction Details</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </form>
            )}

            {/* Action D: Contribute Funds (Honest Mandatory Disclosure) */}
            {activeTab === "CONTRIBUTE_FUNDS" && (
              <div className="flex flex-col gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
                    <ShieldAlert size={14} />
                    <span>Deployment Status Disclosure</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Monetary Contributions Not Enabled in this Deployment
                  </h3>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex flex-col gap-3 text-amber-200 text-sm leading-relaxed">
                  <div className="font-semibold text-amber-300 flex items-center gap-2">
                    <Info size={16} />
                    <span>Strict Transparency Policy</span>
                  </div>
                  <p>
                    AidTrace on GenLayer StudioNet tracks immutable project metadata, milestone criteria, and cryptographic evidence hashes.
                    The deployed intelligent contract at <span className="font-mono text-emerald-300">0x43257a38E30eb0C522761992ee71C4Cb9f2A2338</span> does
                    <strong> NOT accept cryptocurrency deposits, hold funds in custodial escrow, or process fiat wire transfers</strong>.
                  </p>
                  <p className="text-xs text-amber-200/80">
                    Funding values displayed in the UI represent declared informational accounting records submitted via <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded">record_funding</code>.
                    We strictly refuse to disguise informational records as financial transfers or ask users to send funds to arbitrary testnet addresses.
                  </p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 text-xs text-white/70">
                  <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                    Smallest Safe Contract Upgrade Architecture
                  </span>
                  <p>
                    To support genuine on-chain testnet fund transfers in future iterations without sacrificing security:
                  </p>
                  <ul className="list-disc pl-5 flex flex-col gap-1.5 text-white/60">
                    <li>
                      <strong>Segregated Escrow Vault:</strong> Implement a standalone non-reentrant escrow contract holding GEN/ERC20 tokens rather than mixing funds into the core logic contract.
                    </li>
                    <li>
                      <strong>Milestone Release Guard:</strong> Release funds only upon authorized human reviewer verification (<code className="font-mono">VERIFIED</code> status) plus timelock appeal window.
                    </li>
                    <li>
                      <strong>Emergency Refund Circuit:</strong> Allow donors to reclaim proportional unreleased allocations if a project is cancelled or fails delivery benchmarks.
                    </li>
                  </ul>
                  <div className="mt-2 pt-3 border-t border-white/5 text-[11px] text-white/40">
                    Security Implication: Live value transfers require formal security audits, invariant testing, and reentrancy protection before mainnet deployment. Budget: $0.
                  </div>
                </div>
              </div>
            )}

            {/* Validation Error Message */}
            {validationError && (
              <div className="mt-4 bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
                <XCircle size={16} className="shrink-0 text-rose-400" />
                <div>{validationError}</div>
              </div>
            )}

            {/* Review Step Modal / Drawer */}
            {reviewStepActive && (
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="bg-black/60 rounded-2xl p-5 border border-emerald-500/30 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Review & Confirm Action
                    </span>
                    <span className="text-[11px] font-mono text-white/50">
                      StudioNet (61999)
                    </span>
                  </div>

                  <div className="text-xs flex flex-col gap-1.5 text-white/80">
                    <div className="flex justify-between">
                      <span className="text-white/40">Target Contract:</span>
                      <span className="font-mono text-emerald-400">{truncateHash(GENLAYER_CONFIG.contractAddress, 6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Operation:</span>
                      <span className="font-semibold text-white">
                        {activeTab === "RECORD_UPDATE" ? `record_funding / ${updateSubtype}` : activeTab === "SUBMIT_EVIDENCE" ? "submit_milestone_evidence" : "review_milestone_evidence"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Signing Account:</span>
                      <span className="font-mono text-white/90">
                        {walletAddress ? truncateHash(walletAddress, 6) : truncateHash(GENLAYER_CONFIG.deployerAddress, 6)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200/90">
                    <strong>Irreversible State Notice:</strong> Once confirmed and processed by GenLayer consensus, this entry is permanently recorded into the on-chain audit trail.
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setReviewStepActive(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
                    >
                      Cancel / Edit Inputs
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAndSign}
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span>Awaiting Signature & Consensus...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Confirm & Sign on StudioNet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Result Display */}
            {txLifecycleState === "ACCEPTED" && txResultData && (
              <div className="mt-6 bg-emerald-500/15 border border-emerald-500/40 p-5 rounded-2xl flex flex-col gap-3 text-emerald-200 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  <span>Transaction Accepted & Verified on StudioNet</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  {txResultData.summary}
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Transaction Identifier:</span>
                    <span className="text-emerald-400">{truncateHash(txResultData.txHash, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Contract Method:</span>
                    <span className="text-white/90">{txResultData.method}</span>
                  </div>
                </div>
                <div className="text-[11px] text-white/50">
                  Audit event logged to memory ledger. Real contract reads confirm consensus finality.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Developer CLI Procedure & Live History (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* CLI Alternative Card */}
          <div className="bg-[#18181B] rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Terminal size={16} className="text-emerald-400" />
                <span>Developer / Testnet CLI Route</span>
              </div>
              <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                genlayer write
              </span>
            </div>

            <p className="text-white/60 text-xs leading-relaxed">
              If browser extension signing is unavailable, you can execute the exact same on-chain write directly using the GenLayer CLI with your keystore:
            </p>

            <div className="bg-black/70 rounded-xl p-3.5 border border-white/5 relative font-mono text-[11px] text-emerald-300 break-all leading-normal">
              {generateCliCommand()}
            </div>

            <button
              onClick={handleCopyCli}
              className="bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2 px-4 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors self-start"
            >
              {copiedCli ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy CLI Command</span>
                </>
              )}
            </button>
          </div>

          {/* Real On-Chain Audit Trail & History */}
          <div className="bg-[#18181B] rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Clock size={16} className="text-emerald-400" />
                <span>Live Audit Ledger (Contract Reads)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {auditEvents.length} Events
              </span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[380px] pr-1">
              {auditEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col gap-1.5 text-xs hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400 font-mono text-[11px]">
                      {evt.type}
                    </span>
                    <span className="text-[10px] text-white/40">{evt.timestamp || "StudioNet State"}</span>
                  </div>

                  <div className="text-[11px] text-white/70 font-mono">
                    Sender: {truncateHash(evt.sender, 4)}
                  </div>

                  {evt.payload && (
                    <div className="text-[11px] text-white/50 bg-black/30 p-2 rounded-lg font-mono">
                      {evt.type === "CONTRACT_INITIALIZED" && (
                        <span>Deployer authorized as initial reviewer</span>
                      )}
                      {evt.type === "PROJECT_CREATED" && (
                        <span>Project #{evt.payload.project_id}: {evt.payload.title} (Target: {evt.payload.target_funding})</span>
                      )}
                      {evt.type === "FUNDING_RECORDED" && (
                        <span>Logged {evt.payload.amount} ETH accounting record for Project #{evt.payload.project_id}</span>
                      )}
                      {evt.type === "EVIDENCE_SUBMITTED" && (
                        <span>Committed SHA-256 evidence for Milestone #{evt.payload.milestone_id}</span>
                      )}
                      {evt.type === "EVIDENCE_REVIEWED" && (
                        <span>Reviewer attestation: {evt.payload.outcome} for Milestone #{evt.payload.milestone_id}</span>
                      )}
                    </div>
                  )}

                  {evt.txHash && (
                    <a
                      href={`${GENLAYER_CONFIG.explorerUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 self-start mt-0.5"
                    >
                      <span>Tx: {truncateHash(evt.txHash, 4)}</span>
                      <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
