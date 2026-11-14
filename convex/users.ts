import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Server-side helper to get authenticated user document from Clerk identity.
 */
export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User record not found. Please sync user first.");
  }

  return user;
}

/**
 * Safely syncs or retrieves the authenticated user without allowing client-controlled role assignment.
 * Role is derived server-side via trusted configuration (ADMIN_EMAILS or initial bootstrap).
 */
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: No Clerk identity found");
    }

    const clerkId = identity.subject;
    const email = identity.email ?? "";
    const name = identity.name ?? identity.nickname ?? email.split("@")[0] ?? "Neighbor";

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      // Update mutable profile info if changed, but NEVER modify role or trusted status
      if (existingUser.name !== name || existingUser.email !== email) {
        await ctx.db.patch(existingUser._id, { name, email });
      }
      return existingUser;
    }

    // Role assignment is strictly server-controlled:
    // 1. Configured via ADMIN_EMAILS environment variable
    // 2. Or bootstrap: if this is the very first user in the system
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isExplicitAdmin = email && adminEmails.includes(email.toLowerCase());
    const totalUsers = await ctx.db.query("users").take(1);
    const isFirstUserBootstrap = totalUsers.length === 0;

    const role: "user" | "admin" = isExplicitAdmin || isFirstUserBootstrap ? "admin" : "user";

    const newUserId = await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      role,
      isTrustedLender: role === "admin", // Admin is trusted by default
      createdAt: Date.now(),
    });

    return await ctx.db.get(newUserId);
  },
});

/**
 * Gets current authenticated user profile and permissions.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

/**
 * Admin-only: Toggle trusted lender status for a community member.
 */
export const setTrustedLender = mutation({
  args: {
    userId: v.id("users"),
    isTrusted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    if (caller.role !== "admin") {
      throw new Error("Forbidden: Only administrators can grant or revoke Trusted Lender status");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    await ctx.db.patch(args.userId, {
      isTrustedLender: args.isTrusted,
    });

    return { success: true, userId: args.userId, isTrustedLender: args.isTrusted };
  },
});

/**
 * Admin-only: View all users in the neighborhood.
 */
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getAuthenticatedUser(ctx);
    if (caller.role !== "admin") {
      throw new Error("Forbidden: Administrator access required");
    }

    return await ctx.db.query("users").order("desc").collect();
  },
});
