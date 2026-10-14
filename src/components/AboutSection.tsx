import React from "react";
import { FileText, Plus } from "lucide-react";

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
      id="transparency"
      className="bg-[#F6E4CF] rounded-t-[25px] relative z-10 py-20 md:py-32 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-16 md:gap-24">
        {/* Top Area: Heading and Action Buttons */}
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9C4AA]/50 text-[#321C04] text-xs uppercase tracking-widest font-semibold">
            Humanitarian Accountability
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-[#321C04] tracking-tight">
            Trust should be <span className="font-serif italic font-normal">visible.</span>
          </h2>

          <p className="text-[#321C04] text-base md:text-lg text-center leading-relaxed max-w-xl">
            AidTrace helps communities, donors, and independent monitors track project milestones
            from budget allocation to verified field delivery with cryptographic integrity and zero personal data leakage.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Primary Action Button */}
            <button
              onClick={onExploreProjects}
              className="bg-[#321C04] text-[#FFF9F2] rounded-full pl-2 pr-6 py-2.5 flex items-center gap-3 hover:bg-[#1F1003] transition-all shadow-md group"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#321C04] group-hover:scale-105 transition-transform">
                <FileText size={16} />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">
                Explore Projects
              </span>
            </button>

            {/* Secondary Action Button */}
            <button
              onClick={onOpenVerifier}
              className="bg-[#D9C4AA] text-[#321C04] rounded-full pl-2 pr-6 py-2.5 flex items-center gap-3 hover:bg-[#CEBA9E] transition-all shadow-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#321C04] group-hover:scale-105 transition-transform">
                <Plus size={16} />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider">
                Verify Document Hash
              </span>
            </button>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="w-full flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#D9C4AA]" />
          <div className="flex-1 h-[2px] bg-[#D9C4AA] mx-1" />
          <span className="w-2 h-2 rounded-full bg-[#D9C4AA]" />
        </div>

        {/* Bottom Area: Brand Emblem + Core Mission Statement */}
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
          {/* Left Emblem */}
          <div className="flex items-center md:items-start gap-3 md:flex-col shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 256 256"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M 256 256 L 178 256 C 150.386 256 128 233.614 128 206 L 128 256 L 0 256 L 0 192 C 0 156.654 28.654 128 64 128 C 99.346 128 128 156.654 128 192 L 128 128 L 256 128 Z M 78 0 C 105.614 0 128 22.386 128 50 L 128 0 L 256 0 L 256 64 C 256 99.346 227.346 128 192 128 C 156.654 128 128 99.346 128 64 L 128 128 L 0 128 L 0 0 Z"
                fill="#321C04"
              />
            </svg>
            <div className="text-xs uppercase tracking-widest font-semibold text-[#321C04] leading-tight">
              AidTrace
              <br />
              Verifiable
            </div>
          </div>

          {/* Right Large Paragraph */}
          <div className="flex-1">
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-[1.3] font-normal text-[#321C04]">
              We build intelligent on-chain accountability systems. But, most importantly, we help
              humanitarian stakeholders remember what credible community aid looks like when
              cryptographic proofs reinforce human integrity, not replace it. We create systems that
              carry the burden of proof, so communities can focus on what truly counts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
