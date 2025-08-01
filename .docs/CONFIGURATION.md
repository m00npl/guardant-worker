# GuardAnt Worker Configuration

## Environment Variables

All configuration is done through the `.env` file in the root directory.

### Required Variables

- `OWNER_EMAIL` - Your email address registered with GuardAnt
  - Example: `OWNER_EMAIL=user@example.com`
  - This must match the email used in your GuardAnt account

### Optional Variables

- `WORKER_ID` - Unique identifier for this worker
  - Default: Auto-generated based on hostname and timestamp
  - Example: `WORKER_ID=my-worker-1`

- `WORKER_REGION` - Geographic region for the worker
  - Default: Auto-detected via IP geolocation
  - Example: `WORKER_REGION=us-east-1`
  - Valid regions: us-east-1, us-west-1, eu-west-1, eu-central-1, ap-southeast-1, etc.

- `LOG_LEVEL` - Logging verbosity
  - Default: `info`
  - Options: `debug`, `info`, `warn`, `error`
  - Example: `LOG_LEVEL=debug`

### Automatically Provided Variables

These are set automatically after worker approval:

- `RABBITMQ_URL` - Message queue connection string
  - Provided by GuardAnt platform after approval
  - Format: `amqp://username:password@host:port`

## Configuration Files

### .env.example
Template configuration file with all available options.

### docker-compose.yml
Docker Compose configuration. Usually doesn't need modification.

## Directories

### .keys/
Stores the worker's RSA keypair for authentication. Created automatically.

### .cache/
Temporary cache for worker operations. Can be safely deleted.

## First-Time Setup

1. Copy `.env.example` to `.env`
2. Set your `OWNER_EMAIL`
3. Run `./start.sh`
4. Wait for approval email
5. Worker will start automatically after approval