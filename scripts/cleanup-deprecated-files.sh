#!/bin/bash

# Cleanup Script for Deprecated and Unused Files
# This script removes files that have been identified as deprecated or unused in the project.
# See DEPRECATED_FILES.md for more details.

echo "🧹 Starting cleanup of deprecated and unused files..."

# Function to remove a file safely
remove_file() {
  if [ -f "$1" ]; then
    echo "Removing: $1"
    rm "$1"
  else
    echo "Warning: $1 not found, skipping..."
  fi
}

# Remove deprecated source files
remove_file "src/client/client.js"
remove_file "src/server/app.js"
remove_file "src/server/routes/index.js"
remove_file "src/server/websocket/index.js"

# Remove redundant TypeScript/JavaScript files
remove_file "src/plugins/obs-control.ts"
remove_file "src/plugins/ObsPlugin.ts"
remove_file "tests/server/actions.test.ts"

# Remove outdated configuration files
remove_file "src/server/config.js"
remove_file "src/server/config/plugin.config.ts"

# Remove incomplete/experimental files
remove_file "src/server/core/plugin-manager.ts"
remove_file "src/server/models/plugin.model.ts"
remove_file "src/server/plugins/PluginTypes.ts"
remove_file "src/server/middlewares/error-handler.ts"
remove_file "tests/plugin-manager.test.js"

# Remove duplicate version files
remove_file "src/plugins/icon-manager/index.js"

# Remove irrelevant or stale tests
remove_file "tests/client/button.test.js"
remove_file "tests/client/configuration.test.js"
remove_file "tests/client/plugin.test.js"
remove_file "tests/client/uiRenderer.test.ts"

echo "✅ Cleanup completed!"
echo ""
echo "To commit these changes, run:"
echo "  git add -A"
echo "  git commit -m \"Remove deprecated and unused files\""
echo "  git push"
