# Changelog

## [Unreleased]

### Added
- Dynamic plugin system with BasePlugin interface
- PluginLoader for managing plugin lifecycle
- ObsPlugin as an example of plugin integration
- Support for OBS WebSocket actions via plugin system

### Changed
- Refactored `src/index.js` to support dynamic plugin loading
- Updated `package.json` to include `obs-websocket-js` dependency

### Features
- Plugins can now:
  - Register custom actions
  - Manage connection states
  - Provide lifecycle methods (initialize, unload)
  - Dynamically extend application functionality

## [1.0.0] - Initial Release
- Initial project setup
- Basic server and client infrastructure
- Core streaming deck functionality