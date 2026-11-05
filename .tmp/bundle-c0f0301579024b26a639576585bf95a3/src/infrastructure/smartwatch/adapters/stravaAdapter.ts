import { ISmartwatchAdapter, SmartwatchPlatformId, SmartwatchTelemetry, SyncedActivityRecord } from "../types";

export class StravaAdapter implements ISmartwatchAdapter {
  platformId: SmartwatchPlatformId = "strava";
  displayName = "Strava API (V3 OAuth & Webhooks)";
  brand = "Strava Athletes";

  private isConnected = false;
  private telemetry: SmartwatchTelemetry = {
    heartRateBpm: 142,
    restingHrBpm: 52,
    hrvMs: 64,
    stepCount: 11420,
    activeCaloriesBurned: 680,
    batteryLevelPct: 88,
    lastSyncTimestamp: new Date().toISOString(),
    connectionStatus: "disconnected",
    deviceName: "Strava Cloud Companion (GPS Linked)",
    firmwareVersion: "API v3.2.1",
    spO2Percentage: 98,
    stressScore: 28,
  };

  isAvailable(): boolean {
    return true;
  }

  async connect(): Promise<{ success: boolean; deviceName: string; telemetry: SmartwatchTelemetry }> {
    // Simulate real OAuth authorization handshake
    await new Promise((r) => setTimeout(r, 600));
    this.isConnected = true;
    this.telemetry = {
      ...this.telemetry,
      connectionStatus: "connected",
      lastSyncTimestamp: new Date().toISOString(),
      heartRateBpm: Math.floor(130 + Math.random() * 25),
      stepCount: 12540,
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
    // Live realistic variation
    return {
      ...this.telemetry,
      heartRateBpm: Math.floor(135 + Math.random() * 20),
      lastSyncTimestamp: new Date().toISOString(),
    };
  }

  async syncActivities(): Promise<SyncedActivityRecord[]> {
    await new Promise((r) => setTimeout(r, 500));
    return [
      {
        id: `strava-act-${Date.now()}-1`,
        platform: "strava",
        name: "Treino de Corrida Intervalada (5km Fartlek)",
        type: "Run",
        startTime: new Date(Date.now() - 3600000 * 4).toISOString(),
        durationMinutes: 28,
        caloriesBurned: 345,
        averageHrBpm: 158,
        maxHrBpm: 178,
        distanceKm: 5.2,
        elevationGainM: 42,
        gpsTrackPointsCount: 1840,
      },
      {
        id: `strava-act-${Date.now()}-2`,
        platform: "strava",
        name: "Ciclismo Urbano & Subidas",
        type: "Ride",
        startTime: new Date(Date.now() - 3600000 * 24).toISOString(),
        durationMinutes: 45,
        caloriesBurned: 410,
        averageHrBpm: 144,
        maxHrBpm: 169,
        distanceKm: 18.4,
        elevationGainM: 195,
        gpsTrackPointsCount: 3200,
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
