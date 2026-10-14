/**
 * Client-Side Evidence Integrity & Hashing Utilities
 * Uses standard W3C Web Cryptography API (crypto.subtle).
 * 
 * GUARANTEE:
 * Files are read strictly in-memory inside the browser.
 * No file bytes, personal records, or confidential attachments
 * are transmitted across the network during hash computation.
 */

export async function computeFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

export function truncateHash(hash: string, chars = 6): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
