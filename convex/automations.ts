import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Idempotent Mutation: Records an automation log (e.g. from n8n write-back or outbox dispatcher).
 * Uses indexed `deduplicationKey` check to ensure retries never duplicate reminders or records.
 */
export const recordAutomationLog = mutation({
  args: {
    loanId: v.id("loans"),
    workflowType: v.union(
      v.literal("request_notification"),
      v.literal("overdue_reminder")
    ),
    status: v.union(v.literal("success"), v.literal("failed")),
    deduplicationKey: v.string(), // E.g. "overdue:loan_id:2026-11-14"
    details: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Transactional Idempotency Check: look up existing log by deduplication key
    const existingLog = await ctx.db
      .query("automationLogs")
      .withIndex("by_deduplicationKey", (q) =>
        q.eq("deduplicationKey", args.deduplicationKey)
      )
      .unique();

    if (existingLog) {
      // Idempotent no-op: already processed successfully
      return {
        success: true,
        idempotentSkip: true,
        logId: existingLog._id,
        message: "Log already recorded for this key",
      };
    }

    const now = Date.now();

    // 2. Insert new audit log entry
    const logId = await ctx.db.insert("automationLogs", {
      loanId: args.loanId,
      workflowType: args.workflowType,
      status: args.status,
      deduplicationKey: args.deduplicationKey,
      details: args.details,
      timestamp: now,
    });

    // 3. If this was an overdue reminder, update loan's metadata
    if (args.workflowType === "overdue_reminder" && args.status === "success") {
      const loan = await ctx.db.get(args.loanId);
      if (loan) {
        await ctx.db.patch(loan._id, {
          lastReminderSentAt: now,
          reminderCount: (loan.reminderCount ?? 0) + 1,
          updatedAt: now,
        });
      }
    }

    return {
      success: true,
      idempotentSkip: false,
      logId,
      message: "Log recorded successfully",
    };
  },
});

/**
 * Internal Query: Fetch pending events from the Outbox for dispatching.
 */
export const getPendingOutboxEvents = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("automationEvents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(limit);
  },
});

/**
 * Internal Mutation: Update outbox event status after dispatch attempt.
 */
export const updateOutboxEventStatus = internalMutation({
  args: {
    eventId: v.id("automationEvents"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("dispatched"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return;

    await ctx.db.patch(args.eventId, {
      status: args.status,
      lastError: args.error,
      retryCount: args.status === "failed" ? event.retryCount + 1 : event.retryCount,
    });
  },
});

/**
 * Query: Fetch automation activity timeline for a loan.
 */
export const getLoanAutomationHistory = query({
  args: {
    loanId: v.id("loans"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("automationLogs")
      .withIndex("by_loanId", (q) => q.eq("loanId", args.loanId))
      .order("desc")
      .collect();
  },
});
