#!/bin/bash

# GuardAnt Worker Quick Install Script
# Usage: curl -sSL https://guardant.example.com/install-worker.sh | bash

set -e

INSTALL_DIR=${INSTALL_DIR:-/opt/guardant-worker}
REGISTRATION_URL=${REGISTRATION_URL:-https://guardant.me/api/public/workers/register}
REGISTRATION_TOKEN=${REGISTRATION_TOKEN:-}
OWNER_EMAIL=${OWNER_EMAIL:-}

echo "🚀 GuardAnt Worker Installer"
echo "==========================="
echo ""

# Get owner email if not provided
if [ -z "$OWNER_EMAIL" ]; then
    read -p "📧 Please enter your email address: " OWNER_EMAIL
    
    # Basic email validation
    if ! echo "$OWNER_EMAIL" | grep -qE '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'; then
        echo "❌ Invalid email format"
        exit 1
    fi
fi

echo "Owner email: $OWNER_EMAIL"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ All prerequisites met"

# Create installation directory
echo "Creating installation directory..."
sudo mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Clone worker repository
echo "Downloading GuardAnt Worker..."
if [ -d ".git" ]; then
    echo "Updating existing installation..."
    sudo git pull
else
    sudo git clone https://github.com/m00npl/guardant-worker.git .
fi

# Set registration config
echo "Configuring registration..."
sudo tee bootstrap.env > /dev/null <<EOF
REGISTRATION_URL=$REGISTRATION_URL
REGISTRATION_TOKEN=$REGISTRATION_TOKEN
OWNER_EMAIL=$OWNER_EMAIL
EOF

# Run bootstrap
echo "Starting bootstrap process..."
sudo docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $INSTALL_DIR:/app \
    -w /app \
    --env-file bootstrap.env \
    oven/bun:1 \
    bun run src/bootstrap.ts

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Admin will receive notification for: $OWNER_EMAIL"
echo "2. Wait for approval in GuardAnt dashboard"
echo "3. Worker will start automatically once approved"
echo "4. Check logs: cd $INSTALL_DIR && docker-compose logs -f"
echo ""
echo "Worker location: $INSTALL_DIR"
echo "Owner email: $OWNER_EMAIL"