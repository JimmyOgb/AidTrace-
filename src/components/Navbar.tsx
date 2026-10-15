import React, { useState } from "react";
import { Wallet, Menu, X, Check, ExternalLink } from "lucide-react";
import { AidTraceLogo, GenLayerLogo } from "./Icons";
import { GENLAYER_CONFIG } from "../utils/genlayer";

interface NavbarProps {
  activeTab: string;
  onNavigate: (sectionId: string) => void;
  onOpenWalletModal: () => void;
  onOpenCreateProject?: () => void;
  walletConnected?: boolean;
  walletAddress?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onOpenWalletModal,
  onOpenCreateProject,
  walletConnected = false,
  walletAddress = "0x27D5...fe47",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Projects", id: "projects" },
    { label: "Verify Evidence", id: "verifier" },
    { label: "For Reviewers", id: "reviewers" },
    { label: "About", id: "about" },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 w-full z-40 bg-gradient-to-b from-[#041315]/95 via-[#041315]/80 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Subtitle */}
        <div
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="transition-transform group-hover:scale-105">
            <AidTraceLogo size={36} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
              AidTrace
            </span>
            <span className="text-[10px] text-slate-300 font-normal tracking-wide mt-1 leading-none">
              Transparent Aid. Verifiable Impact.
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-all relative py-1 focus:outline-none ${
                  isActive
                    ? "text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#00d084] after:rounded-full"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Create Project, GenLayer StudioNet Pill & Connect Wallet */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Create Project Button */}
          {onOpenCreateProject && (
            <button
              onClick={onOpenCreateProject}
              className="bg-[#00d084] hover:bg-[#00ba76] active:scale-[0.98] text-slate-950 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 focus:outline-none"
            >
              <span>+ Create Project</span>
            </button>
          )}

          {/* GenLayer StudioNet Badge */}
          <div className="bg-[#0b2434]/80 hover:bg-[#0e2c40]/90 border border-sky-400/40 rounded-2xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-md shadow-md transition-colors cursor-default">
            <div className="text-sky-300">
              <GenLayerLogo size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-white leading-tight">
                GenLayer StudioNet
              </span>
              <div className="flex items-center gap-1 leading-tight">
                <span className="text-[10px] text-sky-200/80">61999</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d084] animate-pulse"></span>
              </div>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <button
            onClick={onOpenWalletModal}
            className="bg-[#071e2e] hover:bg-[#0a293d] active:scale-[0.98] border border-sky-400/40 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all shadow-md focus:outline-none"
          >
            <Wallet size={15} className="text-sky-300" />
            <span>{walletConnected ? walletAddress : "Connect Wallet"}</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenWalletModal}
            className="bg-[#071e2e] border border-sky-400/40 text-white rounded-xl px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
          >
            <Wallet size={14} className="text-sky-300" />
            <span>{walletConnected ? "Connected" : "Wallet"}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#05171b]/95 backdrop-blur-xl border-b border-teal-500/20 px-6 py-4 flex flex-col gap-3 shadow-2xl">
          {onOpenCreateProject && (
            <button
              onClick={() => {
                onOpenCreateProject();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] text-black font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>+ Create Project (On-Chain)</span>
            </button>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="text-left py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>{item.label}</span>
              {activeTab === item.id && (
                <span className="w-2 h-2 rounded-full bg-[#00d084]"></span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <GenLayerLogo size={14} />
              <span>StudioNet 61999</span>
            </div>
            <a
              href={GENLAYER_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d084] hover:underline flex items-center gap-1"
            >
              Explorer <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
