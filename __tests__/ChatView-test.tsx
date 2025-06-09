import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import ChatView from '@/components/ChatView';

// Mock the convex API
jest.mock('@/convex/_generated/api', () => ({
  api: {
    chat: {
      createUserChat: 'createUserChat',
      continueUserChat: 'continueUserChat',
      deleteChat: 'deleteChat',
      getUserChats: 'getUserChats',
      getChat: 'getChat',
      getChatMessagesFromDB: 'getChatMessagesFromDB',
      getChatBody: 'getChatBody',
    },
    agents: {
      chat: 'agents.chat',
    },
  },
}));

// Mock the useChat hook to provide test data
jest.mock('@/hooks/useChat', () => ({
  useChat: jest.fn(() => ({
    // State
    messages: [],
    inputText: '',
    isCreatingChat: false,
    selectedModel: 'gemini-2.5-flash',
    showModelModal: false,
    showChatHistory: false,
    useAgent: false,
    chatHistory: [],
    
    // Actions
    setInputText: jest.fn(),
    setSelectedModel: jest.fn(),
    setShowModelModal: jest.fn(),
    setShowChatHistory: jest.fn(),
    setUseAgent: jest.fn(),
    handleSendMessage: jest.fn(),
    handleSuggestedQuestion: jest.fn(),
    startNewChat: jest.fn(),
    loadChat: jest.fn(),
    handleDeleteChat: jest.fn(),
  })),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children, href, ...props }: any) => <div {...props}>{children}</div>,
  Stack: ({ children }: any) => <div>{children}</div>,
}));

describe('<ChatView />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { getByTestId } = render(<ChatView userName="test-user" />);
    expect(getByTestId('chat-container')).toBeTruthy();
  });

  test('renders welcome message for user', () => {
    const { getByText } = render(<ChatView userName="user" />);
    expect(getByText('How can I help you, user?')).toBeTruthy();
  });

  test('renders all four action buttons', () => {
    const { getByTestId } = render(<ChatView userName="user" />);
    expect(getByTestId('action-create')).toBeTruthy();
    expect(getByTestId('action-explore')).toBeTruthy();
    expect(getByTestId('action-code')).toBeTruthy();
    expect(getByTestId('action-learn')).toBeTruthy();
  });

  test('renders suggested questions', () => {
    const { getByText } = render(<ChatView userName="user" />);
    expect(getByText('How does AI work?')).toBeTruthy();
    expect(getByText('Are black holes real?')).toBeTruthy();
    expect(getByText("How many Rs are in the word 'strawberry'?")).toBeTruthy();
    expect(getByText('What is the meaning of life?')).toBeTruthy();
  });

  test('renders chat header with buttons', () => {
    const { getByTestId } = render(<ChatView userName="user" />);
    expect(getByTestId('all-chats-button')).toBeTruthy();
    expect(getByTestId('add-button')).toBeTruthy();
  });

  test('renders bottom input area', () => {
    const { getByPlaceholderText, getByText } = render(<ChatView userName="user" />);
    expect(getByPlaceholderText('Type your message here...')).toBeTruthy();
    expect(getByText('Gemini 2.5 Flash')).toBeTruthy();
  });

  test('can press action buttons', () => {
    const { getByTestId } = render(<ChatView userName="user" />);
    const createButton = getByTestId('action-create');
    
    fireEvent.press(createButton);
    // Should handle button press (functionality is mocked)
    expect(createButton).toBeTruthy();
  });

  test('can press suggested questions', () => {
    const { getByTestId } = render(<ChatView userName="user" />);
    const questionButton = getByTestId('suggestion-0');
    
    fireEvent.press(questionButton);
    // Should handle question selection (functionality is mocked)
    expect(questionButton).toBeTruthy();
  });

  test('header buttons are pressable', () => {
    const { getByTestId } = render(<ChatView userName="user" />);
    const menuButton = getByTestId('all-chats-button');
    const addButton = getByTestId('add-button');
    
    fireEvent.press(menuButton);
    fireEvent.press(addButton);
    
    expect(menuButton).toBeTruthy();
    expect(addButton).toBeTruthy();
  });

  test('renders with custom userName', () => {
    const { getByText } = render(<ChatView userName="Alice" />);
    expect(getByText('How can I help you, Alice?')).toBeTruthy();
  });

  test('renders with default userName when not provided', () => {
    const { getByText } = render(<ChatView />);
    expect(getByText('How can I help you, user?')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const tree = render(<ChatView userName="user" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
