import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";

interface ChatHeaderProps {
  onMenuPress: () => void;
  onSearchPress: () => void;
  onNewChatPress: () => void;
  useAgent: boolean;
  onToggleAgent: (enabled: boolean) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = React.memo(
  ({ onMenuPress, onSearchPress, onNewChatPress, useAgent, onToggleAgent }) => {
    const { onButtonPress, onImportantAction } = useHapticFeedback();

    const handleMenuPress = useCallback(() => {
      // Add haptic feedback for menu button
      onButtonPress();
      onMenuPress();
    }, [onButtonPress, onMenuPress]);

    const handleNewChatPress = useCallback(() => {
      // Add haptic feedback for new chat button
      onImportantAction();
      onNewChatPress();
    }, [onImportantAction, onNewChatPress]);

    return (
      <View className="flex-row justify-between items-center px-6 py-4 bg-app-dark-background">
        <View className="flex-row items-center">
          
          <TouchableOpacity
            testID="all-chats-button"
            className="p-2 "
            onPress={handleMenuPress}
          >
            
            <Ionicons
              name="menu"
              size={30}
              className="text-app-dark-icon"
              color={"#2da3d4"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="add-button"
            className="p-2"
            onPress={handleNewChatPress}
          >
            
            <Ionicons
              name="add"
              size={30}
              className="text-app-dark-icon"
              color={"#2da3d4"}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity testID="search-button" className="p-2" onPress={onSearchPress}>          <Ionicons
            name="search"
            size={30}
            className="text-app-dark-icon"
            color={"#2da3d4"}
          />
        </TouchableOpacity> */}
        </View>
        <View className="flex-row items-end space-x-2">
          <Image
            source={require("../../assets/images/anyllmchatlogo.png")}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
          <Text className="text-app-dark-text text-xl font-bold pb-3">
            Any Llm Chat
          </Text>
        </View>
      </View>
    );
  }
);

ChatHeader.displayName = "ChatHeader";
