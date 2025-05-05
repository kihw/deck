# Deck - Web Stream Deck Application

## 🌟 Overview

Deck is an open-source, web-based Stream Deck application that transforms any device into a powerful control surface.

## 🔌 Plugin System

### Introduction

Deck features a robust, dynamic plugin system that allows extending functionality seamlessly.

### Plugin Structure

A typical Deck plugin consists of:
- Metadata
- Initialization method
- Optional unload method
- Actions dictionary

### Example Plugin

```typescript
const ObsPlugin: Plugin = {
  metadata: {
    id: 'obs-plugin',
    name: 'OBS Studio Plugin',
    version: '1.0.0',
    description: 'Control OBS Studio from Deck',
    author: 'Deck Team'
  },

  initialize() {
    // Connection logic
  },

  actions: {
    toggleStream() {
      // Implement stream toggle
    }
  }
};
```

### Plugin Management

- Automatic plugin discovery
- Dynamic loading/unloading
- Configuration management
- Action execution

### Plugin Lifecycle

1. Load from `plugins/` directory
2. Validate plugin structure
3. Initialize plugin
4. Register actions
5. Enable/disable via configuration

### Configuration

Plugins can be configured via `plugin-configs.json`:
- Enable/disable plugins
- Store plugin-specific settings

## Getting Started

### Creating a Plugin

1. Create a TypeScript file in `plugins/`
2. Implement the `Plugin` interface
3. Export default plugin object

### Plugin Development Guidelines

- Use TypeScript
- Implement `metadata` and `initialize()`
- Create an `actions` dictionary
- Optional: Implement `unload()`