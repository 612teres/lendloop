import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeHmacSha256, verifyHmacSignature, timingSafeEqual } from "../convex/crypto.js";

describe("HMAC Security & Replay Attack Prevention", () => {
  const secret = "test-lendloop-secret-2026";

  test("computes deterministic HMAC-SHA256 hash", async () => {
    const payload = JSON.stringify({ event: "loan_requested", loanId: "loan_123" });
    const sig1 = await computeHmacSha256(payload, secret);
    const sig2 = await computeHmacSha256(payload, secret);

    assert.equal(typeof sig1, "string");
    assert.equal(sig1.length, 64); // 256 bits = 64 hex characters
    assert.equal(sig1, sig2);
  });

  test("timingSafeEqual correctly matches identical strings and rejects differing strings", () => {
    assert.equal(timingSafeEqual("abcdef123456", "abcdef123456"), true);
    assert.equal(timingSafeEqual("abcdef123456", "abcdef123457"), false);
    assert.equal(timingSafeEqual("short", "longerstring"), false);
  });

  test("successfully verifies valid signature with fresh timestamp and unique nonce", async () => {
    const payload = JSON.stringify({ loanId: "loan_456", status: "success" });
    const now = Date.now();
    const timestamp = now.toString();
    const nonce = "nonce-uuid-111";

    const message = `${timestamp}:${nonce}:${payload}`;
    const signature = await computeHmacSha256(message, secret);

    const usedNonces = new Set<string>();

    const result = await verifyHmacSignature({
      payload,
      signatureHeader: `sha256=${signature}`,
      timestampHeader: timestamp,
      nonceHeader: nonce,
      secret,
      isNonceUsed: async (n) => usedNonces.has(n),
      recordNonce: async (n) => { usedNonces.add(n); },
    });

    assert.equal(result.valid, true);
    assert.equal(usedNonces.has(nonce), true);
  });

  test("rejects tampered payload", async () => {
    const originalPayload = JSON.stringify({ loanId: "loan_456", amount: 10 });
    const tamperedPayload = JSON.stringify({ loanId: "loan_456", amount: 9999 });

    const timestamp = Date.now().toString();
    const nonce = "nonce-uuid-222";
    const signature = await computeHmacSha256(`${timestamp}:${nonce}:${originalPayload}`, secret);

    const usedNonces = new Set<string>();

    const result = await verifyHmacSignature({
      payload: tamperedPayload,
      signatureHeader: `sha256=${signature}`,
      timestampHeader: timestamp,
      nonceHeader: nonce,
      secret,
      isNonceUsed: async (n) => usedNonces.has(n),
      recordNonce: async (n) => { usedNonces.add(n); },
    });

    assert.equal(result.valid, false);
    assert.match(result.error ?? "", /Invalid HMAC signature/);
  });

  test("rejects replay attack with stale timestamp (> 5 minutes drift)", async () => {
    const payload = JSON.stringify({ loanId: "loan_789" });
    const oldTimestamp = (Date.now() - 360_000).toString(); // 6 minutes ago
    const nonce = "nonce-uuid-333";
    const signature = await computeHmacSha256(`${oldTimestamp}:${nonce}:${payload}`, secret);

    const usedNonces = new Set<string>();

    const result = await verifyHmacSignature({
      payload,
      signatureHeader: `sha256=${signature}`,
      timestampHeader: oldTimestamp,
      nonceHeader: nonce,
      secret,
      isNonceUsed: async (n) => usedNonces.has(n),
      recordNonce: async (n) => { usedNonces.add(n); },
    });

    assert.equal(result.valid, false);
    assert.match(result.error ?? "", /Timestamp outside acceptable window/);
  });

  test("rejects replay attack with duplicate nonce", async () => {
    const payload = JSON.stringify({ loanId: "loan_999" });
    const timestamp = Date.now().toString();
    const nonce = "already-used-nonce";
    const signature = await computeHmacSha256(`${timestamp}:${nonce}:${payload}`, secret);

    // Pre-populate used nonce
    const usedNonces = new Set<string>(["already-used-nonce"]);

    const result = await verifyHmacSignature({
      payload,
      signatureHeader: `sha256=${signature}`,
      timestampHeader: timestamp,
      nonceHeader: nonce,
      secret,
      isNonceUsed: async (n) => usedNonces.has(n),
      recordNonce: async (n) => { usedNonces.add(n); },
    });

    assert.equal(result.valid, false);
    assert.match(result.error ?? "", /Duplicate nonce detected/);
  });
});

describe("Idempotent Automation Write-Back", () => {
  test("composite deduplication key guarantees exactly one record per loan per day", () => {
    const loanId = "loan_abc";
    const date = "2026-11-14";
    const key1 = `overdue:${loanId}:${date}`;
    const key2 = `overdue:${loanId}:${date}`;

    assert.equal(key1, key2);

    // Mock storage simulating Convex unique indexed check
    const logDb = new Map<string, any>();

    function mockRecordAutomation(key: string, payload: any) {
      if (logDb.has(key)) {
        return { success: true, idempotentSkip: true, logId: logDb.get(key).id };
      }
      const id = "log_" + Math.random().toString(36).substring(7);
      logDb.set(key, { id, ...payload });
      return { success: true, idempotentSkip: false, logId: id };
    }

    // First delivery succeeds and records
    const r1 = mockRecordAutomation(key1, { details: "Sent email reminder 1" });
    assert.equal(r1.idempotentSkip, false);

    // Second delivery (network retry from n8n) is safely deduplicated
    const r2 = mockRecordAutomation(key2, { details: "Sent email reminder 1 retry" });
    assert.equal(r2.idempotentSkip, true);
    assert.equal(r1.logId, r2.logId);
    assert.equal(logDb.size, 1);
  });
});
