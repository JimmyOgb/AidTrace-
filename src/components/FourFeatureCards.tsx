import React from "react";
import { Box, Sparkles, Users, ShieldCheck } from "lucide-react";

export const FourFeatureCards: React.FC = () => {
  const cards = [
    {
      title: "On-Chain Transparency",
      description: "Project data, funding and milestones recorded on GenLayer StudioNet.",
      icon: <Box size={22} className="text-sky-500" />,
      bgIcon: "bg-sky-50 border-sky-100",
    },
    {
      title: "AI-Powered Assessment",
      description: "GenLayer validators analyze evidence against project criteria.",
      icon: <Sparkles size={22} className="text-purple-500" />,
      bgIcon: "bg-purple-50 border-purple-100",
    },
    {
      title: "Human Verification",
      description: "Authorized field reviewers attest real-world delivery.",
      icon: <Users size={22} className="text-emerald-500" />,
      bgIcon: "bg-emerald-50 border-emerald-100",
    },
    {
      title: "Privacy by Design",
      description: "Only hashes and metadata on-chain. No sensitive data exposed.",
      icon: <ShieldCheck size={22} className="text-amber-500" />,
      bgIcon: "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="relative -mt-10 sm:-mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex items-start gap-4 group"
          >
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.bgIcon}`}
            >
              {card.icon}
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                {card.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
