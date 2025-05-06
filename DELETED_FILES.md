# Deleted Deprecated Files

This file documents files that were removed during cleanup because they were deprecated, redundant, or no longer used in the project.

## Removed files

### Deprecated Source Files
- `src/client/client.js` - Replaced by `src/client/dist/scripts/main.js`
- `src/server/app.js` - Functionality integrated into `main.js`
- `src/server/routes/index.js` - Routing integrated into `main.js`
- `src/server/websocket/index.js` - WebSocket functionality integrated into `main.js`

### Redundant TypeScript/JavaScript Files
- `src/plugins/obs-control.ts` - Redundant with `src/plugins/ObsPlugin.js` and `src/plugins/obs-advanced.ts`
- `src/plugins/ObsPlugin.ts` - Redundant with `src/plugins/ObsPlugin.js`
- `tests/server/actions.test.ts` - Duplicate of `tests/server/actions.test.js`

### Outdated Configuration Files
- `src/server/config.js` - Replaced by configuration in `main.js`
- `src/server/config/plugin.config.ts` - Replaced by `src/config/plugins.default.json`

### Incomplete/Experimental Files
- `src/server/core/plugin-manager.ts` - Incomplete implementation compared to `src/plugins/PluginLoader.js`
- `src/server/models/plugin.model.ts` - Replaced by types in `src/plugins/types.ts`
- `src/server/plugins/PluginTypes.ts` - Redundant with `src/plugins/types.ts`
- `src/server/middlewares/error-handler.ts` - Error handling integrated into main application
- `tests/plugin-manager.test.js` - Replaced by `tests/plugin-system.test.ts`

### Multiple Version Files
- `src/plugins/icon-manager/index.js` - Redundant with `src/plugins/icon-manager.ts`

### Irrelevant or Stale Tests
- `tests/client/button.test.js` - References files that don't exist in current structure
- `tests/client/configuration.test.js` - Uses classes that don't match current implementation
- `tests/client/plugin.test.js` - Tests class with different API than current implementation
- `tests/client/uiRenderer.test.ts` - References functions that don't match current client structure
