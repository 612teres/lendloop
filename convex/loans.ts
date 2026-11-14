import { v } from "convex/values";
import { mutation, query, internalQuery, MutationCtx } from "./_generated/server";
import { getAuthenticatedUser } from "./users";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Helper to check whether two date ranges [s1, e1] and [s2, e2] overlap.
 */
function datesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return !(e1 < s2 || s1 > e2);
}

/**
 * Enforces business invariant: No overlapping approved loans for the same tool.
 */
async function assertNoApprovedOverlap(
  ctx: MutationCtx,
  toolId: Id<"tools">,
  startDate: string,
  endDate: string,
  excludeLoanId?: Id<"loans">
) {
  const approvedLoans = await ctx.db
    .query("loans")
    .withIndex("by_tool_and_status", (q) =>
      q.eq("toolId", toolId).eq("status", "approved")
    )
    .collect();

  for (const existing of approvedLoans) {
    if (excludeLoanId && existing._id === excludeLoanId) continue;
    if (datesOverlap(startDate, endDate, existing.startDate, existing.endDate)) {
      throw new Error(
        `Tool is already approved for a loan between ${existing.startDate} and ${existing.endDate}`
      );
    }
  }
}

/**
 * Authenticated Mutation: Request to borrow a tool for a date range.
 * Atomically commits loan record and creates an Outbox event for n8n notification.
 */
export const createRequest = mutation({
  args: {
    toolId: v.id("tools"),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool || tool.isArchived) {
      throw new Error("Tool not found or no longer available");
    }

    // Business Invariant: User cannot borrow their own tool
    if (tool.ownerId === caller._id) {
      throw new Error("Forbidden: You cannot borrow your own tool");
    }

    // Validate date order
    if (args.startDate > args.endDate) {
      throw new Error("Start date must be on or before end date");
    }

    const today = new Date().toISOString().split("T")[0];
    if (args.endDate < today) {
      throw new Error("Loan dates cannot be entirely in the past");
    }

    // Check against overlapping approved loans
    await assertNoApprovedOverlap(ctx, tool._id, args.startDate, args.endDate);

    const lender = await ctx.db.get(tool.ownerId);
    if (!lender) {
      throw new Error("Lender record not found");
    }

    const now = Date.now();

    // 1. Insert loan record
    const loanId = await ctx.db.insert("loans", {
      toolId: tool._id,
      borrowerId: caller._id,
      lenderId: lender._id,
      startDate: args.startDate,
      endDate: args.endDate,
      notes: args.notes?.trim() || undefined,
      status: "pending",
      toolNameSnapshot: tool.name,
      borrowerNameSnapshot: caller.name,
      lenderNameSnapshot: lender.name,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Transactional Outbox: Atomically commit notification event for n8n
    // Data minimization: only necessary fields (tool, borrower name, dates, lender recipient)
    const eventPayload = {
      event: "loan_requested",
      loanId,
      toolId: tool._id,
      toolName: tool.name,
      borrowerName: caller.name,
      lenderName: lender.name,
      recipientEmail: lender.email,
      startDate: args.startDate,
      endDate: args.endDate,
      notes: args.notes?.trim() || "",
      timestamp: now,
    };

    await ctx.db.insert("automationEvents", {
      eventId: crypto.randomUUID(),
      eventType: "loan_requested",
      loanId,
      payload: JSON.stringify(eventPayload),
      status: "pending",
      retryCount: 0,
      createdAt: now,
    });

    return loanId;
  },
});

/**
 * Authenticated Mutation: Tool owner approves a borrow request.
 * Atomically locks tool for dates, updates status, and inserts outbox event.
 */
export const approveRequest = mutation({
  args: {
    loanId: v.id("loans"),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    const loan = await ctx.db.get(args.loanId);

    if (!loan) throw new Error("Loan request not found");
    if (loan.lenderId !== caller._id) {
      throw new Error("Forbidden: Only the tool owner can approve requests");
    }
    if (loan.status !== "pending") {
      throw new Error(`Cannot approve request in '${loan.status}' status`);
    }

    // Re-check overlap before approving (in case another loan was approved meanwhile)
    await assertNoApprovedOverlap(
      ctx,
      loan.toolId,
      loan.startDate,
      loan.endDate,
      loan._id
    );

    const borrower = await ctx.db.get(loan.borrowerId);
    const now = Date.now();

    // 1. Update loan to approved
    await ctx.db.patch(loan._id, {
      status: "approved",
      updatedAt: now,
    });

    // 2. Outbox event to notify borrower
    if (borrower) {
      const eventPayload = {
        event: "loan_approved",
        loanId: loan._id,
        toolName: loan.toolNameSnapshot,
        borrowerName: borrower.name,
        lenderName: caller.name,
        recipientEmail: borrower.email,
        startDate: loan.startDate,
        endDate: loan.endDate,
        timestamp: now,
      };

      await ctx.db.insert("automationEvents", {
        eventId: crypto.randomUUID(),
        eventType: "loan_approved",
        loanId: loan._id,
        payload: JSON.stringify(eventPayload),
        status: "pending",
        retryCount: 0,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Authenticated Mutation: Tool owner declines a borrow request.
 */
export const declineRequest = mutation({
  args: {
    loanId: v.id("loans"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    const loan = await ctx.db.get(args.loanId);

    if (!loan) throw new Error("Loan request not found");
    if (loan.lenderId !== caller._id) {
      throw new Error("Forbidden: Only the tool owner can decline requests");
    }
    if (loan.status !== "pending") {
      throw new Error(`Cannot decline request in '${loan.status}' status`);
    }

    const borrower = await ctx.db.get(loan.borrowerId);
    const now = Date.now();

    await ctx.db.patch(loan._id, {
      status: "declined",
      updatedAt: now,
    });

    if (borrower) {
      const eventPayload = {
        event: "loan_declined",
        loanId: loan._id,
        toolName: loan.toolNameSnapshot,
        borrowerName: borrower.name,
        lenderName: caller.name,
        recipientEmail: borrower.email,
        reason: args.reason?.trim() || "Owner declined the request",
        timestamp: now,
      };

      await ctx.db.insert("automationEvents", {
        eventId: crypto.randomUUID(),
        eventType: "loan_declined",
        loanId: loan._id,
        payload: JSON.stringify(eventPayload),
        status: "pending",
        retryCount: 0,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Authenticated Mutation: Borrower or owner cancels a pending request.
 */
export const cancelRequest = mutation({
  args: {
    loanId: v.id("loans"),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    const loan = await ctx.db.get(args.loanId);

    if (!loan) throw new Error("Loan request not found");
    const isBorrower = loan.borrowerId === caller._id;
    const isLender = loan.lenderId === caller._id;

    if (!isBorrower && !isLender) {
      throw new Error("Forbidden: Only the borrower or lender can cancel this request");
    }
    if (loan.status !== "pending") {
      throw new Error("Only pending requests can be cancelled");
    }

    await ctx.db.patch(loan._id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Authenticated Mutation: Only the tool owner (lender) confirms the tool has been returned.
 */
export const confirmReturn = mutation({
  args: {
    loanId: v.id("loans"),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    const loan = await ctx.db.get(args.loanId);

    if (!loan) throw new Error("Loan not found");
    if (loan.lenderId !== caller._id) {
      throw new Error("Forbidden: Only the tool owner can confirm return");
    }
    if (loan.status !== "approved") {
      throw new Error(`Cannot return loan in '${loan.status}' status`);
    }

    const borrower = await ctx.db.get(loan.borrowerId);
    const now = Date.now();

    await ctx.db.patch(loan._id, {
      status: "returned",
      updatedAt: now,
    });

    if (borrower) {
      const eventPayload = {
        event: "loan_returned",
        loanId: loan._id,
        toolName: loan.toolNameSnapshot,
        borrowerName: borrower.name,
        lenderName: caller.name,
        recipientEmail: borrower.email,
        timestamp: now,
      };

      await ctx.db.insert("automationEvents", {
        eventId: crypto.randomUUID(),
        eventType: "loan_returned",
        loanId: loan._id,
        payload: JSON.stringify(eventPayload),
        status: "pending",
        retryCount: 0,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Authenticated Query: "My requests" (borrow requests initiated by caller).
 */
export const getMyBorrowRequests = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getAuthenticatedUser(ctx);

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_borrowerId", (q) => q.eq("borrowerId", caller._id))
      .order("desc")
      .collect();

    return await Promise.all(
      loans.map(async (loan) => {
        const lender = await ctx.db.get(loan.lenderId);
        const tool = await ctx.db.get(loan.toolId);

        // Fetch recent automation activity (e.g. "Reminder sent 2 days ago")
        const recentLog = await ctx.db
          .query("automationLogs")
          .withIndex("by_loanId", (q) => q.eq("loanId", loan._id))
          .order("desc")
          .first();

        return {
          ...loan,
          toolName: tool?.name ?? loan.toolNameSnapshot,
          category: tool?.category ?? "General",
          lenderName: lender?.name ?? loan.lenderNameSnapshot,
          isLenderTrusted: !!lender?.isTrustedLender,
          recentAutomation: recentLog
            ? {
                workflowType: recentLog.workflowType,
                details: recentLog.details,
                timestamp: recentLog.timestamp,
              }
            : null,
        };
      })
    );
  },
});

/**
 * Authenticated Query: "Incoming requests" (requests submitted to borrow caller's tools).
 */
export const getMyIncomingRequests = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getAuthenticatedUser(ctx);

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_lenderId", (q) => q.eq("lenderId", caller._id))
      .order("desc")
      .collect();

    return await Promise.all(
      loans.map(async (loan) => {
        const borrower = await ctx.db.get(loan.borrowerId);
        const tool = await ctx.db.get(loan.toolId);

        const recentLog = await ctx.db
          .query("automationLogs")
          .withIndex("by_loanId", (q) => q.eq("loanId", loan._id))
          .order("desc")
          .first();

        return {
          ...loan,
          toolName: tool?.name ?? loan.toolNameSnapshot,
          category: tool?.category ?? "General",
          borrowerName: borrower?.name ?? loan.borrowerNameSnapshot,
          recentAutomation: recentLog
            ? {
                workflowType: recentLog.workflowType,
                details: recentLog.details,
                timestamp: recentLog.timestamp,
              }
            : null,
        };
      })
    );
  },
});

/**
 * Admin-only Query: View all loans and history across the entire neighborhood.
 */
export const getAllLoansAdmin = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getAuthenticatedUser(ctx);
    if (caller.role !== "admin") {
      throw new Error("Forbidden: Admin access required");
    }

    const loans = await ctx.db.query("loans").order("desc").collect();

    return await Promise.all(
      loans.map(async (loan) => {
        const borrower = await ctx.db.get(loan.borrowerId);
        const lender = await ctx.db.get(loan.lenderId);
        const tool = await ctx.db.get(loan.toolId);

        const recentLog = await ctx.db
          .query("automationLogs")
          .withIndex("by_loanId", (q) => q.eq("loanId", loan._id))
          .order("desc")
          .first();

        return {
          ...loan,
          toolName: tool?.name ?? loan.toolNameSnapshot,
          borrowerName: borrower?.name ?? loan.borrowerNameSnapshot,
          borrowerEmail: borrower?.email,
          lenderName: lender?.name ?? loan.lenderNameSnapshot,
          lenderEmail: lender?.email,
          recentAutomation: recentLog
            ? {
                workflowType: recentLog.workflowType,
                details: recentLog.details,
                timestamp: recentLog.timestamp,
              }
            : null,
        };
      })
    );
  },
});

/**
 * Internal Query: Fetches overdue approved loans for the n8n daily reminder cron.
 * Minimizes returned data fields (security & data minimization).
 */
export const getOverdueLoansInternal = internalQuery({
  args: {
    asOfDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // 1. Query approved loans
    const approvedLoans = await ctx.db
      .query("loans")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    // 2. Filter loans where endDate < asOfDate (overdue)
    const overdueLoans = [];

    for (const loan of approvedLoans) {
      if (loan.endDate < args.asOfDate) {
        const borrower = await ctx.db.get(loan.borrowerId);
        const lender = await ctx.db.get(loan.lenderId);

        // Compute days overdue
        const dueTime = new Date(loan.endDate).getTime();
        const asOfTime = new Date(args.asOfDate).getTime();
        const daysOverdue = Math.max(1, Math.floor((asOfTime - dueTime) / (1000 * 60 * 60 * 24)));

        // Data minimization: return only necessary fields
        overdueLoans.push({
          loanId: loan._id,
          toolName: loan.toolNameSnapshot,
          startDate: loan.startDate,
          endDate: loan.endDate,
          daysOverdue,
          borrowerName: borrower?.name ?? loan.borrowerNameSnapshot,
          borrowerEmail: borrower?.email ?? "",
          lenderName: lender?.name ?? loan.lenderNameSnapshot,
          reminderCount: loan.reminderCount ?? 0,
          lastReminderSentAt: loan.lastReminderSentAt,
        });
      }
    }

    return overdueLoans;
  },
});

