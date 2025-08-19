"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerRegion = getWorkerRegion;
exports.isFalkensteinWorker = isFalkensteinWorker;
exports.setupGeoFairConsumer = setupGeoFairConsumer;
const simple_logger_1 = require("../simple-logger");
const logger = (0, simple_logger_1.createLogger)('geo-fair-consumer');
function getWorkerRegion(location) {
    const country = (location.country || '').toLowerCase();
    const city = (location.city || '').toLowerCase();
    if (country.includes('germany') || country.includes('poland') || country.includes('finland') ||
        country.includes('france') || country.includes('uk') || country.includes('united kingdom') ||
        country.includes('netherlands') || country.includes('spain') || country.includes('italy') ||
        country.includes('sweden') || country.includes('norway') || country.includes('denmark') ||
        country.includes('belgium') || country.includes('switzerland') || country.includes('austria') ||
        country.includes('czech') || city.includes('falkenstein') || city.includes('warsaw') ||
        city.includes('warszawa') || city.includes('krakow') || city.includes('kraków') ||
        city.includes('poznan') || city.includes('poznań') || city.includes('gdansk') || city.includes('gdańsk') ||
        city.includes('helsinki') || city.includes('frankfurt') || city.includes('berlin') ||
        city.includes('paris') || city.includes('london') || city.includes('amsterdam')) {
        return 'eu';
    }
    if (country.includes('united states') || country.includes('usa') || country.includes('us') ||
        country.includes('canada') || country.includes('mexico') ||
        city.includes('ashburn') || city.includes('new york') || city.includes('san francisco') ||
        city.includes('los angeles') || city.includes('chicago') || city.includes('dallas') ||
        city.includes('seattle') || city.includes('miami') || city.includes('toronto') ||
        city.includes('montreal') || city.includes('vancouver')) {
        return 'na';
    }
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
    if (country.includes('south africa') || country.includes('nigeria') || country.includes('egypt') ||
        country.includes('kenya') || country.includes('morocco') || country.includes('algeria') ||
        country.includes('tunisia') || city.includes('johannesburg') || city.includes('cape town') ||
        city.includes('lagos') || city.includes('cairo') || city.includes('nairobi')) {
        return 'africa';
    }
    if (country.includes('brazil') || country.includes('argentina') || country.includes('chile') ||
        country.includes('colombia') || country.includes('peru') || country.includes('venezuela') ||
        country.includes('ecuador') || country.includes('uruguay') || country.includes('paraguay') ||
        country.includes('bolivia') || city.includes('sao paulo') || city.includes('rio de janeiro') ||
        city.includes('buenos aires') || city.includes('santiago') || city.includes('bogota') ||
        city.includes('lima') || city.includes('caracas')) {
        return 'sa';
    }
    logger.warn(`Could not determine region for location: ${JSON.stringify(location)}, defaulting to EU`);
    return 'eu';
}
function isFalkensteinWorker(location) {
    const city = (location.city || '').toLowerCase();
    const country = (location.country || '').toLowerCase();
    return city.includes('falkenstein') ||
        (country.includes('germany') && city.includes('falk'));
}
async function setupGeoFairConsumer(channel, workerId, location, onMessage) {
    const workerRegion = getWorkerRegion(location);
    const isFalkenstein = isFalkensteinWorker(location);
    logger.info(`🌍 Setting up geo-fair consumer for region: ${workerRegion}`, {
        workerId,
        location,
        isFalkenstein
    });
    await channel.prefetch(1);
    const regionalQueue = `tasks.${workerRegion}.ready`;
    try {
        await channel.checkQueue(regionalQueue);
        await channel.consume(regionalQueue, async (msg) => {
            if (!msg)
                return;
            logger.info(`📥 [REGIONAL] Received task from ${workerRegion} queue`, {
                size: msg.content.length,
                headers: msg.properties.headers
            });
            try {
                const task = JSON.parse(msg.content.toString());
                await onMessage(task);
                channel.ack(msg);
            }
            catch (error) {
                logger.error(`[REGIONAL] Failed to process task`, error);
                channel.nack(msg, false, true);
            }
        }, {
            consumerTag: `${workerId}-regional-${workerRegion}`,
            priority: 10
        });
        logger.info(`✅ Subscribed to regional queue: ${regionalQueue}`);
    }
    catch (error) {
        logger.warn(`Regional queue ${regionalQueue} not available:`, error);
    }
    const globalQueue = 'tasks.global.ready';
    const globalPriority = isFalkenstein ? 0 : 5;
    try {
        await channel.checkQueue(globalQueue);
        if (isFalkenstein) {
            logger.warn(`⚠️ Falkenstein worker detected - applying throttling`);
            let tasksProcessed = 0;
            const MAX_TASKS_BEFORE_COOLDOWN = 5;
            const COOLDOWN_MS = 10000;
            await channel.consume(globalQueue, async (msg) => {
                if (!msg)
                    return;
                if (tasksProcessed >= MAX_TASKS_BEFORE_COOLDOWN) {
                    logger.info(`🛑 Falkenstein cooldown - processed ${tasksProcessed} tasks, waiting ${COOLDOWN_MS}ms`);
                    channel.nack(msg, false, true);
                    await new Promise(resolve => setTimeout(resolve, COOLDOWN_MS));
                    tasksProcessed = 0;
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
                }
                catch (error) {
                    logger.error(`[GLOBAL-THROTTLED] Failed to process task`, error);
                    channel.nack(msg, false, true);
                }
            }, {
                consumerTag: `${workerId}-global-throttled`,
                priority: globalPriority
            });
            logger.info(`⚠️ Subscribed to global queue with THROTTLING (priority ${globalPriority})`);
        }
        else {
            await channel.consume(globalQueue, async (msg) => {
                if (!msg)
                    return;
                logger.info(`📥 [GLOBAL] Received task from global fallback queue`, {
                    size: msg.content.length,
                    headers: msg.properties.headers
                });
                try {
                    const task = JSON.parse(msg.content.toString());
                    await onMessage(task);
                    channel.ack(msg);
                }
                catch (error) {
                    logger.error(`[GLOBAL] Failed to process task`, error);
                    channel.nack(msg, false, true);
                }
            }, {
                consumerTag: `${workerId}-global`,
                priority: globalPriority
            });
            logger.info(`✅ Subscribed to global fallback queue with priority ${globalPriority}`);
        }
    }
    catch (error) {
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
