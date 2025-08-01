#!/bin/bash

# GuardAnt Multi-Worker Start Script
# Starts multiple workers with proper scaling

echo "🐜 GuardAnt Multi-Worker Start"
echo "=============================="

# Check parameters
if [ -z "$1" ]; then
    echo "Usage: $0 <number-of-workers>"
    echo "Example: $0 3"
    exit 1
fi

WORKER_COUNT=$1

if ! [[ "$WORKER_COUNT" =~ ^[1-9]$|^10$ ]]; then
    echo "❌ Invalid number. Please enter 1-10"
    exit 1
fi

# Check .env
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

# Load environment
source .env

if [ -z "$OWNER_EMAIL" ]; then
    echo "❌ OWNER_EMAIL not set in .env"
    exit 1
fi

# Check for conflicting RABBITMQ_URL
if grep -q "^RABBITMQ_URL=" .env; then
    echo "⚠️  WARNING: RABBITMQ_URL found in .env"
    echo "This may cause conflicts if workers need individual credentials."
    echo ""
fi

# Stop existing workers
echo ""
echo "🛑 Stopping any existing workers..."
docker compose down --remove-orphans

# Set worker ID pattern for auto-generation
export WORKER_ID="${HOSTNAME:-worker}-{n}"
echo ""
echo "📋 Worker ID pattern: $WORKER_ID"

# Start workers
echo ""
echo "🚀 Starting $WORKER_COUNT worker(s)..."
docker compose up -d --scale worker=$WORKER_COUNT

# Show status
echo ""
echo "✅ Started $WORKER_COUNT worker(s)"
echo ""
echo "📊 Container status:"
docker compose ps
echo ""
echo "📜 View logs:"
echo "  All workers: docker compose logs -f"
echo "  Specific worker: docker compose logs -f worker-1"
echo ""
echo "⚠️  Note: Each worker will register separately with the admin panel."
echo "Make sure to approve each one if not already approved."