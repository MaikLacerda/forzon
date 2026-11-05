export type SmartwatchPlatformId = "strava" | "zepp_os" | "healthkit" | "wearos" | "garmin";

export type ConnectionState = "connected" | "disconnected" | "syncing" | "error";

export interface SmartwatchTelemetry {
  heartRateBpm: number;
  restingHrBpm: number;
  hrvMs: number;
  stepCount: number;
  activeCaloriesBurned: number;
  batteryLevelPct: number;
  lastSyncTimestamp: string;
  connectionStatus: ConnectionState;
  deviceName: string;
  firmwareVersion?: string;
  // Specific sensor readings
  spO2Percentage?: number;
  stressScore?: number; // 1-100
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  lightSleepMinutes?: number;
  waterIntakeSyncedMl?: number;
}

export interface SyncedActivityRecord {
  id: string;
  platform: SmartwatchPlatformId;
  name: string;
  type: string;
  startTime: string;
  durationMinutes: number;
  caloriesBurned: number;
  averageHrBpm: number;
  maxHrBpm: number;
  distanceKm?: number;
  elevationGainM?: number;
  gpsTrackPointsCount?: number;
}

export interface SmartwatchConnectionInfo {
  platformId: SmartwatchPlatformId;
  name: string;
  brand: string;
  protocol: string;
  status: ConnectionState;
  telemetry: SmartwatchTelemetry;
  lastSyncMessage?: string;
  isAutoSyncEnabled: boolean;
  capabilities: {
    heartRate: boolean;
    hrv: boolean;
    gpsTrack: boolean;
    sleepCycles: boolean;
    hydrationPush: boolean;
    powerMeters: boolean;
  };
}

export interface ISmartwatchAdapter {
  platformId: SmartwatchPlatformId;
  displayName: string;
  brand: string;
  connect(): Promise<{ success: boolean; deviceName: string; telemetry: SmartwatchTelemetry }>;
  disconnect(): Promise<boolean>;
  getTelemetry(): Promise<SmartwatchTelemetry>;
  syncActivities(): Promise<SyncedActivityRecord[]>;
  pushHydrationData(waterMl: number): Promise<{ success: boolean; syncedAt: string }>;
  isAvailable(): boolean;
}
