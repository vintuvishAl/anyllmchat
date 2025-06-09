import * as Haptics from 'expo-haptics';

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection';

/**
 * Custom hook for haptic feedback
 * Provides consistent haptic feedback across the app with support for iOS and Android
 */
export const useHapticFeedback = () => {
  const triggerHaptic = (type: HapticFeedbackType = 'light') => {
    // Trigger haptic feedback on both iOS and Android
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {      // Gracefully handle cases where haptic feedback is not supported
      console.warn('Haptic feedback not supported on this device:', error);
    }
  };

  return {
    triggerHaptic,
    // Convenience methods for common patterns
    onButtonPress: () => triggerHaptic('light'),
    onImportantAction: () => triggerHaptic('medium'),
    onCriticalAction: () => triggerHaptic('heavy'),
    onSelection: () => triggerHaptic('selection'),
    // Streaming-specific haptic feedback - disabled for better UX
    onStreamStart: () => {}, // No haptic feedback for stream start
    onStreamProgress: () => {}, // No haptic feedback during streaming
    onStreamComplete: () => {}, // No haptic feedback for stream completion
  };
};
