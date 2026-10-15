import React, { useState } from "react";
import {
  UserCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  Lock,
} from "lucide-react";
import { GENLAYER_CONFIG } from "../utils/genlayer";

interface ReviewerConsoleProps {
  onOpenTransactionAction?: (projectId: number, milestoneId: number, outcome: string) => void;
}

export const ReviewerConsole: React.FC<ReviewerConsoleProps> = ({
  onOpenTransactionAction,
}) => {
  const [projectId, setProjectId] = useState<number>(1);
  const [milestoneId, setMilestoneId] = useState<number>(2);
  const [reviewOutcome, setReviewOutcome] = useState<"VERIFIED" | "REJECTED" | "DISPUTED">("VERIFIED");

  const handleLaunchTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOpenTransactionAction) {
      onOpenTransactionAction(projectId, milestoneId, reviewOutcome);
    }
  };

  return (
    <section id="reviewers" className="bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-white max-w-4xl mx-auto my-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
            <UserCheck size={14} />
            <span>Authorized Field Reviewer Portal</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Field Reviewer Attestation Console
          </h3>
          <p className="text-white/60 text-xs sm:text-sm mt-1">
            Sign on-chain verification decisions to finalize milestones on GenLayer StudioNet.
          </p>
        </div>

        <div className="bg-black/30 px-3.5 py-2 rounded-xl border border-white/5 text-right font-mono text-xs">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Contract Address</span>
          <span className="text-emerald-400">
            {GENLAYER_CONFIG.contractAddress.slice(0, 8)}...{GENLAYER_CONFIG.contractAddress.slice(-6)}
          </span>
        </div>
      </div>

      {/* Separation of Powers Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
            <Sparkles size={14} />
            <span>1. GenLayer AI Criteria Assessment</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Validators evaluate non-deterministic consensus to verify if document claims match stated milestone targets.
            <strong> AI consensus can never finalize milestones or authorize funding.</strong>
          </p>
        </div>

        <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
            <UserCheck size={14} />
            <span>2. Authorized Human Reviewer Attestation</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Only identified, authorized human field auditors with role-based access can attest that goods/services physically arrived on the ground.
          </p>
        </div>
      </div>

      <form onSubmit={handleLaunchTransaction} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
              Target Project ID
            </label>
            <input
              type="number"
              min="1"
              value={projectId}
              onChange={(e) => setProjectId(Number(e.target.value))}
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
              value={milestoneId}
              onChange={(e) => setMilestoneId(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
            Verification Decision
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "VERIFIED", label: "Verify", icon: <CheckCircle2 size={16} />, color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
              { id: "REJECTED", label: "Reject", icon: <XCircle size={16} />, color: "border-rose-500 text-rose-400 bg-rose-500/10" },
              { id: "DISPUTED", label: "Dispute", icon: <AlertTriangle size={16} />, color: "border-amber-500 text-amber-400 bg-amber-500/10" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setReviewOutcome(option.id as any)}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  reviewOutcome === option.id
                    ? option.color
                    : "border-white/10 bg-black/20 text-white/50 hover:bg-white/5"
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="text-xs text-white/60">
            Submissions are signed on-chain through the Transaction Center with input validation and receipt checking.
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors shrink-0"
          >
            <span>Proceed in Transaction Center</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </form>
    </section>
  );
};
