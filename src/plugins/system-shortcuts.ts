import { Plugin, PluginAction } from './types';
import { exec } from 'child_process';
import { platform } from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

type ShortcutDefinition = {
  name: string;
  description?: string;
  windows: string;
  macos: string;
  linux: string;
};

class SystemShortcutsPlugin implements Plugin {
  metadata = {
    id: 'system-shortcuts',
    name: 'System Shortcuts',
    version: '1.0.0',
    description: 'Cross-platform system shortcuts and hotkeys',
    author: 'Deck Team'
  };

  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private currentPlatform: 'windows' | 'macos' | 'linux';

  constructor() {
    // Déterminer la plateforme actuelle
    const osType = platform();
    this.currentPlatform = osType === 'win32' 
      ? 'windows' 
      : osType === 'darwin' 
        ? 'macos' 
        : 'linux';
    
    // Initialiser quelques raccourcis par défaut
    this.registerDefaultShortcuts();
  }

  private registerDefaultShortcuts() {
    const defaultShortcuts: { [key: string]: ShortcutDefinition } = {
      'screenshot': {
        name: 'Screenshot',
        description: 'Capture d\'écran complète',
        windows: 'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\\"{PRTSC}\\")"',
        macos: 'screencapture -x ~/Desktop/screenshot-$(date +%Y%m%d-%H%M%S).png',
        linux: 'gnome-screenshot || scrot ~/Pictures/screenshot-$(date +%Y%m%d-%H%M%S).png'
      },
      'lock-screen': {
        name: 'Lock Screen',
        description: 'Verrouiller l\'écran',
        windows: 'rundll32.exe user32.dll,LockWorkStation',
        macos: 'pmset displaysleepnow',
        linux: 'gnome-screensaver-command -l || xdg-screensaver lock || loginctl lock-session'
      },
      'app-switcher': {
        name: 'App Switcher',
        description: 'Basculer entre les applications',
        windows: 'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\\"%{TAB}\\")"',
        macos: 'osascript -e \'tell application "System Events" to key code 48 using {command down}\'',
        linux: 'xdotool key alt+Tab'
      },
      'sleep': {
        name: 'Sleep',
        description: 'Mettre l\'ordinateur en veille',
        windows: 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0',
        macos: 'pmset sleepnow',
        linux: 'systemctl suspend || dbus-send --system --print-reply --dest="org.freedesktop.UPower" /org/freedesktop/UPower org.freedesktop.UPower.Suspend'
      }
    };

    // Enregistrer les raccourcis par défaut
    Object.entries(defaultShortcuts).forEach(([id, definition]) => {
      this.shortcuts.set(id, definition);
    });
  }

  actions: Record<string, PluginAction> = {
    executeShortcut: {
      id: 'execute-shortcut',
      name: 'Execute Shortcut',
      description: 'Execute a predefined system shortcut',
      async execute(context: { shortcutId: string }) {
        try {
          const { shortcutId } = context;
          const shortcut = this.shortcuts.get(shortcutId);
          
          if (!shortcut) {
            throw new Error(`Shortcut "${shortcutId}" not found`);
          }

          // Obtenir la commande pour la plateforme actuelle
          const command = shortcut[this.currentPlatform];
          if (!command) {
            throw new Error(`Shortcut "${shortcutId}" is not supported on ${this.currentPlatform}`);
          }

          // Exécuter la commande
          const { stdout, stderr } = await execAsync(command);
          
          return {
            success: true,
            shortcut: shortcut.name,
            platform: this.currentPlatform,
            output: stdout || 'Command executed successfully'
          };
        } catch (error) {
          console.error('Error executing shortcut:', error);
          throw new Error(`Shortcut execution failed: ${error.message}`);
        }
      }
    },

    registerShortcut: {
      id: 'register-shortcut',
      name: 'Register Custom Shortcut',
      description: 'Register a new custom shortcut',
      async execute(context: { 
        id: string;
        name: string;
        description?: string;
        windows: string;
        macos: string;
        linux: string;
      }) {
        try {
          const { id, ...definition } = context;
          
          if (!id || !definition.name || !definition.windows || !definition.macos || !definition.linux) {
            throw new Error('Incomplete shortcut definition');
          }

          this.shortcuts.set(id, definition);
          
          return { 
            success: true, 
            message: `Shortcut "${definition.name}" registered successfully`,
            id
          };
        } catch (error) {
          console.error('Error registering shortcut:', error);
          throw new Error(`Failed to register shortcut: ${error.message}`);
        }
      }
    },

    listShortcuts: {
      id: 'list-shortcuts',
      name: 'List Available Shortcuts',
      description: 'Get a list of all available shortcuts',
      async execute() {
        try {
          const shortcuts = Array.from(this.shortcuts.entries()).map(([id, definition]) => ({
            id,
            name: definition.name,
            description: definition.description,
            supportedPlatforms: {
              windows: !!definition.windows,
              macos: !!definition.macos,
              linux: !!definition.linux
            }
          }));
          
          return { 
            shortcuts,
            currentPlatform: this.currentPlatform
          };
        } catch (error) {
          console.error('Error listing shortcuts:', error);
          throw new Error(`Failed to list shortcuts: ${error.message}`);
        }
      }
    },

    sendKeys: {
      id: 'send-keys',
      name: 'Send Keyboard Keys',
      description: 'Send specific keyboard keys to the system',
      async execute(context: { keys: string }) {
        try {
          const { keys } = context;
          
          if (!keys) {
            throw new Error('No keys specified');
          }

          let command: string;
          
          switch (this.currentPlatform) {
            case 'windows':
              command = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\\"${keys}\\")"`;
              break;
            case 'macos':
              command = `osascript -e 'tell application "System Events" to keystroke "${keys}"'`;
              break;
            case 'linux':
              command = `xdotool type "${keys}"`;
              break;
            default:
              throw new Error(`Unsupported platform: ${this.currentPlatform}`);
          }

          await execAsync(command);
          
          return { 
            success: true, 
            message: `Keys sent: "${keys}"`,
            platform: this.currentPlatform
          };
        } catch (error) {
          console.error('Error sending keys:', error);
          throw new Error(`Failed to send keys: ${error.message}`);
        }
      }
    }
  };

  helpers = {
    getCurrentPlatform: () => this.currentPlatform,
    
    getShortcut: (id: string) => this.shortcuts.get(id),
    
    getCommandForPlatform: (shortcutId: string, platform?: 'windows' | 'macos' | 'linux') => {
      const shortcut = this.shortcuts.get(shortcutId);
      if (!shortcut) return null;
      
      const targetPlatform = platform || this.currentPlatform;
      return shortcut[targetPlatform] || null;
    }
  };

  async initialize(config?: Record<string, any>): Promise<void> {
    if (config?.customShortcuts) {
      // Enregistrer les raccourcis personnalisés
      for (const [id, definition] of Object.entries(config.customShortcuts)) {
        this.shortcuts.set(id, definition as ShortcutDefinition);
      }
    }
    
    console.log(`System Shortcuts initialized on ${this.currentPlatform} platform`);
    console.log(`Available shortcuts: ${this.shortcuts.size}`);
  }

  async unload(): Promise<void> {
    this.shortcuts.clear();
    console.log('System Shortcuts plugin unloaded');
  }
}

export default new SystemShortcutsPlugin();
