import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { AboutSection } from "./components/AboutSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { ProjectExplorer } from "./components/ProjectExplorer";
import { EvidenceHasher } from "./components/EvidenceHasher";
import { ReviewerConsole } from "./components/ReviewerConsole";
import { INITIAL_PROJECTS, MilestoneData, GENLAYER_CONFIG } from "./utils/genlayer";
import { ArrowRight, ShieldCheck, HeartHandshake, Sparkles, ExternalLink } from "lucide-react";

export const App: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<{
    hash: string;
    title: string;
  }>({
    hash: "0x70f20de1d9de31c6c4eb330538123c5b0ce719d394bc28e67025f6ff5df1e9e9",
    title: "Procurement & Dispatch of 3 Solar Pumping Units (Turkana Project)",
  });

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

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans">
      {/* Floating Pill Navbar */}
      <Navbar onNavigate={scrollTo} />

      {/* SECTION 1: HERO (full viewport height) */}
      <header
        id="hero"
        className="relative h-screen overflow-hidden mb-[-25px] flex flex-col justify-end"
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260711_090308_1dd0cea7-f9ba-4db4-8147-c7d746061c9e.mp4"
            type="video/mp4"
          />
        </video>

        {/* Semi-transparent Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Hero Content (Bottom-Aligned) */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-14 md:pb-20 flex flex-col items-center text-center gap-6">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium">
            <Sparkles size={14} className="text-amber-300" />
            <span>Web3 for Social Good Hackathon 2026 • Tech Track</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[96px] font-normal text-white leading-[1.08] tracking-tight">
            Every contribution
            <br />
            deserves{" "}
            <em
              className="not-italic font-serif"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
              }}
            >
              accountability.
            </em>
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-sm md:text-base font-medium max-w-[560px] leading-relaxed">
            Follow community aid from its stated purpose to documented delivery, with a transparent
            record of progress and independently reviewable evidence.
          </p>

          {/* CTA Bar */}
          <div className="mt-2 bg-black/40 backdrop-blur-md rounded-xl flex items-center pl-6 pr-1.5 py-1.5 border border-white/10 shadow-2xl max-w-xl w-full justify-between">
            <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">
              No noise. No opaque overhead. Just transparent aid.
            </span>
            <span className="text-white text-xs font-medium sm:hidden">
              Transparent Aid. Verifiable Impact.
            </span>
            <button
              onClick={() => scrollTo("projects")}
              className="bg-white text-black text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 shrink-0 ml-3"
            >
              <span>Explore Projects</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 2: ABOUT / INTRO SECTION */}
      <AboutSection
        onExploreProjects={() => scrollTo("projects")}
        onOpenVerifier={() => scrollTo("verifier")}
      />

      {/* SECTION 3: FEATURES SECTION (Scroll-driven cards) */}
      <FeaturesSection onExploreProjects={() => scrollTo("projects")} />

      {/* SECTION 4: INTERACTIVE PROJECT EXPLORER */}
      <div className="bg-[#18181B] border-t border-white/5">
        <ProjectExplorer
          projects={INITIAL_PROJECTS}
          onSelectMilestoneForVerification={handleSelectMilestoneForVerification}
        />
      </div>

      {/* SECTION 5: EVIDENCE INTEGRITY CHECKER */}
      <div className="bg-[#141416] py-16 px-6 border-t border-white/5">
        <EvidenceHasher
          expectedHash={selectedMilestone.hash}
          milestoneTitle={selectedMilestone.title}
        />
      </div>

      {/* SECTION 6: REVIEWER PORTAL CONSOLE */}
      <div className="bg-[#18181B] py-16 px-6 border-t border-white/5">
        <ReviewerConsole />
      </div>

      {/* FOOTER */}
      <footer className="bg-black py-12 px-6 border-t border-white/10 text-white/50 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <ShieldCheck size={20} className="text-emerald-400" />
            <span>AidTrace.</span>
            <span className="text-white/40 text-xs font-normal">Transparent Aid. Verifiable Impact.</span>
          </div>

          <div className="flex items-center gap-6 text-center sm:text-right">
            <div>
              <span className="block text-white/70">GenLayer StudioNet (Chain ID: 61999)</span>
              <span className="font-mono text-[11px] text-emerald-400">
                Contract: {GENLAYER_CONFIG.contractAddress}
              </span>
            </div>
            <a
              href={`${GENLAYER_CONFIG.explorerUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>Explorer</span>
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
