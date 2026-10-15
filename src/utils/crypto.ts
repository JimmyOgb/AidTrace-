/**
 * Client-Side Evidence Integrity & Hashing Utilities
 * Uses standard W3C Web Cryptography API (crypto.subtle).
 * 
 * GUARANTEE:
 * Files and rationale strings are processed strictly in-memory.
 * No private documents, beneficiary personal records, or confidential attachments
 * are transmitted across the network during hash computation.
 */

export async function computeFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

export async function computeTextSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

export function truncateHash(hash: string, chars = 6): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function isValidSha256Hex(hash: string): boolean {
  if (!hash) return false;
  const clean = hash.startsWith("0x") ? hash.slice(2) : hash;
  return /^[0-9a-fA-F]{64}$/.test(clean);
}
