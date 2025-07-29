# GuardAnt Worker Auto-Update System

This worker supports automatic updates via RabbitMQ commands, allowing you to update all workers remotely without manual intervention.

## Features

- **Version tracking** - Workers won't update to the same version twice
- **Heartbeat monitoring** - Workers report their status and version every 30 seconds
- **Graceful updates** - Workers finish current tasks before updating
- **Remote management** - Update all workers with a single command

## How It Works

1. **Version Management**
   - Each worker maintains a `.worker-version` file
   - Update commands include a version string
   - Workers ignore update commands for already installed versions

2. **Heartbeat System**
   - Workers send heartbeats to RabbitMQ every 30 seconds
   - Heartbeats include: worker ID, region, version, checks completed
   - Main server stores heartbeats in Redis with 2-minute TTL

3. **Update Process**
   - Admin sends update command via API
   - Workers receive command via RabbitMQ
   - Workers check if version is already installed
   - If new version: pull code, rebuild, restart

## Usage

### Send Update Command

From main server:
```bash
# Update all workers to specific version
./scripts/update-workers.sh localhost:4040 $TOKEN update https://github.com/you/worker.git main v1.2.3

# Check worker status
./scripts/update-workers.sh localhost:4040 $TOKEN status
```

### API Endpoints

```bash
# Update workers
POST /api/admin/workers/update
{
  "repoUrl": "https://github.com/you/worker.git",
  "branch": "main",
  "version": "v1.2.3",
  "delay": 5000
}

# Get worker status
GET /api/admin/workers/status

# Response
{
  "success": true,
  "workers": [
    {
      "id": "worker-1",
      "version": "v1.2.3",
      "region": "us-east-1",
      "isAlive": true,
      "lastSeen": "2024-01-01T12:00:00Z",
      "checksCompleted": 1234
    }
  ],
  "versionGroups": {
    "v1.2.3": [...],
    "v1.2.2": [...]
  }
}
```

## Worker Configuration

Workers need Docker access for auto-update:

```yaml
# docker-compose.yml
services:
  worker:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./:/app  # For git updates
```

## Security Considerations

- Workers need access to Docker socket (security risk)
- Use private git repositories with SSH keys
- Limit update commands to authorized users only
- Consider using signed versions for production

## Monitoring

Check worker versions:
```bash
# Via API
curl -H "Authorization: Bearer $TOKEN" http://localhost:4040/api/admin/workers/status | jq .

# Via logs
docker logs guardant-worker-1 | grep "Current version"
```

## Troubleshooting

### Worker not updating
- Check if version already installed
- Verify git repository access
- Check Docker permissions
- Look for errors in worker logs

### Version mismatch after update
- Worker may have failed to save version file
- Check write permissions in container
- Manually delete `.worker-version` and retry

### Workers going offline
- Check RabbitMQ connectivity
- Verify heartbeat messages in RabbitMQ management UI
- Check Redis for stored heartbeats