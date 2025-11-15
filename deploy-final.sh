#!/bin/bash

# Mi42 Final Deployment - Use existing node_modules and dist

set -e

echo "=========================================="
echo "Mi42 Final Deployment"
echo "=========================================="

APP_DIR="/root/mi42"

# Stop existing container
echo "[1/4] Stopping existing container..."
docker stop mi42-app 2>/dev/null || true
docker rm mi42-app 2>/dev/null || true
echo "✓ Container stopped"

# Check if node_modules exists
echo "[2/4] Checking dependencies..."
if [ ! -d "$APP_DIR/node_modules" ]; then
    echo "✗ node_modules not found!"
    echo "Please copy node_modules to $APP_DIR first"
    exit 1
fi
echo "✓ Dependencies found"

# Check if dist exists, if not use old one
echo "[3/4] Checking build files..."
if [ ! -f "$APP_DIR/dist/index.js" ]; then
    echo "✗ dist/index.js not found!"
    exit 1
fi
echo "✓ Build files found"

# Start container with existing files
echo "[4/4] Starting application..."
docker run -d \
  --name mi42-app \
  --network mi42_network \
  -p 3001:3001 \
  -v "$APP_DIR/dist:/app/dist:ro" \
  -v "$APP_DIR/node_modules:/app/node_modules:ro" \
  -v "$APP_DIR/package.json:/app/package.json:ro" \
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
  node /app/dist/index.js

if [ $? -eq 0 ]; then
    echo "✓ Container started"
else
    echo "✗ Failed to start container"
    exit 1
fi

# Health check
echo ""
echo "Waiting for server to start..."
sleep 5

if docker ps | grep -q mi42-app; then
    echo "✓ Container is running"
    
    # Check logs
    echo ""
    echo "Recent logs:"
    docker logs mi42-app --tail 10
    
    echo ""
    echo "=========================================="
    echo "Deployment completed!"
    echo "=========================================="
    echo "URL: http://46.224.9.190:3001"
    echo "Domain: http://mi42.bl2020.com"
    echo ""
    echo "Test login:"
    echo "  Username: admin"
    echo "  Password: Admin2025!"
    echo ""
    echo "Commands:"
    echo "  - View logs: docker logs -f mi42-app"
    echo "  - Restart: docker restart mi42-app"
else
    echo "✗ Container not running"
    docker logs mi42-app
    exit 1
fi
