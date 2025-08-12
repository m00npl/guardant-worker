import { GeographicLocation } from './geographic-hierarchy';
export interface WorkerConfig {
    workerId: string;
    location: GeographicLocation;
    rabbitmqUrl: string;
    capabilities?: string[];
    version?: string;
}
export declare class GeographicWorker {
    private config;
    private connection;
    private channel;
    private registration;
    private activeChecks;
    private heartbeatInterval;
    private readonly HEARTBEAT_INTERVAL;
    private readonly CHECK_TIMEOUT;
    private readonly CLAIM_TIMEOUT;
    constructor(config: WorkerConfig);
    start(): Promise<void>;
    private connectToRabbitMQ;
    private reconnect;
    private register;
    private setupExchanges;
    private setupQueues;
    private listenForChecks;
    private claimTask;
    private executeCheck;
    private sendResult;
    private startHeartbeat;
    stop(): Promise<void>;
}
//# sourceMappingURL=geographic-worker.d.ts.map