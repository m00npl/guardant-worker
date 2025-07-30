#!/bin/bash

# GuardAnt Worker Quick Install Script
# Usage: 
#   Single worker: curl -sSL https://guardant.me/install | OWNER_EMAIL=your@email.com bash
#   Multiple workers: curl -sSL https://guardant.me/install | OWNER_EMAIL=your@email.com WORKER_COUNT=3 bash

set -e

INSTALL_DIR=${INSTALL_DIR:-/opt/guardant-worker}
REGISTRATION_URL=${REGISTRATION_URL:-https://guardant.me/api/public/workers/register}
REGISTRATION_TOKEN=${REGISTRATION_TOKEN:-}
OWNER_EMAIL=${OWNER_EMAIL:-}
WORKER_COUNT=${WORKER_COUNT:-1}
WORKER_NAME=${WORKER_NAME:-}

echo "🚀 GuardAnt Worker Installer"
echo "==========================="
echo ""
echo "Workers to install: $WORKER_COUNT"
echo ""

# Check for required tools
echo "🔍 Checking system requirements..."
MISSING_DEPS=""

if ! command -v docker &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS docker"
fi

if ! command -v git &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS git"
fi

if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
    MISSING_DEPS="$MISSING_DEPS curl"
fi

if [ ! -z "$MISSING_DEPS" ]; then
    echo "❌ Missing required dependencies:$MISSING_DEPS"
    echo ""
    echo "Please install the missing dependencies:"
    echo ""
    if [[ $MISSING_DEPS == *"docker"* ]]; then
        echo "# Install Docker:"
        echo "curl -fsSL https://get.docker.com | sudo sh"
        echo "sudo usermod -aG docker $USER"
        echo ""
    fi
    if [[ $MISSING_DEPS == *"git"* ]]; then
        echo "# Install Git:"
        echo "sudo apt-get update && sudo apt-get install -y git"
        echo ""
    fi
    if [[ $MISSING_DEPS == *"curl"* ]]; then
        echo "# Install curl:"
        echo "sudo apt-get update && sudo apt-get install -y curl"
        echo ""
    fi
    echo "After installing, please run this script again."
    exit 1
fi

echo "✅ All requirements satisfied!"
echo ""

# Detect system and set appropriate install directory
detect_install_location() {
    # Check if running in Docker
    if [ -f /.dockerenv ]; then
        echo "🐳 Detected Docker environment"
        INSTALL_DIR="/app/guardant-worker"
        return 0
    fi
    
    # Check common cloud providers
    if [ -f /etc/cloud/cloud.cfg ]; then
        if grep -q "ubuntu" /etc/os-release 2>/dev/null; then
            echo "☁️  Detected Ubuntu cloud instance"
            INSTALL_DIR="/opt/guardant-worker"
            return 0
        fi
    fi
    
    # Check if running on EC2
    if curl -s -m 2 http://169.254.169.254/latest/meta-data/instance-id >/dev/null 2>&1; then
        echo "🔶 Detected AWS EC2 instance"
        INSTALL_DIR="/opt/guardant-worker"
        return 0
    fi
    
    # Check if running on DigitalOcean
    if [ -f /etc/digitalocean ]; then
        echo "🌊 Detected DigitalOcean droplet"
        INSTALL_DIR="/opt/guardant-worker"
        return 0
    fi
    
    # Check standard Linux systems
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case "$ID" in
            ubuntu|debian)
                echo "🐧 Detected $PRETTY_NAME"
                INSTALL_DIR="/opt/guardant-worker"
                return 0
                ;;
            centos|rhel|fedora)
                echo "🎩 Detected $PRETTY_NAME"
                INSTALL_DIR="/opt/guardant-worker"
                return 0
                ;;
        esac
    fi
    
    # Unknown system
    return 1
}

# Only use provided INSTALL_DIR if explicitly set
if [ -z "${INSTALL_DIR}" ]; then
    if detect_install_location; then
        echo "📍 Using standard location: $INSTALL_DIR"
    else
        # Unknown system - ask for confirmation
        INSTALL_DIR="/opt/guardant-worker"
        echo "⚠️  Could not detect system type"
        echo "📍 Suggested installation location: $INSTALL_DIR"
        echo ""
        echo -n "Do you want to proceed with installation in this directory? (y/N): "
        read CONFIRM < /dev/tty
        
        if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
            echo ""
            echo "❌ Installation cancelled by user"
            echo ""
            echo "To install in a different location, run:"
            echo "  INSTALL_DIR=/your/path curl -sSL https://guardant.me/install | bash"
            exit 0
        fi
    fi
else
    echo "📍 Using custom location: $INSTALL_DIR"
fi

echo ""

# Get worker count if not provided
if [ -z "$WORKER_COUNT" ]; then
    WORKER_COUNT=1
fi

# Validate worker count
if ! [[ "$WORKER_COUNT" =~ ^[0-9]+$ ]] || [ "$WORKER_COUNT" -lt 1 ] || [ "$WORKER_COUNT" -gt 10 ]; then
    echo "❌ Invalid WORKER_COUNT. Must be between 1 and 10"
    exit 1
fi

# Get owner email if not provided
if [ -z "$OWNER_EMAIL" ]; then
    # Read from /dev/tty to work even when piped
    echo -n "📧 Please enter your email address: "
    read OWNER_EMAIL < /dev/tty
    
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

# Check for Docker Compose (both variants)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
else
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
# If multiple workers requested, set up multi-worker configuration
if [ "$WORKER_COUNT" -gt 1 ]; then
    echo ""
    echo "🔧 Setting up $WORKER_COUNT workers..."
    
    # Determine which compose file to use based on server
    HOSTNAME=$(hostname)
    if [ "$HOSTNAME" = "moon.dev" ] || [ "$HOSTNAME" = "moon" ]; then
        # Use host network mode on same server as GuardAnt
        COMPOSE_FILE="docker-compose.multi.yml"
    else
        # Use normal network mode on different servers
        COMPOSE_FILE="docker-compose.blog.yml"
    fi
    
    # Check if multi-worker compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo "⚠️  Multi-worker configuration not found. Using single worker."
        WORKER_COUNT=1
    else
        # Stop any existing workers
        sudo $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE down 2>/dev/null || true
        
        # Set environment for multi-worker
        if [ -n "$WORKER_NAME" ]; then
            export HOSTNAME="$WORKER_NAME"
        else
            export HOSTNAME=$(hostname)
        fi
        export TIMESTAMP=$(date +%s%3N)
        export OWNER_EMAIL
        export LOG_LEVEL=info
        
        # Start multiple workers
        echo "🚀 Starting $WORKER_COUNT workers..."
        sudo $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE up -d --build
        
        echo ""
        echo "✅ Installation complete!"
        echo ""
        echo "📊 Started $WORKER_COUNT workers"
        echo "Next steps:"
        echo "1. Admin will receive notification for: $OWNER_EMAIL"
        echo "2. Approve each worker in GuardAnt dashboard"
        echo "3. Workers will start automatically once approved"
        echo "4. Check logs: cd $INSTALL_DIR && $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs -f"
        echo ""
        echo "Worker location: $INSTALL_DIR"
        exit 0
    fi
fi

# Single worker installation
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Admin will receive notification for: $OWNER_EMAIL"
echo "2. Wait for approval in GuardAnt dashboard"
echo "3. Worker will start automatically once approved"
echo "4. Check logs: cd $INSTALL_DIR && $DOCKER_COMPOSE_CMD logs -f"
echo ""
echo "Worker location: $INSTALL_DIR"
echo "Owner email: $OWNER_EMAIL"