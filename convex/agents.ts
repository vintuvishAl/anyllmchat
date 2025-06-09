// convex/agents.ts
import { openai } from "@ai-sdk/openai";
import { Agent, createTool } from "@convex-dev/agent";
import { v } from "convex/values";
import { z } from "zod";
import { components } from "./_generated/api";
import { action, mutation } from "./_generated/server";

// Create tools using the proper Convex agent framework
export const calculatorTool = createTool({
  description: "Perform mathematical calculations including basic arithmetic and exponentiation",
  args: z.object({
    expression: z.string().describe("Mathematical expression like '5 + 3', '10 * 2', '15 / 3', '2 ^ 4'"),
  }),
  handler: async (ctx, args): Promise<string> => {
    try {
      // Simple pattern matching for basic math operations
      const mathPattern = /(\d+\.?\d*)\s*([\+\-\*\/\^])\s*(\d+\.?\d*)/;
      const match = args.expression.match(mathPattern);
      
      if (!match) {
        return "Invalid math expression format. Please use format like '5 + 3'";
      }
      
      const [, a, operator, b] = match;
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      let result: number;
      
      switch (operator) {
        case '+':
          result = numA + numB;
          break;
        case '-':
          result = numA - numB;
          break;
        case '*':
          result = numA * numB;
          break;
        case '/':
          if (numB === 0) {
            return "Division by zero is not allowed";
          }
          result = numA / numB;
          break;
        case '^':
          result = Math.pow(numA, numB);
          break;
        default:
          return "Unknown operation";
      }
      
      return `🧮 **Calculation Result**\n${numA} ${operator} ${numB} = ${result}`;
    } catch (error) {
      return `Error performing calculation: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export const textUtilityTool = createTool({
  description: "Perform text operations like counting words, counting characters, or reversing text",
  args: z.object({
    operation: z.enum(["count_words", "count_characters", "reverse"]).describe("The text operation to perform"),
    text: z.string().describe("The text to operate on"),
  }),
  handler: async (ctx, args): Promise<string> => {
    try {
      switch (args.operation) {
        case "count_words":
          const wordCount = args.text.split(/\s+/).filter(word => word.length > 0).length;
          return `📝 **Word Count**\nText: "${args.text}"\nWord count: ${wordCount}`;
        
        case "count_characters":
          return `📝 **Character Count**\nText: "${args.text}"\nCharacter count: ${args.text.length}`;
        
        case "reverse":
          const reversed = args.text.split('').reverse().join('');
          return `🔄 **Text Reversed**\nOriginal: "${args.text}"\nReversed: "${reversed}"`;
        
        default:
          return "Unknown text operation";
      }
    } catch (error) {
      return `Error performing text operation: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

// Create the main utility agent
export const utilityAgent = new Agent(components.agent, {
  chat: openai.chat("gpt-4o-mini"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  instructions: `You are a helpful utility assistant. You can help users with:

🧮 **Math Operations** - Use the calculator tool for arithmetic calculations
📝 **Text Operations** - Use the text utility tool for text processing

When users ask for math calculations, use the calculator tool.
When users ask for text operations (word count, character count, reverse text), use the text utility tool.

Be friendly and helpful in your responses.`,
  tools: {
    calculator: calculatorTool,
    textUtility: textUtilityTool,
  },
  maxSteps: 3, // Allow multiple tool calls if needed
});

// Convex functions for agent interactions

// Create a new thread for agent conversations
export const createThread = mutation({
  args: { 
    userId: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ threadId: string }> => {
    const { threadId } = await utilityAgent.createThread(ctx, { 
      userId: args.userId,
    });
    return { threadId };
  },
});

// Generate text using the utility agent
export const generateText = action({
  args: { 
    prompt: v.string(),
    threadId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ text: string; threadId: string }> => {
    let threadId = args.threadId;
    let thread;

    if (threadId) {
      // Continue existing thread
      const result = await utilityAgent.continueThread(ctx, { threadId });
      thread = result.thread;
    } else {
      // Create new thread
      const result = await utilityAgent.createThread(ctx, { userId: args.userId });
      threadId = result.threadId;
      thread = result.thread;
    }

    const result = await thread.generateText({ prompt: args.prompt });
    return { text: result.text, threadId };
  },
});

// Get messages from a thread
export const getMessages = action({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const messages = await utilityAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: { cursor: null, numItems: 50 }
    });
    return messages.page;
  },
});

// Expose agent actions using the framework's built-in methods
export const agentTextAction = utilityAgent.asTextAction({
  maxSteps: 3,
});

export const createThreadMutation = utilityAgent.createThreadMutation();
