import { accountStorage } from "./accountStorage";
import {
  SleepStageMetrics,
  DeepSleepLoadAdjustment,
  ConnectedFitnessPlatform,
  UserProfile,
} from "../types";
import { storage } from "./storage";

const SLEEP_STORAGE_KEY = "athlynx_health_sleep_metrics";
const PLATFORMS_STORAGE_KEY = "athlynx_connected_platforms";
const LOAD_ADJUSTMENT_KEY = "athlynx_deep_sleep_load_adj";

export const DEFAULT_CONNECTED_PLATFORMS: ConnectedFitnessPlatform[] = [
  {
    id: "apple_watch",
    name: "Apple Watch (Apple HealthKit)",
    displayName: "Apple Watch Ultra 2",
    category: "smartwatch",
    iconName: "Watch",
    connected: true,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    supportedData: ["Ciclos de Sono (REM/Leve/Profundo)", "Frequência Cardíaca", "VFC (HRV)", "Água"],
    batteryPercent: 88,
    deviceModel: "Watch Ultra 2 (WatchOS 11)",
  },
  {
    id: "strava",
    name: "Strava Club & GPS Sync",
    displayName: "Strava Athlete Bridge",
    category: "fitness_app",
    iconName: "Flame",
    connected: true,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    supportedData: ["Corridas & Ciclismo GPS", "Esforço Relativo", "Segmentos & PRs", "Altimetria"],
    deviceModel: "Strava API v3",
  },
  {
    id: "zepp_os",
    name: "Zepp OS (Amazfit & Helio Ring)",
    displayName: "Amazfit Balance / Helio Ring",
    category: "smart_ring",
    iconName: "Zap",
    connected: true,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    supportedData: ["Estágios de Sono Profundo", "Prontidão Biofísica", "Temperatura Cutânea"],
    batteryPercent: 92,
    deviceModel: "Zepp OS 4.0 Ecosystem",
  },
  {
    id: "wearos",
    name: "WearOS (Galaxy Watch & Pixel Watch)",
    displayName: "Galaxy Watch 6 Classic",
    category: "smartwatch",
    iconName: "Smartphone",
    connected: false,
    supportedData: ["Health Connect API", "Bioimpedância de Pulso", "Composições de Treino"],
    batteryPercent: 74,
    deviceModel: "WearOS 5 by Google",
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    displayName: "Garmin Forerunner 965",
    category: "smartwatch",
    iconName: "Activity",
    connected: false,
    supportedData: ["Body Battery", "Training Readiness", "VO2 Max Dinâmico"],
    batteryPercent: 82,
    deviceModel: "Garmin Connect IQ",
  },
];

export const DEFAULT_SLEEP_METRICS: SleepStageMetrics = {
  deepSleepMinutes: 105, // 1h 45m de sono profundo reparador
  remSleepMinutes: 115,  // 1h 55m de sono REM
  lightSleepMinutes: 215,// 3h 35m de sono leve
  awakeMinutes: 20,      // 20 min desperto
  totalSleepMinutes: 455,// 7h 35m total
  sleepEfficiencyPercent: 91,
  averageHeartRateBpm: 51,
  restingHrvMs: 68,
  recordedDate: new Date().toISOString().slice(0, 10),
  sourcePlatform: "apple_health",
};

export const healthSleepService = {
  /**
   * Retrieves today's sleep cycle breakdown
   */
  getSleepMetrics(): SleepStageMetrics {
    try {
      const stored = accountStorage.getItem(SLEEP_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return { ...DEFAULT_SLEEP_METRICS, deepSleepMinutes: 0, remSleepMinutes: 0, lightSleepMinutes: 0, awakeMinutes: 0, totalSleepMinutes: 0, sleepEfficiencyPercent: 0, averageHeartRateBpm: 0, restingHrvMs: 0, recordedDate: "" };
  },

  /**
   * Saves updated sleep cycle breakdown
   */
  saveSleepMetrics(metrics: SleepStageMetrics): void {
    try {
      accountStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(metrics));
      window.dispatchEvent(
        new CustomEvent("athlynx_sleep_metrics_updated", { detail: metrics })
      );
    } catch (e) {
      console.error("Error saving sleep metrics", e);
    }
  },

  /**
   * Retrieves list of fitness platforms (Apple Watch, Strava, Zepp OS, etc.)
   */
  getConnectedPlatforms(): ConnectedFitnessPlatform[] {
    try {
      const stored = accountStorage.getItem(PLATFORMS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return DEFAULT_CONNECTED_PLATFORMS.map(p => ({ ...p, connected: false, lastSyncedAt: undefined, batteryPercent: undefined }));
  },

  /**
   * Saves connected platforms
   */
  saveConnectedPlatforms(platforms: ConnectedFitnessPlatform[]): void {
    try {
      accountStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(platforms));
      window.dispatchEvent(
        new CustomEvent("athlynx_platforms_updated", { detail: platforms })
      );
    } catch (e) {
      console.error("Error saving platforms", e);
    }
  },

  /**
   * Toggles connection state for a given platform
   */
  togglePlatformConnection(platformId: string): ConnectedFitnessPlatform[] {
    const list = this.getConnectedPlatforms().map((p) => {
      if (p.id === platformId) {
        const nextState = !p.connected;
        return {
          ...p,
          connected: nextState,
          lastSyncedAt: nextState ? new Date().toISOString() : p.lastSyncedAt,
        };
      }
      return p;
    });
    this.saveConnectedPlatforms(list);
    return list;
  },

  /**
   * Imports live health sleep cycle data from paired devices (Apple Watch, Zepp OS, Strava)
   */
  async importSleepDataFromDevice(
    source: "apple_health" | "strava" | "zepp_os" | "wearos" | "garmin" = "apple_health"
  ): Promise<SleepStageMetrics> {
    throw new Error('A integração real com este dispositivo ainda não está configurada. Nenhum registro de saúde foi criado.');
  },

  /**
   * Calculates scientific load calibration based on Deep Sleep minutes
   */
  calculateDeepSleepLoadAdjustment(
    sleep: SleepStageMetrics
  ): DeepSleepLoadAdjustment {
    const deepMin = sleep.deepSleepMinutes;
    const deepPct = Math.round((deepMin / (sleep.totalSleepMinutes || 1)) * 100);

    // Check if user has already applied this adjustment
    let applied = false;
    let appliedAt: string | undefined = undefined;
    try {
      const stored = accountStorage.getItem(LOAD_ADJUSTMENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === sleep.recordedDate && parsed.applied) {
          applied = true;
          appliedAt = parsed.appliedAt;
        }
      }
    } catch {}

    const h = Math.floor(deepMin / 60);
    const m = deepMin % 60;
    const formattedDeep = `${h}h ${m}m`;

    if (deepMin >= 90) {
      // High deep sleep: Optimal Growth Hormone & Miofibrilar Repair
      return {
        deepSleepMinutes: deepMin,
        deepSleepPercent: deepPct,
        status: "excelente",
        loadMultiplier: 1.05,
        volumeSetsAdjustment: 0,
        targetRpeRange: "RPE 8.5 - 9.5 (Luz Verde para PRs)",
        badgeLabel: `Sono Profundo Ótimo (${formattedDeep} · +5% Carga)`,
        explanation: `Identificados ${formattedDeep} de sono profundo (${deepPct}% do repouso noturno). A taxa de secreção de GH e reparação de microtraumas miofibrilares foi máxima. O SNC está 100% regenerado: a IA recomenda sobrecarga progressiva (+5% na carga ou +1-2 repetições).`,
        applied,
        appliedAt,
      };
    }

    if (deepMin >= 60) {
      // Moderate deep sleep: Standard baseline maintenance
      return {
        deepSleepMinutes: deepMin,
        deepSleepPercent: deepPct,
        status: "adequado",
        loadMultiplier: 1.0,
        volumeSetsAdjustment: 0,
        targetRpeRange: "RPE 7.5 - 8.5 (Carga Padrão)",
        badgeLabel: `Sono Profundo Normal (${formattedDeep} · Manter Carga)`,
        explanation: `Sono profundo de ${formattedDeep} (${deepPct}%). Recuperação biológica suficiente para sustentar a periodização planejada. Mantenha as cargas habituais com 2 repetições de reserva.`,
        applied,
        appliedAt,
      };
    }

    // Low deep sleep: Poor recovery, risk of overtraining
    return {
      deepSleepMinutes: deepMin,
      deepSleepPercent: deepPct,
      status: "insuficiente",
      loadMultiplier: 0.88,
      volumeSetsAdjustment: -1,
      targetRpeRange: "RPE 6.5 - 7 (Deload Ativo)",
      badgeLabel: `Sono Profundo Insuficiente (${formattedDeep} · -12% Carga)`,
      explanation: `Apenas ${formattedDeep} de sono profundo registrados (${deepPct}% do ciclo). A síntese proteica noturna e a drenagem do sistema glinfático foram interrompidas. Para prevenir lesões tendíneas e fadiga do SNC, a IA recomenda reduzir a carga em 12% e eliminar 1 série.`,
      applied,
      appliedAt,
    };
  },

  /**
   * Applies load adjustment to athlete's active plan
   */
  applyDeepSleepLoadToPlan(
    adj: DeepSleepLoadAdjustment
  ): void {
    const saved = {
      date: new Date().toISOString().slice(0, 10),
      applied: true,
      appliedAt: new Date().toISOString(),
      multiplier: adj.loadMultiplier,
    };
    try {
      accountStorage.setItem(LOAD_ADJUSTMENT_KEY, JSON.stringify(saved));
    } catch {}

    window.dispatchEvent(
      new CustomEvent("athlynx_deep_sleep_load_applied", { detail: saved })
    );
  },

  /**
   * Reverts load adjustment back to standard
   */
  revertDeepSleepLoad(): void {
    try {
      accountStorage.removeItem(LOAD_ADJUSTMENT_KEY);
    } catch {}

    window.dispatchEvent(
      new CustomEvent("athlynx_deep_sleep_load_applied", {
        detail: { applied: false, multiplier: 1.0 },
      })
    );
  },
};
