#!/bin/bash

set -e

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         🐜 GuardAnt Worker Auto-Installer 🐜         ║"
echo "║          with Automatic Location Detection           ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Sprawdź czy Docker jest zainstalowany
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Sprawdź czy Docker Compose jest zainstalowany
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose first"
    exit 1
fi

# Pobierz dane połączenia
echo -e "${YELLOW}📡 Connection Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Redis URL
if [ -z "$REDIS_URL" ]; then
    echo -n "Enter Redis URL (e.g., redis://guardant.me:6379): "
    read REDIS_URL
fi

# RabbitMQ URL
if [ -z "$RABBITMQ_URL" ]; then
    echo -n "Enter RabbitMQ URL (e.g., amqp://user:pass@guardant.me:5672): "
    read RABBITMQ_URL
fi

# Test połączenia
echo -e "\n${YELLOW}🔍 Testing connections...${NC}"

# Test Redis
REDIS_HOST=$(echo $REDIS_URL | sed -e 's/redis:\/\///' -e 's/:.*$//')
REDIS_PORT=$(echo $REDIS_URL | sed -e 's/.*://' -e 's/\/.*//')
if nc -z -w2 $REDIS_HOST $REDIS_PORT 2>/dev/null; then
    echo -e "${GREEN}✅ Redis connection OK${NC}"
else
    echo -e "${RED}❌ Cannot connect to Redis at $REDIS_HOST:$REDIS_PORT${NC}"
    echo "Please check your Redis URL and try again"
    exit 1
fi

# Test RabbitMQ
RABBITMQ_HOST=$(echo $RABBITMQ_URL | sed -e 's/amqp:\/\///' -e 's/.*@//' -e 's/:.*$//')
RABBITMQ_PORT=$(echo $RABBITMQ_URL | sed -e 's/.*://' -e 's/\/.*//')
if nc -z -w2 $RABBITMQ_HOST $RABBITMQ_PORT 2>/dev/null; then
    echo -e "${GREEN}✅ RabbitMQ connection OK${NC}"
else
    echo -e "${RED}❌ Cannot connect to RabbitMQ at $RABBITMQ_HOST:$RABBITMQ_PORT${NC}"
    echo "Please check your RabbitMQ URL and try again"
    exit 1
fi

# Wykryj lokalizację
echo -e "\n${YELLOW}🌍 Detecting server location...${NC}"

# Spróbuj wykryć przez publiczne IP
PUBLIC_IP=$(curl -s https://api.ipify.org)
LOCATION_DATA=$(curl -s "http://ip-api.com/json/${PUBLIC_IP}")

if [ $? -eq 0 ] && [ -n "$LOCATION_DATA" ]; then
    COUNTRY=$(echo $LOCATION_DATA | jq -r '.country // "Unknown"')
    CITY=$(echo $LOCATION_DATA | jq -r '.city // "Unknown"')
    CONTINENT=$(echo $LOCATION_DATA | jq -r '.continent // "Unknown"' | tr '[:upper:]' '[:lower:]')
    
    echo -e "${GREEN}✅ Detected location:${NC}"
    echo "   Continent: $CONTINENT"
    echo "   Country: $COUNTRY"
    echo "   City: $CITY"
    echo "   Public IP: $PUBLIC_IP"
else
    echo -e "${YELLOW}⚠️ Could not detect location automatically${NC}"
    echo "Worker will use auto-detection at runtime"
fi

# Utwórz katalog dla workera
WORKER_DIR="/opt/guardant-worker"
echo -e "\n${YELLOW}📁 Creating worker directory...${NC}"
sudo mkdir -p $WORKER_DIR
cd $WORKER_DIR

# Utwórz docker-compose.yml
echo -e "${YELLOW}📝 Creating docker-compose.yml...${NC}"
cat > docker-compose.yml << EOF
version: '3.8'

services:
  guardant-worker:
    image: guardant/worker:auto-latest
    container_name: guardant-worker-auto
    restart: unless-stopped
    environment:
      - REDIS_URL=${REDIS_URL}
      - RABBITMQ_URL=${RABBITMQ_URL}
      - NODE_ENV=production
      - LOG_LEVEL=info
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    network_mode: host
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3334/health"]
      interval: 30s
      timeout: 3s
      retries: 3
EOF

# Utwórz .env file
echo -e "${YELLOW}📝 Creating .env file...${NC}"
cat > .env << EOF
REDIS_URL=${REDIS_URL}
RABBITMQ_URL=${RABBITMQ_URL}
# Worker will auto-detect location
# Override if needed:
# WORKER_CONTINENT=europe
# WORKER_REGION=north
# WORKER_COUNTRY=poland
# WORKER_CITY=warsaw
EOF

# Pull najnowszy obraz
echo -e "\n${YELLOW}🐳 Pulling Docker image...${NC}"
docker pull guardant/worker:auto-latest || {
    echo -e "${YELLOW}⚠️ Could not pull image, building locally...${NC}"
    
    # Pobierz kod źródłowy
    git clone https://github.com/m00npl/guardant.git /tmp/guardant-build
    cd /tmp/guardant-build/guardant-worker-standalone
    
    # Zbuduj obraz
    docker build -f Dockerfile.auto -t guardant/worker:auto-latest .
    
    cd $WORKER_DIR
    rm -rf /tmp/guardant-build
}

# Uruchom workera
echo -e "\n${YELLOW}🚀 Starting worker...${NC}"
docker-compose up -d

# Czekaj na start
echo -e "${YELLOW}⏳ Waiting for worker to start...${NC}"
sleep 5

# Sprawdź status
if docker ps | grep -q guardant-worker-auto; then
    echo -e "${GREEN}✅ Worker is running!${NC}"
    
    # Pokaż logi
    echo -e "\n${YELLOW}📋 Worker logs:${NC}"
    docker-compose logs --tail=20
    
    # Pokaż wykrytą lokalizację z logów
    DETECTED_LOCATION=$(docker-compose logs | grep "Worker Location:" | tail -1)
    if [ -n "$DETECTED_LOCATION" ]; then
        echo -e "\n${GREEN}✅ Worker registered with location:${NC}"
        echo "$DETECTED_LOCATION"
    fi
else
    echo -e "${RED}❌ Worker failed to start${NC}"
    echo -e "${YELLOW}Check logs:${NC}"
    docker-compose logs
    exit 1
fi

# Utwórz systemd service
echo -e "\n${YELLOW}🔧 Creating systemd service...${NC}"
sudo cat > /etc/systemd/system/guardant-worker.service << EOF
[Unit]
Description=GuardAnt Worker with Auto-Location
After=docker.service
Requires=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
WorkingDirectory=$WORKER_DIR
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Włącz i uruchom service
sudo systemctl daemon-reload
sudo systemctl enable guardant-worker
sudo systemctl start guardant-worker

echo -e "\n${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ GuardAnt Worker installed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs:        docker-compose logs -f"
echo "  Check status:     docker ps | grep guardant-worker"
echo "  Stop worker:      docker-compose down"
echo "  Start worker:     docker-compose up -d"
echo "  Restart worker:   docker-compose restart"
echo "  Service status:   systemctl status guardant-worker"
echo
echo -e "${YELLOW}📍 Worker will automatically detect and report its location${NC}"
echo -e "${YELLOW}📊 Check admin panel at https://guardant.me/admin/workers${NC}"