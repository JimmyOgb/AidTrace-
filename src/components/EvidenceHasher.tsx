import React, { useState } from "react";
import { computeFileSha256 } from "../utils/crypto";
import { UploadCloud, CheckCircle, AlertTriangle, FileCode, ShieldAlert } from "lucide-react";

interface EvidenceHasherProps {
  expectedHash?: string;
  milestoneTitle?: string;
}

export const EvidenceHasher: React.FC<EvidenceHasherProps> = ({
  expectedHash = "0x70f20de1d9de31c6c4eb330538123c5b0ce719d394bc28e67025f6ff5df1e9e9",
  milestoneTitle = "Procurement & Dispatch of 3 Solar Pumping Units (Turkana Project)",
}) => {
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const processFile = async (file: File) => {
    setIsHashing(true);
    setFileName(file.name);
    setFileSize(file.size);
    try {
      const hash = await computeFileSha256(file);
      setComputedHash(hash);
    } catch (err) {
      console.error("Hashing failed", err);
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
      className="bg-[#202024] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-white max-w-4xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/20">
            <span>Client-Side Privacy Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Evidence Document Integrity Checker
          </h3>
          <p className="text-white/60 text-xs sm:text-sm mt-1">
            Compute SHA-256 hash locally in browser. No sensitive documents are ever uploaded to a server.
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

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
          isDragOver
            ? "border-amber-400 bg-amber-500/5 scale-[1.01]"
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
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-amber-300 mb-1">
          <UploadCloud size={28} />
        </div>
        <p className="text-sm sm:text-base font-medium">
          {isHashing ? "Computing cryptographic SHA-256 hash..." : "Drop off-chain document here, or click to browse"}
        </p>
        <p className="text-xs text-white/40">
          PDF, JPG, PNG, CSV, or manifest bundle (Processed entirely in local memory)
        </p>
      </div>

      {/* Hash Verification Results */}
      {computedHash && (
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/30 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <FileCode className="text-white/60" size={24} />
              <div>
                <span className="text-sm font-medium block">{fileName}</span>
                <span className="text-xs text-white/40">
                  {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : "0 KB"} • Local Browser Memory
                </span>
              </div>
            </div>

            {/* Match Status Badge */}
            <div
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                isMatch
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
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
                  <span>HASH MISMATCH / UNVERIFIED</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-white/40 block mb-1">Locally Computed File Hash:</span>
            <code className="text-xs sm:text-sm font-mono text-white break-all">
              {computedHash}
            </code>
          </div>

          {/* Humility in Cryptography Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 text-amber-200/90 text-xs leading-relaxed">
            <ShieldAlert size={18} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">Humility in Cryptography Principle</strong>
              A cryptographic hash match proves that this document has not been altered since submission.
              It does <em>not</em> prove physical aid delivery. Verification relies on authorized field reviewer attestations.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
