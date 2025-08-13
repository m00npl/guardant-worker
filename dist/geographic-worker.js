"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/geographic-worker.ts
var geographic_worker_exports = {};
__export(geographic_worker_exports, {
  GeographicWorker: () => GeographicWorker
});
module.exports = __toCommonJS(geographic_worker_exports);
var import_amqplib = __toESM(require("amqplib"));
var import_axios = __toESM(require("axios"));

// src/simple-logger.ts
function createLogger(name) {
  const prefix = `[${name}]`;
  return {
    debug: (msg, data) => {
      if (process.env.LOG_LEVEL === "debug") {
        console.log(`${(/* @__PURE__ */ new Date()).toISOString()} DEBUG ${prefix} ${msg}`, data || "");
      }
    },
    info: (msg, data) => {
      console.log(`${(/* @__PURE__ */ new Date()).toISOString()} INFO ${prefix} ${msg}`, data || "");
    },
    warn: (msg, data) => {
      console.warn(`${(/* @__PURE__ */ new Date()).toISOString()} WARN ${prefix} ${msg}`, data || "");
    },
    error: (msg, data) => {
      console.error(`${(/* @__PURE__ */ new Date()).toISOString()} ERROR ${prefix} ${msg}`, data || "");
    }
  };
}

// src/geographic-hierarchy.ts
var RoutingKeyBuilder = class {
  static buildKey(location, level) {
    const parts = [];
    if (location.continent) parts.push(location.continent);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    if (location.city) parts.push(location.city);
    if (location.workerId) parts.push(location.workerId);
    if (level && parts.length < 5) {
      parts.push("*");
    }
    return parts.join(".");
  }
  static parseKey(routingKey) {
    const parts = routingKey.split(".");
    const location = {};
    if (parts[0] && parts[0] !== "*") location.continent = parts[0];
    if (parts[1] && parts[1] !== "*") location.region = parts[1];
    if (parts[2] && parts[2] !== "*") location.country = parts[2];
    if (parts[3] && parts[3] !== "*") location.city = parts[3];
    if (parts[4] && parts[4] !== "*") location.workerId = parts[4];
    return location;
  }
  // Generate all routing keys a worker should listen to
  static getWorkerBindings(location) {
    return [
      // Specific worker
      `check.${location.continent}.${location.region}.${location.country}.${location.city}.${location.workerId}`,
      // City level
      `check.${location.continent}.${location.region}.${location.country}.${location.city}.*`,
      // Country level
      `check.${location.continent}.${location.region}.${location.country}.*.*`,
      // Region level
      `check.${location.continent}.${location.region}.*.*.*`,
      // Continent level
      `check.${location.continent}.*.*.*.*`,
      // Global level
      `check.*.*.*.*.*`
    ];
  }
};
var EXCHANGES = {
  CHECKS: "monitoring.checks",
  CLAIMS: "monitoring.claims",
  HEARTBEATS: "monitoring.heartbeats",
  REGISTRATION: "monitoring.registration",
  RESULTS: "monitoring.results"
};
var QUEUE_PREFIXES = {
  WORKER_CHECKS: "worker.checks.",
  WORKER_CLAIMS: "worker.claims.",
  SCHEDULER_HEARTBEATS: "scheduler.heartbeats",
  SCHEDULER_REGISTRATION: "scheduler.registration",
  SCHEDULER_RESULTS: "scheduler.results"
};

// src/geographic-worker.ts
var logger = createLogger("geographic-worker");
var GeographicWorker = class {
  // 2 seconds
  constructor(config) {
    this.config = config;
    this.registration = {
      workerId: config.workerId,
      location: config.location,
      capabilities: config.capabilities || ["http", "https"],
      version: config.version || "1.0.0",
      registeredAt: Date.now(),
      lastHeartbeat: Date.now()
    };
  }
  connection = null;
  channel = null;
  registration;
  activeChecks = /* @__PURE__ */ new Map();
  heartbeatInterval = null;
  cachedIP = null;
  cachedIPTime = 0;
  checksCompleted = 0;
  totalPoints = 0;
  HEARTBEAT_INTERVAL = 3e4;
  // 30 seconds
  CHECK_TIMEOUT = 3e4;
  // 30 seconds
  CLAIM_TIMEOUT = 2e3;
  async start() {
    try {
      await this.connectToRabbitMQ();
      await this.setupExchanges();
      await this.setupQueues();
      await this.register();
      this.startHeartbeat();
      await this.listenForChecks();
      logger.info(`\u2705 Worker ${this.config.workerId} started`, {
        location: this.config.location
      });
    } catch (error) {
      logger.error("Failed to start worker", {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  }
  async connectToRabbitMQ() {
    this.connection = await import_amqplib.default.connect(this.config.rabbitmqUrl);
    this.connection.on("error", (err) => {
      logger.error("RabbitMQ connection error", err);
      this.reconnect();
    });
    this.connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
      this.reconnect();
    });
    this.channel = await this.connection.createChannel();
    logger.info("\u2705 Connected to RabbitMQ");
  }
  async reconnect() {
    logger.info("Attempting to reconnect...");
    setTimeout(() => this.start(), 5e3);
  }
  async register() {
    if (!this.channel) throw new Error("Channel not initialized");
    let attempts = 0;
    const maxAttempts = 10;
    const ackTimeoutMs = 6e4;
    while (attempts < maxAttempts) {
      attempts++;
      logger.info(`\u{1F4E4} Sending registration (attempt ${attempts}/${maxAttempts})...`);
      const ackQueue = await this.channel.assertQueue("", { exclusive: true });
      const ackRoutingKey = `ack.${this.config.workerId}`;
      await this.channel.bindQueue(ackQueue.queue, EXCHANGES.REGISTRATION, ackRoutingKey);
      logger.info(`\u{1F4EE} ACK queue ready: ${ackQueue.queue} bound to ${EXCHANGES.REGISTRATION} with key: ${ackRoutingKey}`);
      await this.channel.publish(
        EXCHANGES.REGISTRATION,
        "register",
        Buffer.from(JSON.stringify(this.registration))
      );
      logger.info(`\u23F3 Waiting for ACK on ${ackRoutingKey} (timeout: ${ackTimeoutMs / 1e3}s)`);
      const ackReceived = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          logger.warn(`\u23F1\uFE0F ACK timeout for ${this.config.workerId} after ${ackTimeoutMs / 1e3} seconds (attempt ${attempts}/${maxAttempts})`);
          resolve(false);
        }, ackTimeoutMs);
        this.channel.consume(ackQueue.queue, (msg) => {
          logger.debug(`\u{1F514} Message received on ACK queue`);
          if (msg) {
            try {
              logger.debug(`\u{1F4E6} Message details:`, {
                exchange: msg.fields.exchange,
                routingKey: msg.fields.routingKey,
                contentType: msg.properties.contentType
              });
              const ackData = JSON.parse(msg.content.toString());
              logger.info(`\u{1F4E8} Received ACK:`, ackData);
              clearTimeout(timeout);
              this.channel.ack(msg);
              resolve(true);
            } catch (err) {
              logger.error(`\u274C Failed to parse ACK message:`, err);
              logger.error(`Raw message:`, msg.content.toString());
            }
          } else {
            logger.debug(`\u26A0\uFE0F Null message received`);
          }
        }, { noAck: false }).then((result) => {
          logger.debug(`\u{1F442} Consumer started with tag: ${result.consumerTag}`);
        });
      });
      if (ackReceived) {
        logger.info(`\u2705 Worker registered with scheduler after ${attempts} attempt(s)`);
        return;
      }
      await this.channel.deleteQueue(ackQueue.queue);
      if (attempts < maxAttempts) {
        logger.warn(`\u26A0\uFE0F Registration not acknowledged, retrying in 10 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 1e4));
      }
    }
    logger.error(`\u274C Failed to register after ${maxAttempts} attempts. Worker will continue without scheduler confirmation.`);
    logger.info(`\u{1F4AA} Worker proceeding in standalone mode - will process any incoming check requests`);
  }
  async setupExchanges() {
    if (!this.channel) throw new Error("Channel not initialized");
    const exchanges = [
      { name: EXCHANGES.CHECKS, type: "topic" },
      { name: EXCHANGES.CLAIMS, type: "direct" },
      { name: EXCHANGES.RESULTS, type: "topic" },
      { name: EXCHANGES.REGISTRATION, type: "topic" },
      { name: EXCHANGES.HEARTBEATS, type: "topic" }
    ];
    for (const ex of exchanges) {
      try {
        await this.channel.assertExchange(ex.name, ex.type, { durable: true });
        logger.debug(`Created/verified exchange ${ex.name} (${ex.type})`);
      } catch (error) {
        if (error.message && error.message.includes("inequivalent")) {
          logger.warn(`Exchange ${ex.name} exists with different type, using existing`);
        } else {
          logger.error(`Failed to create exchange ${ex.name}:`, error.message);
          throw error;
        }
      }
    }
    logger.info("\u2705 Exchanges configured");
  }
  async setupQueues() {
    if (!this.channel) throw new Error("Channel not initialized");
    const checkQueue = `${QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
    await this.channel.assertQueue(checkQueue, { durable: true });
    const bindings = RoutingKeyBuilder.getWorkerBindings(this.config.location);
    for (const binding of bindings) {
      await this.channel.bindQueue(checkQueue, EXCHANGES.CHECKS, binding);
      logger.debug(`Bound to routing key: ${binding}`);
    }
    const claimQueue = `${QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
    await this.channel.assertQueue(claimQueue, { durable: true });
    await this.channel.bindQueue(claimQueue, EXCHANGES.CLAIMS, `response.${this.config.workerId}`);
    logger.info(`\u2705 Queues and bindings configured`);
  }
  async listenForChecks() {
    if (!this.channel) throw new Error("Channel not initialized");
    const checkQueue = `${QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
    await this.channel.consume(checkQueue, async (msg) => {
      if (!msg) return;
      try {
        const task = JSON.parse(msg.content.toString());
        logger.info(`\u{1F4E5} Received check task ${task.id}`, {
          serviceId: task.serviceId,
          target: task.target
        });
        const claimed = await this.claimTask(task);
        if (!claimed) {
          logger.info(`\u274C Task ${task.id} claimed by another worker, skipping`);
          this.channel.ack(msg);
          return;
        }
        const result = await this.executeCheck(task);
        await this.sendResult(task, result);
        this.channel.ack(msg);
      } catch (error) {
        logger.error("Failed to process check", error);
        this.channel.nack(msg, false, false);
      }
    });
    logger.info("\u{1F442} Listening for check tasks");
  }
  async claimTask(task) {
    if (!this.channel) throw new Error("Channel not initialized");
    const claimRequest = {
      taskId: task.id,
      workerId: this.config.workerId,
      timestamp: Date.now()
    };
    await this.channel.publish(
      EXCHANGES.CLAIMS,
      "request",
      Buffer.from(JSON.stringify(claimRequest))
    );
    const claimQueue = `${QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.warn(`Claim timeout for task ${task.id}, skipping check`);
        resolve(false);
      }, this.CLAIM_TIMEOUT);
      this.channel.consume(claimQueue, async (msg) => {
        if (!msg) return;
        try {
          const response = JSON.parse(msg.content.toString());
          if (response.taskId === task.id) {
            clearTimeout(timeout);
            this.channel.ack(msg);
            resolve(response.approved);
          }
        } catch (error) {
          logger.error("Failed to parse claim response", error);
        }
      }).then(({ consumerTag }) => {
        setTimeout(() => {
          if (this.channel && consumerTag) {
            this.channel.cancel(consumerTag).catch(() => {
            });
          }
        }, this.CLAIM_TIMEOUT + 1e3);
      });
    });
  }
  async executeCheck(task) {
    const startTime = Date.now();
    try {
      const response = await (0, import_axios.default)({
        method: task.config?.method || "GET",
        url: task.target,
        timeout: this.CHECK_TIMEOUT,
        headers: task.config?.headers || {},
        validateStatus: () => true
        // Accept any status
      });
      const responseTime = Date.now() - startTime;
      return {
        status: response.status < 400 ? "up" : "down",
        statusCode: response.status,
        responseTime,
        timestamp: Date.now(),
        workerId: this.config.workerId,
        location: this.config.location,
        region: this.config.location.city || this.config.location.country || this.config.location.region || "unknown"
      };
    } catch (error) {
      return {
        status: "down",
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        workerId: this.config.workerId,
        location: this.config.location,
        region: this.config.location.city || this.config.location.country || this.config.location.region || "unknown",
        error: error.message || "Check failed"
      };
    }
  }
  async sendResult(task, result) {
    if (!this.channel) throw new Error("Channel not initialized");
    const fullResult = {
      taskId: task.id,
      serviceId: task.serviceId,
      nestId: task.nestId,
      ...result
    };
    await this.channel.publish(
      EXCHANGES.RESULTS,
      `check.${this.config.workerId}`,
      Buffer.from(JSON.stringify(fullResult)),
      { persistent: true }
    );
    logger.info(`\u2705 Result sent for task ${task.id}`, {
      status: result.status,
      responseTime: result.responseTime
    });
  }
  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (!this.channel) return;
      try {
        let publicIP = null;
        if (!this.cachedIP || Date.now() - this.cachedIPTime > 36e5) {
          try {
            const response = await fetch("https://api.ipify.org?format=json", {
              signal: AbortSignal.timeout(5e3)
            });
            const data = await response.json();
            this.cachedIP = data.ip;
            this.cachedIPTime = Date.now();
            publicIP = data.ip;
          } catch (err) {
            publicIP = this.cachedIP;
          }
        } else {
          publicIP = this.cachedIP;
        }
        const heartbeatData = {
          workerId: this.config.workerId,
          location: this.config.location,
          ip: publicIP,
          // Include IP for server-side geolocation
          timestamp: Date.now(),
          lastSeen: Date.now(),
          activeChecks: this.activeChecks.size,
          uptime: Date.now() - this.registration.registeredAt,
          // Required fields for HeartbeatVerifier
          region: this.config.location.region || "unknown",
          version: this.config.version || "6.4.4",
          checksCompleted: 0,
          // TODO: track actual checks completed
          totalPoints: 0,
          // TODO: track actual points
          currentPeriodPoints: 0,
          earnings: {
            points: 0,
            estimatedUSD: 0,
            estimatedCrypto: 0
          }
        };
        await this.channel.publish(
          EXCHANGES.HEARTBEATS,
          "worker",
          Buffer.from(JSON.stringify(heartbeatData))
        );
        logger.debug("\u{1F493} Heartbeat sent");
      } catch (error) {
        logger.error("Failed to send heartbeat", error);
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  async stop() {
    logger.info("Stopping worker...");
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.channel) {
      await this.channel.publish(
        EXCHANGES.REGISTRATION,
        "unregister",
        Buffer.from(JSON.stringify({ workerId: this.config.workerId }))
      );
    }
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    logger.info("Worker stopped");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GeographicWorker
});
