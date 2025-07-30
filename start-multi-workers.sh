#!/bin/bash

# Get hostname and timestamp for unique worker IDs
export HOSTNAME=$(hostname)
export TIMESTAMP=$(date +%s%3N)
export OWNER_EMAIL="moon.pl.kr@gmail.com"
export LOG_LEVEL="info"

echo "🚀 Starting 3 standalone workers..."
echo "Hostname: $HOSTNAME"
echo "Base timestamp: $TIMESTAMP"

# Create key directories
mkdir -p worker1-keys worker2-keys worker3-keys
mkdir -p worker1-cache worker2-cache worker3-cache

# Stop existing workers
docker compose -f docker-compose.multi.yml down

# Start new workers
docker compose -f docker-compose.multi.yml up -d --build

echo "✅ Workers started. Checking status..."
docker compose -f docker-compose.multi.yml ps

echo ""
echo "📋 To view logs:"
echo "docker compose -f docker-compose.multi.yml logs -f"
echo ""
echo "🛑 To stop all workers:"
echo "docker compose -f docker-compose.multi.yml down"