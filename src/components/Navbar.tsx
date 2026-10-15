import React, { useState } from "react";
import { ShieldCheck, Menu, X, ExternalLink } from "lucide-react";
import { GENLAYER_CONFIG } from "../utils/genlayer";

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Projects", id: "projects" },
    { label: "Transactions", id: "transactions" },
    { label: "Verify Evidence", id: "verifier" },
    { label: "For Reviewers", id: "reviewers" },
    { label: "About", id: "about" },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <header className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-full px-4 max-w-4xl">
      {/* Centered Floating Pill */}
      <nav aria-label="Main navigation" className="w-full bg-[#091818]/90 backdrop-blur-md rounded-full shadow-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between border border-teal-500/20">
        <button
          onClick={() => handleLinkClick("hero")}
          className="flex items-center gap-2 text-left focus:outline-none group"
          aria-label="AidTrace Home"
        >
          <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 border border-teal-500/40 group-hover:scale-105 transition-transform">
            <ShieldCheck size={16} />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white">AidTrace.</span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.id)}
              className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Live StudioNet Indicator Tag & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">StudioNet</span>
            <span>61999</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors focus:outline-none"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="w-full mt-2 bg-[#091818]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-3 border border-teal-500/20 flex flex-col gap-1 md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.id)}
              className="px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left flex items-center justify-between"
            >
              <span>{item.label}</span>
            </button>
          ))}
          <div className="my-1 border-t border-white/10"></div>
          <div className="px-4 py-2 flex items-center justify-between text-[11px] text-white/50 font-mono">
            <span>GenLayer Chain 61999</span>
            <a
              href={GENLAYER_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Explorer</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
