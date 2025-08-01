#!/bin/bash

# GuardAnt Worker Scale Script

echo "⚖️  GuardAnt Worker Scale Script"
echo "================================"

# Check if running in correct directory
if [ ! -f docker-compose.yml ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the GuardAnt worker directory"
    exit 1
fi

# Get current count
CURRENT=$(docker compose ps --format json 2>/dev/null | jq -r 'select(.Service == "worker") | .Name' | wc -l | tr -d ' ')
if [ -z "$CURRENT" ] || [ "$CURRENT" -eq 0 ]; then
    CURRENT=0
fi

echo "Current workers: $CURRENT"
echo ""
echo "How many workers do you want? (0-10):"
read -p "> " NEW_COUNT

# Validate input
if ! [[ "$NEW_COUNT" =~ ^[0-9]$|^10$ ]]; then
    echo "Invalid number. Please enter 0-10"
    exit 1
fi

if [ "$NEW_COUNT" -eq "$CURRENT" ]; then
    echo "Already running $CURRENT workers. No change needed."
    exit 0
fi

# Load environment
source .env 2>/dev/null || true
export HOSTNAME=${HOSTNAME:-$(hostname)}

# Scale
if [ "$NEW_COUNT" -eq 0 ]; then
    echo "Stopping all workers..."
    docker compose down
else
    echo "Scaling to $NEW_COUNT worker(s)..."
    docker compose up -d --scale worker=$NEW_COUNT --no-recreate
fi

echo ""
echo "✅ Scaled to $NEW_COUNT worker(s)"
echo ""
echo "Check status: docker compose ps"