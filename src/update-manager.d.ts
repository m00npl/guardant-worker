export declare class UpdateManager {
    private isUpdating;
    private updateTimeout;
    private versionFile;
    private currentVersion;
    constructor();
    private loadCurrentVersion;
    getCurrentVersion(): string | null;
    handleUpdateCommand(data: any): Promise<void>;
    private performUpdate;
    handleRebuildCommand(data: any): Promise<void>;
    private performRebuild;
    cancel(): void;
}
//# sourceMappingURL=update-manager.d.ts.map