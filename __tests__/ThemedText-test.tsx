import { render } from '@testing-library/react-native';

import { ThemedText } from '@/components/ThemedText';

describe('<ThemedText />', () => {
  test('renders default text correctly', () => {
    const { getByText } = render(<ThemedText>Default text</ThemedText>);
    
    expect(getByText('Default text')).toBeTruthy();
  });

  test('renders title text correctly', () => {
    const { getByText } = render(<ThemedText type="title">Title text</ThemedText>);
    
    expect(getByText('Title text')).toBeTruthy();
  });

  test('renders subtitle text correctly', () => {
    const { getByText } = render(<ThemedText type="subtitle">Subtitle text</ThemedText>);
    
    expect(getByText('Subtitle text')).toBeTruthy();
  });

  test('renders link text correctly', () => {
    const { getByText } = render(<ThemedText type="link">Link text</ThemedText>);
    
    expect(getByText('Link text')).toBeTruthy();
  });

  test('snapshot test for default ThemedText', () => {
    const tree = render(<ThemedText>Snapshot text</ThemedText>).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  test('snapshot test for title ThemedText', () => {
    const tree = render(<ThemedText type="title">Title snapshot</ThemedText>).toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});
