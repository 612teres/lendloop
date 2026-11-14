import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { computeHmacSha256 } from "./crypto";
import { v } from "convex/values";

/**
 * Resilient Outbox Dispatcher Action:
 * Fetches pending automation events, signs the payload with HMAC + timestamp + nonce,
 * and dispatches to n8n webhook.
 */
export const dispatchPendingOutboxEvents = internalAction({
  args: {},
  handler: async (ctx) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.WEBHOOK_SECRET || "lendloop-shared-hmac-secret-key-prod";

    if (!webhookUrl) {
      console.warn("N8N_WEBHOOK_URL is not configured; skipping outbox dispatch");
      return { dispatched: 0, reason: "missing_webhook_url" };
    }

    const pendingEvents = await ctx.runQuery(
      internal.automations.getPendingOutboxEvents,
      { limit: 10 }
    );

    let successCount = 0;

    for (const event of pendingEvents) {
      try {
        await ctx.runMutation(internal.automations.updateOutboxEventStatus, {
          eventId: event._id,
          status: "processing",
        });

        const timestamp = Date.now().toString();
        const nonce = crypto.randomUUID();
        const payloadString = event.payload;

        // Message to sign incorporates timestamp and nonce to bind headers
        const messageToSign = `${timestamp}:${nonce}:${payloadString}`;
        const signature = await computeHmacSha256(messageToSign, webhookSecret);

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-LendLoop-Signature": `sha256=${signature}`,
            "X-LendLoop-Timestamp": timestamp,
            "X-LendLoop-Nonce": nonce,
            "X-LendLoop-Event": event.eventType,
          },
          body: payloadString,
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          throw new Error(`n8n responded with HTTP status ${response.status}: ${await response.text()}`);
        }

        // Successfully dispatched!
        await ctx.runMutation(internal.automations.updateOutboxEventStatus, {
          eventId: event._id,
          status: "dispatched",
        });

        // Record automation log
        await ctx.runMutation(internal.automations.recordAutomationLog, {
          loanId: event.loanId,
          workflowType: "request_notification",
          status: "success",
          deduplicationKey: `outbox:${event._id}:dispatched`,
          details: `Dispatched ${event.eventType} notification to n8n`,
        });

        successCount++;
      } catch (err: any) {
        console.error(`Failed to dispatch outbox event ${event._id}:`, err);

        const isFatal = event.retryCount >= 4;
        await ctx.runMutation(internal.automations.updateOutboxEventStatus, {
          eventId: event._id,
          status: isFatal ? "failed" : "pending", // allow retry unless max retries exceeded
          error: err.message ?? "Unknown network error",
        });
      }
    }

    return { dispatched: successCount, total: pendingEvents.length };
  },
});
