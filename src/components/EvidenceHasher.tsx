import React, { useState } from "react";
import { computeFileSha256, computeTextSha256 } from "../utils/crypto";
import {
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  FileCode,
  ShieldAlert,
  ArrowRight,
  FileText,
  FileWarning,
} from "lucide-react";

interface EvidenceHasherProps {
  expectedHash?: string;
  milestoneTitle?: string;
  onUseHashInTransaction?: (hash: string) => void;
}

// Sample file contents from demo/
const VALID_MANIFEST_CONTENT = `AIDTRACE DEMONSTRATION DISPATCH MANIFEST #4409
Project: Horn of Africa Emergency Water Logistics
Item: 3 Solar Pumping Units (Submersible 5.5kW)
Destination: Lodwar Regional Depot, Turkana County
Date: 2026-10-14
`;

const TAMPERED_MANIFEST_CONTENT = `AIDTRACE DEMONSTRATION DISPATCH MANIFEST #4409
Project: Horn of Africa Emergency Water Logistics
Item: 1 Hand Pump (Altered)
Destination: Lodwar Regional Depot, Turkana County
Date: 2026-10-14
`;

export const EvidenceHasher: React.FC<EvidenceHasherProps> = ({
  expectedHash = "0x0270319b919a2e140fad2facea59b39f6ee0738f81fb9c47008e579f2b59cc16",
  milestoneTitle = "Procurement & Dispatch of 3 Solar Pumping Units (Turkana Project)",
  onUseHashInTransaction,
}) => {
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeSampleType, setActiveSampleType] = useState<"VALID" | "TAMPERED" | null>(null);

  const processFile = async (file: File) => {
    setIsHashing(true);
    setFileName(file.name);
    setFileSize(file.size);
    setActiveSampleType(null);
    try {
      const hash = await computeFileSha256(file);
      setComputedHash(hash);
    } catch (err) {
      console.error("Hashing failed", err);
    } finally {
      setIsHashing(false);
    }
  };

  const loadSampleManifest = async (type: "VALID" | "TAMPERED") => {
    setIsHashing(true);
    setActiveSampleType(type);
    const content = type === "VALID" ? VALID_MANIFEST_CONTENT : TAMPERED_MANIFEST_CONTENT;
    const name = type === "VALID" ? "dispatch_manifest_4409.txt (Authentic)" : "tampered_manifest.txt (Tampered)";
    setFileName(name);
    setFileSize(content.length);

    try {
      const hash = await computeTextSha256(content);
      setComputedHash(hash);
    } catch (err) {
      console.error("Sample hashing failed", err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const isMatch =
    computedHash &&
    expectedHash &&
    computedHash.toLowerCase() === expectedHash.toLowerCase();

  return (
    <div
      id="verifier"
      className="bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-white max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/20">
            <span>Client-Side Privacy Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Evidence Document Integrity Checker
          </h3>
          <p className="text-white/60 text-xs sm:text-sm mt-1">
            Compute SHA-256 hash locally in browser. No private documents or sensitive records leave your device.
          </p>
        </div>

        <div className="bg-black/30 px-3.5 py-2 rounded-xl border border-white/5 text-right">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Target Milestone</span>
          <span className="text-xs font-medium text-amber-200">{milestoneTitle}</span>
        </div>
      </div>

      {/* Target Milestone Hash Reference */}
      <div className="mb-6 bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-1.5">
        <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
          On-Chain Committed Fingerprint (GenLayer StudioNet)
        </span>
        <code className="text-xs sm:text-sm font-mono text-emerald-400 break-all select-all">
          {expectedHash}
        </code>
      </div>

      {/* Interactive Tamper-Demonstration Sample Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => loadSampleManifest("VALID")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
            activeSampleType === "VALID"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
          }`}
        >
          <FileText size={15} />
          <span>Load Authentic Manifest #4409 (Match Demo)</span>
        </button>

        <button
          type="button"
          onClick={() => loadSampleManifest("TAMPERED")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
            activeSampleType === "TAMPERED"
              ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
          }`}
        >
          <FileWarning size={15} />
          <span>Load Altered Manifest (Mismatch Demo)</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
          isDragOver
            ? "border-teal-400 bg-teal-500/5 scale-[1.01]"
            : "border-white/15 bg-white/[0.02] hover:border-white/30"
        }`}
        onClick={() => document.getElementById("evidence-file-input")?.click()}
      >
        <input
          id="evidence-file-input"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-teal-300 mb-1">
          <UploadCloud size={28} />
        </div>
        <p className="text-sm sm:text-base font-medium">
          {isHashing ? "Computing cryptographic SHA-256 hash in browser memory..." : "Drop off-chain document here, or click to browse"}
        </p>
        <p className="text-xs text-white/40">
          PDF, JPG, PNG, CSV, or text manifest (Evaluated strictly in local RAM)
        </p>
      </div>

      {/* Hash Verification Results */}
      {computedHash && (
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <FileCode className="text-white/60" size={24} />
              <div>
                <span className="text-sm font-medium block">{fileName}</span>
                <span className="text-xs text-white/40">
                  {fileSize ? `${fileSize} bytes` : "0 bytes"} • Local Browser Memory
                </span>
              </div>
            </div>

            {/* Match Status Badge */}
            <div
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                isMatch
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {isMatch ? (
                <>
                  <CheckCircle size={18} />
                  <span>MATCHES ON-CHAIN RECORD</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} />
                  <span>HASH MISMATCH / TAMPER DETECTED</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-black/60 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-white/40 block mb-1">Locally Computed SHA-256 Hash:</span>
            <code className="text-xs sm:text-sm font-mono text-white break-all select-all">
              {computedHash}
            </code>
          </div>

          {/* Action button to use this hash in Transaction Center */}
          {onUseHashInTransaction && (
            <button
              type="button"
              onClick={() => onUseHashInTransaction(computedHash)}
              className="self-start bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors"
            >
              <span>Submit this Hash in Transaction Center</span>
              <ArrowRight size={14} />
            </button>
          )}

          {/* Humility in Cryptography Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 text-amber-200/90 text-xs leading-relaxed">
            <ShieldAlert size={18} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">Humility in Cryptography Principle</strong>
              A cryptographic hash match proves data integrity (the document is byte-for-byte identical to the submitted version).
              It does <em>not</em> prove physical reality. Real-world delivery verification requires authorized human field reviewer sign-off.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
