#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting HelixSmash Static Web Export..."

# 1. Run Next.js build (which produces the 'out' directory due to output: 'export')
echo "📦 Building project..."
npm run build

# 2. Verify 'out' directory exists
if [ -d "out" ]; then
    echo "🧹 Cleaning build artifacts..."
    
    # Remove the 404 directory as requested for Yandex Games compatibility
    if [ -d "out/404" ]; then
        rm -rf out/404
        echo "✅ Removed out/404 directory."
    fi
    
    echo "🗜️  Creating game.zip archive..."
    
    # Ensure any existing game.zip is removed to avoid appending
    rm -f game.zip
    
    # Navigate into the out directory to ensure the ZIP contains contents, not the folder itself
    cd out
    zip -r ../game.zip .
    cd ..
    
    echo "✨ Export successful! Your game is ready at: game.zip"
else
    echo "❌ Error: 'out' directory not found. Did the build fail?"
    exit 1
fi
