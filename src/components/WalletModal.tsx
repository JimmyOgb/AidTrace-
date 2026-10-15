import React, { useState } from "react";
import { X, Wallet, Check, ExternalLink, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { GenLayerLogo } from "./Icons";
import { GENLAYER_CONFIG } from "../utils/genlayer";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  address: string;
  chainId?: number | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onSwitchNetwork?: () => Promise<void>;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  address,
  chainId,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const isStudioNet = chainId === GENLAYER_CONFIG.chainId;

  const handleConnectClick = async () => {
    setConnecting(true);
    setErrorMessage("");
    try {
      await onConnect();
      onClose();
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes("User rejected")) {
        setErrorMessage("Wallet connection request was rejected by user.");
      } else {
        setErrorMessage(err.message || "Failed to connect wallet.");
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectClick = () => {
    onDisconnect();
    onClose();
  };

  const handleSwitchClick = async () => {
    if (onSwitchNetwork) {
      try {
        await onSwitchNetwork();
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to switch network.");
      }
    }
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
              <span className="text-slate-400">Deployed Contract</span>
              <span className="font-mono text-teal-300 text-[11px] truncate max-w-[200px]">
                {GENLAYER_CONFIG.contractAddress}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isConnected ? (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                    <Check size={14} />
                    <span>Wallet Connected</span>
                  </span>
                  {chainId !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isStudioNet
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      Chain: {chainId ?? "Unknown"}
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-white break-all">{address}</span>
              </div>

              {!isStudioNet && onSwitchNetwork && (
                <button
                  onClick={handleSwitchClick}
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Switch Network to GenLayer StudioNet (61999)</span>
                </button>
              )}

              <button
                onClick={handleDisconnectClick}
                className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
              >
                Disconnect Session
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConnectClick}
                disabled={connecting}
                className="w-full py-3.5 rounded-xl bg-[#00d084] hover:bg-[#00ba76] disabled:opacity-50 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <GenLayerLogo size={16} />
                <span>
                  {connecting
                    ? "Connecting to StudioNet..."
                    : "Connect Authorized StudioNet Account"}
                </span>
              </button>

              <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Security & Safety Guarantee</span>
                </div>
                <p className="leading-normal">
                  GenLayer StudioNet is completely gasless. AidTrace will <strong>never</strong> request your seed phrase, private key, or any financial tokens.
                </p>
              </div>
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
