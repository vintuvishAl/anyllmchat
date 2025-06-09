import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { ModelType } from "../../hooks/useChat";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";
import { modelOptions } from "./ChatInput";

interface ModelSelectorModalProps {
  visible: boolean;
  selectedModel: ModelType;
  onClose: () => void;
  onModelSelect: (model: ModelType) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  visible,
  selectedModel,
  onClose,
  onModelSelect,
}) => {
  const { onImportantAction, onButtonPress } = useHapticFeedback();

  // Animated values for smooth modal transitions
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  // Update animation when modal visibility changes
  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(300, { duration: 200 });
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

  const handleModelSelect = useCallback(
    (model: ModelType) => {
      onImportantAction();
      onModelSelect(model);
      onClose();
    },
    [onImportantAction, onModelSelect, onClose]
  );

  const handleClose = useCallback(() => {
    onButtonPress();
    onClose();
  }, [onButtonPress, onClose]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      {" "}
      <Animated.View
        style={[
          {
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,3,34,0.8)",
          },
          backgroundStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              backgroundColor: "#000322",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 0,
              
            },
            modalStyle,
          ]}
        >
          
          <View className="flex-row justify-between items-center p-6 ">
            <Text className="text-app-dark-text text-xl font-bold">
              Select AI Model
            </Text>{" "}
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 rounded-full bg-app-dark-chat-bg border border-app-dark-border"
            >
              <Ionicons name="close" size={24} color="#2da3d4" />
            </TouchableOpacity>
          </View>
          {/* Model Options */}
          <View className="p-6 pb-8">
            {" "}
            {modelOptions.map((model) => (
              <TouchableOpacity
                key={model.id}
                className={`flex-row items-center justify-between p-5 rounded-xl mb-4 ${
                  selectedModel === model.id
                    ? "border-2 border-app-dark-tint"
                    : "bg-app-dark-chat-bg border border-app-dark-border"
                }`}
                onPress={() => handleModelSelect(model.id)}
                style={
                  selectedModel === model.id
                    ? { backgroundColor: "#0a1a2a" }
                    : {}
                }
              >
                <View className="flex-1">
                  <Text
                    className={`font-bold text-lg ${
                      selectedModel === model.id
                        ? "text-app-dark-tint"
                        : "text-app-dark-text"
                    }`}
                  >
                    {model.name}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      selectedModel === model.id
                        ? "text-app-dark-tint/70"
                        : "text-app-dark-placeholder"
                    }`}
                  >
                    {model.provider}
                  </Text>
                </View>
                {selectedModel === model.id && (
                  <View className="bg-app-dark-tint rounded-full p-1">
                    <Ionicons name="checkmark" size={20} color="#000322" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
