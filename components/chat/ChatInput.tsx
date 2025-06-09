import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ModelType } from "../../hooks/useChat";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";

export const modelOptions = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
] as const;

interface ChatInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onModelSelectorPress: () => void;
  onGlobePress: () => void;
  onAttachPress: () => void;
  selectedModel: ModelType;
  isCreatingChat: boolean;
  useAgent?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = React.memo(
  ({
    inputText,
    onInputChange,
    onSendMessage,
    onModelSelectorPress,
    onGlobePress,
    onAttachPress,
    selectedModel,
    isCreatingChat,
    useAgent = false,
  }) => {
    const { onImportantAction, onButtonPress } = useHapticFeedback();

    const handleSendMessage = useCallback(() => {
      if (inputText.trim() && !isCreatingChat) {
        // Add haptic feedback for sending messages
        onImportantAction();
        Keyboard.dismiss();
        onSendMessage();
      }
    }, [inputText, isCreatingChat, onImportantAction, onSendMessage]);

    const handleModelSelectorPress = useCallback(() => {
      // Add haptic feedback for model selection
      onButtonPress();
      onModelSelectorPress();
    }, [onButtonPress, onModelSelectorPress]);

    // Memoize model name to prevent recalculation
    const selectedModelName = React.useMemo(() => {
      return modelOptions.find((m) => m.id === selectedModel)?.name;
    }, [selectedModel]);

    return (
      <View className="bg-app-dark-background px-6 py-0">
        {/* Input Field - Separate section */}
        <View className="border-4 border-app-dark-border  rounded-lg   ">
          <View className="bg-app-dark-chat-bg rounded-xl  px-6 py-2  ">
           
            <TextInput
              className="text-app-dark-text text-base min-h-6"
              placeholder="Type your message here..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={onInputChange}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
              returnKeyType="send"
              multiline
              testID="message-input"
            />
          </View>
          {/* Model Info Bar - Separate section */}
          <View className="flex-row items-center justify-between bg-app-dark-chat-bg  px-6 py-2 ">
            <View className="flex-row items-center space-x-4 gap-2">
              {/* Agent Mode Indicator */}
              {useAgent && (
                <View className="flex-row items-center space-x-1 bg-blue-600 px-2 py-1 rounded">
                  <Ionicons name="calculator" size={14} color="white" />
                  <Text className="text-white text-xs font-medium">Agent</Text>
                </View>
              )}{" "}
              {/* Model Selection Button */}{" "}
              <TouchableOpacity
                className="flex-row items-center space-x-1 bg-app-dark-border px-3 py-2 rounded-lg"
                testID="model-selector"
                onPress={handleModelSelectorPress}
              >
                <Text className="text-app-dark-text text-sm font-medium">
                  {selectedModelName}
                </Text>{" "}
                <Ionicons
                  name="chevron-down"
                  size={16}
                  className="text-app-dark-icon"
                  color={"#2da3d4"}
                />
              </TouchableOpacity>
              {/* <TouchableOpacity testID="globe-button" onPress={handleGlobePress}>
              <Ionicons
                name="globe-outline"
                size={20}
                className="text-app-dark-icon"
                color={"#6b6b6b"}
              />
            </TouchableOpacity>
            
           
            <TouchableOpacity testID="attach-button" onPress={handleAttachPress}>
              <Ionicons
                name="attach"
                size={20}
                className="text-app-dark-icon"
                color={"#6b6b6b"}
              />
            </TouchableOpacity> */}
            </View>
            {/* Send Button */}
            <TouchableOpacity
              className={`px-4 py-3 rounded-xl ${
                inputText.trim() && !isCreatingChat
                  ? "bg-app-dark-tint"
                  : "bg-app-dark-border"
              }`}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isCreatingChat}
              testID="send-button"
            >
             
              {isCreatingChat ? (
                <Ionicons
                  name="hourglass"
                  size={20}
                  className="text-app-dark-text"
                  color={"#2da3d4"}
                />
              ) : (
                <Ionicons
                  name="arrow-up"
                  size={20}
                  className="text-app-dark-text"
                  color={inputText.trim() ? "#000322" : "#6b6b6b"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

ChatInput.displayName = "ChatInput";
