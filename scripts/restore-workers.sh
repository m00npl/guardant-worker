#!/bin/bash

# GuardAnt Worker Restore Script
# Quick script to restore specific number of workers

echo "🔄 GuardAnt Worker Restore Script"
echo "================================"

if [ -z "$1" ]; then
    echo "Usage: $0 <number-of-workers>"
    echo "Example: $0 3"
    exit 1
fi

WORKER_COUNT=$1

if ! [[ "$WORKER_COUNT" =~ ^[1-9]$|^10$ ]]; then
    echo "Invalid number. Please enter 1-10"
    exit 1
fi

# Load environment
source .env 2>/dev/null || true
export HOSTNAME=${HOSTNAME:-$(hostname)}

echo "Starting $WORKER_COUNT workers..."
docker compose up -d --scale worker=$WORKER_COUNT

echo ""
echo "✅ Started $WORKER_COUNT workers"
echo ""
echo "Check status: docker compose ps"