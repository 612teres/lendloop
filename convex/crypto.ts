/**
 * Cryptographic helpers for HMAC-SHA256 payload signing and verification
 * Built with standard Web Crypto API (crypto.subtle) compatible with Convex runtime.
 */

export async function computeHmacSha256(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verifies HMAC signature, timestamp freshness, and nonce uniqueness.
 * Replay protection window: 5 minutes (300,000 ms).
 */
export async function verifyHmacSignature(params: {
  payload: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
  nonceHeader: string | null;
  secret: string;
  isNonceUsed: (nonce: string) => Promise<boolean>;
  recordNonce: (nonce: string, timestamp: number) => Promise<void>;
  maxAgeMs?: number;
}): Promise<{ valid: boolean; error?: string }> {
  const {
    payload,
    signatureHeader,
    timestampHeader,
    nonceHeader,
    secret,
    isNonceUsed,
    recordNonce,
    maxAgeMs = 5 * 60 * 1000, // 5 minutes
  } = params;

  if (!signatureHeader) {
    return { valid: false, error: "Missing signature header" };
  }
  if (!timestampHeader) {
    return { valid: false, error: "Missing timestamp header" };
  }
  if (!nonceHeader) {
    return { valid: false, error: "Missing nonce header" };
  }

  // 1. Verify Timestamp Freshness (prevent replay of old valid requests)
  const requestTime = parseInt(timestampHeader, 10);
  if (isNaN(requestTime)) {
    return { valid: false, error: "Invalid timestamp format" };
  }

  const now = Date.now();
  if (Math.abs(now - requestTime) > maxAgeMs) {
    return {
      valid: false,
      error: `Timestamp outside acceptable window (${Math.round(Math.abs(now - requestTime) / 1000)}s drift)`,
    };
  }

  // 2. Verify Nonce Uniqueness (prevent replay within acceptable window)
  const seen = await isNonceUsed(nonceHeader);
  if (seen) {
    return { valid: false, error: "Duplicate nonce detected: replay attack prevented" };
  }

  // 3. Verify HMAC Signature
  // Signed content incorporates nonce and timestamp to bind the message
  const messageToSign = `${timestampHeader}:${nonceHeader}:${payload}`;
  const expectedSignature = await computeHmacSha256(messageToSign, secret);

  const cleanSignature = signatureHeader.replace(/^sha256=/, "");
  if (!timingSafeEqual(cleanSignature, expectedSignature)) {
    return { valid: false, error: "Invalid HMAC signature" };
  }

  // 4. Record Nonce
  await recordNonce(nonceHeader, requestTime);

  return { valid: true };
}
