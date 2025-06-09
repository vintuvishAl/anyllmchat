import React from "react";
import { Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import type { Message } from "../../hooks/useChat";

interface MessageListProps {
  messages: Message[];
}

// Memoized individual message component for better performance
const MessageItem = React.memo<{ message: Message }>(({ message }) => {
  const markdownStyles = {
    body: {
      color: '#f3f4f6', // text-app-dark-text color
      fontSize: 16,
    },
    code_inline: {
      backgroundColor: '#374151',
      color: '#e5e7eb',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: '#374151',
      color: '#e5e7eb',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: '#1f2937',
      borderLeftColor: '#6b7280',
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
    },
    heading1: {
      color: '#f3f4f6',
      fontSize: 24,
      fontWeight: 'bold' as const,
      marginVertical: 8,
    },
    heading2: {
      color: '#f3f4f6',
      fontSize: 20,
      fontWeight: 'bold' as const,
      marginVertical: 6,
    },
    heading3: {
      color: '#f3f4f6',
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginVertical: 4,
    },
    list_item: {
      color: '#f3f4f6',
      marginVertical: 2,
    },
    strong: {
      color: '#f3f4f6',
      fontWeight: 'bold' as const,
    },
    em: {
      color: '#f3f4f6',
      fontStyle: 'italic' as const,
    },
  };

  return (
    <View
      className={`mb-4 ${
        message.isUser ? "items-end" : "items-start"
      }`}
      testID={`message-${message.id}`}
    >
      <View
        className={`px-4 py-2 rounded-lg ${
          message.isUser
            ? "bg-app-dark-user-message ml-auto max-w-xs lg:max-w-md"
            : "bg-app-dark-ai-message mr-auto w-full"
        }`}
      >
        {message.isUser ? (
          <Text className="text-app-dark-text">{message.text}</Text>
        ) : (
          <Markdown style={markdownStyles}>
            {message.text}
          </Markdown>
        )}
      </View>
    </View>
  );
});

MessageItem.displayName = 'MessageItem';

export const MessageList: React.FC<MessageListProps> = React.memo(({ messages }) => {  // Deduplicate messages based on content and user type to prevent double rendering
  const deduplicatedMessages = React.useMemo(() => {
    const result: Message[] = [];
    const aiMessages: Message[] = [];
    
    // Separate user and AI messages
    messages.forEach(message => {
      if (message.isUser) {
        result.push(message);
      } else {
        aiMessages.push(message);
      }
    });
    
    // For AI messages, remove duplicates and partial duplicates
    const processedAIMessages: Message[] = [];
    aiMessages.forEach(message => {
      // Check if this message is a subset of any existing message
      const isSubsetOfExisting = processedAIMessages.some(existing => 
        existing.text.includes(message.text) && existing.text.length > message.text.length
      );
      
      if (!isSubsetOfExisting) {
        // Remove any existing messages that are subsets of this message
        const filteredExisting = processedAIMessages.filter(existing => 
          !(message.text.includes(existing.text) && message.text.length > existing.text.length)
        );
        
        // Check for exact duplicates in the filtered list
        const isDuplicate = filteredExisting.some(existing => 
          existing.text.trim() === message.text.trim()
        );
        
        if (!isDuplicate) {
          processedAIMessages.length = 0; // Clear array
          processedAIMessages.push(...filteredExisting, message);
        }
      }
    });
    
    // Combine user messages with deduplicated AI messages, sorted by timestamp
    const combined = [...result, ...processedAIMessages];
    return combined.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [messages]);

  return (
    <View className="py-4">
      {deduplicatedMessages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </View>
  );
});

MessageList.displayName = 'MessageList';
