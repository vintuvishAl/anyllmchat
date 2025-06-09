import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";
import { httpRouter } from "convex/server";
import { components, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming);

const http = httpRouter();

export const streamChat = httpAction(async (ctx, request) => {
  const { streamId, prompt, model = "gemini-1.5-flash-latest", conversationHistory = [], chatId } = await request.json();
  
  return persistentTextStreaming.stream(
    ctx,
    request,
    streamId,
    async (ctx, request, streamId, chunkAppender) => {
      await streamWithOpenAIFormat(prompt, chunkAppender, model, conversationHistory, ctx, chatId);
    }
  );
});

async function streamWithOpenAIFormat(
  prompt: string, 
  chunkAppender: (chunk: string) => Promise<void>, 
  model: string, 
  conversationHistory: {role: string, content: string}[] = [],
  ctx?: any,
  chatId?: string
) {
  let apiKey: string | undefined;
  let baseURL: string;
  let actualModel: string;
  
  if (model.startsWith("gemini")) {
    // Use Gemini with OpenAI compatibility
    apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/";
    
    // Map our model names to Gemini API model names (OpenAI-compatible endpoint)
    switch (model) {
      case "gemini-2.5-flash-preview":
        actualModel = "models/gemini-2.5-flash-preview-05-20";
        break;
      case "gemini-2.5-pro-preview":
        actualModel = "models/gemini-2.5-pro-preview-06-05";
        break;
      default:
        actualModel = "models/gemini-2.5-flash-preview-05-20";
    }
    
    if (!apiKey) {
      await chunkAppender("Error: Google Gemini API key not configured");
      return;
    }
  } else if (model.startsWith("gpt")) {
    // Use OpenAI directly
    apiKey = process.env.OPENAI_API_KEY;
    baseURL = "https://api.openai.com/v1/";
    
    // Map our model names to OpenAI API model names
    switch (model) {
      case "gpt-4o":
        actualModel = "gpt-4o";
        break;
      case "gpt-4o-mini":
        actualModel = "gpt-4o-mini";
        break;
      default:
        actualModel = "gpt-4o-mini";
    }
    
    if (!apiKey) {
      await chunkAppender("Error: OpenAI API key not configured");
      return;
    }
  } else {
    await chunkAppender("Error: Unsupported model selected");
    return;
  }

  let completeResponse = ""; // Track the complete response

  try {
    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content: "You are a helpful AI assistant. Please respond to the user's queries."
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: "user",
        content: prompt
      }
    ];

    const requestBody = {
      model: actualModel,
      messages,
      stream: true,
      temperature: 0.7,
    };
    
    const response = await fetch(`${baseURL}chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API request failed:", response.status, response.statusText, errorText);
      await chunkAppender(`Error: API request failed with status ${response.status}: ${errorText}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error("Failed to get response stream");
      await chunkAppender("Error: Failed to get response stream");
      return;
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              completeResponse += content; // Accumulate the complete response
              await chunkAppender(content);
            }
          } catch {
            // Skip invalid JSON chunks
            continue;
          }
        }
      }
    }    // After streaming is complete, save the response directly if we have chatId
    if (ctx && chatId && completeResponse.trim()) {
      try {
        console.log("HTTP: Attempting to save AI response", {
          chatId,
          contentLength: completeResponse.length,
          model
        });
        
        await ctx.runMutation(internal.chat.saveAIResponse, {
          chatId,
          content: completeResponse.trim(),
          model,
        });
        console.log("HTTP: AI response saved successfully");
      } catch (error) {
        console.error("HTTP: Error saving complete AI response:", error);
      }
    } else if (!chatId) {
      console.log("HTTP: No chatId provided, skipping save");
    } else if (!completeResponse.trim()) {
      console.log("HTTP: No response content to save");
    } else {
      console.log("HTTP: Missing context, skipping save");
    }
    
  } catch (error) {
    console.error("Streaming error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    await chunkAppender(`Sorry, I encountered an error while processing your request with ${model}.`);
  }
}

http.route({
  path: "/chat-stream",
  method: "POST", 
  handler: streamChat,
});

export default http;
