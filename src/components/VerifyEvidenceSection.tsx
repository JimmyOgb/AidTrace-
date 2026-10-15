import React, { useState, useRef } from "react";
import {
  Fingerprint,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  X,
  Copy,
} from "lucide-react";
import { computeFileSha256, computeTextSha256 } from "../utils/crypto";

// Sample manifests matching demo/ assets
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

const TARGET_ON_CHAIN_HASH =
  "0x0270319b919a2e140fad2facea59b39f6ee0738f81fb9c47008e579f2b59cc16";

interface VerifyEvidenceSectionProps {
  onUseHashInTransaction?: (hash: string) => void;
}

export const VerifyEvidenceSection: React.FC<VerifyEvidenceSectionProps> = ({
  onUseHashInTransaction,
}) => {
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeFileSample, setActiveFileSample] = useState<"VALID" | "TAMPERED" | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsHashing(true);
    setFileName(file.name);
    setActiveFileSample(null);
    try {
      const hash = await computeFileSha256(file);
      setComputedHash(hash);
    } catch (err) {
      console.error("Hashing failed", err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleSelectSample = async (type: "VALID" | "TAMPERED") => {
    setIsHashing(true);
    setActiveFileSample(type);
    const content = type === "VALID" ? VALID_MANIFEST_CONTENT : TAMPERED_MANIFEST_CONTENT;
    const name = type === "VALID" ? "dispatch_manifest_4409.txt" : "tampered_manifest.txt";
    setFileName(name);

    try {
      const hash = await computeTextSha256(content);
      setComputedHash(hash);
    } catch (err) {
      console.error("Sample hash failed", err);
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

  const handleCopyHash = () => {
    if (computedHash) {
      navigator.clipboard.writeText(computedHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isMatch =
    computedHash &&
    computedHash.toLowerCase() === TARGET_ON_CHAIN_HASH.toLowerCase();

  return (
    <div id="verifier" className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
          <Fingerprint size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">Verify Evidence</h3>
          <p className="text-xs text-slate-500 leading-tight mt-0.5">
            Check document integrity with SHA-256
          </p>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
        <div>
          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-teal-500 bg-teal-50/50"
                : "border-slate-200 hover:border-teal-400 bg-slate-50/70"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <UploadCloud
                size={34}
                className="text-slate-400 stroke-[1.5] group-hover:scale-105 transition-transform"
              />
              <span className="text-xs font-semibold text-slate-700 mt-2">
                Drag & drop a file or click to browse
              </span>
              <span className="text-[10px] text-slate-400 mt-1 max-w-xs">
                Files are processed locally in your browser (no data is sent to our servers)
              </span>
            </div>
          </div>

          {/* Example Files Section */}
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-600 block mb-2">Example Files</span>

            <div className="flex flex-col gap-2">
              {/* File 1: Authentic */}
              <div
                onClick={() => handleSelectSample("VALID")}
                className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                  activeFileSample === "VALID"
                    ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                    : "bg-slate-50/60 hover:bg-slate-100 border-slate-200/80"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 font-mono truncate">
                      dispatch_manifest_4409.txt
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">0x0270...cc16</span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <span>+</span>
                  <span>MATCHES ON-CHAIN RECORD</span>
                </div>
              </div>

              {/* File 2: Tampered */}
              <div
                onClick={() => handleSelectSample("TAMPERED")}
                className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                  activeFileSample === "TAMPERED"
                    ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-300"
                    : "bg-slate-50/60 hover:bg-slate-100 border-slate-200/80"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 font-mono truncate">
                      tampered_manifest.txt
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">0x91ac...7e3f</span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <span>+</span>
                  <span>HASH MISMATCH / UNVERIFIED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Live Computation Result */}
          {computedHash && (
            <div
              className={`mt-4 p-3.5 rounded-xl border animate-in fade-in duration-200 ${
                isMatch
                  ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                  : "bg-rose-50/90 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  {isMatch ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Cryptographic Match Confirmed</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} className="text-rose-600" />
                      <span>Integrity Mismatch (Tampering Detected)</span>
                    </>
                  )}
                </div>

                <button
                  onClick={handleCopyHash}
                  className="text-[10px] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy Hash"}</span>
                </button>
              </div>

              <div className="mt-2 text-[11px] font-mono break-all opacity-85 bg-white/70 p-2 rounded-lg border border-black/5">
                {computedHash}
              </div>

              {onUseHashInTransaction && (
                <button
                  onClick={() => onUseHashInTransaction(computedHash)}
                  className="mt-2 text-[11px] font-semibold text-teal-800 hover:underline flex items-center gap-1"
                >
                  Use this hash in transaction center →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Humility in Cryptography Callout Box */}
        <div className="bg-[#f0f9ff] border border-sky-200/90 rounded-xl p-3 mt-4 flex items-start gap-2.5 text-sky-900 text-[11px] leading-relaxed">
          <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-sky-950">Humility in Cryptography:</strong> A hash
            match proves data integrity, not physical delivery.
          </div>
        </div>
      </div>
    </div>
  );
};
