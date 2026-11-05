import { CompletedWorkoutRecord, Achievement, GPSActivity, UserProfile } from "../types";

export interface DynamicBadge {
  id: string;
  title: string;
  description: string;
  icon: "Dumbbell" | "Flame" | "Trophy" | "Medal" | "Zap" | "Award" | "Crown" | "Compass";
  category: "treinos" | "streak" | "volume" | "outdoor";
  requirementType: "workouts_count" | "streak_days" | "total_volume_kg" | "gps_count";
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export const badgeService = {
  calculateBadges(
    history: CompletedWorkoutRecord[],
    currentStreakDays: number = 7,
    gpsActivities: GPSActivity[] = []
  ): DynamicBadge[] {
    const workoutsCount = history.length;
    const totalVolumeKg = history.reduce((sum, item) => sum + (item.totalVolumeKg || 0), 0);
    const gpsCount = gpsActivities.length;

    // Dates for unlocked badges based on history
    const firstWorkoutDate = history[history.length - 1]?.completedAt || "2026-01-16T10:00:00Z";
    const recentWorkoutDate = history[0]?.completedAt || new Date().toISOString();

    const BADGE_DEFINITIONS: Omit<DynamicBadge, "currentValue" | "unlocked" | "unlockedAt" | "progressPercent">[] = [
      // 1. Treinos Concluídos
      {
        id: "badge-w1",
        title: "Primeiro Registro",
        description: "Completou seu 1º treino anotando cargas e séries no app.",
        icon: "Dumbbell",
        category: "treinos",
        requirementType: "workouts_count",
        targetValue: 1,
      },
      {
        id: "badge-w3",
        title: "Construção de Base",
        description: "Completou 3 treinos com registro de esforço.",
        icon: "Award",
        category: "treinos",
        requirementType: "workouts_count",
        targetValue: 3,
      },
      {
        id: "badge-w5",
        title: "Dedicado de Ferro",
        description: "Atingiu a marca de 5 treinos concluídos no plano.",
        icon: "Medal",
        category: "treinos",
        requirementType: "workouts_count",
        targetValue: 5,
      },
      {
        id: "badge-w10",
        title: "Centurião dos Pesos",
        description: "Concluiu 10 treinos de alta performance.",
        icon: "Trophy",
        category: "treinos",
        requirementType: "workouts_count",
        targetValue: 10,
      },
      {
        id: "badge-w25",
        title: "Veterano Imparável",
        description: "Concluiu 25 sessões completas no FORZON.",
        icon: "Crown",
        category: "treinos",
        requirementType: "workouts_count",
        targetValue: 25,
      },

      // 2. Streak de Dias Ativos
      {
        id: "badge-s3",
        title: "Centelha Ativa",
        description: "Manteve 3 dias consecutivos de atividade física e consistência.",
        icon: "Zap",
        category: "streak",
        requirementType: "streak_days",
        targetValue: 3,
      },
      {
        id: "badge-s7",
        title: "Fogo Olímpico (7 Dias)",
        description: "Completou uma semana inteira ininterrupta de disciplina esportiva.",
        icon: "Flame",
        category: "streak",
        requirementType: "streak_days",
        targetValue: 7,
      },
      {
        id: "badge-s14",
        title: "Hábito de Aço (14 Dias)",
        description: "Manteve o streak ativo por duas semanas consecutivas.",
        icon: "Flame",
        category: "streak",
        requirementType: "streak_days",
        targetValue: 14,
      },
      {
        id: "badge-s30",
        title: "Lenda da Consistência (30 Dias)",
        description: "Um mês inteiro mantendo a chama acesa sem falhar.",
        icon: "Crown",
        category: "streak",
        requirementType: "streak_days",
        targetValue: 30,
      },

      // 3. Tonelagem & Carga Total
      {
        id: "badge-v10k",
        title: "Clube dos 10.000 kg",
        description: "Acumulou mais de 10 toneladas totais levantadas em treinos.",
        icon: "Dumbbell",
        category: "volume",
        requirementType: "total_volume_kg",
        targetValue: 10000,
      },
      {
        id: "badge-v50k",
        title: "Titã da Tonelagem (50.000 kg)",
        description: "Levantou mais de 50 toneladas somadas na sua carreira esportiva.",
        icon: "Trophy",
        category: "volume",
        requirementType: "total_volume_kg",
        targetValue: 50000,
      },

      // 4. Outdoor
      {
        id: "badge-gps1",
        title: "Conquistador do Asfalto",
        description: "Gravou sua primeira rota outdoor com telemetria GPS e parciais.",
        icon: "Compass",
        category: "outdoor",
        requirementType: "gps_count",
        targetValue: 1,
      },
    ];

    return BADGE_DEFINITIONS.map((b) => {
      let current = 0;
      if (b.requirementType === "workouts_count") current = workoutsCount;
      else if (b.requirementType === "streak_days") current = currentStreakDays;
      else if (b.requirementType === "total_volume_kg") current = totalVolumeKg;
      else if (b.requirementType === "gps_count") current = gpsCount;

      const unlocked = current >= b.targetValue;
      const progressPercent = Math.min(100, Math.round((current / b.targetValue) * 100));

      let unlockedAt: string | undefined = undefined;
      if (unlocked) {
        if (b.id === "badge-w1") unlockedAt = firstWorkoutDate;
        else if (b.id === "badge-s7") unlockedAt = "2026-10-20T12:00:00Z";
        else if (b.id === "badge-s3") unlockedAt = "2026-10-16T12:00:00Z";
        else if (b.id === "badge-v10k") unlockedAt = "2026-10-26T19:12:00Z";
        else if (b.id === "badge-gps1") unlockedAt = "2026-10-25T07:15:00Z";
        else unlockedAt = recentWorkoutDate;
      }

      return {
        ...b,
        currentValue: current,
        unlocked,
        unlockedAt,
        progressPercent,
      };
    });
  },
};
