const { spawn, exec } = require('child_process');
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
        id: 'mute',
        label: '🔇',
        type: 'system',
        action: 'mute'
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
      },
      {
        id: 'copy',
        label: '📋',
        type: 'keyboard',
        action: 'copy'
      },
      {
        id: 'paste',
        label: '📄',
        type: 'keyboard',
        action: 'paste'
      },
      {
        id: 'media-play-pause',
        label: '⏯️',
        type: 'media',
        action: 'playPause'
      },
      {
        id: 'media-next',
        label: '⏭️',
        type: 'media',
        action: 'nextTrack'
      },
      {
        id: 'media-previous',
        label: '⏮️',
        type: 'media',
        action: 'previousTrack'
      },
      {
        id: 'lock-screen',
        label: '🔒',
        type: 'system',
        action: 'lockScreen'
      },
      {
        id: 'open-task-manager',
        label: '⚙️',
        type: 'system',
        action: 'openTaskManager'
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
      case 'mute':
        return this.toggleMute();
      case 'screenshot':
        return this.takeScreenshot();
      case 'openBrowser':
        return this.openApp('browser');
      case 'copy':
        return this.keyboardShortcut('copy');
      case 'paste':
        return this.keyboardShortcut('paste');
      case 'playPause':
        return this.mediaControl('play_pause');
      case 'nextTrack':
        return this.mediaControl('next');
      case 'previousTrack':
        return this.mediaControl('previous');
      case 'lockScreen':
        return this.lockScreen();
      case 'openTaskManager':
        return this.openTaskManager();
      case 'customKeyboard':
        return this.executeCustomKeyboardShortcut(button.params);
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
          const adjustment = value.startsWith('+') ? '+5' : '-5';
          command = 'osascript';
          args = ['-e', `set volume output volume (output volume of (get volume settings) ${adjustment})`];
          break;
        case 'linux':
          command = 'amixer';
          args = ['set', 'Master', `${value}%`];
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Volume change failed')));
    });
  }

  toggleMute() {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (platform) {
        case 'win32':
          command = 'nircmd';
          args = ['mutesysvolume', '2'];
          break;
        case 'darwin':
          command = 'osascript';
          args = ['-e', 'set volume with output muted not (output muted of (get volume settings))'];
          break;
        case 'linux':
          command = 'amixer';
          args = ['set', 'Master', 'toggle'];
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Mute toggle failed')));
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

  keyboardShortcut(action) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (platform) {
        case 'win32':
          switch (action) {
            case 'copy':
              command = 'powershell';
              args = ['-command', 'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("^c")'];
              break;
            case 'paste':
              command = 'powershell';
              args = ['-command', 'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("^v")'];
              break;
            default:
              return reject(new Error('Unsupported keyboard action'));
          }
          break;
        case 'darwin':
          switch (action) {
            case 'copy':
              command = 'osascript';
              args = ['-e', 'tell application "System Events" to keystroke "c" using command down'];
              break;
            case 'paste':
              command = 'osascript';
              args = ['-e', 'tell application "System Events" to keystroke "v" using command down'];
              break;
            default:
              return reject(new Error('Unsupported keyboard action'));
          }
          break;
        case 'linux':
          switch (action) {
            case 'copy':
              command = 'xdotool';
              args = ['key', 'ctrl+c'];
              break;
            case 'paste':
              command = 'xdotool';
              args = ['key', 'ctrl+v'];
              break;
            default:
              return reject(new Error('Unsupported keyboard action'));
          }
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Keyboard action failed')));
    });
  }

  mediaControl(action) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (platform) {
        case 'win32':
          switch (action) {
            case 'play_pause':
              command = 'nircmd';
              args = ['sendkeypress', 'pause'];
              break;
            case 'next':
              command = 'nircmd';
              args = ['sendkeypress', 'medianext'];
              break;
            case 'previous':
              command = 'nircmd';
              args = ['sendkeypress', 'mediaprev'];
              break;
            default:
              return reject(new Error('Unsupported media action'));
          }
          break;
        case 'darwin':
          switch (action) {
            case 'play_pause':
              command = 'osascript';
              args = ['-e', 'tell application "System Events" to keystroke space'];
              break;
            case 'next':
              command = 'osascript';
              args = ['-e', 'tell app "iTunes" to next track'];
              break;
            case 'previous':
              command = 'osascript';
              args = ['-e', 'tell app "iTunes" to previous track'];
              break;
            default:
              return reject(new Error('Unsupported media action'));
          }
          break;
        case 'linux':
          switch (action) {
            case 'play_pause':
              command = 'dbus-send';
              args = ['--dest=org.mpris.MediaPlayer2', '/org/mpris/MediaPlayer2', 'org.mpris.MediaPlayer2.Player.PlayPause'];
              break;
            case 'next':
              command = 'dbus-send';
              args = ['--dest=org.mpris.MediaPlayer2', '/org/mpris/MediaPlayer2', 'org.mpris.MediaPlayer2.Player.Next'];
              break;
            case 'previous':
              command = 'dbus-send';
              args = ['--dest=org.mpris.MediaPlayer2', '/org/mpris/MediaPlayer2', 'org.mpris.MediaPlayer2.Player.Previous'];
              break;
            default:
              return reject(new Error('Unsupported media action'));
          }
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Media control failed')));
    });
  }

  lockScreen() {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (platform) {
        case 'win32':
          command = 'rundll32';
          args = ['user32.dll,LockWorkStation'];
          break;
        case 'darwin':
          command = 'osascript';
          args = ['-e', 'tell application "System Events" to keystroke "q" using {command down, control down}'];
          break;
        case 'linux':
          command = 'gnome-screensaver-command';
          args = ['-l'];
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Lock screen failed')));
    });
  }

  openTaskManager() {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      switch (platform) {
        case 'win32':
          command = 'taskmgr';
          args = [];
          break;
        case 'darwin':
          command = 'open';
          args = ['-a', 'Activity Monitor'];
          break;
        case 'linux':
          command = 'gnome-system-monitor';
          args = [];
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Task manager open failed')));
    });
  }

  executeCustomKeyboardShortcut(params) {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command, args;

      if (!params || !params.keys) {
        return reject(new Error('No keys specified for custom keyboard shortcut'));
      }

      switch (platform) {
        case 'win32':
          command = 'powershell';
          args = ['-command', `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("${params.keys}")`];
          break;
        case 'darwin':
          command = 'osascript';
          args = ['-e', `tell application "System Events" to keystroke "${params.keys}"`];
          break;
        case 'linux':
          command = 'xdotool';
          args = ['key', params.keys];
          break;
        default:
          return reject(new Error('Unsupported platform'));
      }

      const process = spawn(command, args);
      process.on('close', code => code === 0 ? resolve() : reject(new Error('Custom keyboard shortcut failed')));
    });
  }
}

module.exports = ActionManager;