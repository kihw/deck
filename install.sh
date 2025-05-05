#!/bin/bash

# Deck Installation Script

echo "🚀 Installing Deck - Virtual Stream Deck"
echo "--------------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version must be 14 or higher."
    echo "Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
mkdir -p src/client/dist/scripts
mkdir -p src/client/dist/styles

# Set executable permissions
chmod +x src/index.js

# Create global command
echo "🔗 Creating global command..."
npm link

echo ""
echo "✅ Installation completed!"
echo ""
echo "To start Deck, run:"
echo "  deck start"
echo ""
echo "Or:"
echo "  npm start"
echo ""
echo "The application will be accessible at the URL displayed on startup."
echo "Share this URL with devices on your local network."
echo ""