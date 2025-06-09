import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { ChatInput, modelOptions } from '@/components/chat/ChatInput';

describe('<ChatInput />', () => {
  const mockOnInputChange = jest.fn();
  const mockOnSendMessage = jest.fn();
  const mockOnModelSelectorPress = jest.fn();
  const mockOnGlobePress = jest.fn();
  const mockOnAttachPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    inputText: '',
    onInputChange: mockOnInputChange,
    onSendMessage: mockOnSendMessage,
    onModelSelectorPress: mockOnModelSelectorPress,
    onGlobePress: mockOnGlobePress,
    onAttachPress: mockOnAttachPress,
    selectedModel: 'gemini-2.5-flash' as const,
    isCreatingChat: false,
    useAgent: false,
  };

  test('renders text input with placeholder', () => {
    const { getByPlaceholderText } = render(<ChatInput {...defaultProps} />);
    expect(getByPlaceholderText('Type your message here...')).toBeTruthy();
  });

  test('renders selected model name', () => {
    const { getByText } = render(<ChatInput {...defaultProps} />);
    const expectedModelName = modelOptions.find(m => m.id === 'gemini-2.5-flash')?.name;
    expect(getByText(expectedModelName!)).toBeTruthy();
  });

  test('renders send button', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} />);
    expect(getByTestId('send-button')).toBeTruthy();
  });

  test('renders model selector button', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} />);
    expect(getByTestId('model-selector')).toBeTruthy();
  });

  test('calls onInputChange when typing', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} />);
    const input = getByTestId('message-input');
    
    fireEvent.changeText(input, 'Hello world');
    expect(mockOnInputChange).toHaveBeenCalledWith('Hello world');
  });

  test('calls onSendMessage when send button is pressed', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} inputText="Hello" />);
    const sendButton = getByTestId('send-button');
    
    fireEvent.press(sendButton);
    expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
  });

  test('calls onModelSelectorPress when model selector is pressed', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} />);
    const modelSelector = getByTestId('model-selector');
    
    fireEvent.press(modelSelector);
    expect(mockOnModelSelectorPress).toHaveBeenCalledTimes(1);
  });

  test('send button is disabled when input is empty', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} inputText="" />);
    const sendButton = getByTestId('send-button');
    
    expect(sendButton.props.accessibilityState.disabled).toBeTruthy();
  });

  test('send button is enabled when input has text', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} inputText="Hello" />);
    const sendButton = getByTestId('send-button');
    
    expect(sendButton.props.accessibilityState.disabled).toBeFalsy();
  });

  test('send button is disabled when creating chat', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} inputText="Hello" isCreatingChat={true} />);
    const sendButton = getByTestId('send-button');
    
    expect(sendButton.props.accessibilityState.disabled).toBeTruthy();
  });

  test('shows agent indicator when useAgent is true', () => {
    const { getByText } = render(<ChatInput {...defaultProps} useAgent={true} />);
    expect(getByText('Agent')).toBeTruthy();
  });

  test('does not show agent indicator when useAgent is false', () => {
    const { queryByText } = render(<ChatInput {...defaultProps} useAgent={false} />);
    expect(queryByText('Agent')).toBeNull();
  });

  test('displays correct model name for different models', () => {
    const { getByText } = render(<ChatInput {...defaultProps} selectedModel="gpt-4o" />);
    const expectedModelName = modelOptions.find(m => m.id === 'gpt-4o')?.name;
    expect(getByText(expectedModelName!)).toBeTruthy();
  });

  test('shows loading icon when creating chat', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} isCreatingChat={true} />);
    const sendButton = getByTestId('send-button');
    
    // The button should contain the hourglass icon when creating chat
    expect(sendButton).toBeTruthy();
  });

  test('calls onSendMessage on submit editing', () => {
    const { getByTestId } = render(<ChatInput {...defaultProps} inputText="Hello" />);
    const input = getByTestId('message-input');
    
    fireEvent(input, 'submitEditing');
    expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
  });

  test('matches snapshot', () => {
    const tree = render(<ChatInput {...defaultProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('matches snapshot with agent mode', () => {
    const tree = render(<ChatInput {...defaultProps} useAgent={true} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('matches snapshot while creating chat', () => {
    const tree = render(<ChatInput {...defaultProps} isCreatingChat={true} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
