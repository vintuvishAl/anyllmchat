import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export type ModelType = "gemini-2.5-flash" | "gemini-2.5-pro" | "gpt-4o-mini" | "gpt-4o";

export const useChat = (userName: string = "user", onScrollToBottom?: () => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("gemini-2.5-flash");  const [showModelModal, setShowModelModal] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [useAgent, setUseAgent] = useState(false);

  // Convex mutations and queries
  const createChat = useMutation(api.chat.createUserChat);
  const continueChat = useMutation(api.chat.continueUserChat);
  const deleteChat = useMutation(api.chat.deleteChat);
  const chatHistory = useQuery(api.chat.getUserChats);
  const chat = useQuery(
    api.chat.getChat,
    currentChatId ? { chatId: currentChatId } : "skip"
  );
  // Get chat messages for existing chat
  const chatMessages = useQuery(
    api.chat.getChatMessagesFromDB,
    currentChatId ? { chatId: currentChatId } : "skip"
  );
  // Get the stream body to display AI responses
  const streamBody = useQuery(
    api.chat.getChatBody,
    chat?.streamId ? { streamId: chat.streamId } : "skip"
  );  // Reset streaming state when switching chats
  useEffect(() => {
    // Chat switched, no special handling needed for streaming
  }, [currentChatId]);// Update messages when stream body changes
  useEffect(() => {
    if (streamBody && currentChatId) {
      // The persistent streaming library should return the accumulated text
      let bodyText = "";

      if (typeof streamBody === "string") {
        bodyText = streamBody;
      } else if (streamBody && typeof streamBody === "object") {
        // Handle object format from persistent streaming
        const streamBodyAny = streamBody as any;
        bodyText = streamBodyAny.text || streamBodyAny.body || "";
      }

      if (bodyText && bodyText.trim()) {
        setMessages((prev) => {
          const existingStreamMessage = prev.find(
            (m) => m.id === `stream-${currentChatId}`
          );
          
          if (existingStreamMessage) {
            // Update existing streaming message
            if (bodyText !== existingStreamMessage.text) {
              setTimeout(() => onScrollToBottom?.(), 50);
              return prev.map((m) =>
                m.id === `stream-${currentChatId}`
                  ? { ...m, text: bodyText, isStreaming: true }
                  : m
              );
            }
            return prev;
          } else {
            // Create new streaming message
            setTimeout(() => onScrollToBottom?.(), 50);
            return [
              ...prev,
              {
                id: `stream-${currentChatId}`,
                text: bodyText,
                isUser: false,
                timestamp: new Date(),
                isStreaming: true,
              },
            ];
          }
        });
      }
    }
  }, [streamBody, currentChatId, onScrollToBottom]);
  // Load existing chat messages when a chat is selected
  useEffect(() => {
    if (chatMessages && chatMessages.messages) {
      // Convert timestamp numbers to Date objects for frontend use
      const messagesWithDates = chatMessages.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      
      // Replace messages with database messages when loading a chat
      setMessages(messagesWithDates);
    }
  }, [chatMessages, currentChatId]);

  // Mark streaming as complete after no updates for 3 seconds
  useEffect(() => {
    if (currentChatId) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          return prev.map((m) => {
            if (m.id === `stream-${currentChatId}` && m.isStreaming) {
              return { ...m, isStreaming: false };
            }
            return m;
          });
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [streamBody, currentChatId]);
  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random()}`, // More unique ID
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        // Check if this exact message was already added recently (within 1 second)
        const recentMessage = prev.find(m => 
          m.isUser && 
          m.text === userMessage.text && 
          Math.abs(new Date().getTime() - m.timestamp.getTime()) < 1000
        );
        
        if (recentMessage) {
          return prev;
        }
        
        return [...prev, userMessage];
      });        const prompt = inputText.trim();
      setInputText("");

      if (useAgent) {
        // Use agent functionality
        await handleAgentMessage(prompt);
      } else {        // Use regular streaming chat - continue existing chat or create new one
        try {
          setIsCreatingChat(true);
            if (currentChatId) {            // Continue existing chat - add message to existing conversation
            await continueChat({
              chatId: currentChatId,
              prompt,
              model: selectedModel,
            });          } else {
            // Create new chat only if no current chat exists
            const result = await createChat({
              prompt,
              model: selectedModel,
            });
            setCurrentChatId(result.chatId);
          }
        } catch (error) {
          console.error("Error with chat:", error);
          // Add error message
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              text: "Sorry, I encountered an error. Please try again.",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        } finally {
          setIsCreatingChat(false);
        }
      }
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);    try {
      setIsCreatingChat(true);        const result = await createChat({
        prompt: question,
        model: selectedModel,
      });
      
      setCurrentChatId(result.chatId);
    } catch (error) {
      console.error("Error creating chat:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsCreatingChat(false);
    }
  };
  // Agent functionality
  const agentChat = useAction(api.chat.agentChat);
  const handleAgentMessage = async (prompt: string) => {
    try {      const result = await agentChat({
        prompt,
        model: selectedModel,
        threadId: currentThreadId || undefined,
      });
      
        
      if (result.success) {
        // Update thread ID if we got a new one
        if (result.threadId && result.threadId !== currentThreadId) {
          setCurrentThreadId(result.threadId);
        }
        
        // Add agent response
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            text: result.response || "No response received",
            isUser: false,
            timestamp: new Date(),
          },
        ]);        
        // Log tools used if any
        if (result.toolsUsed && result.toolsUsed.length > 0) {
          // Keep this log for debugging agent tools
          console.log("Tools used:", result.toolsUsed);
        }
      } else {
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-error-${Date.now()}`,
            text: `Agent error: ${result.error}`,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error with agent chat:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-error-${Date.now()}`,
          text: "Sorry, the agent encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  };  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentThreadId(null);
    setIsCreatingChat(false);
  };

  const loadChat = (chatId: Id<"chats">) => {
    setCurrentChatId(chatId);
    setCurrentThreadId(null);
    setMessages([]); // Will be populated by useEffect when chatMessages loads
  };
  const handleDeleteChat = async (chatId: Id<"chats">) => {
    try {
      await deleteChat({ chatId });
      // If the deleted chat is the current one, start a new chat
      if (chatId === currentChatId) {
        startNewChat();
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };return {
    // State
    messages,    inputText,
    currentChatId,
    isCreatingChat,
    selectedModel,
    showModelModal,
    showChatHistory,
    useAgent,
    userName,
    chatHistory: chatHistory || [],
    
    // Actions
    setInputText,
    setSelectedModel,
    setShowModelModal,
    setShowChatHistory,
    setUseAgent,
    handleSendMessage,
    handleSuggestedQuestion,
    startNewChat,
    loadChat,
    handleDeleteChat,
  };
};
