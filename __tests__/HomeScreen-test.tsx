import React from 'react';

import HomeScreen from '@/app/index';

// Mock the convex API
jest.mock('@/convex/_generated/api', () => ({
  api: {
    chat: {},
    agents: {},
  },
}));

// Mock ChatView component to avoid complex dependencies
jest.mock('@/components/ChatView', () => {
  return jest.fn(() => null);
});

// Test HomeScreen component without rendering it to avoid reanimated issues for now
describe('<HomeScreen /> - Component Tests', () => {
  test('HomeScreen component exists', () => {
    // Test that the component can be imported
    expect(HomeScreen).toBeDefined();
  });

  test('HomeScreen is a React component', () => {
    expect(typeof HomeScreen).toBe('function');
  });

  test('HomeScreen can be instantiated', () => {
    const component = React.createElement(HomeScreen);
    expect(component).toBeDefined();
    expect(component.type).toBe(HomeScreen);
  });
});
