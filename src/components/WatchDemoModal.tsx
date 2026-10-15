import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { GenLayerLogo } from "./Icons";
import { GENLAYER_CONFIG } from "../utils/genlayer";

interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerifier: () => void;
  onOpenTransactionCenter: () => void;
}

export const WatchDemoModal: React.FC<WatchDemoModalProps> = ({
  isOpen,
  onClose,
  onOpenVerifier,
  onOpenTransactionCenter,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      badge: "Step 1: On-Chain Project Genesis",
      title: "Truthful Project Registration",
      subtitle: "Explicit target declarations without misleading escrow claims",
      icon: <GenLayerLogo size={24} className="text-emerald-400" />,
      content:
        "AidTrace registers humanitarian initiatives on GenLayer StudioNet (Chain ID 61999). Each project declares target metrics, geographic scope (e.g. Turkana County, Kenya), and target beneficiary counts (1,200 persons). The contract enforces strict separation between declared goals and recorded accounting entries.",
      terminal: `> genlayer contract deploy contracts/aid_trace.py
[DEPLOY] Contract deployed at 0x4325eF28A2ffD6397444c6F255a621743a4e2338
[REGISTRY] Project #1 Registered: "Horn of Africa Emergency Water Logistics"
[INFO] Declared target: 10.0 ETH | Recorded: 0.0 ETH`,
    },
    {
      step: 2,
      badge: "Step 2: Client-Side Privacy Hashing",
      title: "Cryptographic Evidence Anchoring",
      subtitle: "Zero PII leaked; only SHA-256 fingerprints committed",
      icon: <FileCheck2 size={24} className="text-sky-400" />,
      content:
        "Field workers generate SHA-256 fingerprints of dispatch manifests locally in browser via Web Crypto API. Sensitive photos and personal beneficiary identities never touch the blockchain or any central server. Only the 64-character hash is committed on-chain.",
      terminal: `> sha256sum demo/dispatch_manifest_4409.txt
0x0270319b919a2e140fad2facea59b39f6ee0738f81fb9c47008e579f2b59cc16
[PRIVACY] File processed locally in browser. 0 bytes sent over network.
[COMMIT] Hash committed to Milestone #1 on GenLayer StudioNet.`,
    },
    {
      step: 3,
      badge: "Step 3: GenLayer Intelligent Consensus",
      title: "AI Validator Criteria Evaluation",
      subtitle: "Multi-validator consensus assessing milestone criteria",
      icon: <Cpu size={24} className="text-purple-400" />,
      content:
        "GenLayer's intelligent contract engine leverages multi-node AI consensus. Validators examine the milestone criteria (solar pumping units specifications, delivery depot) against evidence metadata to determine criteria compliance without human bottleneck.",
      terminal: `[GENLAYER_CONSENSUS] Invoking AI Validators for Milestone #1...
Node 1 (Leader): Criteria satisfied. Spec match: 3 Solar Pumping Units (Submersible 5.5kW).
Node 2 (Validator): Criteria satisfied. Destination verified: Lodwar Depot.
Consensus achieved: 2/2 Agree -> AI_CONSENSUS_APPROVED`,
    },
    {
      step: 4,
      badge: "Step 4: Dual Verification Attestation",
      title: "Authorized Field Reviewer Signature",
      subtitle: "Cryptographic proof meets ground-truth physical delivery",
      icon: <ShieldCheck size={24} className="text-emerald-400" />,
      content:
        "AidTrace enforces the Humility in Cryptography principle: A hash match proves data integrity, not physical delivery. Authorized humanitarian field reviewers (RBAC verified address) inspect physical installations and submit signed attestations.",
      terminal: `[RBAC_AUTH] Signer: 0x27D56637e172e9d288a4e8d35d1ea8dcd370fe47 (Authorized Field Reviewer)
[ATTESTATION] Outcome: APPROVED
[RATIONALE] Physical delivery confirmed by on-ground inspection at Lodwar Depot.
[LIFECYCLE] Milestone #1 State Transition: SUBMITTED -> VERIFIED`,
    },
  ];

  const current = demoSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b171c] border border-teal-500/30 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#081216]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Play size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                AidTrace Interactive Hackathon Demo
              </h3>
              <p className="text-xs text-slate-400">
                GenLayer Intelligent Contracts • 3-Minute Walkthrough
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

        {/* Step Indicator Tabs */}
        <div className="px-6 py-3 bg-[#061014] border-b border-white/5 flex items-center gap-2 overflow-x-auto">
          {demoSteps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                currentStep === idx
                  ? "bg-teal-500 text-black shadow-md"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                {s.step}
              </span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                {current.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {current.title}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                {current.content}
              </p>
            </div>
          </div>

          {/* Terminal Code Preview */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/10 text-slate-500 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2">GenLayer StudioNet Console (Chain 61999)</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">{current.terminal}</pre>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#081216] border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0))}
              disabled={currentStep === 0}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-semibold transition-colors"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setCurrentStep((prev) => (prev < demoSteps.length - 1 ? prev + 1 : 0))
              }
              className="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>{currentStep === demoSteps.length - 1 ? "Restart Walkthrough" : "Next Step"}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenVerifier();
              }}
              className="text-xs font-semibold text-teal-300 hover:underline"
            >
              Try Evidence Verifier
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => {
                onClose();
                onOpenTransactionCenter();
              }}
              className="text-xs font-semibold text-teal-300 hover:underline"
            >
              Open On-Chain Actions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
