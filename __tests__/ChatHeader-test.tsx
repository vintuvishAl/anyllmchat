import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { ChatHeader } from '@/components/chat/ChatHeader';

describe('<ChatHeader />', () => {
  const mockOnMenuPress = jest.fn();
  const mockOnSearchPress = jest.fn();
  const mockOnNewChatPress = jest.fn();
  const mockOnToggleAgent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    onMenuPress: mockOnMenuPress,
    onSearchPress: mockOnSearchPress,
    onNewChatPress: mockOnNewChatPress,
    useAgent: false,
    onToggleAgent: mockOnToggleAgent,
  };

  test('renders chat header title', () => {
    const { getByText } = render(<ChatHeader {...defaultProps} />);
    expect(getByText('V2 Chat')).toBeTruthy();
  });

  test('renders menu button', () => {
    const { getByTestId } = render(<ChatHeader {...defaultProps} />);
    expect(getByTestId('all-chats-button')).toBeTruthy();
  });

  test('renders add button', () => {
    const { getByTestId } = render(<ChatHeader {...defaultProps} />);
    expect(getByTestId('add-button')).toBeTruthy();
  });

  test('calls onMenuPress when menu button is pressed', () => {
    const { getByTestId } = render(<ChatHeader {...defaultProps} />);
    const menuButton = getByTestId('all-chats-button');
    
    fireEvent.press(menuButton);
    expect(mockOnMenuPress).toHaveBeenCalledTimes(1);
  });

  test('calls onNewChatPress when add button is pressed', () => {
    const { getByTestId } = render(<ChatHeader {...defaultProps} />);
    const addButton = getByTestId('add-button');
    
    fireEvent.press(addButton);
    expect(mockOnNewChatPress).toHaveBeenCalledTimes(1);
  });

  test('works with useAgent enabled', () => {
    const { getByText } = render(<ChatHeader {...defaultProps} useAgent={true} />);
    expect(getByText('V2 Chat')).toBeTruthy();
  });

  test('works with useAgent disabled', () => {
    const { getByText } = render(<ChatHeader {...defaultProps} useAgent={false} />);
    expect(getByText('V2 Chat')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const tree = render(<ChatHeader {...defaultProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
