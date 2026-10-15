import React from "react";
import { X, ShieldCheck, HeartHandshake, Eye, Lock, Cpu, ArrowRight } from "lucide-react";
import { AidTraceLogo, GenLayerLogo } from "./Icons";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreProjects: () => void;
  onOpenVerifier: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onExploreProjects,
  onOpenVerifier,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b171c] border border-teal-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#081216] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <AidTraceLogo size={28} />
            <div>
              <h3 className="text-base font-bold text-white">About AidTrace</h3>
              <p className="text-xs text-slate-400">
                Transparent Aid. Verifiable Impact. • Web3 for Social Good
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

        {/* Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 mb-3">
              <ShieldCheck size={14} />
              <span>Ethical Humanitarian Web3 Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trust should be <span className="text-[#00d084]">visible.</span>
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-3xl">
              Traditional humanitarian aid suffers from an information asymmetry problem: donors
              rarely know if supplies reached the field, and local communities lack a voice to confirm
              deliveries. AidTrace bridges this divide using GenLayer’s intelligent contracts and
              AI-powered consensus, pairing cryptographic proof with physical field review.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0e2128] p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-[#00d084] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Truth in Reporting</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We strictly distinguish declared targets from recorded ledger entries. Beneficiaries
                are labeled as planning goals, never falsely claimed as certified persons served.
              </p>
            </div>

            <div className="bg-[#0e2128] p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Separation of Powers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                GenLayer AI consensus assesses criteria match without human bottlenecks, but only
                authorized human field auditors attest physical ground delivery.
              </p>
            </div>

            <div className="bg-[#0e2128] p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Privacy by Design</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero personally identifiable information (PII) is published on-chain. Only SHA-256
                cryptographic digests are committed to guarantee tamper-resistance.
              </p>
            </div>
          </div>

          {/* Architecture comparison */}
          <div className="bg-[#071318] p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GenLayerLogo size={18} className="text-teal-400" />
              <span>Why GenLayer StudioNet?</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-rose-400 font-semibold block mb-1">Traditional Smart Contracts</span>
                <p className="text-slate-400">
                  Deterministic only; cannot ingest natural language manifests, cannot assess
                  qualitative criteria, requires central off-chain oracles or high gas fees.
                </p>
              </div>
              <div className="bg-teal-500/10 p-4 rounded-xl border border-teal-500/30">
                <span className="text-emerald-300 font-semibold block mb-1">GenLayer Intelligent Contracts</span>
                <p className="text-slate-300">
                  Native GenVM AI consensus natively evaluates natural language criteria, runs gasless on
                  StudioNet, and supports verifiable role-based access control.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onExploreProjects();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] text-black text-xs font-bold transition-all"
            >
              Explore Live Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
