import { accountStorage } from "./accountStorage";
import {
  RecoveryCheckInRecord,
  WorkoutPlan,
  WorkoutSession,
  CompletedWorkoutRecord,
} from "../types";
import { storage } from "./storage";

const RECOVERY_STORAGE_KEY = "athlynx_recovery_checkins";
const ORIGINAL_PLAN_BACKUP_KEY = "athlynx_plan_before_recovery";

export const recoveryService = {
  /**
   * Retrieves all recovery check-ins stored locally
   */
  getCheckIns(): RecoveryCheckInRecord[] {
    try {
      const raw = accountStorage.getItem(RECOVERY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Returns today's check-in record if one already exists
   */
  getTodayCheckIn(): RecoveryCheckInRecord | null {
    const todayStr = new Date().toISOString().split("T")[0];
    const checkIns = this.getCheckIns();
    return checkIns.find((c) => c.date === todayStr) || null;
  },

  /**
   * Persists a recovery check-in and dispatches update event
   */
  saveCheckIn(record: RecoveryCheckInRecord): void {
    const list = this.getCheckIns();
    const existingIdx = list.findIndex((c) => c.id === record.id || c.date === record.date);
    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }
    accountStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent("athlynx_recovery_checkin_saved", { detail: record })
    );
  },

  /**
   * Detects if an athlete completed a high-intensity workout recently
   * that warrants a Recovery Check-in prompt
   */
  detectIntenseWorkout(
    recentWorkouts: CompletedWorkoutRecord[]
  ): { hasIntenseWorkout: boolean; workout?: CompletedWorkoutRecord; reason?: string } {
    if (!recentWorkouts || recentWorkouts.length === 0) {
      return { hasIntenseWorkout: false };
    }

    const latest = recentWorkouts[0];
    const rpe = latest.perceivedEffortRpe || 0;
    const volume = latest.totalVolumeKg || 0;
    const duration = latest.durationSeconds || 0;

    // Intense conditions:
    // 1. RPE >= 7 (Subjective high effort)
    // 2. Volume >= 8,000 kg (Significant mechanical load)
    // 3. Duration >= 40 minutes (2400 seconds)
    if (rpe >= 8) {
      return {
        hasIntenseWorkout: true,
        workout: latest,
        reason: `RPE elevado (${rpe}/10) registrado na última sessão`,
      };
    }

    if (volume >= 10000) {
      return {
        hasIntenseWorkout: true,
        workout: latest,
        reason: `Volume mecânico massivo (${volume.toLocaleString()} kg)`,
      };
    }

    if (rpe >= 7 || volume >= 7000 || duration >= 2400) {
      return {
        hasIntenseWorkout: true,
        workout: latest,
        reason: `Sessão de alta demanda metabólica e neuromuscular`,
      };
    }

    // Default: Return the latest workout as trigger if completed in last 48h
    return {
      hasIntenseWorkout: true,
      workout: latest,
      reason: `Último treino concluído: ${latest.title}`,
    };
  },

  /**
   * Generates a sports-science backed Active Recovery session
   */
  createActiveRecoverySession(dayLabel: string = "Hoje — Recuperação Ativa"): WorkoutSession {
    const now = Date.now();
    return {
      id: `session-active-recovery-${now}`,
      title: "Recuperação Ativa & Mobilidade Regenerativa",
      dayLabel,
      muscleFocus: "Regeneração Neuromuscular, Drenagem de Lactato & Amplitude Articular",
      estimatedMinutes: 30,
      warmupProtocol: "3 min de respiração diafragmática (caixa 4-4-4) + mobilidade dinâmica cervical e torácica",
      completedCount: 0,
      exercises: [
        {
          id: `we-rec-1-${now}`,
          exerciseId: "ex-foam-roller-myofascial",
          name: "Liberação Miofascial (Foam Roller)",
          targetMuscle: "Mobilidade",
          restSeconds: 30,
          notes: "Foque nos grupamentos mais fadigados (dorsais, peitoral, glúteos e quadríceps). 60s por grupo com respiração profunda.",
          sets: [
            { id: `s-rec-1-1-${now}`, setNumber: 1, type: "working", weightKg: 0, targetReps: 1, completed: false },
            { id: `s-rec-1-2-${now}`, setNumber: 2, type: "working", weightKg: 0, targetReps: 1, completed: false },
          ],
        },
        {
          id: `we-rec-2-${now}`,
          exerciseId: "ex-mobility-90-90-thoracic",
          name: "Complexo Mobilidade 90/90 & Rotação Torácica",
          targetMuscle: "Mobilidade",
          restSeconds: 45,
          notes: "Movimentos controlados sem forçar o limiar de dor. 10 rotações torácicas por lado em posição de quatro apoios.",
          sets: [
            { id: `s-rec-2-1-${now}`, setNumber: 1, type: "working", weightKg: 0, targetReps: 10, completed: false },
            { id: `s-rec-2-2-${now}`, setNumber: 2, type: "working", weightKg: 0, targetReps: 10, completed: false },
          ],
        },
        {
          id: `we-rec-3-${now}`,
          exerciseId: "ex-light-aerobic-zone-1",
          name: "Cardio Regenerativo em Zona 1 (Caminhada / Bike Leve)",
          targetMuscle: "Cardio & Resistência",
          restSeconds: 30,
          notes: "Intensidade muito leve (50-60% FC máxima). Ritmo conversacional para acelerar remoção de subprodutos metabólicos.",
          sets: [
            { id: `s-rec-3-1-${now}`, setNumber: 1, type: "working", weightKg: 0, targetReps: 15, completed: false },
          ],
        },
        {
          id: `we-rec-4-${now}`,
          exerciseId: "ex-spinal-decompression",
          name: "Descompressão Espinhal Pendurado & Postura da Criança",
          targetMuscle: "Costas",
          restSeconds: 45,
          notes: "Alívio da sobrecarga axial na coluna e relaxamento do quadrado lombar e trapézios.",
          sets: [
            { id: `s-rec-4-1-${now}`, setNumber: 1, type: "working", weightKg: 0, targetReps: 3, completed: false },
          ],
        },
      ],
    };
  },

  /**
   * Injects the Active Recovery session into the user's active workout plan
   * and saves a backup of the original plan to allow easy rollback.
   */
  applyActiveRecoveryToPlan(plan: WorkoutPlan): {
    updatedPlan: WorkoutPlan;
    recoverySession: WorkoutSession;
  } {
    // 1. Back up original plan if not backed up yet
    if (!accountStorage.getItem(ORIGINAL_PLAN_BACKUP_KEY)) {
      accountStorage.setItem(ORIGINAL_PLAN_BACKUP_KEY, JSON.stringify(plan));
    }

    // 2. Check if current first session is already an active recovery session
    const isAlreadyRecovery = plan.sessions[0]?.title.toLowerCase().includes("recuperação ativa");
    const recoverySession = isAlreadyRecovery
      ? plan.sessions[0]
      : this.createActiveRecoverySession();

    let updatedSessions: WorkoutSession[];
    if (isAlreadyRecovery) {
      updatedSessions = plan.sessions;
    } else {
      // Prepend or replace today's slot
      updatedSessions = [recoverySession, ...plan.sessions];
    }

    const updatedPlan: WorkoutPlan = {
      ...plan,
      sessions: updatedSessions,
      updatedAt: new Date().toISOString(),
    };

    // 3. Persist updated plan
    storage.saveWorkoutPlan(updatedPlan);

    // 4. Update today's checkin record if exists
    const todayCheckIn = this.getTodayCheckIn();
    if (todayCheckIn) {
      this.saveCheckIn({
        ...todayCheckIn,
        activeRecoveryApplied: true,
        suggestedActiveRecovery: true,
      });
    }

    window.dispatchEvent(
      new CustomEvent("athlynx_active_recovery_applied", {
        detail: { plan: updatedPlan, session: recoverySession },
      })
    );

    return { updatedPlan, recoverySession };
  },

  /**
   * Reverts active recovery session and restores previous schedule
   */
  revertActiveRecovery(currentPlan: WorkoutPlan): WorkoutPlan {
    const backupRaw = accountStorage.getItem(ORIGINAL_PLAN_BACKUP_KEY);
    let restoredPlan: WorkoutPlan;

    if (backupRaw) {
      try {
        restoredPlan = JSON.parse(backupRaw);
        accountStorage.removeItem(ORIGINAL_PLAN_BACKUP_KEY);
      } catch {
        // Fallback: filter out the recovery session
        restoredPlan = {
          ...currentPlan,
          sessions: currentPlan.sessions.filter(
            (s) => !s.id.startsWith("session-active-recovery")
          ),
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      restoredPlan = {
        ...currentPlan,
        sessions: currentPlan.sessions.filter(
          (s) => !s.id.startsWith("session-active-recovery")
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    storage.saveWorkoutPlan(restoredPlan);

    // Update today's checkin record
    const todayCheckIn = this.getTodayCheckIn();
    if (todayCheckIn) {
      this.saveCheckIn({
        ...todayCheckIn,
        activeRecoveryApplied: false,
      });
    }

    window.dispatchEvent(
      new CustomEvent("athlynx_active_recovery_reverted", {
        detail: { plan: restoredPlan },
      })
    );

    return restoredPlan;
  },

  /**
   * Checks whether the current plan has an Active Recovery session at index 0
   */
  isPlanActiveRecoveryActive(plan: WorkoutPlan): boolean {
    return (
      Boolean(plan.sessions[0]?.id?.startsWith("session-active-recovery")) ||
      Boolean(plan.sessions[0]?.title?.toLowerCase().includes("recuperação ativa"))
    );
  },
};
