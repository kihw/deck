# Deck - Advanced Plugin System 🔌

## Overview

Deck now features a powerful, flexible, and extensible plugin system that allows dynamic loading and configuration of system integrations.

## Plugin System Architecture

### Key Features
- Dynamic plugin loading
- Configuration management
- Lifecycle hooks
- Type-safe plugin interface
- Runtime plugin registration

### Plugin Structure

A Deck plugin consists of:
- Metadata
- Actions
- Initialization method
- Optional unload method
- Configuration validation

#### Example Plugin Structure

```typescript
interface Plugin {
  metadata: {
    id: string;
    name: string;
    version: string;
    description: string;
  };
  
  actions: {
    [actionName: string]: {
      execute(context?: any): Promise<any>;
      validate?(params: any): boolean;
    }
  };

  initialize(config?: any): Promise<void>;
  unload?(): Promise<void>;
}
```

## Included Plugins

### 1. System Monitor Plugin
- Real-time system resource tracking
- CPU and Memory usage monitoring
- Configurable alert thresholds
- Event-based metrics reporting

### 2. Discord Integration Plugin
- Bot connection management
- Message sending capabilities
- Status updates
- Channel interaction

## Configuration

Plugins are configured via `plugins.default.json`:

```json
{
  "system-monitor": {
    "enabled": true,
    "settings": {
      "autoStart": false,
      "interval": 5000
    }
  },
  "discord-integration": {
    "enabled": false,
    "settings": {
      "autoConnect": false
    }
  }
}
```

## Environment Configuration

Use `.env` file to configure plugin behaviors:

```bash
# System Monitor
SYSTEM_MONITOR_INTERVAL=10000
SYSTEM_MONITOR_ALERT_CPU_THRESHOLD=80

# Discord Integration
DISCORD_BOT_TOKEN=your_token
```

## Creating a Custom Plugin

1. Implement the `Plugin` interface
2. Export the plugin as default
3. Place in `src/plugins/`

```typescript
const MyCustomPlugin: Plugin = {
  metadata: {
    id: 'my-plugin',
    name: 'Custom Plugin',
    version: '1.0.0'
  },
  
  actions: {
    customAction: {
      async execute(context) {
        // Plugin logic here
      }
    }
  },

  async initialize(config) {
    // Initialization logic
  },

  async unload() {
    // Cleanup logic
  }
};

export default MyCustomPlugin;
```

## Plugin Lifecycle

1. Registration
2. Configuration Loading
3. Initialization
4. Action Execution
5. Optional Unloading

## Security Considerations

- Plugins are sandboxed
- Configuration validation
- Runtime permission checks
- Secure plugin loading mechanism

## Performance

- Lazy loading
- Minimal overhead
- Configurable resource limits

## Roadmap

- [ ] Plugin marketplace
- [ ] Enhanced security model
- [ ] More built-in plugins
- [ ] Community plugin support

## Contributing

1. Follow plugin interface
2. Write comprehensive tests
3. Document thoroughly
4. Submit pull request

## License

MIT License
