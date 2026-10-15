import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { FourFeatureCards } from "./components/FourFeatureCards";
import { LiveProjectsSection } from "./components/LiveProjectsSection";
import { VerifyEvidenceSection } from "./components/VerifyEvidenceSection";
import { WatchDemoModal } from "./components/WatchDemoModal";
import { WalletModal } from "./components/WalletModal";
import { AllProjectsModal } from "./components/AllProjectsModal";
import { ReviewerModal } from "./components/ReviewerModal";
import { AboutModal } from "./components/AboutModal";
import { TransactionCenterModal } from "./components/TransactionCenterModal";
import { GenLayerLogo } from "./components/Icons";
import { INITIAL_PROJECTS, MilestoneData, GENLAYER_CONFIG } from "./utils/genlayer";
import { ArrowRight, Play, Sparkles, Send } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  // Modals state
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAllProjectsOpen, setIsAllProjectsOpen] = useState<boolean>(false);
  const [isReviewerOpen, setIsReviewerOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState<boolean>(false);

  // Wallet session simulation
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>(
    "0x27D56637e172e9d288a4e8d35d1ea8dcd370fe47"
  );

  // Selected state for cross-component interactions
  const [targetProjectId, setTargetProjectId] = useState<number>(1);
  const [targetMilestoneId, setTargetMilestoneId] = useState<number>(1);
  const [activeEvidenceHash, setActiveEvidenceHash] = useState<string>("");

  const scrollTo = (id: string) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveTab("home");
      return;
    }

    if (id === "reviewers") {
      setIsReviewerOpen(true);
      setActiveTab("reviewers");
      return;
    }

    if (id === "about") {
      setIsAboutOpen(true);
      setActiveTab("about");
      return;
    }

    if (id === "projects") {
      setActiveTab("projects");
      const el = document.getElementById("projects");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (id === "verifier") {
      setActiveTab("verifier");
      const el = document.getElementById("verifier");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveTab(id);
    }
  };

  const handleSelectMilestoneForVerification = (
    milestone: MilestoneData,
    projectTitle: string
  ) => {
    setActiveEvidenceHash(milestone.evidenceHash);
    scrollTo("verifier");
  };

  const handleOpenTransactionForProject = (projectId: number) => {
    setTargetProjectId(projectId);
    setIsTransactionOpen(true);
  };

  const handleOpenReviewerAction = (
    projectId: number,
    milestoneId: number,
    outcome: string
  ) => {
    setTargetProjectId(projectId);
    setTargetMilestoneId(milestoneId);
    setIsTransactionOpen(true);
  };

  const handleUseHashInTransaction = (hash: string) => {
    setActiveEvidenceHash(hash);
    setIsTransactionOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#00d084] selection:text-black">
      {/* SECTION 1: HERO & NAVBAR (Dark Humanitarian Theme) */}
      <div className="relative bg-[#041315] min-h-[540px] sm:min-h-[580px] lg:min-h-[620px] overflow-hidden flex flex-col justify-between">
        {/* Real Humanitarian Photograph on Right Side */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%] pointer-events-none z-0">
          <picture>
            <source srcSet="/hero-clean-final.png" type="image/png" />
            <img
              src="/hero-clean-final.png"
              alt="AidTrace Humanitarian Logistics"
              className="w-full h-full object-cover object-right-top opacity-90 lg:opacity-100"
              loading="eager"
            />
          </picture>
          {/* Gradients blending photograph into dark hero background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#041315] via-[#041315]/70 to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041315] via-transparent to-transparent lg:hidden block" />
          <div className="absolute inset-0 bg-[#041315]/30 lg:hidden block" />
        </div>

        {/* Global Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onNavigate={scrollTo}
          onOpenWalletModal={() => setIsWalletOpen(true)}
          walletConnected={walletConnected}
          walletAddress={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
        />

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 sm:pt-32 pb-16 sm:pb-20 flex flex-col items-start justify-center">
          <div className="max-w-xl flex flex-col items-start">
            {/* Hackathon Track Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#062423]/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-6 shadow-md">
              <GenLayerLogo size={14} className="text-emerald-400" />
              <span>Web3 for Social Good Hackathon 2026 • Tech Track</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-white tracking-tight leading-[1.08]">
              Transparent Aid.
              <br />
              <span className="text-[#00d084]">Verifiable Impact.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-200 text-sm sm:text-base mt-4 leading-relaxed font-normal">
              AidTrace uses GenLayer's intelligent contracts and AI consensus to bring
              transparency, accountability and real-world verification to humanitarian aid.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => scrollTo("projects")}
                className="bg-[#00d084] hover:bg-[#00ba76] active:scale-[0.98] text-slate-950 text-sm font-bold px-7 py-3 rounded-full transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>Explore Live Projects</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setIsDemoOpen(true)}
                className="bg-[#0a1e26]/85 hover:bg-[#0f2c38] active:scale-[0.98] text-white border border-white/30 text-sm font-semibold px-6 py-3 rounded-full transition-all backdrop-blur-md flex items-center justify-center gap-2"
              >
                <Play size={15} className="fill-white" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero bottom spacer */}
        <div className="h-6"></div>
      </div>

      {/* SECTION 2: FOUR FEATURE CARDS (Banner Overlapping Seam) */}
      <FourFeatureCards />

      {/* SECTION 3: TWO-COLUMN MAIN CONTENT (Live Projects & Verify Evidence) */}
      <main className="flex-1 bg-[#f8fafc] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Live Projects */}
            <div className="lg:col-span-7">
              <LiveProjectsSection
                projects={INITIAL_PROJECTS}
                onOpenAllProjectsModal={() => setIsAllProjectsOpen(true)}
                onSelectMilestoneForVerification={handleSelectMilestoneForVerification}
                onOpenTransactionAction={handleOpenTransactionForProject}
              />
            </div>

            {/* Right Column (5 cols): Verify Evidence */}
            <div className="lg:col-span-5">
              <VerifyEvidenceSection
                onUseHashInTransaction={handleUseHashInTransaction}
              />
            </div>
          </div>
        </div>
      </main>

      {/* SECTION 4: DARK FOOTER (Matching Mockup Bottom Bar) */}
      <footer className="bg-[#071318] border-t border-slate-800 text-slate-400 py-4 px-4 sm:px-8 text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: GenLayer Brand */}
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <div className="text-teal-400">
              <GenLayerLogo size={16} />
            </div>
            <span>Powered by GenLayer StudioNet</span>
          </div>

          {/* Center: Hackathon Info */}
          <div className="text-slate-400 text-center font-normal">
            Web3 for Social Good Hackathon 2026 • Tech Track
          </div>

          {/* Right: StudioNet Network Status */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#00d084] animate-pulse"></span>
            <span>Network: StudioNet (Chain ID 61999)</span>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <WatchDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onOpenVerifier={() => scrollTo("verifier")}
        onOpenTransactionCenter={() => setIsTransactionOpen(true)}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        isConnected={walletConnected}
        address={walletAddress}
        onConnect={() => setWalletConnected(true)}
        onDisconnect={() => setWalletConnected(false)}
      />

      <AllProjectsModal
        isOpen={isAllProjectsOpen}
        onClose={() => setIsAllProjectsOpen(false)}
        projects={INITIAL_PROJECTS}
        onSelectMilestoneForVerification={handleSelectMilestoneForVerification}
        onSelectProjectForTransaction={handleOpenTransactionForProject}
      />

      <ReviewerModal
        isOpen={isReviewerOpen}
        onClose={() => setIsReviewerOpen(false)}
        onOpenTransactionAction={handleOpenReviewerAction}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onExploreProjects={() => scrollTo("projects")}
        onOpenVerifier={() => scrollTo("verifier")}
      />

      <TransactionCenterModal
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        initialProjectId={targetProjectId}
        initialMilestoneId={targetMilestoneId}
        initialEvidenceHash={activeEvidenceHash}
      />
    </div>
  );
};
export default App;
