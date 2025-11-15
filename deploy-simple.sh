#!/bin/bash

# Simple Mi42 Deployment - Run TypeScript directly in Docker

set -e

echo "=========================================="
echo "Mi42 Simple Deployment (TypeScript)"
echo "=========================================="

APP_DIR="/root/mi42"

# Stop existing container
echo "[1/3] Stopping existing container..."
docker stop mi42-app 2>/dev/null || true
docker rm mi42-app 2>/dev/null || true
echo "✓ Container stopped"

# Start new container with source files mounted
echo "[2/3] Starting new container..."
docker run -d \
  --name mi42-app \
  --network mi42_network \
  -p 3001:3001 \
  -v "$APP_DIR:/app" \
  -w /app \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATABASE_URL="mysql://mi42_user:mi42_password_2025@mi42-db:3306/mi42_db" \
  -e JWT_SECRET="change_this_secret_key_in_production" \
  -e OAUTH_SERVER_URL="https://api.manus.im" \
  -e VITE_OAUTH_PORTAL_URL="https://auth.manus.im" \
  -e VITE_APP_ID="mi42" \
  -e VITE_APP_TITLE="Mi42" \
  -e VITE_APP_LOGO="/mi42-logo.png" \
  -e OWNER_NAME="Admin" \
  -e BUILT_IN_FORGE_API_URL="https://forge.manus.im" \
  -e VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im" \
  -e OPEN_WEBUI_API_URL="https://maxproxy.bl2020.com/api/chat/completions" \
  -e OPEN_WEBUI_API_KEY="sk-bd621b0666474be1b054b3c5360b3cef" \
  -e OPEN_WEBUI_MODEL="gpt-oss:120b" \
  --restart unless-stopped \
  node:22-alpine \
  sh -c "npm install -g tsx pnpm && pnpm install && tsx server/_core/index.ts"

echo "✓ Container started"

# Health check
echo "[3/3] Waiting for server to start..."
sleep 10

if docker ps | grep -q mi42-app; then
    echo "✓ Container is running"
    echo ""
    echo "Recent logs:"
    docker logs mi42-app --tail 15
    echo ""
    echo "=========================================="
    echo "Deployment completed!"
    echo "=========================================="
    echo "URL: http://46.224.9.190:3001"
    echo ""
    echo "View logs: docker logs -f mi42-app"
else
    echo "✗ Container failed to start"
    docker logs mi42-app
    exit 1
fi
