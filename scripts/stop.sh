#!/bin/bash

# GuardAnt Worker Stop Script

echo "🛑 Stopping GuardAnt Worker..."

# Check if running in correct directory
if [ ! -f docker-compose.yml ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the GuardAnt worker directory"
    exit 1
fi

# Stop worker
docker compose down

echo "✅ Worker stopped"