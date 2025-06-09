import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import NotFoundScreen from '@/app/+not-found';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children, href, ...props }: any) => <div {...props}>{children}</div>,
  Stack: { Screen: ({ options }: any) => <div>{options?.title}</div> },
}));

describe('<NotFoundScreen />', () => {
  test('renders error message', () => {
    const { getByText } = render(<NotFoundScreen />);
    expect(getByText('This screen does not exist.')).toBeTruthy();
  });

  test('renders link to home screen', () => {
    const { getByText } = render(<NotFoundScreen />);
    expect(getByText('Go to home screen!')).toBeTruthy();
  });

  test('link is pressable', () => {
    const { getByText } = render(<NotFoundScreen />);
    const link = getByText('Go to home screen!');
    
    fireEvent.press(link);
    expect(link).toBeTruthy();
  });

  test('has proper styling classes', () => {
    const { getByText } = render(<NotFoundScreen />);
    const title = getByText('This screen does not exist.');
    const link = getByText('Go to home screen!');
    
    expect(title).toBeTruthy();
    expect(link).toBeTruthy();
  });

  test('matches snapshot', () => {
    const tree = render(<NotFoundScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
