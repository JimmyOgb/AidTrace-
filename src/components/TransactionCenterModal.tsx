import React from "react";
import { X, Send } from "lucide-react";
import { TransactionCenter } from "./TransactionCenter";

interface TransactionCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: number;
  initialMilestoneId?: number;
  initialEvidenceHash?: string;
}

export const TransactionCenterModal: React.FC<TransactionCenterModalProps> = ({
  isOpen,
  onClose,
  initialProjectId = 1,
  initialMilestoneId = 1,
  initialEvidenceHash = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b171c] border border-teal-500/30 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#081216] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Send size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                GenLayer StudioNet On-Chain Transaction Center
              </h3>
              <p className="text-xs text-slate-400">
                Execute live transactions, record updates, submit evidence & sign attestations
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

        {/* Transaction Center Form Body */}
        <div className="p-4 sm:p-6">
          <TransactionCenter
            initialProjectId={initialProjectId}
            initialMilestoneId={initialMilestoneId}
            initialEvidenceHash={initialEvidenceHash}
          />
        </div>
      </div>
    </div>
  );
};
