import React, { useState } from "react";
import { ProjectData, MilestoneData } from "../utils/genlayer";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Target,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
} from "lucide-react";

interface ProjectExplorerProps {
  projects: ProjectData[];
  onSelectMilestoneForVerification?: (milestone: MilestoneData, projectTitle: string) => void;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  projects,
  onSelectMilestoneForVerification,
}) => {
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(1);

  const toggleExpand = (id: number) => {
    setExpandedProjectId(expandedProjectId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CheckCircle2 size={13} />
            <span>VERIFIED</span>
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Clock size={13} />
            <span>UNDER REVIEW</span>
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Clock size={13} />
            <span>SUBMITTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-xs font-semibold">
            <AlertCircle size={13} />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <section id="projects" className="py-20 px-6 max-w-6xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
            <span>Live Audit Ledger</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight">
            Aid Projects & <span className="font-serif italic text-amber-200">Verified Milestones</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Real on-chain initiatives deployed to GenLayer StudioNet. Never fabricated.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/50 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
          <span>Network:</span>
          <span className="text-emerald-400 font-semibold">GenLayer StudioNet (61999)</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {projects.map((project) => {
          const isExpanded = expandedProjectId === project.id;
          const isStudioNet = project.networkSource === "StudioNet On-Chain";

          return (
            <div
              key={project.id}
              className={`rounded-3xl border transition-all overflow-hidden ${
                isStudioNet
                  ? "bg-white/[0.04] border-emerald-500/30 shadow-xl"
                  : "bg-white/[0.02] border-white/10 opacity-90"
              }`}
            >
              {/* Project Card Header */}
              <div
                onClick={() => toggleExpand(project.id)}
                className="p-6 sm:p-8 cursor-pointer flex flex-col gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono text-white/40">#{project.id}</span>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {project.title}
                    </h3>

                    {/* Network Source Pill */}
                    {isStudioNet ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        StudioNet On-Chain
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-xs font-medium border border-purple-500/30">
                        Sample Demonstration
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(project.status)}
                    <button
                      className="p-1 rounded-full text-white/40 hover:text-white transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                <p className="text-white/70 text-sm leading-relaxed max-w-3xl">
                  {project.description}
                </p>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
                    <MapPin size={18} className="text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block truncate">Location</span>
                      <span className="text-xs font-medium text-white truncate block">{project.coarse_location}</span>
                    </div>
                  </div>

                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
                    <Users size={18} className="text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block truncate">Beneficiaries</span>
                      <span className="text-xs font-medium text-white truncate block">
                        {project.aggregate_beneficiaries_target} (Aggregate)
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
                    <Target size={18} className="text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block truncate">Funding Goal</span>
                      <span className="text-xs font-medium text-white truncate block">{project.target_funding}</span>
                    </div>
                  </div>

                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 flex items-center gap-2.5">
                    <FileCheck2 size={18} className="text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block truncate">Received</span>
                      <span className="text-xs font-medium text-emerald-300 truncate block">
                        {project.total_received}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Milestones Section */}
              {isExpanded && (
                <div className="px-6 sm:px-8 pb-8 pt-2 border-t border-white/10 bg-black/20 flex flex-col gap-4">
                  <div className="flex items-center justify-between pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                      Milestone Execution Trail ({project.milestones.length})
                    </h4>
                    <span className="text-xs text-white/40">
                      Coordinator: <code className="text-amber-200/80 font-mono text-[11px]">{project.coordinator}</code>
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {project.milestones.map((m) => (
                      <div
                        key={m.id}
                        className="bg-black/40 rounded-2xl p-5 border border-white/5 flex flex-col gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 text-xs flex items-center justify-center font-bold">
                              {m.id}
                            </span>
                            <span className="text-base font-medium text-white">{m.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(m.status)}
                            {onSelectMilestoneForVerification && m.evidenceHash && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectMilestoneForVerification(m, project.title);
                                }}
                                className="text-xs text-amber-300 hover:text-amber-200 underline font-medium ml-2"
                              >
                                Test Integrity
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-white/60">
                          Target Outcome: <span className="text-white/80">{m.targetOutcome}</span> • Allocation:{" "}
                          <span className="text-amber-300 font-mono">{m.allocationAmount}</span>
                        </div>

                        {/* On-Chain Evidence Hash Reference */}
                        {m.evidenceHash && (
                          <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-white/40 font-mono">Evidence Hash:</span>
                              <code className="text-emerald-400 font-mono truncate select-all">
                                {m.evidenceHash}
                              </code>
                            </div>
                            {m.metadataUri && (
                              <span className="text-white/40 font-mono text-[11px] shrink-0">
                                {m.metadataUri}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Dual Verification Status View: GenLayer Consensus vs Reviewer Attestation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {/* 1. GenLayer AI Assessment Record */}
                          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-1">
                              <Sparkles size={14} />
                              <span>GenLayer Consensus Assessment</span>
                            </div>
                            <p className="text-xs text-white/60">
                              {m.assessmentRationale || "Awaiting consensus evaluation against criteria."}
                            </p>
                          </div>

                          {/* 2. Authorized Human Reviewer Attestation */}
                          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1">
                              <UserCheck size={14} />
                              <span>Field Reviewer Attestation</span>
                            </div>
                            <p className="text-xs text-white/60">
                              {m.reviewer ? (
                                <>
                                  Attested by:{" "}
                                  <code className="text-emerald-400 font-mono text-[11px]">
                                    {m.reviewer}
                                  </code>
                                </>
                              ) : (
                                "Pending independent reviewer signature."
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
