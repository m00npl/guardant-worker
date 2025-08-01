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

# Build and start
docker compose build
docker compose up -d

echo "Worker started. Check logs with: docker compose logs -f"