import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useHapticFeedback } from "../../hooks/useHapticFeedback";

interface ActionButton {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorClass: string;
}

interface WelcomeScreenProps {
  userName: string;
  onActionPress: (action: string) => void;
  onSuggestedQuestionPress: (question: string) => void;
}

const actionButtons: ActionButton[] = [
  {
    label: "Create",
    icon: "star-outline",
    colorClass: "app-dark-icon",
  },
  {
    label: "Explore",
    icon: "document-text-outline",
    colorClass: "",
  },
  { 
    label: "Code", 
    icon: "code-slash", 
    colorClass: "text-code" 
  },
  {
    label: "Learn",
    icon: "school-outline",
    colorClass: "text-learn",
  },
];

const suggestedQuestions = [
  "How does AI work?",
  "Are black holes real?",
  "How many Rs are in the word 'strawberry'?",
  "What is the meaning of life?",
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = React.memo(({
  userName,
  onActionPress,
  onSuggestedQuestionPress,
}) => {
  const { onButtonPress } = useHapticFeedback();

  const handleActionPress = useCallback((action: string) => {
    // Add haptic feedback for action buttons
    onButtonPress();
    onActionPress(action);
  }, [onButtonPress, onActionPress]);

  const handleSuggestedQuestionPress = useCallback((question: string) => {
    // Add haptic feedback for suggested questions
    onButtonPress();
    onSuggestedQuestionPress(question);
  }, [onButtonPress, onSuggestedQuestionPress]);

  return (
    <View className="flex-1 justify-center items-center py-16">
      {/* Welcome Message */}
      <Text className="text-app-dark-text text-4xl font-semibold mb-16 text-center">
        How can I help you, {userName}?
      </Text>
      
      {/* Action Buttons */}
      <View className="w-full max-w-2xl mb-3">
        <View className="flex-row flex-wrap justify-center">
          <View className="flex-row w-full ">
            {actionButtons.map((button, index) => (              <TouchableOpacity
                key={index}
                className="flex-col items-center justify-start bg-app-dark-chat-bg px-1 py-2 rounded-2xl border border-app-dark-border flex-1 mx-2"
                onPress={() => handleActionPress(button.label)}
                testID={`action-${button.label.toLowerCase()}`}
              >
                <Ionicons
                  name={button.icon}
                  size={20}
                  className={button.colorClass}
                  color={"#1769aa"}
                />
                <Text className="text-app-dark-text  font-semibold text-lg">
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Suggested Questions */}
      <View className="w-full max-w-2xl">
        {suggestedQuestions.map((question, index) => (          <TouchableOpacity
            key={index}
            className=" p-5 rounded-xl border-b-1 border-l-0 border-r-0 border-t-0 border   border-app-dark-border"
            onPress={() => handleSuggestedQuestionPress(question)}
            testID={`suggestion-${index}`}
          >
            <Text className="text-app-dark-text text-base">
              {question}
            </Text>
          </TouchableOpacity>
        ))}      </View>
    </View>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';
