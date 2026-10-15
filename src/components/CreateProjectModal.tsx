import React, { useState } from "react";
import {
  X,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Wallet,
  Clock,
  Layers,
  FileCheck2,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { GenLayerLogo } from "./Icons";
import {
  GENLAYER_CONFIG,
  ProjectData,
  createProjectOnChain,
  CreateProjectParams,
} from "../utils/genlayer";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConnected: boolean;
  walletAddress: string;
  walletChainId: number | null;
  onConnectWallet: () => Promise<void>;
  onSwitchNetwork: () => Promise<void>;
  onProjectCreated: (project: ProjectData) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  walletConnected,
  walletAddress,
  walletChainId,
  onConnectWallet,
  onSwitchNetwork,
  onProjectCreated,
}) => {
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coarseLocation, setCoarseLocation] = useState("");
  const [targetFunding, setTargetFunding] = useState("10 ETH");
  const [beneficiariesTarget, setBeneficiariesTarget] = useState<number>(500);
  const [measurableOutcomes, setMeasurableOutcomes] = useState("");

  // Optional initial milestone
  const [includeMilestone, setIncludeMilestone] = useState(true);
  const [milestoneTitle, setMilestoneTitle] = useState("Procurement and Community Staging");
  const [milestoneOutcome, setMilestoneOutcome] = useState("Delivery and verification of initial emergency supplies");
  const [milestoneAllocation, setMilestoneAllocation] = useState("2.5 ETH");

  // Workflow states
  const [step, setStep] = useState<"FORM" | "CONFIRM" | "SUBMITTING" | "SUCCESS" | "ERROR">("FORM");
  const [submittingStatus, setSubmittingStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRejected, setIsRejected] = useState<boolean>(false);
  const [createdProject, setCreatedProject] = useState<ProjectData | null>(null);
  const [txHash, setTxHash] = useState<string>("");

  if (!isOpen) return null;

  const isCorrectNetwork = walletChainId === GENLAYER_CONFIG.chainId;

  const validateForm = (): string | null => {
    if (!title.trim() || title.trim().length < 4) {
      return "Project title must be at least 4 characters.";
    }
    if (!coarseLocation.trim() || coarseLocation.trim().length < 3) {
      return "Coarse geographic location is required (e.g. 'Turkana County, Kenya').";
    }
    if (!description.trim() || description.trim().length < 10) {
      return "Project description must be at least 10 characters.";
    }
    if (!targetFunding.trim()) {
      return "Target funding declaration is required.";
    }
    if (beneficiariesTarget < 0 || isNaN(beneficiariesTarget)) {
      return "Beneficiaries target must be 0 or a positive number.";
    }
    if (!measurableOutcomes.trim() || measurableOutcomes.trim().length < 5) {
      return "Measurable outcomes must be at least 5 characters.";
    }
    if (includeMilestone) {
      if (!milestoneTitle.trim()) {
        return "Initial milestone title cannot be empty.";
      }
      if (!milestoneOutcome.trim()) {
        return "Initial milestone target outcome cannot be empty.";
      }
    }
    return null;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage("");
    setIsRejected(false);
    setStep("CONFIRM");
  };

  const handleConfirmAndSubmit = async () => {
    if (!walletConnected) {
      setErrorMessage("Please connect your wallet before submitting.");
      return;
    }
    if (!isCorrectNetwork) {
      setErrorMessage("Please switch to GenLayer StudioNet (Chain ID 61999).");
      return;
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      setErrorMessage("No EIP-1193 Web3 provider found in browser.");
      return;
    }

    setStep("SUBMITTING");
    setSubmittingStatus("Initiating transaction in wallet for user signature...");
    setErrorMessage("");
    setIsRejected(false);

    const params: CreateProjectParams = {
      title,
      description,
      coarseLocation,
      targetFunding,
      aggregateBeneficiariesTarget: Number(beneficiariesTarget),
      measurableOutcomes,
      initialMilestone: includeMilestone
        ? {
            title: milestoneTitle,
            targetOutcome: milestoneOutcome,
            allocationAmount: milestoneAllocation,
          }
        : undefined,
    };

    try {
      setSubmittingStatus("Submitting create_project to GenLayer StudioNet consensus...");

      const result = await createProjectOnChain(params, ethereum, walletAddress);

      setTxHash(result.txHash);
      setCreatedProject(result.project);
      setStep("SUCCESS");
      onProjectCreated(result.project);
    } catch (err: any) {
      console.error("[CreateProject] Error:", err);
      if (err.code === 4001 || err.message?.includes("User rejected") || err.message?.includes("rejected")) {
        setIsRejected(true);
        setErrorMessage("Transaction signature was rejected by user in wallet. No project was created.");
        setStep("ERROR");
      } else {
        setIsRejected(false);
        setErrorMessage(err.message || "Failed to create project on GenLayer StudioNet.");
        setStep("ERROR");
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCoarseLocation("");
    setTargetFunding("10 ETH");
    setBeneficiariesTarget(500);
    setMeasurableOutcomes("");
    setCreatedProject(null);
    setTxHash("");
    setStep("FORM");
    setErrorMessage("");
    setIsRejected(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b171c] border border-teal-500/30 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#081216] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Register Humanitarian Project
              </h3>
              <p className="text-xs text-slate-400">
                Permissionless On-Chain Creation • GenLayer StudioNet (Chain ID: 61999)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Authenticated Wallet & Network Status Banner */}
          <div className="bg-[#061014] border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Wallet size={13} className="text-teal-400" />
                <span>Connected Coordinator:</span>
              </span>
              {walletConnected ? (
                <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {walletAddress}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onConnectWallet}
                  className="px-2.5 py-1 rounded bg-[#00d084] hover:bg-[#00ba76] text-black font-bold text-[11px] transition-all"
                >
                  Connect Wallet to Register
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Network & Chain:</span>
              <div className="flex items-center gap-1.5">
                {isCorrectNetwork ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>GenLayer StudioNet (61999) Ready</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">
                      Wrong Network ({walletChainId ?? "Unknown"})
                    </span>
                    <button
                      type="button"
                      onClick={onSwitchNetwork}
                      className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[11px]"
                    >
                      Switch to StudioNet
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 border-t border-white/5 pt-2 leading-relaxed">
              <strong>Cryptographic Coordinator Binding:</strong> The deployed contract records{" "}
              <code className="text-teal-300 bg-black/40 px-1 py-0.5 rounded">gl.message.sender_address</code> as
              the coordinator. Coordinator identity is strictly authenticated by your wallet's signature and cannot
              be spoofed by browser input.
            </p>
          </div>

          {errorMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                isRejected
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-200"
              }`}
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* STEP 1: Form Input */}
          {step === "FORM" && (
            <form onSubmit={handleProceedToReview} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Emergency Water Desalination & Distribution"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Coarse Geographic Location *
                  </label>
                  <input
                    type="text"
                    value={coarseLocation}
                    onChange={(e) => setCoarseLocation(e.target.value)}
                    placeholder="e.g. Turkana County, Kenya"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Region/district level to respect beneficiary privacy
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Target Funding (Declared Units) *
                  </label>
                  <input
                    type="text"
                    value={targetFunding}
                    onChange={(e) => setTargetFunding(e.target.value)}
                    placeholder="e.g. 10 ETH"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Informational accounting declaration; does not hold escrow
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Project Description *
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the initiative's humanitarian objectives and operational context..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Aggregate Beneficiaries Target *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={beneficiariesTarget}
                    onChange={(e) => setBeneficiariesTarget(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Planning target (not certified served)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Measurable Outcomes *
                  </label>
                  <input
                    type="text"
                    value={measurableOutcomes}
                    onChange={(e) => setMeasurableOutcomes(e.target.value)}
                    placeholder="e.g. 3 high-yield boreholes operational"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>

              {/* Initial Milestone Checkbox & Fields */}
              <div className="mt-2 border border-white/10 bg-[#0e1f26] rounded-2xl p-4 flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMilestone}
                    onChange={(e) => setIncludeMilestone(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-emerald-300">
                    Define Initial Milestone #1 (Recommended)
                  </span>
                </label>

                {includeMilestone && (
                  <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        value={milestoneTitle}
                        onChange={(e) => setMilestoneTitle(e.target.value)}
                        placeholder="e.g. Equipment Procurement & Logistics Dispatch"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        required={includeMilestone}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-300 block mb-1">
                          Target Outcome
                        </label>
                        <input
                          type="text"
                          value={milestoneOutcome}
                          onChange={(e) => setMilestoneOutcome(e.target.value)}
                          placeholder="e.g. Delivered to regional warehouse"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          required={includeMilestone}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-300 block mb-1">
                          Declared Allocation Amount
                        </label>
                        <input
                          type="text"
                          value={milestoneAllocation}
                          onChange={(e) => setMilestoneAllocation(e.target.value)}
                          placeholder="e.g. 2.5 ETH"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          required={includeMilestone}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!walletConnected || !isCorrectNetwork}
                  className="px-6 py-2.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] disabled:opacity-50 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <span>Review & Sign Transaction</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Pre-Flight Review & Approval */}
          {step === "CONFIRM" && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#0e1f26] border border-teal-500/30 rounded-2xl p-5 flex flex-col gap-3">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Pre-Flight Transaction Parameters
                </span>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Target Contract:</span>
                    <span className="font-mono text-emerald-400">{GENLAYER_CONFIG.contractAddress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Method:</span>
                    <span className="font-mono text-white">create_project</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Recorded Coordinator:</span>
                    <span className="font-mono text-teal-300">{walletAddress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Project Title:</span>
                    <span className="font-semibold text-white">{title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Location:</span>
                    <span>{coarseLocation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Declared Funding Goal:</span>
                    <span>{targetFunding}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Beneficiary Target:</span>
                    <span>{beneficiariesTarget} households</span>
                  </div>
                  {includeMilestone && (
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Subsequent Method:</span>
                      <span className="font-mono text-white">add_milestone ("{milestoneTitle}")</span>
                    </div>
                  )}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200 leading-relaxed">
                  <strong>Irreversible On-Chain Action:</strong> Once confirmed, this initiative is permanently
                  recorded into the GenLayer StudioNet ledger. You will be prompted by your wallet to approve this zero-gas contract write.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back to Form
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSubmit}
                  className="px-6 py-2.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Confirm & Sign in Wallet</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Submitting / Consensus Waiting */}
          {step === "SUBMITTING" && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative w-14 h-14">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <GenLayerLogo size={20} className="text-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="max-w-md">
                <h4 className="text-base font-bold text-white mb-1">
                  Processing On-Chain Transaction
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {submittingStatus}
                </p>
              </div>

              <div className="mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-slate-400 flex items-center gap-2">
                <Clock size={13} className="text-teal-400 shrink-0" />
                <span>Consensus confirmation typically takes 5–15 seconds on StudioNet.</span>
              </div>
            </div>
          )}

          {/* STEP 4: Success View */}
          {step === "SUCCESS" && createdProject && (
            <div className="py-6 flex flex-col items-center justify-center gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  Project Registered On-Chain!
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  Project #{createdProject.id} ({createdProject.title}) is permanently committed to GenLayer StudioNet.
                </p>
              </div>

              <div className="w-full bg-[#0e1f26] border border-emerald-500/30 rounded-2xl p-4 text-left flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Assigned Project ID:</span>
                  <span className="font-mono text-emerald-400 font-bold">#{createdProject.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Authenticated Coordinator:</span>
                  <span className="font-mono text-white text-[11px] truncate max-w-[240px]">
                    {createdProject.coordinator}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Initial Milestones:</span>
                  <span>{createdProject.milestone_count} recorded</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Transaction Hash:</span>
                  <a
                    href={`${GENLAYER_CONFIG.explorerUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>{txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : "Verified"}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  Create Another Project
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  View in Project Explorer
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Error / Rejection View */}
          {step === "ERROR" && (
            <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center border ${
                  isRejected
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                }`}
              >
                <AlertTriangle size={28} />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {isRejected ? "Transaction Rejected" : "Submission Failed"}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  {errorMessage}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  Edit Form
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSubmit}
                  className="px-6 py-2.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] text-black text-xs font-bold transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
