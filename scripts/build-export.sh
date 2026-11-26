#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Configuration
ARCHIVES_DIR="archives"
DATE_STR=$(date +%Y-%m-%d)
# Defaults to 'generic' if NEXT_PUBLIC_PLATFORM_NAME is not set
PLATFORM=$(echo "${NEXT_PUBLIC_PLATFORM_NAME:-generic}" | tr '[:upper:]' '[:lower:]')
ZIP_NAME="step-smash-$PLATFORM-$DATE_STR.zip"

echo "🚀 Step Smash Export Tool"
echo "📍 Platform: $PLATFORM"
echo "📅 Date: $DATE_STR"

# Ensure archives directory exists
mkdir -p "$ARCHIVES_DIR"

# 1. Check if we should skip the build step
if [ "$1" == "--no-build" ]; then
    echo "⏭️  Skipping build step, zipping existing 'out' directory..."
else
    echo "📦 Building project..."
    npm run build
fi

# 2. Verify 'out' directory exists
if [ -d "out" ]; then
    echo "🧹 Cleaning build artifacts..."
    
    # Remove the 404 directory as requested for Yandex Games compatibility
    if [ -d "out/404" ]; then
        rm -rf out/404
        echo "✅ Removed out/404 directory."
    fi
    
    echo "🗜️  Creating $ZIP_NAME archive in $ARCHIVES_DIR..."
    
    # Navigate into the out directory to ensure the ZIP contains contents, not the folder itself
    cd out
    zip -r "../$ARCHIVES_DIR/$ZIP_NAME" .
    cd ..
    
    echo "✨ Export successful! Your game is ready at: $ARCHIVES_DIR/$ZIP_NAME"
else
    echo "❌ Error: 'out' directory not found. Did the build fail?"
    exit 1
fi
