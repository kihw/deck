const AuthService = require('../../src/server/services/authService');

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  test('should generate a 4-digit PIN', () => {
    const pin = authService.getPin();
    expect(pin).toMatch(/^\d{4}$/);
  });

  test('should verify correct PIN', async () => {
    const pin = authService.getPin();
    const isValid = await authService.verifyPin(pin);
    expect(isValid).toBe(true);
  });

  test('should reject incorrect PIN', async () => {
    const isValid = await authService.verifyPin('0000');
    expect(isValid).toBe(false);
  });

  test('should generate unique tokens', () => {
    const token1 = authService.generateToken();
    const token2 = authService.generateToken();
    expect(token1).not.toBe(token2);
  });

  test('should verify valid tokens', () => {
    const token = authService.generateToken();
    authService.addConnection(token, 'socket-id');
    expect(authService.verifyToken(token)).toBe(true);
  });

  test('should not verify invalid tokens', () => {
    expect(authService.verifyToken('invalid')).toBe(false);
  });
});