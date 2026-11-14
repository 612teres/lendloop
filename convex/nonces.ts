import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const isNonceUsed = internalQuery({
  args: { nonce: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookNonces")
      .withIndex("by_nonce", (q) => q.eq("nonce", args.nonce))
      .unique();
    return !!existing;
  },
});

export const recordNonce = internalMutation({
  args: { nonce: v.string(), timestamp: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhookNonces", {
      nonce: args.nonce,
      timestamp: args.timestamp,
    });
  },
});
