# GuardAnt Worker

Lightweight monitoring worker for GuardAnt uptime monitoring platform.

## 🚀 Quick Install

```bash
curl -sSL https://guardant.me/install-worker.sh | bash
```

## Features

- 🌍 Geographic distribution support
- 📊 Service monitoring (HTTP, Ping, Port, DNS)
- 💰 Points system for future billing
- 🔄 Auto-update capability
- 🔒 Secure registration with admin approval
- 📈 Real-time metrics reporting

## Documentation

- [Complete Guide](./COMPLETE_GUIDE.md) - Full documentation
- [Security](./SECURITY.md) - Security model and best practices
- [Auto-Update](./AUTO_UPDATE.md) - Update system documentation
- [One-Liner Install](./INSTALL_ONELINER.md) - Installation options

## Requirements

- Docker & Docker Compose
- Linux server (Ubuntu/Debian/CentOS)
- Outbound access to guardant.me:5672

## Manual Installation

```bash
git clone https://github.com/m00npl/guardant-worker.git
cd worker
cp .env.example .env
# Edit .env with your details
docker-compose up -d
```

## Support

- Platform: https://guardant.me
- Issues: https://github.com/m00npl/guardant-worker/issues
- Email: support@guardant.me

---

Part of [GuardAnt.me](https://guardant.me) monitoring platform.