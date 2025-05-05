#!/bin/bash

# push-to-main.sh - Script to push changes directly to main branch
# Usage: ./scripts/push-to-main.sh "Your commit message"

set -e

# Get the commit message
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message"
  echo "Usage: ./scripts/push-to-main.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Ensure we're working with the latest code
echo "📥 Pulling latest changes from main..."
git pull origin main

# Stage all changes
echo "📝 Staging all changes..."
git add .

# Commit changes with the provided message
echo "✅ Committing changes: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Push directly to main
echo "🚀 Pushing to main branch..."
git push origin main

echo "✨ Success! Changes pushed to main branch."
