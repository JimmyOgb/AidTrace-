import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Projects", id: "projects" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Transparency", id: "transparency" },
    { label: "Verify Evidence", id: "verifier" },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Centered Floating Pill */}
      <div className="bg-white rounded-full shadow-xl px-5 py-2.5 flex items-center gap-4 border border-black/5 backdrop-blur-md">
        <button
          onClick={() => handleLinkClick("hero")}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="w-6 h-6 rounded-full bg-[#321C04] flex items-center justify-center text-[#FFF9F2]">
            <ShieldCheck size={14} />
          </div>
          <span className="text-lg font-bold tracking-tight text-black">AidTrace.</span>
        </button>

        {/* Live StudioNet Indicator Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GenLayer StudioNet</span>
        </div>

        {/* Animated Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
        >
          <span
            className={`w-4 h-0.5 bg-black transition-all duration-300 origin-center ${
              isOpen ? "rotate-45 translate-y-[4px]" : ""
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.77, 0, 0.175, 1)" }}
          />
          <span
            className={`w-4 h-0.5 bg-black transition-all duration-300 origin-center ${
              isOpen ? "-rotate-45 -translate-y-[4px]" : ""
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.77, 0, 0.175, 1)" }}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`w-64 mt-3 bg-white rounded-2xl shadow-2xl p-2 border border-black/5 transition-all duration-200 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-[#F6E4CF]/60 rounded-xl transition-colors text-left flex items-center justify-between"
            >
              <span>{item.label}</span>
            </button>
          ))}
          <div className="my-1 border-t border-gray-100"></div>
          <div className="px-4 py-1.5 text-[11px] text-gray-400 font-mono">
            GenLayer Chain 61999
          </div>
        </div>
      </div>
    </div>
  );
};
