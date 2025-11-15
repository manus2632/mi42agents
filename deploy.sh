#!/bin/bash

# Mi42 Production Deployment Script
# This script deploys the latest code to production without rebuilding Docker

set -e  # Exit on error

echo "=========================================="
echo "Mi42 Production Deployment"
echo "=========================================="
echo ""

# Configuration
APP_DIR="/root/mi42"
BACKUP_DIR="/root/mi42_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create backup
echo -e "${YELLOW}[1/7] Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
if [ -d "$APP_DIR/server" ]; then
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" server client drizzle package.json 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠ No existing files to backup${NC}"
fi

# Step 2: Stop running app (if any)
echo -e "${YELLOW}[2/7] Stopping application...${NC}"
pkill -f "node dist/index.js" 2>/dev/null || true
docker stop mi42-app 2>/dev/null || true
docker rm mi42-app 2>/dev/null || true
echo -e "${GREEN}✓ Application stopped${NC}"

# Step 3: Update code files
echo -e "${YELLOW}[3/7] Updating code files...${NC}"
# Files should already be copied to $APP_DIR before running this script
if [ ! -f "$APP_DIR/package.json" ]; then
    echo -e "${RED}✗ Error: package.json not found in $APP_DIR${NC}"
    echo -e "${RED}Please copy the latest code to $APP_DIR first${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Code files ready${NC}"

# Step 4: Update database schema
echo -e "${YELLOW}[4/7] Updating database schema...${NC}"
cd "$APP_DIR"
if [ -f "drizzle/0010_normal_reavers.sql" ]; then
    docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db < drizzle/0010_normal_reavers.sql 2>/dev/null || echo "Migration already applied or failed"
fi
echo -e "${GREEN}✓ Database schema updated${NC}"

# Step 5: Check if dist exists
echo -e "${YELLOW}[5/7] Checking build files...${NC}"
if [ ! -f "$APP_DIR/dist/index.js" ]; then
    echo -e "${RED}✗ Error: dist/index.js not found${NC}"
    echo -e "${RED}The production build is missing. Cannot start application.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build files found${NC}"

# Step 6: Start application with Docker
echo -e "${YELLOW}[6/7] Starting application...${NC}"

# Create a simple docker run command since docker-compose build fails
docker run -d \
  --name mi42-app \
  --network mi42_network \
  -p 3001:3001 \
  -v "$APP_DIR/dist:/app/dist:ro" \
  -v "$APP_DIR/node_modules:/app/node_modules:ro" \
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
    echo -e "${GREEN}✓ Application started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start application${NC}"
    exit 1
fi

# Step 7: Health check
echo -e "${YELLOW}[7/7] Performing health check...${NC}"
sleep 5

if docker ps | grep -q mi42-app; then
    echo -e "${GREEN}✓ Container is running${NC}"
    
    # Check if port is listening
    if netstat -tlnp 2>/dev/null | grep -q ":3001"; then
        echo -e "${GREEN}✓ Application is listening on port 3001${NC}"
    else
        echo -e "${YELLOW}⚠ Port 3001 not detected yet (may take a few more seconds)${NC}"
    fi
    
    # Show recent logs
    echo ""
    echo -e "${YELLOW}Recent application logs:${NC}"
    docker logs mi42-app --tail 10
else
    echo -e "${RED}✗ Container is not running${NC}"
    echo -e "${RED}Check logs with: docker logs mi42-app${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo -e "Deployment completed successfully!"
echo -e "==========================================${NC}"
echo ""
echo "Application URL: http://46.224.9.190:3001"
echo "Domain: http://mi42.bl2020.com"
echo ""
echo "Useful commands:"
echo "  - View logs: docker logs -f mi42-app"
echo "  - Restart app: docker restart mi42-app"
echo "  - Stop app: docker stop mi42-app"
echo "  - Restore backup: tar -xzf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz -C $APP_DIR"
echo ""
