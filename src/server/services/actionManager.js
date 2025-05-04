const { spawn } = require('child_process');
const os = require('os');

class ActionManager {
  constructor() {
    this.buttons = new Map();
    this.initDefaultButtons();
  }

  initDefaultButtons() {
    const defaultButtons = [
      {
        id: 'volume-up',
        label: '🔊',
        type: 'system',
        action: 'volumeUp'
      },
      {
        id: 'volume-down',
        label: '🔉',
        type: 'system',
        action: 'volumeDown'
      },
      {
        id: 'screenshot',
        label: '📸',
        type: 'system',
        action: 'screenshot'
      },
      {
        id: 'open-browser',
        label: '🌐',
        type: 'app',
        action: 'openBrowser'
      }
    ];

    defaultButtons.forEach(button => this.buttons.set(button.id, button));
  }

  getButtonConfigs() {
    return Array.from(this.buttons.values());
  }

  createButton(config) {
    const id = config.id || `button-${Date.now()}`;
    const button = { ...config, id };
    this.buttons.set(id, button);
    return button;
  }

  updateButton(id, config) {
    if (this.buttons.has(id)) {
      const button = { ...config, id };
      this.buttons.set(id, button);
      return button;
    }
    return null;
  }

  deleteButton(id) {
    return this.buttons.delete(id);
  }

  async executeAction(buttonId) {
    const button = this.buttons.get(buttonId);
    if (!button) throw new Error('Button not found');

    switch (button.action) {
      case 'volumeUp':
        return this.changeVolume('+5');
      case 'volumeDown':
        return this.changeVolume('-5');
      case 'screenshot':
        return this.takeScreenshot();
      case 'openBrowser':
        return this.openApp('browser');
      default:
        throw new Error('Unsupported action');
    }
  }

  changeVolume(value) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (platform) {
        case 'win32':
          command = 'nircmd';
          args = ['changesysvolume', value];
          break;
        case 'darwin':
          command = 'osascript';
          args = ['-e', `set volume output volume (output volume of (get volume settings) ${value})`];
          break;
        case 'linux':
          command = 'amixer';
          args = ['set', 'Master', value];
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Volume change failed')));
    });
  }

  takeScreenshot() {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (platform) {
        case 'win32':
          command = 'powershell';
          args = ['-command', 'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("{PRTSC}")'];
          break;
        case 'darwin':
          command = 'screencapture';
          args = ['-i'];
          break;
        case 'linux':
          command = 'scrot';
          args = [];
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Screenshot failed')));
    });
  }

  openApp(app) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (app) {
        case 'browser':
          switch (platform) {
            case 'win32':
              command = 'start';
              args = ['msedge'];
              break;
            case 'darwin':
              command = 'open';
              args = ['-a', 'Safari'];
              break;
            case 'linux':
              command = 'xdg-open';
              args = ['firefox'];
              break;
            default:
              return reject(new Error('Unsupported platform'));
          }
          break;
        default:
          return reject(new Error('Unsupported app'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('App launch failed')));
    });
  }
}

module.exports = ActionManager;