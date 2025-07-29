# GuardAnt Worker - Complete Guide

## Overview

GuardAnt Worker is a distributed monitoring agent that:
- Executes uptime checks from different geographic locations
- Earns points for completed checks
- Auto-updates via RabbitMQ commands
- Supports region-specific task assignment

## Features

### 1. Auto-Registration & Bootstrap
Workers can self-register with the platform:
```bash
curl -sSL https://guardant.me/install-worker.sh | bash
```

The installer will:
- Ask for owner's email address
- Generate unique ID and keypair
- Register with the platform
- Wait for admin approval
- Auto-configure once approved

Alternatively, provide email via environment:
```bash
OWNER_EMAIL=user@example.com curl -sSL https://guardant.me/install-worker.sh | bash
```

### 2. Points & Billing System
Workers earn points for each check:
- HTTP check: 1 point
- Ping check: 1 point  
- Port check: 2 points (more intensive)
- DNS check: 2 points

Bonuses:
- Fast response (<100ms): +10%
- High volume (>10k/day): +20%
- High uptime (>24h): +10%

### 3. Region-Based Task Assignment
- Workers are assigned to specific regions
- Region-specific tasks only go to workers in that region
- Global tasks can be handled by any worker
- Changing regions requires admin approval

### 4. Auto-Update System
Workers can be updated remotely:
```bash
# Update all workers
./scripts/update-workers.sh $SERVER $TOKEN update $REPO $BRANCH $VERSION

# Check status
./scripts/update-workers.sh $SERVER $TOKEN status
```

Version tracking prevents duplicate updates.

### 5. Heartbeat Monitoring
Workers send heartbeats every 30 seconds including:
- Current version
- Points earned
- Checks completed
- Region
- Earnings estimate

## Installation

### Quick Install (Recommended)
```bash
# Set registration server
export REGISTRATION_URL=https://guardant.me/api/public/workers/register

# Optional: Set registration token if required
export REGISTRATION_TOKEN=your-token

# Optional: Pre-set owner email
export OWNER_EMAIL=your@email.com

# Run installer
curl -sSL https://guardant.me/install-worker.sh | bash
```

If email is not provided, the installer will prompt for it.

### Manual Install
```bash
# Clone repository
git clone https://github.com/m00npl/guardant-worker.git
cd guardant-worker

# Configure
cp .env.example .env
# Edit .env with RabbitMQ connection

# Start
docker-compose up -d
```

## Configuration

### Environment Variables
- `RABBITMQ_URL` - RabbitMQ connection URL (required)
- `WORKER_ID` - Unique worker identifier
- `WORKER_REGION` - Geographic region (e.g., us-east-1)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)

### Regions
Common region codes:
- `us-east-1` - US East (Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - EU (Ireland)
- `eu-central-1` - EU (Frankfurt)
- `ap-southeast-1` - Asia Pacific (Singapore)
- `ap-northeast-1` - Asia Pacific (Tokyo)

## Admin Operations

### Approve Worker Registration
```bash
# List pending registrations
GET /api/admin/workers/registrations/pending

# Response includes owner email:
{
  "workerId": "worker-hostname-123",
  "ownerEmail": "user@example.com",
  "hostname": "worker-server",
  "ip": "1.2.3.4"
}

# Approve
POST /api/admin/workers/registrations/:workerId/approve
{
  "region": "us-east-1"
}
```

### Update Workers
```bash
POST /api/admin/workers/update
{
  "repoUrl": "https://github.com/org/worker.git",
  "branch": "main",
  "version": "v1.2.3",
  "delay": 5000
}
```

### Change Worker Region
```bash
# Request change
POST /api/admin/workers/:workerId/change-region
{
  "newRegion": "eu-west-1"
}

# Approve change (admin only)
POST /api/admin/workers/region-changes/:requestId/approve
```

### View Worker Status
```bash
GET /api/admin/workers/status

# Response includes:
- Worker versions
- Regions
- Points earned
- Uptime status
- Version groups
```

### View Workers by Owner
```bash
# Get all workers for specific owner
GET /api/admin/workers/by-owner/user@example.com

# Get summary of all owners
GET /api/admin/workers/owners/summary

# Response includes:
- Total workers per owner
- Active workers
- Total points earned
- Regions covered
```

### Points Leaderboard
```bash
GET /api/admin/workers/leaderboard

# Shows:
- Top 100 workers by points
- Earnings estimates
- Global statistics
```

## Worker Commands

Workers respond to these RabbitMQ commands:

1. **check_service_once** - Execute single check
2. **monitor_service** - Start continuous monitoring
3. **stop_monitoring** - Stop monitoring service
4. **update_worker** - Update to new version
5. **rebuild_worker** - Rebuild container
6. **change_region** - Change assigned region
7. **reset_points_period** - Reset billing period

## Security

### Registration Security
- Optional registration token
- Admin approval required
- Public key authentication (future)

### Update Security  
- Version tracking prevents replay
- Only approved repositories
- Graceful shutdown during updates

### Region Security
- Workers can only process tasks for their region
- Region changes require admin approval
- Automatic restart after region change

## Monitoring & Troubleshooting

### Check Worker Logs
```bash
docker logs guardant-worker-1 -f
```

### Common Issues

**Worker not receiving tasks:**
- Check RabbitMQ connection
- Verify region assignment
- Check scheduler is running

**Points not accumulating:**
- Check if checks are successful
- Verify points tracker is initialized
- Check heartbeat is being sent

**Update failing:**
- Verify git repository access
- Check Docker permissions
- Look for version conflicts

**Region change not working:**
- Ensure admin approval
- Check worker received command
- Verify restart completed

### Health Checks
```bash
# Check if worker is alive
docker ps | grep guardant-worker

# Check RabbitMQ connection
docker exec guardant-worker-1 nc -zv rabbitmq-server 5672

# View statistics
docker exec guardant-worker-1 cat /app/.worker-stats.json
```

## Owner Management

### Benefits for Owners
- Track all your workers in one place
- See total points earned across all workers
- Monitor worker health and uptime
- Receive notifications about worker issues
- Future: Consolidated billing and payouts

### Owner Dashboard (Admin API)
```bash
# View specific owner's workers
GET /api/admin/workers/by-owner/user@example.com

# Example response:
{
  "ownerEmail": "user@example.com",
  "totalWorkers": 5,
  "activeWorkers": 4,
  "totalPoints": 125000,
  "workers": [
    {
      "workerId": "worker-us-123",
      "region": "us-east-1",
      "currentStatus": {
        "isAlive": true,
        "totalPoints": 25000,
        "version": "v1.2.3"
      }
    }
  ]
}
```

### Owner Leaderboard
```bash
GET /api/admin/workers/owners/summary

# Shows top owners by:
- Total workers deployed
- Total points earned
- Geographic coverage
- Active worker percentage
```

### Future Owner Features
1. **Self-service portal** - Owners can manage their own workers
2. **Earnings dashboard** - Real-time earnings tracking
3. **Payout management** - Configure payment methods
4. **Worker templates** - Deploy multiple workers easily
5. **Team management** - Share workers with team members

## Future Features

1. **Cryptocurrency Payments**
   - Wallet integration
   - Automatic payouts
   - Point-to-crypto conversion

2. **Performance Tiers**
   - Premium regions
   - Guaranteed SLA checks
   - Priority task assignment

3. **Worker Pools**
   - Team management
   - Shared earnings
   - Collective bonuses

4. **Advanced Monitoring**
   - Custom check scripts
   - Browser automation
   - API testing

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.