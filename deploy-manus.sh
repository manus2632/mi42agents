#!/bin/bash
set -e

echo "🚀 Mi42 Deployment Script (manus user)"
echo "======================================="

# Configuration
PROJECT_DIR="/home/manus/mi42"
OLD_PROJECT_DIR="/root/mi42"

echo ""
echo "📋 Step 1: Copy node_modules from old project (if exists)"
if [ -d "$OLD_PROJECT_DIR/node_modules" ]; then
    sudo cp -r $OLD_PROJECT_DIR/node_modules $PROJECT_DIR/
    sudo chown -R manus:manus $PROJECT_DIR/node_modules
    echo "✅ node_modules copied"
else
    echo "⚠️  No existing node_modules found, will need to install"
fi

echo ""
echo "🔨 Step 2: Build backend (server)"
docker run --rm -v $PROJECT_DIR:/app -w /app node:22-alpine sh -c "
  npx esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:./node_modules/*
"

echo ""
echo "🎨 Step 3: Build frontend (client)"
docker run --rm -v $PROJECT_DIR:/app -w /app node:22-alpine sh -c "
  cd client && npx vite build --outDir ../client-dist
"

echo ""
echo "📁 Step 4: Set correct ownership"
sudo chown -R manus:manus $PROJECT_DIR

echo ""
echo "🔄 Step 5: Update Docker container to use new build location"
# Stop existing container
sudo docker stop mi42-app || true
sudo docker rm mi42-app || true

# Start new container with manus project directory
sudo docker run -d \
  --name mi42-app \
  --network construction-agents_mi42_network \
  -p 3001:3000 \
  -v $PROJECT_DIR/client-dist:/app/client-dist:ro \
  -v $PROJECT_DIR/dist:/app/dist:ro \
  -v $PROJECT_DIR/node_modules:/app/node_modules:ro \
  --env-file $OLD_PROJECT_DIR/.env \
  -w /app \
  node:22-alpine \
  node dist/index.js

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URL: http://46.224.9.190:3001"
echo "🌐 Domain: http://mi42.bl2020.com"
echo ""
echo "📊 Check status:"
echo "  docker ps"
echo "  docker logs -f mi42-app"
