#!/bin/bash

# GuardAnt Worker Clean Script
# Removes old containers, images, and volumes

echo "🧹 GuardAnt Worker Clean Script"
echo "================================"
echo ""
echo "This will remove:"
echo "- All stopped GuardAnt containers"
echo "- Unused GuardAnt images"
echo "- Orphan containers"
echo ""
echo "Continue? (y/N)"
read -p "> " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Check if running in correct directory
if [ ! -f docker-compose.yml ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the GuardAnt worker directory"
    exit 1
fi

echo ""
echo "🛑 Stopping all containers..."
docker compose down --remove-orphans

echo ""
echo "🗑️  Removing old containers..."
docker container prune -f --filter "label=com.docker.compose.project=guardant-worker"

echo ""
echo "🖼️  Removing unused images..."
docker image prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To start fresh:"
echo "  ./start.sh"