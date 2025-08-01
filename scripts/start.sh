#!/bin/bash

# GuardAnt Worker Start Script with Interactive Configuration

echo "🐜 GuardAnt Worker Start"
echo "======================="
echo ""

# Function to update or add variable in .env
update_env_var() {
    local key=$1
    local value=$2
    if grep -q "^${key}=" .env; then
        # Update existing
        sed -i "s|^${key}=.*|${key}=${value}|" .env
    else
        # Add new
        echo "${key}=${value}" >> .env
    fi
}

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file and set your OWNER_EMAIL first"
    exit 1
fi

# Load current environment
source .env

# Check required OWNER_EMAIL
if [ -z "$OWNER_EMAIL" ]; then
    echo "❌ OWNER_EMAIL not set in .env"
    echo "Please set your email address first."
    exit 1
fi

echo "📧 Owner Email: $OWNER_EMAIL"
echo ""

# Worker Name Configuration
if [ -n "$WORKER_ID" ]; then
    echo "📋 Current Worker ID pattern: $WORKER_ID"
    echo "Keep this pattern? (Y/n)"
    read -p "> " KEEP_ID
    if [[ $KEEP_ID =~ ^[Nn]$ ]]; then
        WORKER_ID=""
    fi
fi

if [ -z "$WORKER_ID" ]; then
    echo "Enter worker name pattern (use {n} for number):"
    echo "Examples: worker-{n}, myserver-worker-{n}, prod-{n}"
    read -p "> " NEW_WORKER_ID
    if [ -z "$NEW_WORKER_ID" ]; then
        WORKER_ID="${HOSTNAME:-worker}-{n}"
        echo "Using default: $WORKER_ID"
    else
        WORKER_ID="$NEW_WORKER_ID"
    fi
    update_env_var "WORKER_ID" "$WORKER_ID"
fi

# Worker Count Configuration
if [ -n "$WORKER_COUNT" ]; then
    echo ""
    echo "🔢 Current worker count: $WORKER_COUNT"
    echo "Keep this count? (Y/n)"
    read -p "> " KEEP_COUNT
    if [[ $KEEP_COUNT =~ ^[Nn]$ ]]; then
        WORKER_COUNT=""
    fi
fi

if [ -z "$WORKER_COUNT" ]; then
    echo ""
    echo "How many workers do you want to run? (1-10):"
    read -p "> " NEW_COUNT
    if ! [[ "$NEW_COUNT" =~ ^[1-9]$|^10$ ]]; then
        echo "Invalid number. Using default: 1"
        WORKER_COUNT=1
    else
        WORKER_COUNT=$NEW_COUNT
    fi
    update_env_var "WORKER_COUNT" "$WORKER_COUNT"
fi

# Check for RABBITMQ_URL warning
if grep -q "^RABBITMQ_URL=" .env; then
    echo ""
    echo "⚠️  WARNING: RABBITMQ_URL is set in .env"
    echo "This will prevent workers from getting individual credentials."
    echo "Comment it out? (y/N)"
    read -p "> " COMMENT_RABBITMQ
    if [[ $COMMENT_RABBITMQ =~ ^[Yy]$ ]]; then
        sed -i 's/^RABBITMQ_URL=/#RABBITMQ_URL=/' .env
        echo "✅ RABBITMQ_URL commented out"
    fi
fi

# Show summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Configuration Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Worker Pattern: $WORKER_ID"
echo "Worker Count: $WORKER_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Continue? (Y/n)"
read -p "> " CONFIRM

if [[ $CONFIRM =~ ^[Nn]$ ]]; then
    echo "❌ Start cancelled"
    exit 0
fi

# Stop any existing workers
echo ""
echo "🛑 Stopping any existing workers..."
docker compose down --remove-orphans

# Export variables for docker-compose
export WORKER_ID
export WORKER_COUNT
export HOSTNAME=${HOSTNAME:-$(hostname)}

# Build if needed
if [ ! -z "$(docker images -q guardant-worker-worker 2> /dev/null)" ]; then
    echo ""
    echo "🔨 Image already exists. Rebuild? (y/N)"
    read -p "> " REBUILD
    if [[ $REBUILD =~ ^[Yy]$ ]]; then
        echo "Building worker image..."
        docker compose build
    fi
else
    echo ""
    echo "🔨 Building worker image..."
    docker compose build
fi

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
echo "  Specific worker: docker compose logs -f worker"
echo ""
echo "⚠️  Note: Each worker needs to be approved in the admin panel."