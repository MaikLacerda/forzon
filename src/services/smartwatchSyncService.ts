import {
  DailyNutrition,
  CompletedWorkoutRecord,
  SmartwatchDevice,
  SmartwatchPlatform,
  AIHydrationAdjustment,
  SmartwatchSyncTelemetry,
} from "../types";
import { storage } from "./storage";

const DEVICE_STORAGE_KEY = "athlynx_smartwatch_device";
const HYDRATION_ADJUSTMENT_KEY = "athlynx_ai_hydration_adjustment";
const SYNC_TELEMETRY_KEY = "athlynx_smartwatch_telemetry";

const DEFAULT_DEVICE: SmartwatchDevice = {
  id: "watch-apple-ultra",
  platform: "apple_watch",
  deviceName: "Apple Watch Ultra 2 (HealthKit Bridge)",
  batteryPercent: 88,
  lastSyncedAt: new Date().toISOString(),
  autoSync: true,
  connected: true,
  syncWater: true,
  syncMacros: true,
  syncHeartRate: true,
  activeCaloriesBurnedToday: 640,
};

export const smartwatchSyncService = {
  /**
   * Retrieves the currently paired smartwatch device configuration.
   */
  getConnectedDevice(): SmartwatchDevice {
    try {
      const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading smartwatch device", e);
    }
    return DEFAULT_DEVICE;
  },

  /**
   * Updates and saves the smartwatch device settings.
   */
  saveConnectedDevice(device: SmartwatchDevice): void {
    try {
      localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(device));
      window.dispatchEvent(
        new CustomEvent("athlynx_smartwatch_device_change", { detail: device })
      );
    } catch (e) {
      console.error("Error saving smartwatch device", e);
    }
  },

  /**
   * Switches the active smartwatch platform (Apple Watch HealthKit vs WearOS Health Connect).
   */
  switchPlatform(platform: SmartwatchPlatform): SmartwatchDevice {
    const current = this.getConnectedDevice();
    const updated: SmartwatchDevice = {
      ...current,
      platform,
      deviceName:
        platform === "apple_watch"
          ? "Apple Watch Ultra 2 (Apple HealthKit)"
          : platform === "wearos"
          ? "Galaxy Watch 6 Classic (WearOS / Health Connect)"
          : "Garmin Forerunner 965 (Connect IQ API)",
      lastSyncedAt: new Date().toISOString(),
      connected: true,
    };
    this.saveConnectedDevice(updated);
    return updated;
  },

  /**
   * Synchronizes current water and macronutrient metrics with the smartwatch.
   * Simulates bi-directional HealthKit / Health Connect bridge synchronization.
   */
  async syncNutritionWithWatch(
    nutrition: DailyNutrition
  ): Promise<SmartwatchSyncTelemetry> {
    const device = this.getConnectedDevice();

    // Simulate real BLE / Cloud synchronization latency
    await new Promise((resolve) => setTimeout(resolve, 450));

    const telemetry: SmartwatchSyncTelemetry = {
      lastSyncTimestamp: new Date().toISOString(),
      waterSyncedMl: nutrition.waterIntakeMl,
      waterGoalSyncedMl: nutrition.waterGoalMl,
      caloriesBurnedSynced: device.activeCaloriesBurnedToday,
      proteinSyncedG: nutrition.consumedProteinG,
      carbsSyncedG: nutrition.consumedCarbsG,
      fatSyncedG: nutrition.consumedFatG,
      devicePlatform: device.platform,
      syncDirection: "bidirectional",
    };

    const updatedDevice: SmartwatchDevice = {
      ...device,
      lastSyncedAt: telemetry.lastSyncTimestamp,
      batteryPercent: Math.max(15, device.batteryPercent - (Math.random() > 0.8 ? 1 : 0)),
    };

    this.saveConnectedDevice(updatedDevice);

    try {
      localStorage.setItem(SYNC_TELEMETRY_KEY, JSON.stringify(telemetry));
    } catch {}

    window.dispatchEvent(
      new CustomEvent("athlynx_smartwatch_sync", { detail: telemetry })
    );

    return telemetry;
  },

  /**
   * Ingests a water intake log reported directly from the smartwatch complication.
   */
  logWaterFromWatch(ml: number): DailyNutrition {
    const nutrition = storage.getNutrition();
    const updated: DailyNutrition = {
      ...nutrition,
      waterIntakeMl: nutrition.waterIntakeMl + ml,
    };
    storage.saveNutrition(updated);
    this.syncNutritionWithWatch(updated);
    return updated;
  },

  /**
   * AI Hydration Engine: Calculates optimal hydration target and electrolyte replenishment
   * based on recorded workout duration, volume (tonnage) and perceived effort (RPE).
   */
  calculateHydrationAdjustment(
    recentWorkouts: CompletedWorkoutRecord[],
    currentNutrition: DailyNutrition,
    todayScheduledEstimatedMin = 50
  ): AIHydrationAdjustment {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayWorkout = recentWorkouts.find(
      (w) => w.completedAt && w.completedAt.slice(0, 10) === todayStr
    ) || recentWorkouts[0]; // fallback to most recent intense workout for baseline calculation

    const workoutTitle = todayWorkout?.title || "Treino Intenso Programado";
    const durationMin = todayWorkout
      ? Math.max(25, Math.round(todayWorkout.durationSeconds / 60))
      : todayScheduledEstimatedMin;
    const rpe = todayWorkout?.perceivedEffortRpe || 8.0;
    const volumeKg = todayWorkout?.totalVolumeKg || 12500;

    // Biomechanical sweat loss equation:
    // Base rate ~12ml/min for moderate lifting; scale exponentially with RPE (>7.5) and total tonnage (>10.000kg)
    const intensityMultiplier = rpe >= 9 ? 1.45 : rpe >= 8 ? 1.25 : rpe >= 7 ? 1.1 : 0.95;
    const tonnageMultiplier = volumeKg > 15000 ? 1.2 : volumeKg > 10000 ? 1.1 : 1.0;

    const estimatedSweatLossMl = Math.round(
      durationMin * 11.5 * intensityMultiplier * tonnageMultiplier
    );

    // Recommended replenishment: 120-150% of estimated sweat loss rounded to nearest 50ml
    const additionalWaterMl = Math.min(
      1500,
      Math.max(400, Math.round((estimatedSweatLossMl * 1.25) / 50) * 50)
    );

    const baseGoalMl = 2500; // Standard baseline hydration goal
    const adjustedGoalMl = baseGoalMl + additionalWaterMl;

    let electrolyteRecommendation =
      "Hidratação pura com água mineral adequada para este volume de treino.";
    if (rpe >= 8 || durationMin >= 50 || volumeKg >= 12000) {
      electrolyteRecommendation =
        "Perda eletrolítica moderada a alta. Adicione 500mg-800mg de sais isotônicos (sódio/potássio/magnésio) na água de treino e pós-treino.";
    }
    if (rpe >= 9 || durationMin >= 75) {
      electrolyteRecommendation =
        "Demanda osmótica extrema. Recomenda-se reposição de 1.000mg de sódio e 300mg de potássio para evitar cãibras e acelerar a fosforilação oxidativa.";
    }

    const reasonExplanation = `Treino "${workoutTitle}" com duração de ${durationMin} min e RPE ${rpe} (Volume: ${volumeKg.toLocaleString()} kg). A IA estimou perda de ~${estimatedSweatLossMl}ml por sudorese celular e termorregulação.`;

    // Check if user already applied this adjustment
    let applied = false;
    let appliedAt: string | undefined = undefined;
    try {
      const stored = localStorage.getItem(HYDRATION_ADJUSTMENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === todayStr && parsed.applied) {
          applied = true;
          appliedAt = parsed.appliedAt;
        }
      }
    } catch {}

    const adjustment: AIHydrationAdjustment = {
      id: `adj-${todayStr}`,
      date: todayStr,
      baseGoalMl,
      adjustedGoalMl,
      additionalWaterMl,
      workoutTitle,
      workoutDurationMin: durationMin,
      workoutRpe: rpe,
      workoutVolumeKg: volumeKg,
      estimatedSweatLossMl,
      electrolyteRecommendation,
      reasonExplanation,
      applied,
      appliedAt,
    };

    return adjustment;
  },

  /**
   * Applies the AI calculated hydration adjustment, updating user's goal in storage
   * and immediately transmitting the updated goal to the smartwatch.
   */
  async applyHydrationAdjustment(
    adj: AIHydrationAdjustment,
    currentNutrition: DailyNutrition
  ): Promise<{ updatedNutrition: DailyNutrition; telemetry: SmartwatchSyncTelemetry }> {
    const updatedNutrition: DailyNutrition = {
      ...currentNutrition,
      waterGoalMl: adj.adjustedGoalMl,
    };

    storage.saveNutrition(updatedNutrition);

    const savedAdj = {
      ...adj,
      applied: true,
      appliedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(HYDRATION_ADJUSTMENT_KEY, JSON.stringify(savedAdj));
    } catch {}

    // Auto sync new goal to smartwatch
    const telemetry = await this.syncNutritionWithWatch(updatedNutrition);

    window.dispatchEvent(
      new CustomEvent("athlynx_hydration_adjusted", { detail: savedAdj })
    );

    return { updatedNutrition, telemetry };
  },

  /**
   * Reverts the hydration goal back to standard baseline (2.500 ml) and syncs to watch.
   */
  async revertHydrationGoal(
    baseGoalMl: number,
    currentNutrition: DailyNutrition
  ): Promise<DailyNutrition> {
    const updatedNutrition: DailyNutrition = {
      ...currentNutrition,
      waterGoalMl: baseGoalMl,
    };

    storage.saveNutrition(updatedNutrition);

    try {
      localStorage.removeItem(HYDRATION_ADJUSTMENT_KEY);
    } catch {}

    await this.syncNutritionWithWatch(updatedNutrition);

    return updatedNutrition;
  },
};
