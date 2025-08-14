// Geo-fair consumer setup for workers with Falkenstein throttling
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
 * Check if worker is in Falkenstein (needs throttling)
 */
export function isFalkensteinWorker(location: {
  city?: string;
  country?: string;
}): boolean {
  const city = (location.city || '').toLowerCase();
  const country = (location.country || '').toLowerCase();
  
  return city.includes('falkenstein') || 
         (country.includes('germany') && city.includes('falk'));
}

/**
 * Setup geo-fair consumer for a worker with Falkenstein throttling
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
  const isFalkenstein = isFalkensteinWorker(location);
  
  logger.info(`🌍 Setting up geo-fair consumer for region: ${workerRegion}`, {
    workerId,
    location,
    isFalkenstein
  });
  
  // Set prefetch to 1 for fair distribution
  // Falkenstein gets even lower prefetch for global queue
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
  
  // 2. Subscribe to global fallback queue
  // Falkenstein gets LOWEST priority to prevent monopolization
  const globalQueue = 'tasks.global.ready';
  const globalPriority = isFalkenstein ? 0 : 5; // Falkenstein gets 0, others get 5
  
  try {
    // Check if queue exists
    await channel.checkQueue(globalQueue);
    
    // Add rate limiting for Falkenstein workers
    if (isFalkenstein) {
      logger.warn(`⚠️ Falkenstein worker detected - applying throttling`);
      
      // Track tasks processed to implement cooldown
      let tasksProcessed = 0;
      const MAX_TASKS_BEFORE_COOLDOWN = 5;
      const COOLDOWN_MS = 10000; // 10 second cooldown after 5 tasks
      
      await channel.consume(globalQueue, async (msg) => {
        if (!msg) return;
        
        // Check if we need cooldown
        if (tasksProcessed >= MAX_TASKS_BEFORE_COOLDOWN) {
          logger.info(`🛑 Falkenstein cooldown - processed ${tasksProcessed} tasks, waiting ${COOLDOWN_MS}ms`);
          channel.nack(msg, false, true); // Requeue the message
          
          // Wait for cooldown
          await new Promise(resolve => setTimeout(resolve, COOLDOWN_MS));
          tasksProcessed = 0; // Reset counter
          return;
        }
        
        logger.info(`📥 [GLOBAL-THROTTLED] Falkenstein received task (${tasksProcessed + 1}/${MAX_TASKS_BEFORE_COOLDOWN})`, {
          size: msg.content.length,
          headers: msg.properties.headers
        });
        
        try {
          const task = JSON.parse(msg.content.toString());
          await onMessage(task);
          channel.ack(msg);
          tasksProcessed++;
        } catch (error) {
          logger.error(`[GLOBAL-THROTTLED] Failed to process task`, error);
          channel.nack(msg, false, true); // Requeue
        }
      }, {
        consumerTag: `${workerId}-global-throttled`,
        priority: globalPriority // Lowest priority for Falkenstein
      });
      
      logger.info(`⚠️ Subscribed to global queue with THROTTLING (priority ${globalPriority})`);
    } else {
      // Normal consumption for non-Falkenstein workers
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
        priority: globalPriority // Normal priority for non-Falkenstein
      });
      
      logger.info(`✅ Subscribed to global fallback queue with priority ${globalPriority}`);
    }
  } catch (error) {
    logger.warn(`Global queue ${globalQueue} not available:`, error);
  }
  
  logger.info(`🎯 Geo-fair consumer setup complete`, {
    region: workerRegion,
    isFalkenstein,
    globalPriority
  });
  
  return {
    region: workerRegion,
    regionalQueue,
    globalQueue,
    isFalkenstein,
    throttled: isFalkenstein
  };
}