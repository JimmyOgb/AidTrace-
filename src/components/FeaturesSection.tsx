import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, Shield, Eye } from "lucide-react";

interface FeaturesSectionProps {
  onExploreProjects: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onExploreProjects }) => {
  const [activeCard, setActiveCard] = useState<number>(0);
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const features = [
    {
      id: 0,
      title: "Transparent Project Records",
      tagline: "Declared targets vs. received funds",
      description:
        "Register aid initiatives with explicit outcome targets, aggregate beneficiary metrics, and milestone allocations. AidTrace transparently distinguishes declared funding targets from actual funds received, preventing misleading claims.",
      icon: <Eye className="text-amber-400" size={24} />,
      badge: "On-Chain Registry",
      detailItems: [
        "Aggregate beneficiary targets (zero personal PII)",
        "Declared funding goals vs. actual wallet balances",
        "Coarse geographic delineation to protect communities",
      ],
    },
    {
      id: 1,
      title: "Evidence-Based Verification",
      tagline: "Cryptographic integrity meets human accountability",
      description:
        "Field workers commit cryptographic document fingerprints (SHA-256) on-chain without uploading sensitive photos or beneficiary identities. GenLayer validators assess criteria alignment while authorized human reviewers attest physical delivery.",
      icon: <Shield className="text-emerald-400" size={24} />,
      badge: "Intelligent Consensus + Reviewer RBAC",
      detailItems: [
        "Client-side SHA-256 evidence hashing in browser",
        "Humility in Cryptography: hash proves integrity, not physical reality",
        "Tamper-resistant audit log with authorized reviewer signatures",
      ],
    },
    {
      id: 2,
      title: "Measurable Community Impact",
      tagline: "Auditable milestones, honest metrics",
      description:
        "Track milestone lifecycles across Pending, Submitted, Under Review, and Verified states. Donors and community watchdogs audit progress in real time without needing crypto wallets, gas tokens, or technical knowledge.",
      icon: <CheckCircle2 className="text-blue-400" size={24} />,
      badge: "Public Zero-Wallet Explorer",
      detailItems: [
        "Real-time StudioNet sync with transparent state badges",
        "Clear demarcation between verified on-chain and demo data",
        "Fail-closed architecture under network disruption",
      ],
    },
  ];

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.forEach((ref, index) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveCard(index);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const scrollToCard = (index: number) => {
    cardRefs[index].current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <section
      id="how-it-works"
      className="relative z-10 px-5 md:px-10 lg:px-16 py-20 md:py-36 bg-[#18181B] text-white border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr] gap-12 lg:gap-24">
        {/* Left Column (Sticky on Desktop) */}
        <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-140px)] lg:flex lg:flex-col lg:justify-between py-6">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs uppercase tracking-widest font-semibold w-fit border border-white/10">
              Core Capabilities
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-tight">
              Accountability that respects <span className="font-serif italic text-amber-200">field reality.</span>
            </h2>

            <p className="text-white/60 text-sm md:text-base leading-relaxed">
              Designed to solve the "black box" of NGO funding and the fallacy that blockchain transfers alone prove real-world impact.
            </p>

            {/* Feature Nav Buttons */}
            <div className="hidden lg:flex flex-col gap-2 pt-4">
              {features.map((feature, idx) => (
                <button
                  key={feature.id}
                  onClick={() => scrollToCard(idx)}
                  className={`text-left px-5 py-3.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-between border ${
                    activeCard === idx
                      ? "bg-white/15 text-white border-white/20 shadow-md translate-x-1"
                      : "bg-white/5 text-white/50 border-transparent hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  <span>{feature.title}</span>
                  {activeCard === idx && <ArrowRight size={16} className="text-amber-300" />}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom CTA block */}
          <div className="hidden lg:flex flex-col gap-4 pt-8 border-t border-white/10">
            <p className="text-xs text-white/50">
              No noise. No opaque overhead. Just community aid, verifiably delivered.
            </p>
            <button
              onClick={onExploreProjects}
              className="bg-white text-black px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors w-fit flex items-center gap-2"
            >
              <span>Explore Projects</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Column (Scrolling Cards) */}
        <div className="flex flex-col gap-10 md:gap-16">
          {features.map((feature, idx) => (
            <div
              key={feature.id}
              ref={cardRefs[idx]}
              className={`bg-white/[0.04] backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 border transition-all duration-500 ${
                activeCard === idx
                  ? "border-amber-400/30 shadow-2xl shadow-amber-950/20"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    {feature.icon}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                      {feature.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 font-normal">
                {feature.description}
              </p>

              {/* Bullet Highlights */}
              <div className="bg-black/30 rounded-2xl p-5 border border-white/5 flex flex-col gap-2.5">
                {feature.detailItems.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
