import React, { useCallback, useEffect, useRef } from "react";
import { Keyboard, KeyboardEvent, SafeAreaView, ScrollView } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useChat } from "../hooks/useChat";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatHistoryModal } from "./chat/ChatHistoryModal";
import { ChatInput } from "./chat/ChatInput";
import { MessageList } from "./chat/MessageList";
import { ModelSelectorModal } from "./chat/ModelSelectorModal";
import { WelcomeScreen } from "./chat/WelcomeScreen";

interface ChatViewProps {
  userName?: string;
}

const ChatView: React.FC<ChatViewProps> = ({ userName = "user" }) => {
  // Keyboard height state with animated value for smooth transitions
  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardAnimatedHeight = useSharedValue(0);
  
  const scrollToBottom = useCallback(() => {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const {
    // State
    messages,
    inputText,
    isCreatingChat,
    selectedModel,
    showModelModal,
    showChatHistory,
    useAgent,
    chatHistory,
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
  } = useChat(userName, scrollToBottom);
  // Optimized keyboard handling with animated transitions
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        const height = e.endCoordinates.height;
        keyboardAnimatedHeight.value = withTiming(height, { duration: 250 });
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        keyboardAnimatedHeight.value = withTiming(0, { duration: 250 });
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [keyboardAnimatedHeight]);

  // Optimized auto-scroll with debouncing
  useEffect(() => {
    if (messages.length > 0) {
      // Debounced scroll to improve performance
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length]); // Only depend on messages length, not full messages array

  const handleActionButton = useCallback((action: string) => {
    // Handle action button press
    // Could trigger different flows based on action type
  }, []);

  const handleMenuPress = useCallback(() => {
    setShowChatHistory(true);
  }, [setShowChatHistory]);

  const handleSearchPress = useCallback(() => {
    // Handle search functionality
  }, []);

  const handleGlobePress = useCallback(() => {
    console.log("Globe pressed");
  }, []);

  const handleAttachPress = useCallback(() => {
    console.log("Attach pressed");
  }, []);

  // Animated style for keyboard padding
  const keyboardStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardAnimatedHeight.value,
  }));return (
    <SafeAreaView className="flex-1 bg-app-dark-background pt-5 pb-5">      {/* Top Bar */}
      <ChatHeader
        onMenuPress={handleMenuPress}
        onSearchPress={handleSearchPress}
        onNewChatPress={startNewChat}
        useAgent={useAgent}
        onToggleAgent={setUseAgent}
      />      {/* Main Content Container */}
      <Animated.View className="flex-1" style={keyboardStyle}>
        {/* Messages Container with ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-8"
          testID="chat-container"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
        >{messages.length === 0 ? (
            <WelcomeScreen
              userName={userName}
              onActionPress={handleActionButton}
              onSuggestedQuestionPress={handleSuggestedQuestion}
            />
          ) : (
            <MessageList messages={messages} />
          )}        </ScrollView>

        {/* Fixed Bottom Input Bar */}
        <ChatInput
          inputText={inputText}
          onInputChange={setInputText}
          onSendMessage={handleSendMessage}
          onModelSelectorPress={() => setShowModelModal(true)}
          onGlobePress={handleGlobePress}
          onAttachPress={handleAttachPress}
          selectedModel={selectedModel}
          isCreatingChat={isCreatingChat}
          useAgent={useAgent}
        />
      </Animated.View>
        {/* Model Selection Modal */}
      <ModelSelectorModal
        visible={showModelModal}
        selectedModel={selectedModel}
        onClose={() => setShowModelModal(false)}
        onModelSelect={setSelectedModel}
      />
      
      {/* Chat History Modal */}
      <ChatHistoryModal
        visible={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        chatHistory={chatHistory}
        onChatSelect={loadChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={startNewChat}
        loading={chatHistory === undefined}
      />
    </SafeAreaView>
  );
};

export default ChatView;
