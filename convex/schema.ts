import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Chat configurations for persistent streaming
  chats: defineTable({
    title: v.string(),
    prompt: v.optional(v.string()), // Optional for backwards compatibility
    streamId: v.optional(v.string()), // Links to persistent streaming component
    createdAt: v.number(),
    threadId: v.optional(v.id("threads")), // Changed to proper ID reference
    updatedAt: v.optional(v.number()),  }).index("by_thread", ["threadId"]),

  // Chat threads for agent conversations
  threads: defineTable({
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    status: v.optional(v.string()),
    agentThreadId: v.optional(v.string()), // Links to agent framework thread
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_agent_thread", ["agentThreadId"]),  // Messages for chat display
  messages: defineTable({
    threadId: v.id("threads"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    sequenceNumber: v.number(), // For guaranteed ordering
    agentMessageId: v.optional(v.string()), // Links to agent framework message
    toolCalls: v.optional(v.array(v.object({
      toolName: v.string(),
      args: v.any(),
      result: v.optional(v.any()),
    }))),    metadata: v.optional(v.object({
      model: v.optional(v.string()),
      streamId: v.optional(v.string()),
      savedAt: v.optional(v.number()),
      lastUpdated: v.optional(v.number()),
      usage: v.optional(v.object({
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
      })),
    })),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"])
    .index("by_thread_sequence", ["threadId", "sequenceNumber"]),
});
