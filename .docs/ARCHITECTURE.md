# GuardAnt Worker Architecture

## Overview

The GuardAnt Worker is a standalone monitoring agent that connects to the GuardAnt platform to perform service health checks.

## Components

### Core Worker
- **rabbitmq-worker.ts**: Main worker process that listens for monitoring tasks
- **monitoring.ts**: Service monitoring implementations (HTTP, TCP, DNS, etc.)
- **points-tracker.ts**: Tracks worker performance and earnings

### Location Detection
- **worker-ant-location.ts**: Automatic location detection using IP geolocation
- Supports multiple geolocation providers for redundancy
- Falls back to environment variables if external services fail

### Communication
- Uses RabbitMQ for task distribution and heartbeat
- Sends signed heartbeats to prove authenticity
- Receives monitoring tasks from scheduler

### Updates
- **update-manager.ts**: Handles self-updates via Docker
- Supports remote update commands
- Zero-downtime updates

## Directory Structure

```
.
├── .cache/          # Temporary cache files
├── .docs/           # Documentation
├── .keys/           # Worker keypair for authentication
├── scripts/         # Management scripts
├── src/             # Source code
├── docker-compose.yml
└── Dockerfile
```

## Security

- Workers generate RSA keypairs for authentication
- All heartbeats are cryptographically signed
- RabbitMQ credentials are unique per worker
- No sensitive data is logged