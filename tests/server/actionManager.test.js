const ActionManager = require('../../src/server/services/actionManager');

describe('ActionManager', () => {
  let actionManager;

  beforeEach(() => {
    actionManager = new ActionManager();
  });

  test('should initialize with default buttons', () => {
    const buttons = actionManager.getButtonConfigs();
    expect(buttons.length).toBeGreaterThan(0);
    
    const buttonIds = buttons.map(b => b.id);
    expect(buttonIds).toContain('volume-up');
    expect(buttonIds).toContain('volume-down');
    expect(buttonIds).toContain('screenshot');
    expect(buttonIds).toContain('open-browser');
  });

  test('should create a new button', () => {
    const config = {
      label: 'Test Button',
      type: 'custom',
      action: 'testAction'
    };
    
    const button = actionManager.createButton(config);
    expect(button.id).toBeDefined();
    expect(button.label).toBe('Test Button');
  });

  test('should update an existing button', () => {
    const config = {
      label: 'Updated Button',
      type: 'custom',
      action: 'updatedAction'
    };
    
    const created = actionManager.createButton(config);
    const updated = actionManager.updateButton(created.id, {
      label: 'New Label',
      action: 'newAction'
    });
    
    expect(updated.label).toBe('New Label');
    expect(updated.action).toBe('newAction');
  });

  test('should delete a button', () => {
    const config = {
      label: 'To Delete',
      type: 'custom',
      action: 'deleteMe'
    };
    
    const button = actionManager.createButton(config);
    const success = actionManager.deleteButton(button.id);
    
    expect(success).toBe(true);
    expect(actionManager.updateButton(button.id, {})).toBeNull();
  });
});