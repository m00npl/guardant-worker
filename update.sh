#!/bin/bash

# GuardAnt Worker Update Script

echo "🔄 GuardAnt Worker Update Script"
echo "================================"

# Check if running in correct directory
if [ ! -f docker-compose.yml ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the GuardAnt worker directory"
    exit 1
fi

# Save current directory
WORKER_DIR=$(pwd)

echo "📍 Worker directory: $WORKER_DIR"
echo ""

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
if ! git pull; then
    echo "❌ Git pull failed"
    echo ""
    echo "If you see 'dubious ownership' error, run:"
    echo "  git config --global --add safe.directory $WORKER_DIR"
    echo ""
    echo "If you see permission errors, run:"
    echo "  sudo chown -R $USER:$USER $WORKER_DIR"
    exit 1
fi

echo "✅ Code updated"
echo ""

# Stop current worker
echo "🛑 Stopping current worker..."
docker compose down

# Rebuild with new code
echo "🔨 Building new worker image..."
docker compose build --no-cache

# Start updated worker
echo "🚀 Starting updated worker..."
docker compose up -d

echo ""
echo "✅ Update complete!"
echo ""
echo "📊 Check status with:"
echo "  docker compose ps"
echo ""
echo "📜 View logs with:"
echo "  docker compose logs -f"