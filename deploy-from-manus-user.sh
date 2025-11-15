#!/bin/bash
set -e

echo "🚀 Mi42 Deployment Script (from manus user)"
echo "============================================"

# Configuration
PROJECT_DIR="/home/manus/mi42"
ROOT_PROJECT_DIR="/root/mi42"

echo ""
echo "📋 Step 1: Copy files from manus user to root project directory"
sudo rsync -av --delete \
  --exclude='node_modules' \
  --exclude='client-dist' \
  --exclude='dist' \
  --exclude='.git' \
  $PROJECT_DIR/ $ROOT_PROJECT_DIR/

echo ""
echo "📦 Step 2: Install dependencies using Docker"
docker run --rm -v $ROOT_PROJECT_DIR:/app -w /app node:22-alpine sh -c "
  npm install -g pnpm && \
  pnpm install
"

echo ""
echo "🔨 Step 3: Build backend (server)"
docker run --rm -v $ROOT_PROJECT_DIR:/app -w /app node:22-alpine sh -c "
  npx esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:./node_modules/*
"

echo ""
echo "🎨 Step 4: Build frontend (client)"
docker run --rm -v $ROOT_PROJECT_DIR:/app -w /app node:22-alpine sh -c "
  cd client && npx vite build --outDir ../client-dist
"

echo ""
echo "🔄 Step 5: Restart Docker containers"
cd $ROOT_PROJECT_DIR
docker restart mi42-app

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URL: http://46.224.9.190:3001"
echo "🌐 Domain: http://mi42.bl2020.com"
echo ""
echo "📊 Check status:"
echo "  docker ps"
echo "  docker logs -f mi42-app"
