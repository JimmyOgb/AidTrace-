import React from "react";
import { X, UserCheck } from "lucide-react";
import { ReviewerConsole } from "./ReviewerConsole";

interface ReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTransactionAction: (projectId: number, milestoneId: number, outcome: string) => void;
}

export const ReviewerModal: React.FC<ReviewerModalProps> = ({
  isOpen,
  onClose,
  onOpenTransactionAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b171c] border border-teal-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#081216] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <UserCheck size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Authorized Field Reviewer Portal</h3>
              <p className="text-xs text-slate-400">
                Ground-truth physical verification & RBAC signatures
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

        <div className="p-6">
          <ReviewerConsole
            onOpenTransactionAction={(projectId, milestoneId, outcome) => {
              onClose();
              onOpenTransactionAction(projectId, milestoneId, outcome);
            }}
          />
        </div>
      </div>
    </div>
  );
};
