import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { Id } from "../../convex/_generated/dataModel";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";

interface ChatHistoryItem {
  _id: Id<"chats">;
  title: string;
  createdAt: number;
  updatedAt?: number;
}

interface ChatHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  chatHistory: ChatHistoryItem[];
  onChatSelect: (chatId: Id<"chats">) => void;
  onDeleteChat: (chatId: Id<"chats">) => void;
  onNewChat: () => void;
  loading?: boolean;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  visible,
  onClose,
  chatHistory,
  onChatSelect,
  onDeleteChat,
  onNewChat,
  loading = false,
}) => {
  const { onButtonPress, onImportantAction, onCriticalAction } =
    useHapticFeedback();

  // Optimized date formatting with memoization
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }, []);

  // Animated values for smooth modal transitions
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);

  // Update animation when modal visibility changes
  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(1000, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateY, opacity]);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleChatPress = useCallback(
    (chatId: Id<"chats">) => {
      onButtonPress();
      onChatSelect(chatId);
      onClose();
    },
    [onButtonPress, onChatSelect, onClose]
  );

  const handleNewChat = useCallback(() => {
    onImportantAction();
    onNewChat();
    onClose();
  }, [onImportantAction, onNewChat, onClose]);

  const handleDeleteChat = useCallback(
    (chatId: Id<"chats">) => {
      onCriticalAction();
      onDeleteChat(chatId);
    },
    [onCriticalAction, onDeleteChat]
  );

  const handleClose = useCallback(() => {
    onButtonPress();
    onClose();
  }, [onButtonPress, onClose]);
  // Memoized render function for chat items to prevent unnecessary re-renders
  const renderChatItem = useCallback(
    ({ item }: { item: ChatHistoryItem }) => (
      <View className="flex-row items-center px-4 py-3 border-b border-app-dark-border">
        <TouchableOpacity
          className="flex-1 mr-3"
          onPress={() => handleChatPress(item._id)}
        >
          <Text
            className="text-app-dark-text text-base font-medium mb-1"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-app-dark-placeholder text-sm">
            {formatDate(item.updatedAt || item.createdAt)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-2"
          onPress={() => handleDeleteChat(item._id)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    ),
    [handleChatPress, handleDeleteChat, formatDate]
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: ChatHistoryItem) => item._id, []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      
      <Animated.View
        style={[
          { flex: 1, backgroundColor: "rgba(0,3,34,0.8)" },
          backgroundStyle,
        ]}
      >
        <Animated.View
          style={[{ flex: 1, backgroundColor: "#000322" }, modalStyle]}
        >
          
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-app-dark-border">
            <Text className="text-app-dark-text text-xl font-bold">
              Chat History
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#2da3d4" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="flex-row items-center px-4 py-4 bg-app-dark-tint mx-4 mt-4 rounded-lg"
            onPress={handleNewChat}
          >
            <Ionicons name="add" size={20} color="#000322" />
            <Text className="text-app-dark-background text-base font-bold ml-2">
              Start New Chat
            </Text>
          </TouchableOpacity>
          <View className="flex-1 mt-4">
            
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-app-dark-placeholder">
                  Loading chat history...
                </Text>
              </View>
            ) : chatHistory.length === 0 ? (
              <View className="flex-1 justify-center items-center px-4">
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color="#2da3d4"
                />
                <Text className="text-app-dark-text text-lg mt-4 mb-2">
                  No chat history
                </Text>
                <Text className="text-app-dark-placeholder text-center">
                  Start a conversation to see your chat history here
                </Text>
              </View>
            ) : (
              <FlashList
                data={chatHistory}
                renderItem={renderChatItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={70}
                removeClippedSubviews={true}
                getItemType={() => "chat-item"}
              />
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
