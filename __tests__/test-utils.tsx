import { render } from '@testing-library/react-native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import React from 'react';

// Mock Convex client for testing
const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
  action: jest.fn(),
  subscribe: jest.fn(),
  onUpdate: jest.fn(),
  localQueryResult: jest.fn(),
  setAuth: jest.fn(),
  clearAuth: jest.fn(),
  connectionState: jest.fn(() => ({
    isConnected: true,
    errors: [],
  })),
} as unknown as ConvexReactClient;

// Mock ConvexProvider wrapper for testing
export const ConvexTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConvexProvider client={mockConvexClient}>
      {children}
    </ConvexProvider>
  );
};

// Custom render function that includes ConvexProvider
export const renderWithConvex = (ui: React.ReactElement, options = {}) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ConvexTestProvider>{children}</ConvexTestProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock functions for convex hooks
export const mockUseQuery = jest.fn();
export const mockUseMutation = jest.fn();
export const mockUseAction = jest.fn();

// Mock convex hooks
jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useMutation: (...args: any[]) => mockUseMutation(...args),
  useAction: (...args: any[]) => mockUseAction(...args),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Export everything from react-testing-library
export * from '@testing-library/react-native';

// Add a test to prevent Jest from complaining about no tests
describe('Test utilities', () => {
  it('should export mock functions', () => {
    expect(ConvexTestProvider).toBeDefined();
    expect(renderWithConvex).toBeDefined();
    expect(mockUseQuery).toBeDefined();
    expect(mockUseMutation).toBeDefined();
    expect(mockUseAction).toBeDefined();
  });
});
