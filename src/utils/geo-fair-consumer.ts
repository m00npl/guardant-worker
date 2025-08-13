// Geo-fair consumer setup for workers
import { Channel } from 'amqplib';
import { createLogger } from '../simple-logger';

const logger = createLogger('geo-fair-consumer');

export type Region = 'eu' | 'na' | 'apac' | 'africa' | 'sa';

/**
 * Determine worker's region from location data
 */
export function getWorkerRegion(location: {
  continent?: string;
  country?: string;
  city?: string;
  region?: string;
}): Region {
  const country = (location.country || '').toLowerCase();
  const city = (location.city || '').toLowerCase();
  
  // Europe
  if (country.includes('germany') || country.includes('poland') || country.includes('finland') ||
      country.includes('france') || country.includes('uk') || country.includes('united kingdom') ||
      country.includes('netherlands') || country.includes('spain') || country.includes('italy') ||
      country.includes('sweden') || country.includes('norway') || country.includes('denmark') ||
      country.includes('belgium') || country.includes('switzerland') || country.includes('austria') ||
      country.includes('czech') || city.includes('falkenstein') || city.includes('warsaw') ||
      city.includes('helsinki') || city.includes('frankfurt') || city.includes('berlin') ||
      city.includes('paris') || city.includes('london') || city.includes('amsterdam')) {
    return 'eu';
  }
  
  // North America
  if (country.includes('united states') || country.includes('usa') || country.includes('us') ||
      country.includes('canada') || country.includes('mexico') ||
      city.includes('ashburn') || city.includes('new york') || city.includes('san francisco') ||
      city.includes('los angeles') || city.includes('chicago') || city.includes('dallas') ||
      city.includes('seattle') || city.includes('miami') || city.includes('toronto') ||
      city.includes('montreal') || city.includes('vancouver')) {
    return 'na';
  }
  
  // Asia-Pacific
  if (country.includes('japan') || country.includes('china') || country.includes('india') ||
      country.includes('singapore') || country.includes('hong kong') || country.includes('taiwan') ||
      country.includes('korea') || country.includes('australia') || country.includes('new zealand') ||
      country.includes('indonesia') || country.includes('thailand') || country.includes('vietnam') ||
      country.includes('philippines') || country.includes('malaysia') ||
      city.includes('tokyo') || city.includes('osaka') || city.includes('singapore') ||
      city.includes('sydney') || city.includes('melbourne') || city.includes('mumbai') ||
      city.includes('bangalore') || city.includes('delhi') || city.includes('beijing') ||
      city.includes('shanghai') || city.includes('seoul')) {
    return 'apac';
  }
  
  // Africa
  if (country.includes('south africa') || country.includes('nigeria') || country.includes('egypt') ||
      country.includes('kenya') || country.includes('morocco') || country.includes('algeria') ||
      country.includes('tunisia') || city.includes('johannesburg') || city.includes('cape town') ||
      city.includes('lagos') || city.includes('cairo') || city.includes('nairobi')) {
    return 'africa';
  }
  
  // South America
  if (country.includes('brazil') || country.includes('argentina') || country.includes('chile') ||
      country.includes('colombia') || country.includes('peru') || country.includes('venezuela') ||
      country.includes('ecuador') || country.includes('uruguay') || country.includes('paraguay') ||
      country.includes('bolivia') || city.includes('sao paulo') || city.includes('rio de janeiro') ||
      city.includes('buenos aires') || city.includes('santiago') || city.includes('bogota') ||
      city.includes('lima') || city.includes('caracas')) {
    return 'sa';
  }
  
  // Default to EU if unknown
  logger.warn(`Could not determine region for location: ${JSON.stringify(location)}, defaulting to EU`);
  return 'eu';
}

/**
 * Setup geo-fair consumer for a worker
 * Subscribes to:
 * 1. Regional queue with high priority (for tasks in worker's region)
 * 2. Global fallback queue with low priority (for any unclaimed tasks)
 * 
 * @param channel RabbitMQ channel
 * @param workerId Worker ID
 * @param location Worker location data
 * @param onMessage Callback for handling messages
 */
export async function setupGeoFairConsumer(
  channel: Channel,
  workerId: string,
  location: { continent?: string; country?: string; city?: string; region?: string },
  onMessage: (msg: any) => Promise<void>
) {
  const workerRegion = getWorkerRegion(location);
  
  logger.info(`🌍 Setting up geo-fair consumer for region: ${workerRegion}`, {
    workerId,
    location
  });
  
  // Set prefetch to 1 for fair distribution
  await channel.prefetch(1);
  
  // 1. Subscribe to regional queue (high priority)
  const regionalQueue = `tasks.${workerRegion}.ready`;
  try {
    // Check if queue exists (it should have been created by setup script)
    await channel.checkQueue(regionalQueue);
    
    // Consume with high priority
    await channel.consume(regionalQueue, async (msg) => {
      if (!msg) return;
      
      logger.info(`📥 [REGIONAL] Received task from ${workerRegion} queue`, {
        size: msg.content.length,
        headers: msg.properties.headers
      });
      
      try {
        const task = JSON.parse(msg.content.toString());
        await onMessage(task);
        channel.ack(msg);
      } catch (error) {
        logger.error(`[REGIONAL] Failed to process task`, error);
        channel.nack(msg, false, true); // Requeue
      }
    }, {
      consumerTag: `${workerId}-regional-${workerRegion}`,
      priority: 10 // High priority for regional tasks
    });
    
    logger.info(`✅ Subscribed to regional queue: ${regionalQueue}`);
  } catch (error) {
    logger.warn(`Regional queue ${regionalQueue} not available:`, error);
  }
  
  // 2. Subscribe to global fallback queue (low priority)
  const globalQueue = 'tasks.global.ready';
  try {
    // Check if queue exists
    await channel.checkQueue(globalQueue);
    
    // Consume with low priority
    await channel.consume(globalQueue, async (msg) => {
      if (!msg) return;
      
      logger.info(`📥 [GLOBAL] Received task from global fallback queue`, {
        size: msg.content.length,
        headers: msg.properties.headers
      });
      
      try {
        const task = JSON.parse(msg.content.toString());
        await onMessage(task);
        channel.ack(msg);
      } catch (error) {
        logger.error(`[GLOBAL] Failed to process task`, error);
        channel.nack(msg, false, true); // Requeue
      }
    }, {
      consumerTag: `${workerId}-global`,
      priority: 1 // Low priority for global tasks
    });
    
    logger.info(`✅ Subscribed to global fallback queue: ${globalQueue}`);
  } catch (error) {
    logger.warn(`Global queue ${globalQueue} not available:`, error);
  }
  
  logger.info(`🎯 Geo-fair consumer setup complete for ${workerRegion} region`);
  
  return {
    region: workerRegion,
    regionalQueue,
    globalQueue
  };
}