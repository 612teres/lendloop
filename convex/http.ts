import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { verifyHmacSignature } from "./crypto";

const http = httpRouter();

/**
 * Helper to authenticate HTTP requests from n8n using HMAC-SHA256, timestamp, and nonce.
 */
async function authenticateRequest(
  ctx: any,
  request: Request,
  bodyString: string
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.WEBHOOK_SECRET || "lendloop-shared-hmac-secret-key-prod";

  const signature = request.headers.get("X-LendLoop-Signature");
  const timestamp = request.headers.get("X-LendLoop-Timestamp");
  const nonce = request.headers.get("X-LendLoop-Nonce");

  const verification = await verifyHmacSignature({
    payload: bodyString,
    signatureHeader: signature,
    timestampHeader: timestamp,
    nonceHeader: nonce,
    secret,
    isNonceUsed: async (n) => {
      return await ctx.runQuery(internal.nonces.isNonceUsed, { nonce: n });
    },
    recordNonce: async (n, ts) => {
      await ctx.runMutation(internal.nonces.recordNonce, { nonce: n, timestamp: ts });
    },
  });

  return { ok: verification.valid, error: verification.error };
}

/**
 * GET /api/overdue-loans
 * Polled by n8n daily cron workflow to fetch overdue loans with minimal fields.
 */
http.route({
  path: "/api/overdue-loans",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Authenticate HMAC signature
    const auth = await authenticateRequest(ctx, request, "");
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const overdueLoans = await ctx.runQuery(internal.loans.getOverdueLoansInternal, {
      asOfDate: today,
    });

    return new Response(JSON.stringify({ asOf: today, count: overdueLoans.length, overdueLoans }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

/**
 * POST /api/loan-reminders
 * Called by n8n overdue reminder workflow to record reminder status back into Convex.
 * Idempotency is enforced through stable composite deduplication keys.
 */
http.route({
  path: "/api/loan-reminders",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();

    // Authenticate HMAC signature
    const auth = await authenticateRequest(ctx, request, rawBody);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { loanId, status = "success", reminderDate, details } = parsed;
    if (!loanId) {
      return new Response(JSON.stringify({ error: "Missing required loanId field" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dateKey = reminderDate || new Date().toISOString().split("T")[0];
    // Stable idempotency key: exactly one reminder per loan per calendar day
    const deduplicationKey = `overdue:${loanId}:${dateKey}`;

    const result = await ctx.runMutation(api.automations.recordAutomationLog, {
      loanId,
      workflowType: "overdue_reminder",
      status: status === "failed" ? "failed" : "success",
      deduplicationKey,
      details: details || `Overdue reminder dispatched by n8n workflow for date ${dateKey}`,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
