#!/bin/bash

# GuardAnt Multi-Worker Setup Script
# Helps set up multiple workers with separate credentials

echo "🐜 GuardAnt Multi-Worker Setup"
echo "=============================="
echo ""
echo "This script helps set up multiple workers with separate RabbitMQ credentials."
echo ""

# Check .env
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

source .env

if [ -z "$OWNER_EMAIL" ]; then
    echo "❌ OWNER_EMAIL not set in .env"
    exit 1
fi

echo "How many workers do you want to set up? (1-10):"
read -p "> " WORKER_COUNT

if ! [[ "$WORKER_COUNT" =~ ^[1-9]$|^10$ ]]; then
    echo "Invalid number. Please enter 1-10"
    exit 1
fi

echo ""
echo "⚠️  IMPORTANT: Each worker needs to be approved separately in the admin panel!"
echo ""
echo "The process will be:"
echo "1. Start worker 1 and wait for approval"
echo "2. Start worker 2 and wait for approval"
echo "3. Continue for all $WORKER_COUNT workers"
echo ""
echo "Continue? (y/N)"
read -p "> " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 0
fi

# Stop all workers
echo ""
echo "🛑 Stopping any existing workers..."
docker compose down --remove-orphans

# Clean up old data
echo "🧹 Cleaning up old data..."
sudo rm -rf .keys/worker-* 2>/dev/null
sudo rm -rf .cache/worker-* 2>/dev/null

# Remove RABBITMQ_URL from main .env if present
if grep -q "^RABBITMQ_URL=" .env; then
    echo "⚠️  Found RABBITMQ_URL in .env - this will cause conflicts!"
    echo "Please remove or comment out RABBITMQ_URL from .env"
    echo ""
    echo "Edit .env and comment the line like this:"
    echo "# RABBITMQ_URL=..."
    echo ""
    echo "Then run this script again."
    exit 1
fi

export HOSTNAME=${HOSTNAME:-$(hostname)}

echo ""
echo "🚀 Starting worker setup..."
echo ""

for i in $(seq 1 $WORKER_COUNT); do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Setting up Worker $i of $WORKER_COUNT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Generate unique worker ID
    WORKER_ID="${HOSTNAME}-${i}-$(date +%s%3N)"
    export WORKER_ID
    
    echo "Worker ID: $WORKER_ID"
    echo ""
    
    # Start this worker only
    echo "Starting worker $i..."
    docker compose up -d --scale worker=$i
    
    echo ""
    echo "⏳ Worker $i started. Please:"
    echo "1. Check the admin panel for new registration"
    echo "2. Approve the worker"
    echo "3. Wait for it to receive RabbitMQ credentials"
    echo ""
    echo "Monitoring logs (press Ctrl+C when ready for next worker)..."
    echo ""
    
    # Show logs until user is ready
    timeout 300 docker compose logs -f worker || true
    
    echo ""
    echo "Is Worker $i approved and running? (y/N)"
    read -p "> " APPROVED
    
    if [[ ! $APPROVED =~ ^[Yy]$ ]]; then
        echo "❌ Setup incomplete. Please approve the worker and try again."
        exit 1
    fi
    
    echo "✅ Worker $i configured"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All $WORKER_COUNT workers configured!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Check status: docker compose ps"
echo "View logs: docker compose logs -f"
echo ""
echo "To add more workers later, run this script again."