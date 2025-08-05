#\!/bin/bash

ssh ubuntu@moon.dev.golem.network 'bash -s' << 'REMOTE'
# Najpierw sprawdzmy jak dokładnie wygląda kod
echo "Sprawdzam kod schedulera..."
docker exec guardant-scheduler grep -B5 -A10 "rabbitmqChannel.publish" /app/services/scheduler/src/index.ts

# Teraz musimy naprawić routing - zadania powinny iść do konkretnych regionów
echo ""
echo "Naprawiam routing w schedulerze..."

# Stwórz poprawkę
cat > /tmp/fix-scheduler.js << 'SCRIPT'
const fs = require('fs');
const code = fs.readFileSync('/app/services/scheduler/src/index.ts', 'utf8');

// Znajdź i zamień publikowanie
const fixed = code.replace(
  /await rabbitmqChannel\.publish\(\s*'monitoring',\s*'region\.all',/g,
  `// Send to each region separately
  const regions = service.monitoring?.regions || ['all'];
  for (const region of regions) {
    await rabbitmqChannel.publish(
      'monitoring',
      \`region.\${region}\`,`
).replace(
  /Buffer\.from\(JSON\.stringify\(command\)\),\s*\{ persistent: true \}\s*\);/g,
  `Buffer.from(JSON.stringify(command)),
      { persistent: true }
    );
  } // end for loop`
);

fs.writeFileSync('/app/services/scheduler/src/index.ts', fixed);
console.log('Scheduler code fixed');
SCRIPT

docker exec guardant-scheduler node /tmp/fix-scheduler.js

# Restart scheduler
docker restart guardant-scheduler
echo "Scheduler naprawiony i zrestartowany"
REMOTE
