# GuardAnt Worker - Security Model

## Overview

GuardAnt Worker implements a secure, zero-trust registration and authentication model:

1. **No credentials before approval** - Workers cannot connect to RabbitMQ until approved
2. **Unique credentials per worker** - Each worker gets its own RabbitMQ user
3. **Minimal permissions** - Workers can only access specific queues and exchanges
4. **Secure password generation** - 256-bit random passwords

## Registration Flow

### 1. Worker Registration
```
Worker → guardant.me/api/public/workers/register
         ├─ workerId
         ├─ hostname  
         ├─ ownerEmail
         └─ publicKey
```
- No credentials provided at this stage
- Worker waits for approval

### 2. Admin Approval
When admin approves:
1. Unique RabbitMQ user created: `worker-{workerId}`
2. Secure password generated: 256-bit random
3. Minimal permissions assigned

### 3. Worker Gets Credentials
```
Worker → guardant.me/api/public/workers/register/{workerId}/status
         └─ Returns: amqp://worker-xxx:password@guardant.me:5672
```
Only after approval!

## RabbitMQ Permissions

Workers get minimal permissions:

### Can Write To:
- `worker_commands` - Receive commands
- `worker_heartbeat` - Send heartbeats
- `monitoring_results` - Send check results

### Can Read From:
- `monitoring_workers*` - Worker queues
- `worker.*` - Worker-specific queues

### Cannot:
- Create/delete queues
- Access other workers' queues
- Access admin exchanges
- Modify permissions

## Security Best Practices

### For Platform Operators

1. **Secure RabbitMQ Management**
   ```yaml
   environment:
     - RABBITMQ_ADMIN_USER=secure-admin
     - RABBITMQ_ADMIN_PASS=very-secure-password
     - RABBITMQ_MANAGEMENT_URL=http://rabbitmq:15672
   ```

2. **Use Registration Tokens**
   ```yaml
   environment:
     - WORKER_REGISTRATION_TOKEN=secret-token
   ```

3. **Monitor Registrations**
   - Review all pending registrations
   - Check owner emails
   - Verify IP addresses

4. **Rotate Credentials**
   - Periodically rotate worker passwords
   - Revoke credentials for inactive workers

### For Worker Owners

1. **Protect Worker ID**
   - Don't share worker credentials
   - Use unique email per deployment

2. **Secure Installation**
   ```bash
   # Use HTTPS for installer
   curl -sSL https://guardant.me/install-worker.sh | bash
   
   # Verify SSL certificate
   curl --cacert /etc/ssl/certs/ca-certificates.crt https://guardant.me/install-worker.sh
   ```

3. **Monitor Your Workers**
   - Check worker status regularly
   - Monitor for unauthorized changes

## Threat Model

### Protected Against:

1. **Unauthorized Workers**
   - Cannot connect without approval
   - Cannot access RabbitMQ

2. **Worker Impersonation**
   - Unique credentials per worker
   - Public key verification (future)

3. **Lateral Movement**
   - Workers isolated from each other
   - Cannot access other queues

4. **Credential Leakage**
   - Credentials only sent after approval
   - Over HTTPS connection

### Not Protected Against:

1. **Compromised Admin Account**
   - Can approve malicious workers
   - Implement 2FA for admin accounts

2. **Network Sniffing**
   - Use TLS for RabbitMQ (amqps://)
   - VPN for additional security

3. **Malicious Worker Code**
   - Review worker updates
   - Use signed releases

## Audit Log

All security events are logged:

```json
{
  "event": "worker_registration",
  "workerId": "worker-xxx",
  "ownerEmail": "user@example.com",
  "ip": "1.2.3.4",
  "timestamp": "2024-01-01T12:00:00Z"
}

{
  "event": "worker_approved",
  "workerId": "worker-xxx",
  "approvedBy": "admin@guardant.me",
  "permissions": ["worker"],
  "timestamp": "2024-01-01T12:30:00Z"
}
```

## Future Enhancements

1. **Mutual TLS**
   - Client certificates for workers
   - Stronger authentication

2. **Key Rotation**
   - Automatic credential rotation
   - Zero-downtime updates

3. **RBAC**
   - Role-based permissions
   - Team management

4. **Audit Compliance**
   - SOC2 compliance
   - GDPR compliance