#!/bin/bash

# Simple start script for GuardAnt Worker

echo "Starting GuardAnt Worker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file and set your OWNER_EMAIL"
    exit 1
fi

# Check if OWNER_EMAIL is set
source .env
if [ -z "$OWNER_EMAIL" ]; then
    echo "ERROR: OWNER_EMAIL not set in .env file"
    exit 1
fi

# Ask for number of workers
echo ""
echo "How many workers would you like to start? (1-10) [default: 1]:"
read -p "> " WORKER_COUNT

# Validate input
if [ -z "$WORKER_COUNT" ]; then
    WORKER_COUNT=1
elif ! [[ "$WORKER_COUNT" =~ ^[1-9]$|^10$ ]]; then
    echo "Invalid number. Using default: 1"
    WORKER_COUNT=1
fi

# Export hostname for worker ID generation
export HOSTNAME=${HOSTNAME:-$(hostname)}

# Build and start
echo ""
echo "Building worker image..."
docker compose build

echo "Starting $WORKER_COUNT worker(s)..."
docker compose up -d --scale worker=$WORKER_COUNT

echo ""
echo "✅ Started $WORKER_COUNT worker(s)"
echo ""
echo "Check status: docker compose ps"
echo "View logs: docker compose logs -f"