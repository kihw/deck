import { renderButton } from '../../src/client/components/button';

describe('Button Component', () => {
  test('renders button correctly', () => {
    const button = renderButton({
      label: 'Test Button',
      icon: 'test-icon.svg',
      action: 'testAction'
    });
    
    expect(button).toHaveTextContent('Test Button');
    expect(button.querySelector('img').src).toContain('test-icon.svg');
  });

  test('handles click event', () => {
    const mockAction = jest.fn();
    const button = renderButton({
      label: 'Click Me',
      action: mockAction
    });

    button.click();
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});