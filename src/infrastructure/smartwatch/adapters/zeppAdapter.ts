import { ISmartwatchAdapter, SmartwatchPlatformId, SmartwatchTelemetry, SyncedActivityRecord } from "../types";

export class ZeppAdapter implements ISmartwatchAdapter {
  platformId: SmartwatchPlatformId = "zepp_os";
  displayName = "Zepp OS (Amazfit BioTracker™ & PAI)";
  brand = "Zepp Health";

  private isConnected = false;
  private telemetry: SmartwatchTelemetry = {
    heartRateBpm: 68,
    restingHrBpm: 49,
    hrvMs: 78,
    stepCount: 9840,
    activeCaloriesBurned: 540,
    batteryLevelPct: 92,
    lastSyncTimestamp: new Date().toISOString(),
    connectionStatus: "disconnected",
    deviceName: "Amazfit Balance (Zepp OS 3.5)",
    firmwareVersion: "ZeppOS-v3.5.8.1",
    spO2Percentage: 99,
    stressScore: 22,
    deepSleepMinutes: 104,
    remSleepMinutes: 88,
    lightSleepMinutes: 248,
  };

  isAvailable(): boolean {
    return true;
  }

  async connect(): Promise<{ success: boolean; deviceName: string; telemetry: SmartwatchTelemetry }> {
    await new Promise((r) => setTimeout(r, 550));
    this.isConnected = true;
    this.telemetry = {
      ...this.telemetry,
      connectionStatus: "connected",
      lastSyncTimestamp: new Date().toISOString(),
      heartRateBpm: Math.floor(65 + Math.random() * 12),
      stepCount: 10210,
    };
    return {
      success: true,
      deviceName: this.telemetry.deviceName,
      telemetry: this.telemetry,
    };
  }

  async disconnect(): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 200));
    this.isConnected = false;
    this.telemetry.connectionStatus = "disconnected";
    return true;
  }

  async getTelemetry(): Promise<SmartwatchTelemetry> {
    if (!this.isConnected) {
      return { ...this.telemetry, connectionStatus: "disconnected" };
    }
    return {
      ...this.telemetry,
      heartRateBpm: Math.floor(66 + Math.random() * 14),
      lastSyncTimestamp: new Date().toISOString(),
    };
  }

  async syncActivities(): Promise<SyncedActivityRecord[]> {
    await new Promise((r) => setTimeout(r, 450));
    return [
      {
        id: `zepp-act-${Date.now()}-1`,
        platform: "zepp_os",
        name: "Treino Funcional & Calistenia",
        type: "Fitness",
        startTime: new Date(Date.now() - 3600000 * 6).toISOString(),
        durationMinutes: 50,
        caloriesBurned: 390,
        averageHrBpm: 136,
        maxHrBpm: 165,
      },
    ];
  }

  async pushHydrationData(waterMl: number): Promise<{ success: boolean; syncedAt: string }> {
    await new Promise((r) => setTimeout(r, 300));
    this.telemetry.waterIntakeSyncedMl = waterMl;
    return {
      success: true,
      syncedAt: new Date().toISOString(),
    };
  }
}
