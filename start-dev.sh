#!/bin/bash

# Mi42 Development Server Starter (runs TypeScript directly without build)
# This script uses tsx to execute TypeScript files directly

set -e

echo "Starting Mi42 Development Server..."

# Install tsx if not present
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Please install Node.js first."
    exit 1
fi

# Set environment variables
export NODE_ENV=production
export PORT=3001
export DATABASE_URL="mysql://mi42_user:mi42_password_2025@localhost:3307/mi42_db"
export JWT_SECRET="change_this_secret_key_in_production"
export OAUTH_SERVER_URL="https://api.manus.im"
export VITE_OAUTH_PORTAL_URL="https://auth.manus.im"
export VITE_APP_ID="mi42"
export VITE_APP_TITLE="Mi42"
export VITE_APP_LOGO="/mi42-logo.png"
export OWNER_NAME="Admin"
export BUILT_IN_FORGE_API_URL="https://forge.manus.im"
export VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
export OPEN_WEBUI_API_URL="https://maxproxy.bl2020.com/api/chat/completions"
export OPEN_WEBUI_API_KEY="sk-bd621b0666474be1b054b3c5360b3cef"
export OPEN_WEBUI_MODEL="gpt-oss:120b"

# Run with tsx (TypeScript executor)
echo "Installing tsx..."
npm install -g tsx 2>/dev/null || true

echo "Starting server with tsx..."
tsx server/_core/index.ts
