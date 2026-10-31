import {
  ISmartwatchAdapter,
  SmartwatchPlatformId,
  SmartwatchConnectionInfo,
  SmartwatchTelemetry,
  SyncedActivityRecord,
  ConnectionState,
} from "./types";
import { StravaAdapter } from "./adapters/stravaAdapter";
import { ZeppAdapter } from "./adapters/zeppAdapter";
import { HealthKitAdapter } from "./adapters/healthKitAdapter";

const STORAGE_KEY = "athlynx_smartwatch_infrastructure_v1";

export class SmartwatchConnectivityService {
  private static instance: SmartwatchConnectivityService | null = null;
  private adapters: Map<SmartwatchPlatformId, ISmartwatchAdapter> = new Map();
  private connections: Map<SmartwatchPlatformId, SmartwatchConnectionInfo> = new Map();
  private subscribers: Set<(connections: SmartwatchConnectionInfo[]) => void> = new Set();
  private telemetryTimer: number | null = null;

  private constructor() {
    this.registerAdapter(new StravaAdapter());
    this.registerAdapter(new ZeppAdapter());
    this.registerAdapter(new HealthKitAdapter());
    this.initDefaultConnections();
    this.loadFromStorage();
    this.startHeartbeatTelemetry();
  }

  public static getInstance(): SmartwatchConnectivityService {
    if (!SmartwatchConnectivityService.instance) {
      SmartwatchConnectivityService.instance = new SmartwatchConnectivityService();
    }
    return SmartwatchConnectivityService.instance;
  }

  public registerAdapter(adapter: ISmartwatchAdapter) {
    this.adapters.set(adapter.platformId, adapter);
  }

  private initDefaultConnections() {
    const defaultList: SmartwatchConnectionInfo[] = [
      {
        platformId: "strava",
        name: "Strava Cloud Companion",
        brand: "Strava GPS",
        protocol: "OAuth 2.0 Webhooks",
        status: "connected",
        isAutoSyncEnabled: true,
        capabilities: {
          heartRate: true,
          hrv: true,
          gpsTrack: true,
          sleepCycles: false,
          hydrationPush: true,
          powerMeters: true,
        },
        telemetry: {
          heartRateBpm: 138,
          restingHrBpm: 52,
          hrvMs: 64,
          stepCount: 11420,
          activeCaloriesBurned: 680,
          batteryLevelPct: 88,
          lastSyncTimestamp: new Date().toISOString(),
          connectionStatus: "connected",
          deviceName: "Strava Mobile & Segments",
          firmwareVersion: "v3.2",
          spO2Percentage: 98,
          stressScore: 28,
        },
      },
      {
        platformId: "zepp_os",
        name: "Amazfit Balance / Cheetah",
        brand: "Zepp OS (Amazfit)",
        protocol: "Zepp Bluetooth BLE & Cloud API",
        status: "connected",
        isAutoSyncEnabled: true,
        capabilities: {
          heartRate: true,
          hrv: true,
          gpsTrack: true,
          sleepCycles: true,
          hydrationPush: true,
          powerMeters: false,
        },
        telemetry: {
          heartRateBpm: 67,
          restingHrBpm: 48,
          hrvMs: 76,
          stepCount: 9840,
          activeCaloriesBurned: 540,
          batteryLevelPct: 92,
          lastSyncTimestamp: new Date().toISOString(),
          connectionStatus: "connected",
          deviceName: "Amazfit Balance (Zepp OS 3.5)",
          firmwareVersion: "ZeppOS-v3.5.8",
          spO2Percentage: 99,
          stressScore: 21,
          deepSleepMinutes: 104,
          remSleepMinutes: 88,
          lightSleepMinutes: 248,
        },
      },
      {
        platformId: "healthkit",
        name: "Apple Watch Series & Ultra",
        brand: "Apple HealthKit",
        protocol: "HealthKit Local Storage & WatchOS",
        status: "connected",
        isAutoSyncEnabled: true,
        capabilities: {
          heartRate: true,
          hrv: true,
          gpsTrack: true,
          sleepCycles: true,
          hydrationPush: true,
          powerMeters: true,
        },
        telemetry: {
          heartRateBpm: 72,
          restingHrBpm: 51,
          hrvMs: 72,
          stepCount: 10450,
          activeCaloriesBurned: 620,
          batteryLevelPct: 81,
          lastSyncTimestamp: new Date().toISOString(),
          connectionStatus: "connected",
          deviceName: "Apple Watch Ultra 2",
          firmwareVersion: "watchOS 10.4",
          spO2Percentage: 99,
          stressScore: 19,
          deepSleepMinutes: 98,
          remSleepMinutes: 112,
          lightSleepMinutes: 230,
        },
      },
    ];

    defaultList.forEach((c) => this.connections.set(c.platformId, c));
  }

  private loadFromStorage() {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: SmartwatchConnectionInfo) => {
            this.connections.set(c.platformId, c);
          });
        }
      }
    } catch {
      // fallback
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === "undefined") return;
      const array = Array.from(this.connections.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
    } catch {}
  }

  private startHeartbeatTelemetry() {
    if (typeof window === "undefined") return;
    if (this.telemetryTimer) clearInterval(this.telemetryTimer);

    // Update telemetry with realistic micro-variations every 5 seconds
    this.telemetryTimer = window.setInterval(() => {
      let changed = false;
      this.connections.forEach((conn) => {
        if (conn.status === "connected") {
          const deltaBpm = Math.floor(Math.random() * 5) - 2;
          conn.telemetry.heartRateBpm = Math.max(50, Math.min(185, conn.telemetry.heartRateBpm + deltaBpm));
          changed = true;
        }
      });
      if (changed) {
        this.notifySubscribers();
      }
    }, 6000);
  }

  public subscribe(callback: (connections: SmartwatchConnectionInfo[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getAllConnections());
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    const list = this.getAllConnections();
    this.subscribers.forEach((cb) => cb(list));
  }

  public getAllConnections(): SmartwatchConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  public getConnection(platformId: SmartwatchPlatformId): SmartwatchConnectionInfo | undefined {
    return this.connections.get(platformId);
  }

  public async connectPlatform(platformId: SmartwatchPlatformId): Promise<boolean> {
    const conn = this.connections.get(platformId);
    if (!conn) return false;

    conn.status = "syncing";
    this.notifySubscribers();

    const adapter = this.adapters.get(platformId);
    if (adapter) {
      try {
        const res = await adapter.connect();
        conn.status = "connected";
        conn.telemetry = res.telemetry;
        conn.lastSyncMessage = `Dispositivo ${res.deviceName} conectado com sucesso.`;
      } catch (err: any) {
        conn.status = "error";
        conn.lastSyncMessage = err?.message || "Erro no handshake de conexão.";
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      conn.status = "connected";
      conn.telemetry.connectionStatus = "connected";
    }

    this.saveToStorage();
    this.notifySubscribers();
    return conn.status === "connected";
  }

  public async disconnectPlatform(platformId: SmartwatchPlatformId): Promise<boolean> {
    const conn = this.connections.get(platformId);
    if (!conn) return false;

    const adapter = this.adapters.get(platformId);
    if (adapter) {
      await adapter.disconnect();
    }
    conn.status = "disconnected";
    conn.telemetry.connectionStatus = "disconnected";
    conn.lastSyncMessage = "Desconectado pelo usuário.";
    this.saveToStorage();
    this.notifySubscribers();
    return true;
  }

  public async syncPlatform(platformId: SmartwatchPlatformId): Promise<{
    success: boolean;
    activitiesCount: number;
    telemetry: SmartwatchTelemetry;
  }> {
    const conn = this.connections.get(platformId);
    if (!conn) {
      throw new Error("Plataforma não encontrada");
    }

    const previousStatus = conn.status;
    conn.status = "syncing";
    this.notifySubscribers();

    const adapter = this.adapters.get(platformId);
    let activities: SyncedActivityRecord[] = [];

    try {
      if (adapter) {
        activities = await adapter.syncActivities();
        const latestTelemetry = await adapter.getTelemetry();
        conn.telemetry = {
          ...conn.telemetry,
          ...latestTelemetry,
          lastSyncTimestamp: new Date().toISOString(),
          connectionStatus: "connected",
        };
      } else {
        await new Promise((r) => setTimeout(r, 800));
        conn.telemetry.lastSyncTimestamp = new Date().toISOString();
      }

      conn.status = "connected";
      conn.lastSyncMessage = `Sincronização concluída: ${activities.length} atividade(s) e biometria atualizada.`;
      this.saveToStorage();
      this.notifySubscribers();

      return {
        success: true,
        activitiesCount: activities.length,
        telemetry: conn.telemetry,
      };
    } catch (err: any) {
      conn.status = previousStatus === "connected" ? "connected" : "error";
      conn.lastSyncMessage = err?.message || "Falha na sincronização.";
      this.saveToStorage();
      this.notifySubscribers();
      throw err;
    }
  }

  public async syncAll(): Promise<{ syncedPlatforms: number; totalActivities: number }> {
    let synced = 0;
    let totalActs = 0;

    for (const [id, conn] of this.connections.entries()) {
      if (conn.status === "connected") {
        try {
          const res = await this.syncPlatform(id);
          if (res.success) {
            synced++;
            totalActs += res.activitiesCount;
          }
        } catch {}
      }
    }

    return { syncedPlatforms: synced, totalActivities: totalActs };
  }
}

export const smartwatchConnectivity = SmartwatchConnectivityService.getInstance();
