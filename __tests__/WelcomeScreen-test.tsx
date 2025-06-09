import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { WelcomeScreen } from '@/components/chat/WelcomeScreen';

describe('<WelcomeScreen />', () => {
  const mockOnActionPress = jest.fn();
  const mockOnSuggestedQuestionPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    userName: 'TestUser',
    onActionPress: mockOnActionPress,
    onSuggestedQuestionPress: mockOnSuggestedQuestionPress,
  };

  test('renders welcome message with user name', () => {
    const { getByText } = render(<WelcomeScreen {...defaultProps} />);
    expect(getByText('How can I help you, TestUser?')).toBeTruthy();
  });

  test('renders all action buttons', () => {
    const { getByTestId } = render(<WelcomeScreen {...defaultProps} />);
    expect(getByTestId('action-create')).toBeTruthy();
    expect(getByTestId('action-explore')).toBeTruthy();
    expect(getByTestId('action-code')).toBeTruthy();
    expect(getByTestId('action-learn')).toBeTruthy();
  });

  test('renders all suggested questions', () => {
    const { getByText } = render(<WelcomeScreen {...defaultProps} />);
    expect(getByText('How does AI work?')).toBeTruthy();
    expect(getByText('Are black holes real?')).toBeTruthy();
    expect(getByText("How many Rs are in the word 'strawberry'?")).toBeTruthy();
    expect(getByText('What is the meaning of life?')).toBeTruthy();
  });

  test('calls onActionPress when action button is pressed', () => {
    const { getByTestId } = render(<WelcomeScreen {...defaultProps} />);
    const createButton = getByTestId('action-create');
    
    fireEvent.press(createButton);
    expect(mockOnActionPress).toHaveBeenCalledWith('Create');
  });

  test('calls onSuggestedQuestionPress when suggestion is pressed', () => {
    const { getByTestId } = render(<WelcomeScreen {...defaultProps} />);
    const suggestion = getByTestId('suggestion-0');
    
    fireEvent.press(suggestion);
    expect(mockOnSuggestedQuestionPress).toHaveBeenCalledWith('How does AI work?');
  });

  test('all action buttons are pressable', () => {
    const { getByTestId } = render(<WelcomeScreen {...defaultProps} />);
    
    fireEvent.press(getByTestId('action-create'));
    expect(mockOnActionPress).toHaveBeenCalledWith('Create');
    
    fireEvent.press(getByTestId('action-explore'));
    expect(mockOnActionPress).toHaveBeenCalledWith('Explore');
    
    fireEvent.press(getByTestId('action-code'));
    expect(mockOnActionPress).toHaveBeenCalledWith('Code');
    
    fireEvent.press(getByTestId('action-learn'));
    expect(mockOnActionPress).toHaveBeenCalledWith('Learn');
  });

  test('all suggested questions are pressable', () => {
    const { getByTestId } = render(<WelcomeScreen {...defaultProps} />);
    
    fireEvent.press(getByTestId('suggestion-0'));
    expect(mockOnSuggestedQuestionPress).toHaveBeenCalledWith('How does AI work?');
    
    fireEvent.press(getByTestId('suggestion-1'));
    expect(mockOnSuggestedQuestionPress).toHaveBeenCalledWith('Are black holes real?');
    
    fireEvent.press(getByTestId('suggestion-2'));
    expect(mockOnSuggestedQuestionPress).toHaveBeenCalledWith("How many Rs are in the word 'strawberry'?");
    
    fireEvent.press(getByTestId('suggestion-3'));
    expect(mockOnSuggestedQuestionPress).toHaveBeenCalledWith('What is the meaning of life?');
  });

  test('renders with different user names', () => {
    const { getByText } = render(
      <WelcomeScreen {...defaultProps} userName="Alice" />
    );
    expect(getByText('How can I help you, Alice?')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const tree = render(<WelcomeScreen {...defaultProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
