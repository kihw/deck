# Changelog

## [1.1.1] - 2025-05-05

### Changed
- Refactored application architecture with new main.js entry point
- Improved shutdown handling with proper plugin unloading
- Enhanced startup process with better error handling

### Added
- Comprehensive plugin usage documentation
- Additional error handling for plugin initialization
- Better support for environment variables in plugins

### Fixed
- Fixed outdated references to src/index.js in installation scripts
- Corrected plugin registration process

## [1.1.0] - 2024-05-05

### Added
- Plugin System 🔌
  - BasePlugin abstract class for standardized plugin development
  - PluginLoader for dynamic plugin discovery and management
  - Example ObsPlugin demonstrating WebSocket plugin integration
- Support for dynamic action registration in plugins
- Lifecycle methods for plugins (initialize, unload)

### Updated
- Package dependencies to support plugin ecosystem
- Project structure to accommodate plugin system

### Features
- Extensible architecture for third-party plugins
- Dynamic loading of plugins at runtime
- Centralized plugin management

## [1.0.0] - Initial Release

### Initial Project Setup
- Basic project structure
- Core functionality implementation
