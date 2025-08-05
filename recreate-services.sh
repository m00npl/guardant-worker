#!/bin/bash

echo "Recreating monitoring services with correct regions..."

ssh ubuntu@moon.dev.golem.network 'bash -s' << 'REMOTE'
# Add test services with proper regions
docker exec guardant-redis redis-cli << 'REDIS'
# Service 1: Onet.pl
SET service:0a6b5954-cdf3-4cdd-b880-a940013a87de:e68a6bf1-b669-4b9f-b36e-c178d571f65b '{"id":"e68a6bf1-b669-4b9f-b36e-c178d571f65b","nestId":"0a6b5954-cdf3-4cdd-b880-a940013a87de","name":"Onet.pl","type":"web","target":"https://onet.pl/","interval":60,"monitoring":{"regions":["asia-northeast","eu-north","eu-east","us-east","eu-central"],"strategy":"failover","minRegions":1,"maxRegions":5},"config":{},"isActive":true,"priority":"normal"}'

# Service 2: Golem Base
SET service:270c8001-4747-432f-b868-2ec369ed513e:4a2613d3-928d-43e8-a384-1913bc4f13ce '{"id":"4a2613d3-928d-43e8-a384-1913bc4f13ce","nestId":"270c8001-4747-432f-b868-2ec369ed513e","name":"Golem Base","type":"web","target":"https://golem-base.io/","interval":90,"monitoring":{"regions":["asia-northeast","eu-east","eu-north","us-east","eu-central"],"strategy":"all-selected","minRegions":1,"maxRegions":5},"config":{},"isActive":true,"priority":"normal"}'

# Service 3: Allegro
SET service:0a6b5954-cdf3-4cdd-b880-a940013a87de:a86f2ecc-219e-406b-b68c-4594e6543fdc '{"id":"a86f2ecc-219e-406b-b68c-4594e6543fdc","nestId":"0a6b5954-cdf3-4cdd-b880-a940013a87de","name":"Allegro","type":"web","target":"https://allegro.pl/","interval":60,"monitoring":{"regions":["eu-east","eu-central","eu-north"],"strategy":"failover","minRegions":1,"maxRegions":3},"config":{},"isActive":true,"priority":"normal"}'

# Service 4: Wp.pl
SET service:0a6b5954-cdf3-4cdd-b880-a940013a87de:9ec9977a-c3fb-4c45-91e6-fb6826d04dd2 '{"id":"9ec9977a-c3fb-4c45-91e6-fb6826d04dd2","nestId":"0a6b5954-cdf3-4cdd-b880-a940013a87de","name":"Wp.pl","type":"web","target":"https://wp.pl/","interval":60,"monitoring":{"regions":["eu-east","eu-central"],"strategy":"failover","minRegions":1,"maxRegions":2},"config":{},"isActive":true,"priority":"normal"}'

# Service 5: Gazeta.pl
SET service:0a6b5954-cdf3-4cdd-b880-a940013a87de:29e10a4b-c312-4b45-ba3c-5b6e5fcbb77b '{"id":"29e10a4b-c312-4b45-ba3c-5b6e5fcbb77b","nestId":"0a6b5954-cdf3-4cdd-b880-a940013a87de","name":"Gazeta.pl","type":"web","target":"https://gazeta.pl/","interval":60,"monitoring":{"regions":["eu-east","us-east"],"strategy":"failover","minRegions":1,"maxRegions":2},"config":{},"isActive":true,"priority":"normal"}'

REDIS

echo "Services recreated. Restarting scheduler..."
docker restart guardant-scheduler

echo "Waiting for scheduler to start..."
sleep 5

echo "Checking scheduler logs..."
docker logs guardant-scheduler --tail 20 | grep -E "(Loaded|services|Sent check)"
REMOTE