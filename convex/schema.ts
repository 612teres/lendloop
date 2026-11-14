import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    isTrustedLender: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  tools: defineTable({
    name: v.string(),
    category: v.string(), // "Power Tools" | "Garden" | "Kitchen" | "Camping" | "Hand Tools" | "Other"
    condition: v.string(), // "Brand New" | "Like New" | "Good" | "Fair"
    description: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
    ownerId: v.id("users"),
    isArchived: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_category", ["category"])
    .index("by_archived", ["isArchived"]),

  loans: defineTable({
    toolId: v.id("tools"),
    borrowerId: v.id("users"),
    lenderId: v.id("users"),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("returned"),
      v.literal("cancelled")
    ),
    // Immutable snapshots ensuring auditability even if tool/user profiles mutate
    toolNameSnapshot: v.string(),
    borrowerNameSnapshot: v.string(),
    lenderNameSnapshot: v.string(),
    lastReminderSentAt: v.optional(v.number()),
    reminderCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_toolId", ["toolId"])
    .index("by_borrowerId", ["borrowerId"])
    .index("by_lenderId", ["lenderId"])
    .index("by_status", ["status"])
    .index("by_tool_and_status", ["toolId", "status"]),

  // Transactional Outbox: Events created atomically within database mutations
  automationEvents: defineTable({
    eventId: v.string(),
    eventType: v.union(
      v.literal("loan_requested"),
      v.literal("loan_approved"),
      v.literal("loan_declined"),
      v.literal("loan_returned"),
      v.literal("loan_overdue")
    ),
    loanId: v.id("loans"),
    payload: v.string(), // Minimized JSON payload
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("dispatched"),
      v.literal("failed")
    ),
    retryCount: v.number(),
    nextRetryAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_loanId", ["loanId"]),

  // Audit and Idempotency Log for automation write-backs
  automationLogs: defineTable({
    loanId: v.id("loans"),
    workflowType: v.union(
      v.literal("request_notification"),
      v.literal("overdue_reminder")
    ),
    status: v.union(v.literal("success"), v.literal("failed")),
    deduplicationKey: v.string(), // Stable compound key preventing duplicate reminders
    details: v.string(),
    timestamp: v.number(),
  })
    .index("by_deduplicationKey", ["deduplicationKey"])
    .index("by_loanId", ["loanId"]),

  // Nonce registry for HMAC replay attack prevention
  webhookNonces: defineTable({
    nonce: v.string(),
    timestamp: v.number(),
  }).index("by_nonce", ["nonce"]),
});
