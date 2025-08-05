#\!/bin/bash

echo "Naprawiam scheduler aby wysyłał zadania do właściwych workerów..."

ssh ubuntu@moon.dev.golem.network 'bash -s' << 'REMOTE_SCRIPT'
# Zatrzymaj scheduler
docker stop guardant-scheduler

# Stwórz poprawkę
cat > /tmp/fix-scheduler.patch << 'PATCH'
--- a/services/scheduler/src/index.ts
+++ b/services/scheduler/src/index.ts
@@ -193,11 +193,25 @@
     timestamp: Date.now(),
   };
   
-  // Always send to general queue - workers will filter by region
+  // Send to each region's workers
   try {
-    await rabbitmqChannel.publish(
-      'worker_commands',
-      'check_service_once',
+    const regions = service.monitoring?.regions || ['all'];
+    logger.info('Publishing to regions', { 
+      serviceId: service.id,
+      regions 
+    });
+    
+    // Send to all regions that this service monitors
+    for (const region of regions) {
+      const routingKey = `region.${region}`;
+      logger.debug('Publishing to routing key', { 
+        routingKey,
+        exchange: 'monitoring' 
+      });
+      
+      await rabbitmqChannel.publish(
+        'monitoring',
+        routingKey,
       Buffer.from(JSON.stringify(command)),
     { persistent: true }
   );
+    }
   
   } catch (error) {
PATCH

# Aplikuj poprawkę bezpośrednio modyfikując plik
docker exec guardant-scheduler bash -c "
cat > /tmp/fix.js << 'SCRIPT'
const fs = require('fs');
let code = fs.readFileSync('/app/services/scheduler/src/index.ts', 'utf8');

// Znajdź i zamień sekcję publikowania
const oldPublish = \`  // Always send to general queue - workers will filter by region
  try {
    await rabbitmqChannel.publish(
      'worker_commands',
      'check_service_once',
      Buffer.from(JSON.stringify(command)),
    { persistent: true }
  );\`;

const newPublish = \`  // Send to each region's workers
  try {
    const regions = service.monitoring?.regions || ['all'];
    logger.info('Publishing to regions', { 
      serviceId: service.id,
      regions 
    });
    
    // Send to all regions that this service monitors
    for (const region of regions) {
      const routingKey = \\\`region.\\\${region}\\\`;
      logger.debug('Publishing to routing key', { 
        routingKey,
        exchange: 'monitoring' 
      });
      
      await rabbitmqChannel.publish(
        'monitoring',
        routingKey,
        Buffer.from(JSON.stringify(command)),
        { persistent: true }
      );
    }\`;

code = code.replace(oldPublish, newPublish);

// Również zmień typ exchange na topic
code = code.replace(
  \"await rabbitmqChannel.assertExchange('worker_commands', 'direct');\",
  \"await rabbitmqChannel.assertExchange('monitoring', 'topic');\"
);

// I usuń stary exchange worker_commands
code = code.replace(
  \"await rabbitmqChannel.assertExchange('monitoring', 'direct');\",
  \"await rabbitmqChannel.assertExchange('monitoring', 'topic');\"
);

fs.writeFileSync('/app/services/scheduler/src/index.ts', code);
console.log('Scheduler code fixed\!');
SCRIPT

node /tmp/fix.js
"

# Uruchom scheduler
docker start guardant-scheduler

echo "Scheduler naprawiony i uruchomiony\!"
echo "Czekam na uruchomienie..."
sleep 10

# Sprawdź logi
echo ""
echo "Sprawdzam logi schedulera:"
docker logs guardant-scheduler --tail 20
REMOTE_SCRIPT
