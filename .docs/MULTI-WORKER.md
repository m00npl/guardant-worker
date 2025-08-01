# Multi-Worker Setup Guide

This guide explains how to run multiple GuardAnt workers on the same machine.

## Important: RabbitMQ Authentication

Each worker needs its own RabbitMQ credentials. When workers start, they:
1. Generate a unique ID automatically
2. Register with the admin panel
3. Wait for approval
4. Receive individual RabbitMQ credentials

## Quick Start

### Method 1: Using start-multi.sh (Recommended)

```bash
# Start 3 workers
./scripts/start-multi.sh 3

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Method 2: Using docker-compose scale

```bash
# Start multiple workers
docker compose up -d --scale worker=3

# View specific worker logs
docker compose logs -f guardant-worker-1
docker compose logs -f guardant-worker-2
docker compose logs -f guardant-worker-3
```

## Worker Identification

Each worker automatically generates a unique ID in the format:
- `hostname-1-timestamp` for worker 1
- `hostname-2-timestamp` for worker 2
- etc.

The worker ID is stored in `.keys/worker-id` for persistence.

## Shared vs Individual Configuration

### Shared (from .env):
- OWNER_EMAIL
- LOG_LEVEL
- Other general settings

### Individual (per worker):
- Worker ID (auto-generated)
- RabbitMQ credentials (received after approval)
- Keys and certificates (stored in .keys/)

## Managing Workers

### View all workers:
```bash
docker compose ps
```

### Stop all workers:
```bash
docker compose down
```

### Update workers (preserves count):
```bash
./scripts/update.sh
```

### Restart specific worker:
```bash
docker compose restart guardant-worker-2
```

## Troubleshooting

### RabbitMQ Authentication Errors

If you see "403 (ACCESS-REFUSED)" errors:
1. Make sure each worker is approved in the admin panel
2. Check that RABBITMQ_URL is NOT set in .env (comment it out)
3. Each worker needs its own approval and credentials

### Workers Using Same ID

If multiple workers show the same ID:
1. Stop all workers: `docker compose down`
2. Clear stored IDs: `rm -rf .keys/worker-id*`
3. Start workers again: `./scripts/start-multi.sh 3`

### Container Naming

Workers are named:
- `guardant-worker-1`
- `guardant-worker-2`
- `guardant-worker-3`
- etc.

## Best Practices

1. Always use the same method to start workers (either start-multi.sh or docker-compose scale)
2. Let each worker register and get approved individually
3. Don't set RABBITMQ_URL in .env when running multiple workers
4. Use update.sh to preserve worker count during updates