#!/bin/bash

# GuardAnt Worker Migration Script
# Migrates from old container names to new format

echo "🔄 GuardAnt Worker Migration Script"
echo "==================================="
echo ""
echo "This script will help migrate from old worker format to new format."
echo ""

# Detect old workers
OLD_WORKERS=$(docker ps -a --filter "name=guardant-worker-[0-9]" --format "{{.Names}}" | grep -v "guardant-worker-worker")
OLD_COUNT=$(echo "$OLD_WORKERS" | grep -c "guardant-worker" || echo "0")

if [ "$OLD_COUNT" -eq 0 ]; then
    echo "No old format workers found. Nothing to migrate."
    exit 0
fi

echo "Found $OLD_COUNT old format worker(s):"
echo "$OLD_WORKERS"
echo ""

# Check if they're running
RUNNING_OLD=$(docker ps --filter "name=guardant-worker-[0-9]" --format "{{.Names}}" | grep -v "guardant-worker-worker" | wc -l | tr -d ' ')

echo "Running: $RUNNING_OLD"
echo ""

echo "Would you like to migrate to the new format? (y/N)"
read -p "> " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

# Stop old workers
echo ""
echo "Stopping old workers..."
for worker in $OLD_WORKERS; do
    docker stop $worker
done

# Remove old workers
echo "Removing old containers..."
for worker in $OLD_WORKERS; do
    docker rm $worker
done

# Load environment
source .env 2>/dev/null || true
export HOSTNAME=${HOSTNAME:-$(hostname)}

# Start new workers with same count
echo ""
echo "Starting $OLD_COUNT worker(s) in new format..."
docker compose up -d --scale worker=$OLD_COUNT

echo ""
echo "✅ Migration complete!"
echo ""
echo "Check status: docker compose ps"