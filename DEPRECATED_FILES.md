# Deprecated and Unused Files

This document lists files that are deprecated or unused in the Deck project and can be safely removed to clean up the codebase.

## Deprecated Source Files

1. **src/client/client.js**
   - Replaced by src/client/dist/scripts/main.js which has more comprehensive functionality
   - The newer implementation in main.js has more features and better structure

2. **src/server/app.js**
   - Functionality has been moved to main.js
   - DeckApplication class in main.js now handles server setup and configuration

3. **src/server/routes/index.js**
   - Router configuration is now integrated directly into main.js
   - Contains older, simpler routes compared to the complete implementation in main.js

4. **src/server/websocket/index.js**
   - WebSocket functionality has been integrated into the DeckApplication class in main.js
   - The newer implementation in main.js provides more comprehensive WebSocket handling

## Redundant TypeScript/JavaScript Files

1. **src/plugins/obs-control.ts**
   - Redundant with src/plugins/ObsPlugin.js and src/plugins/obs-advanced.ts
   - Has significantly less functionality than the other implementations

2. **src/plugins/ObsPlugin.ts**
   - Redundant with src/plugins/ObsPlugin.js (JavaScript version)
   - Both files have the same functionality with different syntax

3. **tests/server/actions.test.ts** 
   - Duplicate of tests/server/actions.test.js with less content
   - Tests the same functionality

## Outdated Configuration Files

1. **src/server/config.js**
   - Simple configuration that has been replaced by a more comprehensive approach in main.js
   - The DeckApplication class in main.js now handles configuration loading

2. **src/server/config/plugin.config.ts**
   - Older approach to plugin configuration that has been replaced by src/config/plugins.default.json

## Incomplete/Experimental Files

1. **src/server/core/plugin-manager.ts**
   - Incomplete implementation compared to the main PluginLoader in src/plugins/PluginLoader.js
   - Lacks the robust functionality present in the main implementation

2. **src/server/models/plugin.model.ts**
   - Basic model definition that has been replaced by comprehensive types in src/plugins/types.ts

3. **src/server/plugins/PluginTypes.ts**
   - Redundant with src/plugins/types.ts which has more complete type definitions

4. **src/server/middlewares/error-handler.ts**
   - Error handling is now integrated into the main application

5. **tests/plugin-manager.test.js**
   - Basic test that has been replaced by the more comprehensive tests/plugin-system.test.ts

## Multiple Version Files

1. **src/plugins/icon-manager/index.js**
   - Redundant with src/plugins/icon-manager.ts
   - The TypeScript version appears to be the current one as it aligns with other TypeScript plugins

## Irrelevant or Stale Tests

1. **tests/client/button.test.js**
   - References files that don't exist in the current project structure
   - Tests a renderButton function that doesn't match the current implementation

2. **tests/client/configuration.test.js**
   - Tests a ConfigManager class that doesn't match the current project structure
   - Appears to be for an older version of the client

3. **tests/client/plugin.test.js**
   - Tests a PluginManager class with a different API than the current implementation

4. **tests/client/uiRenderer.test.ts**
   - References functions that don't match the current client structure

## How to Remove These Files

To clean up the codebase, you can run the following git commands:

```bash
# Remove deprecated source files
git rm src/client/client.js
git rm src/server/app.js
git rm src/server/routes/index.js
git rm src/server/websocket/index.js

# Remove redundant TypeScript/JavaScript files
git rm src/plugins/obs-control.ts
git rm src/plugins/ObsPlugin.ts
git rm tests/server/actions.test.ts

# Remove outdated configuration files
git rm src/server/config.js
git rm src/server/config/plugin.config.ts

# Remove incomplete/experimental files
git rm src/server/core/plugin-manager.ts
git rm src/server/models/plugin.model.ts
git rm src/server/plugins/PluginTypes.ts
git rm src/server/middlewares/error-handler.ts
git rm tests/plugin-manager.test.js

# Remove duplicate version files
git rm src/plugins/icon-manager/index.js

# Remove irrelevant or stale tests
git rm tests/client/button.test.js
git rm tests/client/configuration.test.js
git rm tests/client/plugin.test.js
git rm tests/client/uiRenderer.test.ts

# Commit the changes
git commit -m "Remove deprecated and unused files"
git push
```

After removing these files, the codebase will be cleaner and easier to maintain.