import React, { useState } from "react";
import { UserCheck, ShieldAlert, Sparkles, CheckCircle2, XCircle, AlertTriangle, Send } from "lucide-react";
import { GENLAYER_CONFIG } from "../utils/genlayer";

interface ReviewerConsoleProps {
  onAttestationComplete?: (projectId: number, milestoneId: number, outcome: string) => void;
}

export const ReviewerConsole: React.FC<ReviewerConsoleProps> = () => {
  const [projectId, setProjectId] = useState<number>(1);
  const [milestoneId, setMilestoneId] = useState<number>(2);
  const [reviewOutcome, setReviewOutcome] = useState<"VERIFIED" | "REJECTED" | "DISPUTED">("VERIFIED");
  const [rationale, setRationale] = useState<string>("Hydrological well flow test logs inspected against certified NGO ground report.");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [attestationSuccess, setAttestationSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAttestationSuccess(false);

    // Simulate signing & submitting review attestation to GenLayer contract
    setTimeout(() => {
      setIsSubmitting(false);
      setAttestationSuccess(true);
    }, 1200);
  };

  return (
    <div className="bg-[#202024] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-white max-w-4xl mx-auto my-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
            <UserCheck size={14} />
            <span>Authorized Reviewer Portal</span>
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
          <span className="text-emerald-400">{GENLAYER_CONFIG.contractAddress.slice(0, 8)}...{GENLAYER_CONFIG.contractAddress.slice(-6)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
              Target Project ID
            </label>
            <input
              type="number"
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

        <div>
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
            Audit Rationale Statement
          </label>
          <textarea
            rows={3}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            placeholder="Explain inspection basis, invoice check, or physical delivery corroboration..."
            required
          />
          <span className="text-[11px] text-white/40 mt-1 block">
            A cryptographic SHA-256 fingerprint of this rationale is permanently committed to the GenLayer contract.
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Broadcasting to StudioNet Validators...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Submit Attestation to StudioNet</span>
            </>
          )}
        </button>

        {attestationSuccess && (
          <div className="mt-2 bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 size={20} className="shrink-0" />
            <div>
              <strong>Attestation Accepted by Validators:</strong> Milestone #{milestoneId} updated to{" "}
              <span className="font-bold underline">{reviewOutcome}</span> on GenLayer StudioNet.
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
