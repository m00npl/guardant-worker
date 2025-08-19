"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateManager = void 0;
class UpdateManager {
    currentVersion = '6.5.1';
    getCurrentVersion() {
        return this.currentVersion;
    }
    async handleUpdateCommand(data) {
        console.log('Update command received:', data);
    }
    async handleRebuildCommand(data) {
        console.log('Rebuild command received:', data);
    }
    cancel() {
    }
}
exports.UpdateManager = UpdateManager;
