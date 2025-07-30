# GuardAnt Worker - One Line Install

## 🚀 Quick Install

Install a GuardAnt worker with a single command:

```bash
# Shortest URL:
curl -sSL https://guardant.me/install | bash

# Alternative URLs:
curl -sSL https://guardant.me/install-worker.sh | bash
curl -sSL https://guardant.me/worker.sh | bash
```

Or with pre-configured email:

```bash
curl -sSL https://guardant.me/install | OWNER_EMAIL=your@email.com bash
```

## What happens:

1. **Downloads installer** from guardant.me
2. **Asks for your email** (if not provided)
3. **Installs worker** in `/opt/guardant-worker`
4. **Registers with platform** at guardant.me
5. **Waits for approval** from admin
6. **Starts automatically** once approved

## After installation:

- Admin will see your registration at: https://guardant.me/admin/workers/pending
- You'll be notified once approved
- Worker logs: `cd /opt/guardant-worker && docker-compose logs -f`

## Requirements:

- Docker & Docker Compose
- Linux server (Ubuntu/Debian/CentOS)
- Outbound access to guardant.me:5672 (RabbitMQ)

## Custom installation:

```bash
# Custom location
INSTALL_DIR=/home/user/worker curl -sSL https://guardant.me/install-worker.sh | bash

# With registration token
REGISTRATION_TOKEN=secret-token curl -sSL https://guardant.me/install-worker.sh | bash

# All options
OWNER_EMAIL=user@example.com \
REGISTRATION_TOKEN=secret-token \
INSTALL_DIR=/opt/my-worker \
curl -sSL https://guardant.me/install-worker.sh | bash
```

## Uninstall:

```bash
cd /opt/guardant-worker
docker-compose down
cd /
sudo rm -rf /opt/guardant-worker
```

---

🌐 **GuardAnt.me** - Distributed Uptime Monitoring