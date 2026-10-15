import React, { useState, useEffect } from "react";
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
import { CreateProjectModal } from "./components/CreateProjectModal";
import { GenLayerLogo } from "./components/Icons";
import {
  INITIAL_PROJECTS,
  MilestoneData,
  ProjectData,
  GENLAYER_CONFIG,
  fetchAllOnChainProjects,
} from "./utils/genlayer";
import { ArrowRight, Play, PlusCircle } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  // Modals state
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAllProjectsOpen, setIsAllProjectsOpen] = useState<boolean>(false);
  const [isReviewerOpen, setIsReviewerOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState<boolean>(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false);

  // Real Web3 Wallet Session
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletChainId, setWalletChainId] = useState<number | null>(null);

  // Project List (Live on-chain + clearly marked sample demos)
  const [projects, setProjects] = useState<ProjectData[]>(INITIAL_PROJECTS);

  // Selected state for cross-component interactions
  const [targetProjectId, setTargetProjectId] = useState<number>(1);
  const [targetMilestoneId, setTargetMilestoneId] = useState<number>(1);
  const [activeEvidenceHash, setActiveEvidenceHash] = useState<string>("");

  // Check injected wallet & load on-chain projects on mount
  useEffect(() => {
    const initSession = async () => {
      // 1. Check existing wallet connection
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        try {
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
          const chainHex = await ethereum.request({ method: "eth_chainId" });
          if (chainHex) {
            setWalletChainId(parseInt(chainHex, 16));
          }

          // Listeners for account & network changes
          const handleAccountsChanged = (newAccounts: string[]) => {
            if (newAccounts.length > 0) {
              setWalletAddress(newAccounts[0]);
              setWalletConnected(true);
            } else {
              setWalletAddress("");
              setWalletConnected(false);
            }
          };

          const handleChainChanged = (newChainHex: string) => {
            setWalletChainId(parseInt(newChainHex, 16));
          };

          ethereum.on("accountsChanged", handleAccountsChanged);
          ethereum.on("chainChanged", handleChainChanged);
        } catch (err) {
          console.warn("[App] Error checking injected wallet session:", err);
        }
      }

      // 2. Fetch live on-chain projects from StudioNet
      try {
        const liveOnChain = await fetchAllOnChainProjects();
        if (liveOnChain.length > 0) {
          // Preserve sample demonstration items with clear separation
          const demoItems = INITIAL_PROJECTS.filter((p) => p.networkSource.includes("Sample"));
          setProjects([...liveOnChain, ...demoItems]);
        }
      } catch (err) {
        console.warn("[App] Could not load live on-chain projects; using cached initial data:", err);
      }
    };

    initSession();
  }, []);

  // Connect wallet handler
  const handleConnectWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error("No Web3 browser wallet detected (e.g. MetaMask, Rabby).");
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts authorized.");
    }

    setWalletAddress(accounts[0]);
    setWalletConnected(true);

    const chainHex = await ethereum.request({ method: "eth_chainId" });
    const currentChain = parseInt(chainHex, 16);
    setWalletChainId(currentChain);

    if (currentChain !== GENLAYER_CONFIG.chainId) {
      await handleSwitchNetwork();
    }
  };

  // Disconnect wallet handler
  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
  };

  // Switch network handler to GenLayer StudioNet (61999)
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
    } catch (switchError: any) {
      if (switchError.code === 4902) {
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
      } else {
        throw switchError;
      }
    }
  };

  // Callback when a project is created permissionlessly on-chain
  const handleProjectCreated = (newProject: ProjectData) => {
    setProjects((prev) => [newProject, ...prev.filter((p) => p.id !== newProject.id)]);
    setTargetProjectId(newProject.id);
  };

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
          <div className="absolute inset-0 bg-gradient-to-r from-[#041315] via-[#041315]/70 to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041315] via-transparent to-transparent lg:hidden block" />
          <div className="absolute inset-0 bg-[#041315]/30 lg:hidden block" />
        </div>

        {/* Global Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onNavigate={scrollTo}
          onOpenWalletModal={() => setIsWalletOpen(true)}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          walletConnected={walletConnected}
          walletAddress={
            walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"
          }
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
                onClick={() => setIsCreateProjectOpen(true)}
                className="bg-[#0b2434]/90 hover:bg-[#0e2f45] active:scale-[0.98] text-emerald-300 border border-emerald-500/40 text-sm font-semibold px-6 py-3 rounded-full transition-all backdrop-blur-md flex items-center justify-center gap-2"
              >
                <PlusCircle size={15} />
                <span>Create a Project</span>
              </button>

              <button
                onClick={() => setIsDemoOpen(true)}
                className="bg-[#0a1e26]/85 hover:bg-[#0f2c38] active:scale-[0.98] text-white border border-white/30 text-sm font-semibold px-5 py-3 rounded-full transition-all backdrop-blur-md flex items-center justify-center gap-2"
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
                projects={projects}
                onOpenAllProjectsModal={() => setIsAllProjectsOpen(true)}
                onOpenCreateProject={() => setIsCreateProjectOpen(true)}
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

      {/* SECTION 4: DARK FOOTER */}
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
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        walletChainId={walletChainId}
        onConnectWallet={handleConnectWallet}
        onSwitchNetwork={handleSwitchNetwork}
        onProjectCreated={handleProjectCreated}
      />

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
        chainId={walletChainId}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        onSwitchNetwork={handleSwitchNetwork}
      />

      <AllProjectsModal
        isOpen={isAllProjectsOpen}
        onClose={() => setIsAllProjectsOpen(false)}
        projects={projects}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
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
