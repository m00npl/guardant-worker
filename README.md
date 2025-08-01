# GuardAnt Worker

A standalone worker node for the GuardAnt monitoring system.

## Prerequisites

- Docker and Docker Compose
- An approved GuardAnt account

## Quick Start

1. Clone this repository:
```bash
git clone https://github.com/m00npl/guardant-worker.git
cd guardant-worker
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your email:
```bash
OWNER_EMAIL=your-email@example.com
```

4. Start the worker to register:
```bash
docker compose up -d
```

5. Wait for approval from GuardAnt admin

6. Once approved, you'll receive RabbitMQ credentials. Add them to `.env`:
```bash
RABBITMQ_URL=amqp://username:password@rabbit.guardant.me:5672
```

7. Restart the worker:
```bash
docker compose restart
```

## Scripts

```bash
# Start worker (handles initial setup)
./start.sh

# Stop worker
./stop.sh

# Update worker to latest version
./update.sh
```

## Manual Commands

```bash
# Start worker
docker compose up -d

# Stop worker
docker compose down

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose build

# Check status
docker compose ps
```

## Configuration

All configuration is done through environment variables in the `.env` file:

- `OWNER_EMAIL` - Your email address (required)
- `WORKER_ID` - Worker identifier (auto-generated if not set)
- `RABBITMQ_URL` - Connection URL (provided after approval)
- `LOG_LEVEL` - Logging level: debug, info, warn, error (default: info)