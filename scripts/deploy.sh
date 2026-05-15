#!/bin/bash
# scripts/deploy.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Configuration
APP_NAME="KZU-TRAADE"
UPLOADS_DIR="$HOME/uploads"
DATA_DIR="$HOME/data"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "--- Starting Deployment at $(date) ---"
echo "Project directory: $PROJECT_DIR"

# 1. Pull latest changes
echo "Pulling latest code..."
git pull

# 2. Install dependencies
echo "Installing dependencies..."
pnpm install

# 3. Build the project
echo "Building project..."
pnpm build

# 4. Restore Persistence (Symlinks)
echo "Ensuring persistence ordners exist..."
mkdir -p "$UPLOADS_DIR"
mkdir -p "$DATA_DIR"

# Move initial data if it's the first time
if [ ! -f "$DATA_DIR/posts.json" ] && [ -f "$PROJECT_DIR/server/data/posts.json" ]; then
    cp "$PROJECT_DIR/server/data/posts.json" "$DATA_DIR/posts.json"
fi
if [ ! -f "$DATA_DIR/users.json" ] && [ -f "$PROJECT_DIR/server/data/users.json" ]; then
    cp "$PROJECT_DIR/server/data/users.json" "$DATA_DIR/users.json"
fi

# Ensure .output/public exists
mkdir -p "$PROJECT_DIR/.output/public"

# Link Uploads
echo "Linking uploads..."
rm -rf "$PROJECT_DIR/.output/public/uploads"
ln -s "$UPLOADS_DIR" "$PROJECT_DIR/.output/public/uploads"

# Link Data (we also link it in the source for development/runtime consistency)
echo "Linking data..."
rm -rf "$PROJECT_DIR/server/data"
ln -s "$DATA_DIR" "$PROJECT_DIR/server/data"

# 5. Restart application
echo "Restarting application with PM2..."
# Try to reload (zero downtime), if it fails, try to start it fresh
pm2 reload "$APP_NAME" || pm2 start .output/server/index.mjs --name "$APP_NAME"

echo "--- Deployment successful at $(date) ---"
