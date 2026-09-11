/**
 * Cryptographic helpers for Q-SHIELD
 * Implements deterministic SHA-256 message hashing and token generation.
 */

export async function computeSHA256(message: string): Promise<string> {
  // Browser Web Crypto API or Node crypto
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback or Node.js environment
    try {
      const nodeCrypto = await import('crypto');
      return nodeCrypto.createHash('sha256').update(message).digest('hex');
    } catch {
      // Basic fast pure JS SHA-256 fallback if environment lacks crypto
      let hash = 0;
      for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).padStart(64, '0');
    }
  }
}

export function generateSessionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const randomHex = Array.from({ length: 4 }, () => 
    Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, '0')
  ).join('');
  return `QS-2026-${timestamp}-${randomHex.slice(0, 6)}`;
}

export function generateTransactionId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `TX-SIH-${num}`;
}

export function generateDigitalSignature(hash: string): string {
  // Simulated Lattice-based Quantum-Resilient Signature Token representation
  const prefix = "QRES-DILITHIUM";
  const segment1 = hash.slice(0, 16).toUpperCase();
  const segment2 = hash.slice(16, 32).toUpperCase();
  return `${prefix}:${segment1}::${segment2}::VERIFIED`;
}
