import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { utilityAgent } from "./agents";

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming);

export const createChat = mutation({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const streamId = await persistentTextStreaming.createStream(ctx);

    const chatId = await ctx.db.insert("chats", {
      title: args.prompt.slice(0, 50) + (args.prompt.length > 50 ? "..." : ""),
      prompt: args.prompt,
      streamId,
      createdAt: Date.now(),
    });

    // Trigger streaming via internal action
    const selectedModel = args.model || "gemini-2.5-flash";
    
    await ctx.scheduler.runAfter(0, internal.chat.triggerStreaming, {
      streamId,
      prompt: args.prompt,
      model: selectedModel,
      chatId,
    });

    return { chatId, streamId };
  },
});

export const triggerStreaming = internalAction({
  args: {
    streamId: v.string(),
    prompt: v.string(),
    model: v.string(),
    chatId: v.optional(v.id("chats")),
  },  handler: async (ctx, args) => {
    // Get conversation history if we have a chat ID
    let conversationHistory: {role: string, content: string}[] = [];
    if (args.chatId) {
      try {
        const chatMessages = await ctx.runQuery(internal.chat.getChatMessagesForStreaming, {
          chatId: args.chatId
        });
        
        if (chatMessages && chatMessages.length > 0) {
          conversationHistory = chatMessages.map((msg: {role: string, content: string}) => ({
            role: msg.role,
            content: msg.content
          }));
        }
      } catch (error) {
        console.error("Error retrieving conversation history:", error);
      }
    }
    
    const convexUrl = process.env.CONVEX_SITE_URL;
    if (!convexUrl) {
      console.error("CONVEX_SITE_URL not set");
      return;
    }
    
    const requestUrl = `${convexUrl}/chat-stream`;    const requestBody = {
      streamId: args.streamId,
      prompt: args.prompt,
      model: args.model,
      conversationHistory, // Include conversation history
      chatId: args.chatId, // Include chatId so HTTP endpoint can save response directly
    };
    
    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP request failed:", response.status, response.statusText, errorText);
      } else {
        console.log("Streaming triggered successfully");
      }
    } catch (error) {
      console.error("Failed to trigger streaming:", error);
    }
  },
});

export const getChatBody = query({
  args: { streamId: v.string() },
  handler: async (ctx, args) => {
    return await persistentTextStreaming.getStreamBody(ctx, args.streamId as any);
  },
});

export const getChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId);
  },
});

export const getUserChats = query({
  args: {},
  handler: async (ctx) => {
    // Return all chats since we don't have auth anymore
    return await ctx.db
      .query("chats")
      .order("desc")
      .take(50);
  },
});

// Create a chat without authentication requirements
export const createUserChat = mutation({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
  },  handler: async (ctx, args) => {
    const streamId = await persistentTextStreaming.createStream(ctx);

    // Create thread first
    const threadId = await ctx.db.insert("threads", {
      title: args.prompt.slice(0, 50) + (args.prompt.length > 50 ? "..." : ""),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const chatId = await ctx.db.insert("chats", {
      title: args.prompt.slice(0, 50) + (args.prompt.length > 50 ? "..." : ""),
      prompt: args.prompt,
      streamId,
      threadId: threadId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });    // Save user message to database with proper sequence
    await ctx.runMutation(internal.chat.saveMessageWithSequenceInternal, {
      threadId: threadId,
      content: args.prompt,
      role: "user" as const,
    });// Trigger streaming via internal action
    const selectedModel = args.model || "gemini-2.5-flash";
    
    await ctx.scheduler.runAfter(0, internal.chat.triggerStreaming, {
      streamId,
      prompt: args.prompt,
      model: selectedModel,
      chatId,
    });

    return { chatId, streamId };
  },
});

// Delete a chat
export const deleteChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    // Since we don't have auth, just delete the chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    await ctx.db.delete(args.chatId);
  },
});

// Update chat title
export const updateChatTitle = mutation({
  args: { 
    chatId: v.id("chats"), 
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    await ctx.db.patch(args.chatId, { 
      title: args.title, 
      updatedAt: Date.now() 
    });
  },
});

// Get chat messages for display (for non-agent chats)
export const getChatMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) {
      return null;
    }
      // For streaming chats, we'll get the stream body
    if (chat.streamId) {
      const streamBody = await persistentTextStreaming.getStreamBody(ctx, chat.streamId as any);
      return {
        chat,
        streamBody,
        messages: [
          {
            id: "user-prompt",
            text: chat.prompt || "",
            isUser: true,
            timestamp: chat.createdAt,
          },
          ...(streamBody ? [{
            id: `stream-${chat._id}`,
            text: typeof streamBody === "string" ? streamBody : (streamBody as any)?.text || (streamBody as any)?.body || "",
            isUser: false,
            timestamp: chat.createdAt + 1000,
            isStreaming: false,
          }] : [])
        ]
      };
    }
    
    return { chat, messages: [] };
  },
});

export const agentChat = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },  handler: async (ctx, args) => {
    
    try {
      let threadId = args.threadId;
      let thread;

      if (threadId) {
        // Continue existing thread
        const result = await utilityAgent.continueThread(ctx, { threadId });
        thread = result.thread;
      } else {
        // Create new thread
        const result = await utilityAgent.createThread(ctx, {});
        threadId = result.threadId;
        thread = result.thread;
      }

      // Generate response using the agent
      const result = await thread.generateText({ prompt: args.prompt });
      
      return {
        success: true,
        response: result.text,
        threadId,
        toolsUsed: result.toolCalls?.map(call => call.toolName) || [],
        usage: result.usage,
      };
      
    } catch (error) {
      console.error("Agent action failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// Get thread messages for display in the UI - using agent framework
export const getThreadMessages = action({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    try {
      const messages = await utilityAgent.listMessages(ctx, {
        threadId: args.threadId,
        paginationOpts: { cursor: null, numItems: 50 }
      });
      
      return messages.page;
    } catch (error) {
      console.error("Error fetching thread messages:", error);
      return [];
    }
  },
});

// List all threads for a user - using component queries
export const getUserThreads = query({
  args: {},
  handler: async (ctx, args) => {
    // Since we don't have users anymore, return empty array
    // You might want to implement a different logic here based on your needs
    return [];
  },
});

// Continue an existing chat with a new message
export const continueUserChat = mutation({
  args: {
    chatId: v.id("chats"),
    prompt: v.string(),
    model: v.optional(v.string()),
  },  handler: async (ctx, args) => {
    // Verify chat exists
    const existingChat = await ctx.db.get(args.chatId);
    if (!existingChat) {
      throw new Error("Chat not found");
    }

    // Create a new stream for the continuation
    const streamId = await persistentTextStreaming.createStream(ctx);

    // Update the chat with new stream and latest prompt
    await ctx.db.patch(args.chatId, {
      streamId,
      prompt: args.prompt, // Update to latest prompt
      updatedAt: Date.now(),
    });    // Save user message to database with proper sequence
    if (existingChat.threadId) {
      await ctx.runMutation(internal.chat.saveMessageWithSequenceInternal, {
        threadId: existingChat.threadId,
        content: args.prompt,
        role: "user" as const,
      });
    } else {
      console.error("No threadId found for chat:", args.chatId);
    }

    // Trigger streaming via internal action
    const selectedModel = args.model || "gemini-2.5-flash";
    
    await ctx.scheduler.runAfter(0, internal.chat.triggerStreaming, {
      streamId,
      prompt: args.prompt,
      model: selectedModel,
      chatId: args.chatId,
    });

    return { chatId: args.chatId, streamId };
  },
});

// Save a message to the database
export const saveMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify chat exists
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Create thread if it doesn't exist
    let threadId = chat.threadId;
    if (!threadId) {
      const newThreadId = await ctx.db.insert("threads", {
        title: chat.title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      // Update chat with thread reference
      await ctx.db.patch(args.chatId, { threadId: newThreadId });
      threadId = newThreadId;
    }    const sequenceNumber = await getNextSequenceNumber(ctx, threadId);
    
    const messageId = await ctx.db.insert("messages", {
      threadId,
      content: args.content,
      role: args.role,
      sequenceNumber,
      metadata: args.model ? { model: args.model } : undefined,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Save a message with proper sequence number
export const saveMessageWithSequence = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    model: v.optional(v.string()),
    metadata: v.optional(v.object({
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
  },
  handler: async (ctx, args) => {
    const sequenceNumber = await getNextSequenceNumber(ctx, args.threadId);
    
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      content: args.content,
      role: args.role,
      sequenceNumber,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return { messageId, sequenceNumber };
  },
});

// Internal version of saveMessageWithSequence
export const saveMessageWithSequenceInternal = internalMutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    model: v.optional(v.string()),
    metadata: v.optional(v.object({
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
  },
  handler: async (ctx, args) => {
    const sequenceNumber = await getNextSequenceNumber(ctx, args.threadId);
    
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      content: args.content,
      role: args.role,
      sequenceNumber,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    return { messageId, sequenceNumber };
  },
});

// Save AI response with streaming completion tracking
export const saveAIResponseWithTracking = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    model: v.string(),
    streamId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.threadId) {
      throw new Error("Chat not found or no thread ID");
    }    // Check if we already have an AI response for this stream
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", chat.threadId as Id<"threads">))
      .filter((q) => q.eq(q.field("role"), "assistant"))
      .collect();
    
    const existingMessage = allMessages.find(msg => 
      msg.metadata?.streamId === args.streamId
    );

    if (existingMessage) {
      // Update existing message if the new content is longer (more complete)
      if (args.content.length > existingMessage.content.length) {        await ctx.db.patch(existingMessage._id, {
          content: args.content,
          metadata: { 
            model: args.model, 
            streamId: args.streamId,
            lastUpdated: Date.now()
          },
        });
        return existingMessage._id;
      }
      return existingMessage._id;
    }

    // Create new AI response message with proper sequence
    const sequenceNumber = await getNextSequenceNumber(ctx, chat.threadId as Id<"threads">);
      const messageId = await ctx.db.insert("messages", {
      threadId: chat.threadId as Id<"threads">,
      content: args.content,
      role: "assistant" as const,
      sequenceNumber,
      metadata: { 
        model: args.model, 
        streamId: args.streamId,
        savedAt: Date.now()
      },
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Get messages for a chat
export const getChatMessagesFromDB = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) {
      return null;
    }

    if (!chat.threadId) {
      return { chat, messages: [] };
    }const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", chat.threadId as Id<"threads">))
      .order("asc")
      .collect();

    return {
      chat,
      messages: messages.map(msg => ({
        id: msg._id,
        text: msg.content,
        isUser: msg.role === "user",
        timestamp: msg.createdAt,
        model: msg.metadata?.model,
      }))
    };
  },
});

// Internal mutation to save AI response (simplified)
export const saveAIResponse = internalMutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("saveAIResponse: Called with", {
      chatId: args.chatId,
      contentLength: args.content.length,
      model: args.model
    });
    
    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.threadId) {
      console.error("saveAIResponse: Chat not found or no thread ID for chatId:", args.chatId);
      return;
    }

    console.log("saveAIResponse: Found chat with threadId:", chat.threadId);

    // Get the next sequence number for proper ordering
    const sequenceNumber = await getNextSequenceNumber(ctx, chat.threadId);
    
    console.log("saveAIResponse: Next sequence number:", sequenceNumber);
    
    // Save AI response to database with sequence number
    const messageId = await ctx.db.insert("messages", {
      threadId: chat.threadId,
      content: args.content,
      role: "assistant" as const,
      sequenceNumber,
      metadata: { model: args.model },
      createdAt: Date.now(),
    });

    console.log("saveAIResponse: Successfully saved AI message with ID:", messageId);
    return messageId;
  },
});

// Internal query to get chat messages for streaming (includes conversation history)
export const getChatMessagesForStreaming = internalQuery({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat || !chat.threadId) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", chat.threadId as Id<"threads">))
      .order("asc")
      .collect();

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }));},
});

// Helper function to get the next sequence number for a thread (with retry for race conditions)
const getNextSequenceNumber = async (ctx: any, threadId: Id<"threads">) => {
  const lastMessage = await ctx.db
    .query("messages")
    .withIndex("by_thread_sequence", (q: any) => q.eq("threadId", threadId))
    .order("desc")
    .first();
  
  return (lastMessage?.sequenceNumber || 0) + 1;
};
