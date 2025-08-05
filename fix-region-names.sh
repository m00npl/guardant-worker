#\!/bin/bash

# SSH to the server and update the admin API to use improved region names

ssh ubuntu@moon.dev.golem.network 'bash -s' << 'REMOTE_SCRIPT'
cd ~/projects/guardant

# Add the getRegionDisplayName function to index.ts
cat > /tmp/region-name-fix.ts << 'CODE'

// Helper function to get display name for regions
function getRegionDisplayName(region: string, city: string, country: string): string {
  const regionNames: Record<string, string> = {
    'us-east': 'US East',
    'us-west': 'US West',
    'eu-west': 'EU West',
    'eu-central': 'EU Central',
    'eu-east': 'EU East',
    'eu-north': 'EU North',
    'asia-pacific': 'Asia Pacific',
    'south-america': 'South America',
    'africa': 'Africa',
    'europe': 'Europe',
    'auto': 'Auto-detected',
    'unknown': 'Unknown'
  };
  
  const regionPrefix = regionNames[region];
  if (regionPrefix && city \!== 'Unknown') {
    return `${regionPrefix} (${city})`;
  }
  
  // Fallback to city, country format
  return `${city}, ${country}`;
}
CODE

echo "Function created. Now updating the endpoint..."

# Find the line where name is set and update it
# This is around line 1877 in index.ts
sed -i.bak "1877s/.*/              name: getRegionDisplayName(worker.region || 'unknown', city, country),/" services/api-admin/src/index.ts

# Also need to add the function before the endpoint
# Insert the function at line 1820 (before the endpoint)
sed -i '1820r /tmp/region-name-fix.ts' services/api-admin/src/index.ts

echo "Updated index.ts with region display names"

# Rebuild the container
cd services/api-admin
docker build -t guardant-admin-api .

# Restart the container
docker stop guardant-admin-api
docker rm guardant-admin-api
docker run -d \
  --name guardant-admin-api \
  --network guardant_default \
  -p 4040:3333 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://guardant:guardant123@guardant-postgres:5432/guardant \
  -e REDIS_HOST=guardant-redis \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-jwt-secret-here \
  -e PORT=3333 \
  --restart unless-stopped \
  guardant-admin-api

echo "Admin API restarted with improved region names"
REMOTE_SCRIPT
