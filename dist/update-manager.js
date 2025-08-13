// src/update-manager.ts
class UpdateManager {
  currentVersion = "6.4.0";
  getCurrentVersion() {
    return this.currentVersion;
  }
  async handleUpdateCommand(data) {
    console.log("Update command received:", data);
  }
  async handleRebuildCommand(data) {
    console.log("Rebuild command received:", data);
  }
  cancel() {}
}
export {
  UpdateManager
};
