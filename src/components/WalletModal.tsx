import React, { useState } from "react";
import { X, Wallet, Check, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { GenLayerLogo } from "./Icons";
import { GENLAYER_CONFIG } from "../utils/genlayer";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  address: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  address,
  onConnect,
  onDisconnect,
}) => {
  const [connecting, setConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnectClick = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 600));
    onConnect();
    setConnecting(false);
    onClose();
  };

  const handleDisconnectClick = () => {
    onDisconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b171c] border border-teal-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#081216]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Wallet size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GenLayer StudioNet Wallet</h3>
              <p className="text-xs text-slate-400">Zero-gas smart contract interaction</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Network details card */}
          <div className="bg-[#061014] p-4 rounded-2xl border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Network</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>GenLayer StudioNet</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Chain ID</span>
              <span className="font-mono text-white">61999 (0xf22f)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Intelligent Contract</span>
              <span className="font-mono text-teal-300 text-[11px] truncate max-w-[200px]">
                {GENLAYER_CONFIG.contractAddress}
              </span>
            </div>
          </div>

          {isConnected ? (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Wallet Connected</span>
                </span>
                <span className="font-mono text-xs text-white break-all">{address}</span>
              </div>

              <button
                onClick={handleDisconnectClick}
                className="w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
              >
                Disconnect Session
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConnectClick}
                disabled={connecting}
                className="w-full py-3.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <GenLayerLogo size={16} />
                <span>
                  {connecting
                    ? "Connecting to StudioNet..."
                    : "Connect Authorized StudioNet Account"}
                </span>
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-normal">
                GenLayer StudioNet is gasless. You do not need real funds or gas tokens to interact.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <a
              href={GENLAYER_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>StudioNet Explorer</span>
              <ExternalLink size={11} />
            </a>
            <span className="text-[11px] text-slate-500">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
