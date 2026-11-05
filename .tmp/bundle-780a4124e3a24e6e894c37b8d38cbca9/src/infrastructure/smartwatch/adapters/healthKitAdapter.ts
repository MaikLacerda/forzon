import { ISmartwatchAdapter, SmartwatchPlatformId, SmartwatchTelemetry, SyncedActivityRecord } from "../types";

export class HealthKitAdapter implements ISmartwatchAdapter {
  platformId: SmartwatchPlatformId = "healthkit";
  displayName = "Apple HealthKit & Apple Watch Series/Ultra";
  brand = "Apple Health";

  private isConnected = false;
  private telemetry: SmartwatchTelemetry = {
    heartRateBpm: 72,
    restingHrBpm: 51,
    hrvMs: 72,
    stepCount: 10450,
    activeCaloriesBurned: 620,
    batteryLevelPct: 81,
    lastSyncTimestamp: new Date().toISOString(),
    connectionStatus: "disconnected",
    deviceName: "Apple Watch Ultra 2 (watchOS 10.4)",
    firmwareVersion: "watchOS-10.4.1",
    spO2Percentage: 99,
    stressScore: 19,
    deepSleepMinutes: 98,
    remSleepMinutes: 112,
    lightSleepMinutes: 230,
  };

  isAvailable(): boolean {
    return true;
  }

  async connect(): Promise<{ success: boolean; deviceName: string; telemetry: SmartwatchTelemetry }> {
    await new Promise((r) => setTimeout(r, 600));
    this.isConnected = true;
    this.telemetry = {
      ...this.telemetry,
      connectionStatus: "connected",
      lastSyncTimestamp: new Date().toISOString(),
      heartRateBpm: Math.floor(70 + Math.random() * 15),
      stepCount: 11100,
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
      heartRateBpm: Math.floor(71 + Math.random() * 10),
      lastSyncTimestamp: new Date().toISOString(),
    };
  }

  async syncActivities(): Promise<SyncedActivityRecord[]> {
    await new Promise((r) => setTimeout(r, 450));
    return [
      {
        id: `hk-act-${Date.now()}-1`,
        platform: "healthkit",
        name: "Treino de Força Tradicional (Apple Fitness+)",
        type: "TraditionalStrengthTraining",
        startTime: new Date(Date.now() - 3600000 * 3).toISOString(),
        durationMinutes: 55,
        caloriesBurned: 480,
        averageHrBpm: 142,
        maxHrBpm: 172,
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
