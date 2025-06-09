// Jest setup file for Expo React Native app
// This file is automatically loaded by Jest before running tests

// Note: Built-in Jest matchers are automatically available in @testing-library/react-native v12.4+
// No need to import @testing-library/jest-native (deprecated)

// Mock NativeWind
jest.mock('nativewind', () => ({
  StyledComponent: (component) => component,
  useDeviceContext: jest.fn(),
  useAppColorScheme: jest.fn(),
}));

// Mock Convex
jest.mock('convex/react', () => ({
  ConvexProvider: ({ children }) => children,
  useQuery: jest.fn(() => undefined),
  useMutation: jest.fn(() => jest.fn()),
  useAction: jest.fn(() => jest.fn()),
  ConvexReactClient: jest.fn().mockImplementation(() => ({})),
}));

// Global environment setup
global.__DEV__ = true;
global.fetch = require('node-fetch');

// Mock Expo modules that might not be available in the test environment

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'llm-chat-app',
      slug: 'llm-chat-app',
    },
  },
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: (component) => component,
    Directions: {},
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  
  // Add missing functions that might be used in components
  Reanimated.useScrollViewOffset = jest.fn(() => ({ value: 0 }));
  Reanimated.useBottomTabOverflow = jest.fn(() => 0);
  Reanimated.useAnimatedRef = jest.fn(() => ({ current: null }));
  Reanimated.useAnimatedStyle = jest.fn(() => ({}));
  
  return Reanimated;
});

// Note: NativeAnimatedHelper mock is not needed with current React Native versions
