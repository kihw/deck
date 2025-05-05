import { executeAction } from '../../src/server/actions';

describe('Action Executor', () => {
  test('should execute simple action', () => {
    const mockAction = {
      type: 'test',
      payload: { data: 'test' }
    };
    
    const result = executeAction(mockAction);
    expect(result).toBeDefined();
  });

  test('should handle unknown action type', () => {
    const mockAction = {
      type: 'unknown',
      payload: {}
    };
    
    expect(() => executeAction(mockAction)).toThrow();
  });
})