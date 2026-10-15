import React from "react";
import { FileText, ShieldCheck, ArrowRight, Eye, CheckCircle2 } from "lucide-react";

interface AboutSectionProps {
  onExploreProjects: () => void;
  onOpenVerifier: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onExploreProjects,
  onOpenVerifier,
}) => {
  return (
    <section
      id="about"
      className="bg-[#0b1717] rounded-t-[32px] relative z-10 py-20 md:py-32 px-6 border-t border-teal-500/20 text-white"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-16 md:gap-24">
        {/* Top Area: Heading and Action Buttons */}
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs uppercase tracking-widest font-semibold border border-teal-500/20">
            <ShieldCheck size={14} />
            <span>Humanitarian Accountability Protocol</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-tight">
            Trust should be <span className="font-serif italic text-teal-300">visible.</span>
          </h2>

          <p className="text-white/80 text-base md:text-lg text-center leading-relaxed max-w-2xl">
            AidTrace helps communities, donors, and independent monitors track aid initiatives
            from declared goals to verified ground delivery with cryptographic integrity and zero personal data leakage.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            {/* Primary Action Button */}
            <button
              onClick={onExploreProjects}
              className="bg-teal-500 text-black font-semibold rounded-full px-6 py-3 flex items-center gap-3 hover:bg-teal-400 transition-all shadow-lg hover:shadow-teal-500/20 group text-xs uppercase tracking-wider"
            >
              <span>Explore Projects</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Secondary Action Button */}
            <button
              onClick={onOpenVerifier}
              className="bg-white/10 hover:bg-white/15 text-white rounded-full px-6 py-3 flex items-center gap-3 transition-all border border-white/15 text-xs uppercase tracking-wider font-semibold"
            >
              <Eye size={14} />
              <span>Verify Document Hash</span>
            </button>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="w-full flex items-center">
          <span className="w-2 h-2 rounded-full bg-teal-500/40" />
          <div className="flex-1 h-[1px] bg-teal-500/20 mx-2" />
          <span className="w-2 h-2 rounded-full bg-teal-500/40" />
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f2424] rounded-2xl p-6 border border-teal-500/20 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">
              1
            </div>
            <h4 className="text-lg font-semibold text-white">Truth in Reporting</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              We distinguish declared targets from recorded ledger entries. Beneficiaries are labeled as planning goals, never fabricated as verified persons served.
            </p>
          </div>

          <div className="bg-[#0f2424] rounded-2xl p-6 border border-teal-500/20 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">
              2
            </div>
            <h4 className="text-lg font-semibold text-white">Separation of Powers</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              GenLayer intelligent contract validators evaluate off-chain document criteria, but only authorized human field reviewers attest physical delivery on the ground.
            </p>
          </div>

          <div className="bg-[#0f2424] rounded-2xl p-6 border border-teal-500/20 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">
              3
            </div>
            <h4 className="text-lg font-semibold text-white">Strict Privacy & Zero PII</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Beneficiary identities, street addresses, and private records are never published on-chain. Only SHA-256 cryptographic digests protect public auditability.
            </p>
          </div>
        </div>

        {/* Bottom Area: Core Mission Statement */}
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16 pt-6 border-t border-teal-500/10">
          <div className="flex items-center md:items-start gap-3 md:flex-col shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-300 border border-teal-500/30">
              <ShieldCheck size={24} />
            </div>
            <div className="text-xs uppercase tracking-widest font-semibold text-teal-400 leading-tight">
              AidTrace
              <br />
              Accountability
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xl sm:text-2xl md:text-3xl leading-[1.4] font-normal text-white/90">
              We engineer intelligent on-chain accountability systems. But, most importantly, we help
              humanitarian stakeholders remember what credible community aid looks like when
              cryptographic proofs reinforce human integrity, not replace it. We build systems that
              carry the burden of proof, so relief teams can focus on saving lives.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
