#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geographic_worker_1 = require("./geographic-worker");
const workerId = process.env.WORKER_ID || `worker-${Date.now()}`;
const continent = process.env.WORKER_CONTINENT || 'europe';
const region = process.env.WORKER_REGION || 'north';
const country = process.env.WORKER_COUNTRY || 'poland';
const city = process.env.WORKER_CITY || 'warsaw';
const locationString = process.env.WORKER_LOCATION;
let location;
if (locationString) {
    const parts = locationString.split('.');
    location = {
        continent: parts[0] || continent,
        region: parts[1] || region,
        country: parts[2] || country,
        city: parts[3] || city,
        workerId: parts[4] || workerId
    };
}
else {
    location = {
        continent,
        region,
        country,
        city,
        workerId
    };
}
const config = {
    workerId,
    location,
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    capabilities: (process.env.WORKER_CAPABILITIES || 'http,https,tcp').split(','),
    version: process.env.WORKER_VERSION || '2.0.0'
};
console.log('🚀 Starting Geographic Worker');
console.log('Configuration:', {
    workerId: config.workerId,
    location: `${location.continent}.${location.region}.${location.country}.${location.city}`,
    capabilities: config.capabilities,
    version: config.version
});
const worker = new geographic_worker_1.GeographicWorker(config);
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await worker.stop();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await worker.stop();
    process.exit(0);
});
worker.start().catch((error) => {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
});
