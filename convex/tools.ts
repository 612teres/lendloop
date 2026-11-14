import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";
import { Doc, Id } from "./_generated/dataModel";
import { TOOL_CATEGORIES, TOOL_CONDITIONS } from "../lib/constants";
export { TOOL_CATEGORIES, TOOL_CONDITIONS };

/**
 * Public Query: Returns read-only available tools with ONLY name and category.
 * Strictest data-minimization: zero owner details, contact info, or timestamps.
 */
export const getPublicAvailableTools = query({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch unarchived tools
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_archived", (q) => q.eq("isArchived", false))
      .collect();

    const today = new Date().toISOString().split("T")[0];

    // 2. Filter out tools currently checked out under approved loans
    const availableTools = [];
    for (const tool of tools) {
      const activeApprovedLoan = await ctx.db
        .query("loans")
        .withIndex("by_tool_and_status", (q) =>
          q.eq("toolId", tool._id).eq("status", "approved")
        )
        .filter((q) =>
          q.and(
            q.lte(q.field("startDate"), today),
            q.gte(q.field("endDate"), today)
          )
        )
        .first();

      if (!activeApprovedLoan) {
        // Resolve storage image URLs for public view without exposing owner details
        const imageUrls = tool.images
          ? (
              await Promise.all(
                tool.images.map(async (storageId) => await ctx.storage.getUrl(storageId))
              )
            ).filter((url): url is string => Boolean(url))
          : [];

        // Return strictly data-minimized fields (zero owner details, contact info, or emails)
        availableTools.push({
          _id: tool._id,
          name: tool.name,
          category: tool.category,
          condition: tool.condition,
          description: tool.description,
          images: imageUrls,
        });
      }
    }

    return availableTools;
  },
});

/**
 * Authenticated Query: Returns all listings with derived availability, owner badge,
 * and trusted lender status. Supports filtering by category and search term.
 */
export const getAllTools = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authenticate caller
    await getAuthenticatedUser(ctx);

    let tools = await ctx.db
      .query("tools")
      .withIndex("by_archived", (q) => q.eq("isArchived", false))
      .collect();

    if (args.category && args.category !== "All") {
      tools = tools.filter((t) => t.category === args.category);
    }

    if (args.search && args.search.trim()) {
      const q = args.search.trim().toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // Enrich with owner trust badge and derived real-time availability
    const enrichedTools = await Promise.all(
      tools.map(async (tool) => {
        const owner = await ctx.db.get(tool.ownerId);

        // Check if there is an active approved loan today
        const activeApprovedLoan = await ctx.db
          .query("loans")
          .withIndex("by_tool_and_status", (q) =>
            q.eq("toolId", tool._id).eq("status", "approved")
          )
          .filter((q) =>
            q.and(
              q.lte(q.field("startDate"), today),
              q.gte(q.field("endDate"), today)
            )
          )
          .first();

        // Resolve storage image URLs
        const imageUrls = tool.images
          ? (
              await Promise.all(
                tool.images.map(async (storageId) => await ctx.storage.getUrl(storageId))
              )
            ).filter((url): url is string => Boolean(url))
          : [];

        return {
          _id: tool._id,
          name: tool.name,
          category: tool.category,
          condition: tool.condition,
          description: tool.description,
          images: imageUrls,
          imageStorageIds: tool.images ?? [],
          ownerId: tool.ownerId,
          ownerName: owner?.name ?? "Neighbor",
          isTrustedLender: !!owner?.isTrustedLender,
          isAvailable: !activeApprovedLoan,
          currentLoanEndDate: activeApprovedLoan?.endDate,
          createdAt: tool.createdAt,
        };
      })
    );

    return enrichedTools;
  },
});

/**
 * Authenticated Query: Returns tools listed by the current caller.
 */
export const getMyTools = query({
  args: {},
  handler: async (ctx) => {
    const caller = await getAuthenticatedUser(ctx);

    const tools = await ctx.db
      .query("tools")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", caller._id))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    const today = new Date().toISOString().split("T")[0];

    return await Promise.all(
      tools.map(async (tool) => {
        const activeLoan = await ctx.db
          .query("loans")
          .withIndex("by_tool_and_status", (q) =>
            q.eq("toolId", tool._id).eq("status", "approved")
          )
          .filter((q) =>
            q.and(
              q.lte(q.field("startDate"), today),
              q.gte(q.field("endDate"), today)
            )
          )
          .first();

        const imageUrls = tool.images
          ? (
              await Promise.all(
                tool.images.map(async (storageId) => await ctx.storage.getUrl(storageId))
              )
            ).filter((url): url is string => Boolean(url))
          : [];

        return {
          ...tool,
          images: imageUrls,
          imageStorageIds: tool.images ?? [],
          isAvailable: !activeLoan,
          activeLoanEndDate: activeLoan?.endDate,
        };
      })
    );
  },
});

/**
 * Authenticated Mutation: Generate upload URL for tool images.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getAuthenticatedUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Authenticated Mutation: List a new tool with optional up to 3 images.
 */
export const createTool = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    condition: v.string(),
    description: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);

    if (!args.name.trim()) throw new Error("Tool name is required");
    if (!args.description.trim()) throw new Error("Description is required");
    if (args.images && args.images.length > 3) {
      throw new Error("You can upload a maximum of 3 images per tool");
    }

    const toolId = await ctx.db.insert("tools", {
      name: args.name.trim(),
      category: args.category,
      condition: args.condition,
      description: args.description.trim(),
      images: args.images && args.images.length > 0 ? args.images.slice(0, 3) : undefined,
      ownerId: caller._id,
      isArchived: false,
      createdAt: Date.now(),
    });

    return toolId;
  },
});

/**
 * Authenticated Mutation: Edit tool listing. Only tool owner can edit.
 */
export const updateTool = mutation({
  args: {
    toolId: v.id("tools"),
    name: v.string(),
    category: v.string(),
    condition: v.string(),
    description: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) throw new Error("Tool not found");
    if (tool.ownerId !== caller._id && caller.role !== "admin") {
      throw new Error("Forbidden: You can only edit your own listings");
    }
    if (args.images && args.images.length > 3) {
      throw new Error("You can upload a maximum of 3 images per tool");
    }

    await ctx.db.patch(args.toolId, {
      name: args.name.trim(),
      category: args.category,
      condition: args.condition,
      description: args.description.trim(),
      images: args.images ? args.images.slice(0, 3) : tool.images,
    });

    return { success: true };
  },
});

/**
 * Authenticated Mutation: Soft-deletes a tool.
 * Owner or Admin can delete. Rejects if an approved loan is active.
 */
export const deleteTool = mutation({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    const tool = await ctx.db.get(args.toolId);

    if (!tool) throw new Error("Tool not found");

    const isOwner = tool.ownerId === caller._id;
    const isAdmin = caller.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden: You do not have permission to delete this listing");
    }

    const today = new Date().toISOString().split("T")[0];

    // Ensure no active loan is in progress
    const activeLoan = await ctx.db
      .query("loans")
      .withIndex("by_tool_and_status", (q) =>
        q.eq("toolId", tool._id).eq("status", "approved")
      )
      .filter((q) => q.gte(q.field("endDate"), today))
      .first();

    if (activeLoan) {
      throw new Error(
        `Cannot remove listing: active approved loan in progress until ${activeLoan.endDate}`
      );
    }

    // Soft delete to maintain audit integrity of past loans
    await ctx.db.patch(args.toolId, {
      isArchived: true,
    });

    return { success: true, deletedBy: isAdmin && !isOwner ? "admin" : "owner" };
  },
});
