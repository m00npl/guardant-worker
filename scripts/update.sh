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

# Detect current configuration
echo "🔍 Detecting current configuration..."

# Try to detect from current docker compose first
RUNNING_WORKERS=$(docker compose ps --format json 2>/dev/null | jq -r 'select(.Service == "worker") | .Name' | wc -l | tr -d ' ')

# If that fails, look for any guardant-worker containers
if [ -z "$RUNNING_WORKERS" ] || [ "$RUNNING_WORKERS" -eq 0 ]; then
    # Count containers from guardant-worker project
    RUNNING_WORKERS=$(docker ps --filter "label=com.docker.compose.project=guardant-worker" --format "{{.Names}}" | wc -l | tr -d ' ')
fi

# Default to 1 if nothing found
if [ -z "$RUNNING_WORKERS" ] || [ "$RUNNING_WORKERS" -eq 0 ]; then
    RUNNING_WORKERS=1
fi

echo "✅ Detected $RUNNING_WORKERS running worker(s)"

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

# Stop current worker(s)
echo "🛑 Stopping current worker(s)..."
docker compose down --remove-orphans

# Rebuild with new code
echo "🔨 Building new worker image..."
docker compose build --no-cache

# Load environment
source .env 2>/dev/null || true
export HOSTNAME=${HOSTNAME:-$(hostname)}

# Start updated worker(s) with same scale
echo "🚀 Starting $RUNNING_WORKERS worker(s)..."
docker compose up -d --scale worker=$RUNNING_WORKERS

echo ""
echo "✅ Update complete!"
echo ""
echo "Check status with:"
echo "  docker compose ps"
echo ""
echo "View logs with:"
echo "  docker compose logs -f"