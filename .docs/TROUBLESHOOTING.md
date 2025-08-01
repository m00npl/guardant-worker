# GuardAnt Worker Troubleshooting

## Common Issues

### Worker Not Starting

**Symptom**: Docker container exits immediately

**Solutions**:
1. Check logs: `docker compose logs`
2. Verify `.env` file exists and has `OWNER_EMAIL` set
3. Ensure Docker daemon is running

### Registration Issues

**Symptom**: Worker not appearing in admin dashboard

**Solutions**:
1. Check your email is correct in `.env`
2. Ensure you have internet connectivity
3. Check firewall allows outbound HTTPS (port 443)
4. View logs for registration errors

### Approval Pending

**Symptom**: Worker registered but not receiving tasks

**Solutions**:
1. Check admin dashboard for pending approvals
2. Ask platform admin to approve your worker
3. Check email for approval notification

### Git Permission Errors

**Symptom**: `fatal: detected dubious ownership in repository`

**Solution**:
```bash
git config --global --add safe.directory /opt/guardant-worker
```

**Symptom**: Permission denied errors

**Solution**:
```bash
sudo chown -R $USER:$USER /opt/guardant-worker
```

### Connection Issues

**Symptom**: Cannot connect to RabbitMQ

**Solutions**:
1. Check firewall allows port 5672 outbound
2. Verify RabbitMQ credentials in logs
3. Ensure worker is approved
4. Check internet connectivity

### Update Failures

**Symptom**: Update script fails

**Solutions**:
1. Fix git permissions (see above)
2. Ensure you have internet access
3. Check disk space
4. Manually pull: `git pull origin main`

## Debug Commands

### View Logs
```bash
# All logs
docker compose logs

# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Check Status
```bash
# Container status
docker compose ps

# Worker processes
docker compose exec worker ps aux
```

### Restart Worker
```bash
# Graceful restart
docker compose restart

# Full restart
./stop.sh && ./start.sh
```

### Manual Registration Check
```bash
# Check registration status
curl -s https://guardant.me/api/public/workers/register/YOUR_WORKER_ID/status
```

## Log Levels

Set `LOG_LEVEL=debug` in `.env` for verbose logging:
- `debug`: All messages including internal details
- `info`: Normal operation messages
- `warn`: Warning messages only
- `error`: Error messages only

## Getting Help

1. Check logs first: `docker compose logs`
2. Review configuration in `.env`
3. Check GuardAnt platform status
4. Contact support with:
   - Worker ID
   - Error messages from logs
   - Your configuration (hide sensitive data)