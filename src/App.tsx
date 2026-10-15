import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { AboutSection } from "./components/AboutSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { ProjectExplorer } from "./components/ProjectExplorer";
import { TransactionCenter } from "./components/TransactionCenter";
import { EvidenceHasher } from "./components/EvidenceHasher";
import { ReviewerConsole } from "./components/ReviewerConsole";
import { INITIAL_PROJECTS, MilestoneData, GENLAYER_CONFIG, TransactionRecord } from "./utils/genlayer";
import { ArrowRight, ShieldCheck, Sparkles, ExternalLink, Activity, Send } from "lucide-react";

export const App: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<{
    hash: string;
    title: string;
  }>({
    hash: "0x0270319b919a2e140fad2facea59b39f6ee0738f81fb9c47008e579f2b59cc16",
    title: "Procurement & Dispatch of 3 Solar Pumping Units (Turkana Project)",
  });

  const [transactionTargetProjectId, setTransactionTargetProjectId] = useState<number>(1);
  const [transactionTargetMilestoneId, setTransactionTargetMilestoneId] = useState<number>(1);
  const [activeEvidenceHash, setActiveEvidenceHash] = useState<string>("");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectMilestoneForVerification = (
    milestone: MilestoneData,
    projectTitle: string
  ) => {
    setSelectedMilestone({
      hash: milestone.evidenceHash,
      title: `${milestone.title} (${projectTitle})`,
    });
    scrollTo("verifier");
  };

  const handleSelectProjectForTransaction = (projectId: number) => {
    setTransactionTargetProjectId(projectId);
    scrollTo("transactions");
  };

  const handleUseHashInTransaction = (hash: string) => {
    setActiveEvidenceHash(hash);
    scrollTo("transactions");
  };

  const handleOpenReviewerAction = (projectId: number, milestoneId: number, outcome: string) => {
    setTransactionTargetProjectId(projectId);
    setTransactionTargetMilestoneId(milestoneId);
    scrollTo("transactions");
  };

  return (
    <div className="min-h-screen bg-[#070f14] text-white flex flex-col font-sans selection:bg-teal-500 selection:text-black">
      {/* Floating Pill Navbar */}
      <Navbar onNavigate={scrollTo} />

      {/* SECTION 1: HERO (Humanitarian Design with Local Image) */}
      <header
        id="hero"
        className="relative min-h-[92vh] md:min-h-screen overflow-hidden flex flex-col justify-end pt-28 pb-16 md:pb-24"
      >
        {/* Real Humanitarian Photograph Background */}
        <picture className="absolute inset-0 w-full h-full">
          <source srcSet="/hero-humanitarian.png" type="image/png" />
          <img
            src="/hero-humanitarian.png"
            alt="Humanitarian community aid delivery and clean water distribution"
            className="w-full h-full object-cover object-center transform scale-105 motion-safe:transition-transform motion-safe:duration-1000"
            loading="eager"
          />
        </picture>

        {/* Multi-Stop Readability Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070f14] via-[#070f14]/75 to-[#070f14]/40" />
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-6">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 backdrop-blur-md border border-teal-500/30 text-teal-200 text-xs font-medium shadow-xl">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>GenLayer StudioNet Testnet • Gasless Chain 61999</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-normal text-white leading-[1.08] tracking-tight max-w-4xl">
            Transparent Aid.{" "}
            <span
              className="not-italic font-serif text-teal-300 block sm:inline"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
              }}
            >
              Verifiable Impact.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-white/90 text-sm sm:text-base md:text-lg font-normal max-w-2xl leading-relaxed drop-shadow-md">
            Follow aid projects from their stated goals to recorded progress and independently reviewable evidence.
            Every claim should have a clear status and an auditable trail.
          </p>

          {/* Dual Action CTAs */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Primary CTA */}
            <button
              onClick={() => scrollTo("projects")}
              className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-black text-sm font-semibold px-8 py-3.5 rounded-2xl transition-all shadow-xl hover:shadow-teal-500/25 flex items-center justify-center gap-2.5 group"
            >
              <span>Explore Projects</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary CTA */}
            <button
              onClick={() => scrollTo("transactions")}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-8 py-3.5 rounded-2xl backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Send size={15} className="text-teal-300" />
              <span>Record an On-Chain Update</span>
            </button>
          </div>

          {/* Micro Honesty Disclosure */}
          <div className="mt-2 text-[11px] text-white/50 flex items-center gap-2 font-mono">
            <span>Contract: 0x4325...2338</span>
            <span>•</span>
            <span>Zero-Dollar Public Good Submission</span>
          </div>
        </div>
      </header>

      {/* SECTION 2: ABOUT / ETHICAL MISSION SECTION */}
      <AboutSection
        onExploreProjects={() => scrollTo("projects")}
        onOpenVerifier={() => scrollTo("verifier")}
      />

      {/* SECTION 3: FEATURES (Scroll-driven cards) */}
      <FeaturesSection onExploreProjects={() => scrollTo("projects")} />

      {/* SECTION 4: INTERACTIVE PROJECT EXPLORER */}
      <div className="bg-[#09151b] border-t border-teal-500/10">
        <ProjectExplorer
          projects={INITIAL_PROJECTS}
          onSelectMilestoneForVerification={handleSelectMilestoneForVerification}
          onSelectProjectForTransaction={handleSelectProjectForTransaction}
        />
      </div>

      {/* SECTION 5: REAL TRANSACTION CENTER */}
      <div className="bg-[#0b171f] border-t border-teal-500/15">
        <TransactionCenter
          initialProjectId={transactionTargetProjectId}
          initialMilestoneId={transactionTargetMilestoneId}
          initialEvidenceHash={activeEvidenceHash}
        />
      </div>

      {/* SECTION 6: EVIDENCE INTEGRITY CHECKER */}
      <div className="bg-[#081219] py-16 px-6 border-t border-teal-500/10">
        <EvidenceHasher
          expectedHash={selectedMilestone.hash}
          milestoneTitle={selectedMilestone.title}
          onUseHashInTransaction={handleUseHashInTransaction}
        />
      </div>

      {/* SECTION 7: REVIEWER PORTAL CONSOLE */}
      <div className="bg-[#09151b] py-16 px-6 border-t border-teal-500/10">
        <ReviewerConsole onOpenTransactionAction={handleOpenReviewerAction} />
      </div>

      {/* FOOTER */}
      <footer className="bg-black py-14 px-6 border-t border-white/10 text-white/60 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/40">
              <ShieldCheck size={16} />
            </div>
            <span>AidTrace.</span>
            <span className="text-white/40 text-xs font-normal">Transparent Aid. Verifiable Impact.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-right">
            <div>
              <span className="block text-white/80 font-medium">GenLayer StudioNet (Chain ID: 61999)</span>
              <span className="font-mono text-[11px] text-teal-400">
                Contract: {GENLAYER_CONFIG.contractAddress}
              </span>
            </div>
            <a
              href={GENLAYER_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-300 transition-colors flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              <span>StudioNet Explorer</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <span>Web3 for Social Good Hackathon 2026 • Tech Track Submission • Strictly $0 Budget</span>
          <span>Humility in Cryptography: Hashes prove data integrity, not physical reality.</span>
        </div>
      </footer>
    </div>
  );
};
