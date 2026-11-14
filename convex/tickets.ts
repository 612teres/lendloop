import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

/**
 * Create a new support ticket / complaint.
 */
export const createTicket = mutation({
  args: {
    subject: v.string(),
    category: v.union(
      v.literal("tool_issue"),
      v.literal("user_dispute"),
      v.literal("platform_bug"),
      v.literal("other")
    ),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);

    if (!args.subject.trim()) throw new Error("Subject is required");
    if (!args.description.trim()) throw new Error("Description is required");

    const now = Date.now();
    return await ctx.db.insert("supportTickets", {
      userId: caller._id,
      userEmail: caller.email,
      userName: caller.name,
      subject: args.subject.trim(),
      category: args.category,
      description: args.description.trim(),
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Fetch all tickets submitted by the current authenticated user.
 */
export const getMyTickets = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("supportTickets")
      .withIndex("by_userId", (q) => q.eq("userId", caller._id))
      .order("desc")
      .collect();
  },
});

/**
 * Admin-only: Fetch all tickets across the platform.
 */
export const getAllTicketsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getAuthenticatedUser(ctx);
    if (caller.role !== "admin") {
      throw new Error("Forbidden: Administrator access required");
    }

    return await ctx.db
      .query("supportTickets")
      .order("desc")
      .collect();
  },
});

/**
 * Admin-only: Update ticket status and resolution notes.
 */
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_review"),
      v.literal("resolved")
    ),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    if (caller.role !== "admin") {
      throw new Error("Forbidden: Administrator access required");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    await ctx.db.patch(args.ticketId, {
      status: args.status,
      adminNote: args.adminNote,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
