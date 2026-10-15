import React, { useState } from "react";
import {
  X,
  MapPin,
  Target,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderKanban,
} from "lucide-react";
import { GenLayerLogo } from "./Icons";
import { ProjectData, MilestoneData, GENLAYER_CONFIG } from "../utils/genlayer";

interface AllProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectData[];
  onSelectMilestoneForVerification: (milestone: MilestoneData, projectTitle: string) => void;
  onSelectProjectForTransaction: (projectId: number) => void;
}

export const AllProjectsModal: React.FC<AllProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectMilestoneForVerification,
  onSelectProjectForTransaction,
}) => {
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(1);

  if (!isOpen) return null;

  const toggleExpand = (id: number) => {
    setExpandedProjectId(expandedProjectId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b171c] border border-teal-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#081216] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <FolderKanban size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">All On-Chain Aid Initiatives</h3>
              <p className="text-xs text-slate-400">
                Registered on GenLayer StudioNet (Chain ID: 61999)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Project List */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {projects.map((project) => {
            const isExpanded = expandedProjectId === project.id;
            const isStudioNet = project.networkSource.includes("StudioNet");

            return (
              <div
                key={project.id}
                className="bg-[#0e1f26] border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(project.id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-teal-400">#{project.id}</span>
                      <h4 className="text-base font-bold text-white">{project.title}</h4>
                      {isStudioNet && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                          <GenLayerLogo size={10} />
                          StudioNet
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                      <MapPin size={12} />
                      <span>{project.coarse_location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-white block">
                        {project.target_funding} ETH
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {project.aggregate_beneficiaries_target.toLocaleString()} Beneficiaries
                      </span>
                    </div>

                    <div className="p-1.5 rounded-full bg-white/5 text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 flex flex-col gap-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block">Declared Target</span>
                        <span className="text-xs font-bold text-white">
                          {project.target_funding} ETH
                        </span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block">Recorded Funding</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {project.total_received} ETH
                        </span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center">
                        <span className="text-[10px] text-slate-400 block">Target Beneficiaries</span>
                        <span className="text-xs font-bold text-white">
                          {project.aggregate_beneficiaries_target.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Milestones list */}
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-xs font-semibold text-slate-300">
                        Auditable Milestones
                      </span>
                      {project.milestones?.map((m) => {
                        const isVerified = m.status === "VERIFIED";
                        return (
                          <div
                            key={m.id}
                            className="bg-black/25 rounded-xl p-3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  #{m.id}: {m.title}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    isVerified
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-blue-500/20 text-blue-300"
                                  }`}
                                >
                                  {isVerified ? (
                                    <CheckCircle2 size={10} />
                                  ) : (
                                    <Clock size={10} />
                                  )}
                                  {m.status}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                                Hash: {m.evidenceHash}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                onClose();
                                onSelectMilestoneForVerification(m, project.title);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors shrink-0"
                            >
                              Verify
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProjectForTransaction(project.id);
                        }}
                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <span>Perform On-Chain Actions for Project #{project.id}</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
