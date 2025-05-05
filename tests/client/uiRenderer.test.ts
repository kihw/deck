import { renderButton, updateButtonState } from '../../src/client/uiRenderer';

describe('UI Renderer', () => {
  test('should render button correctly', () => {
    const mockButton = {
      id: 'test-button',
      label: 'Test Button',
      icon: 'test-icon.png'
    };

    const result = renderButton(mockButton);
    expect(result).toContain(mockButton.label);
    expect(result).toContain(mockButton.icon);
  });

  test('should update button state', () => {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'test-button';

    const newState = {
      active: true,
      color: 'green'
    };

    updateButtonState('test-button', newState);
    
    expect(buttonElement.classList.contains('active')).toBeTruthy();
    expect(buttonElement.style.backgroundColor).toBe('green');
  });
})