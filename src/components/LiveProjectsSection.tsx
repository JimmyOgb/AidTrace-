import React, { useState } from "react";
import {
  MapPin,
  Target,
  Wallet,
  Users,
  Info,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GenLayerLogo } from "./Icons";
import { ProjectData, MilestoneData, GENLAYER_CONFIG } from "../utils/genlayer";

interface LiveProjectsSectionProps {
  projects: ProjectData[];
  onOpenAllProjectsModal: () => void;
  onSelectMilestoneForVerification: (milestone: MilestoneData, projectTitle: string) => void;
  onOpenTransactionAction?: (projectId: number) => void;
}

export const LiveProjectsSection: React.FC<LiveProjectsSectionProps> = ({
  projects,
  onOpenAllProjectsModal,
  onSelectMilestoneForVerification,
  onOpenTransactionAction,
}) => {
  const [showMilestones, setShowMilestones] = useState(false);
  const primaryProject = projects[0] || {
    id: 1,
    title: "Horn of Africa Emergency Water Logistics",
    coarse_location: "Turkana County, Kenya",
    description:
      "Emergency water supply and logistics support for vulnerable communities in the Horn of Africa region.",
    target_funding: "10.0",
    total_received: "0.0",
    aggregate_beneficiaries_target: 1200,
    status: "ACTIVE",
    milestones: [],
  };

  return (
    <div id="projects" className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <FolderKanban size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">Live Projects</h3>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">
              Real projects. Real data. On-chain.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAllProjectsModal}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors group focus:outline-none"
        >
          <span>View All Projects</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Project Card (Horn of Africa Emergency Water Logistics) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Project Thumbnail Image */}
          <div className="w-full sm:w-48 h-40 sm:h-auto rounded-xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-200/80">
            <img
              src="/project-turkana.png"
              alt={primaryProject.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Project Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Active
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/90 text-[11px] font-semibold">
                  <GenLayerLogo size={12} className="text-teal-600" />
                  <span>StudioNet On-Chain</span>
                </span>
              </div>

              {/* Title & Location */}
              <h4 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                {primaryProject.title}
              </h4>
              <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mt-1">
                <MapPin size={13} className="text-slate-400" />
                <span>{primaryProject.coarse_location}</span>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                {primaryProject.description}
              </p>
            </div>

            {/* 3 Metric Boxes Grid */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {/* Target */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-2.5 flex flex-col">
                <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-700">
                    <Target size={10} />
                  </div>
                  <span>Declared Target</span>
                </div>
                <span className="text-slate-900 font-bold text-sm mt-1">
                  {primaryProject.target_funding} ETH
                </span>
                <span className="text-slate-400 text-[10px] leading-none mt-0.5">(≈ $18,000)</span>
              </div>

              {/* Recorded Funding */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-2.5 flex flex-col">
                <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-700">
                    <Wallet size={10} />
                  </div>
                  <span>Recorded Funding</span>
                </div>
                <span className="text-slate-900 font-bold text-sm mt-1">
                  {primaryProject.total_received} ETH
                </span>
                <span className="text-slate-400 text-[10px] leading-none mt-0.5">(≈ $0)</span>
              </div>

              {/* Target Beneficiaries */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-2.5 flex flex-col">
                <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-700">
                    <Users size={10} />
                  </div>
                  <div className="truncate">
                    <span>Beneficiaries</span>
                  </div>
                </div>
                <span className="text-slate-900 font-bold text-sm mt-1">
                  {primaryProject.aggregate_beneficiaries_target.toLocaleString()}
                </span>
                <span className="text-slate-400 text-[9px] leading-none mt-0.5">(Planning Target)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Milestones Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1.5 transition-colors focus:outline-none"
          >
            <span>
              {showMilestones ? "Hide Auditable Milestones" : `View ${primaryProject.milestones?.length || 2} Auditable Milestones`}
            </span>
            {showMilestones ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {onOpenTransactionAction && (
            <button
              onClick={() => onOpenTransactionAction(primaryProject.id)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>On-Chain Actions</span>
              <ExternalLink size={11} />
            </button>
          )}
        </div>

        {/* Expanded Milestones Content */}
        {showMilestones && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2.5 animate-in fade-in duration-200">
            {primaryProject.milestones?.map((m) => {
              const isVerified = m.status === "VERIFIED";
              return (
                <div
                  key={m.id}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Milestone #{m.id}: {m.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isVerified ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {m.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-md">
                      Hash: {m.evidenceHash}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onSelectMilestoneForVerification(m, primaryProject.title)
                    }
                    className="text-xs font-semibold bg-white hover:bg-teal-50 text-teal-700 border border-teal-300 rounded-lg px-3 py-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    Verify Fingerprint
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Truthful Integrity Disclosure Banner */}
        <div className="bg-[#fffbeb] border border-amber-200 rounded-xl p-3 mt-4 flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-950">Integrity Disclosure:</strong>{" "}
            Registered on GenLayer StudioNet testnet for demonstration. Beneficiary counts are
            planning targets, not certified persons served. Funding values are recorded entries, not
            custodial escrow.
          </div>
        </div>
      </div>
    </div>
  );
};
