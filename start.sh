#!/bin/bash

# Quick start script for GuardAnt Worker

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating from example..."
    cp .env.example .env
    echo "Please edit .env with your RabbitMQ connection details"
    exit 1
fi

# Load environment
source .env

# Validate required variables
if [ -z "$RABBITMQ_URL" ]; then
    echo "❌ RABBITMQ_URL not set in .env"
    exit 1
fi

# Start worker
echo "🚀 Starting GuardAnt Worker..."
echo "Worker ID: ${WORKER_ID:-worker-1}"
echo "Region: ${WORKER_REGION:-us-east-1}"
echo "RabbitMQ: $RABBITMQ_URL"

docker compose up -d

# Show logs
echo ""
echo "✅ Worker started! Showing logs..."
docker compose logs -f