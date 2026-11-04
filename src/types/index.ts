export type ExperienceLevel = "Iniciante" | "Intermediário" | "Avançado" | "Atleta";

export type MuscleGroup =
  | "Peitoral"
  | "Costas"
  | "Pernas (Quadríceps)"
  | "Pernas (Posterior)"
  | "Glúteos"
  | "Panturrilhas"
  | "Ombros"
  | "Bíceps"
  | "Tríceps"
  | "Abdômen & Core"
  | "Cardio & Resistência"
  | "Mobilidade";

export type ActivityType = "running" | "cycling" | "walking" | "hiking" | "swimming";

export type SleepQuality = "Péssima" | "Ruim" | "Regular" | "Boa" | "Excelente";

export interface IntensityAdjustment {
  readinessScore: number; // 0 to 100
  loadMultiplier: number; // e.g. 0.85 (-15%), 1.0 (manter), 1.05 (+5%)
  volumeSetsAdjustment: number; // -1, 0, or +1
  rpeTarget: string; // e.g. "RPE 6.5 - 7 (Deload ativo)", "RPE 8 - 9 (Sobrecarga progressiva)"
  statusBadge: string;
  recommendationMessage: string;
  adjustedExercises?: Array<{
    name: string;
    adjustedSets: number;
    adjustedReps: string;
    adjustedLoadGuidance: string;
    rpe: string;
  }>;
}

export interface BioimpedanceRecord {
  id: string;
  measuredAt: string;
  deviceName: string;
  weightKg: number;
  bodyFatPercentage: number; // % gordura corporal (ex: 14.8)
  muscleMassKg: number; // massa muscular esquelética em kg (ex: 38.6)
  muscleMassPercentage: number; // massa muscular em % (ex: 49.2)
  boneMassKg?: number; // massa óssea estimada (ex: 3.2)
  bodyWaterPercentage?: number; // água corporal total % (ex: 58.5)
  visceralFatLevel?: number; // nível de gordura visceral (1-12, ex: 4)
  basalMetabolicRateKcal?: number; // BMR basal (ex: 1790)
  metabolicAge?: number; // idade metabólica (ex: 23)
  bmi: number; // IMC
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  mainGoal: string;
  secondaryGoals: string[];
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number;
  timePerSessionMin: number;
  environment: "Academia" | "Casa" | "Ao Ar Livre" | "Híbrido";
  equipment: string[];
  dietaryPreference: string;
  dailyWaterGoalMl: number;
  dailyCalorieGoal: number;
  injuriesOrNotes: string;
  gpsPrivacyCloaking: boolean; // LGPD & safety: hides 500m around start/stop
  consents: {
    lgpdDataCollection: boolean;
    healthSensorsConsent: boolean;
    termsAcceptedAt: string;
  };
  followingIds: string[];
  isPremium: boolean;
  createdAt: string;
  // Daily recovery & bio-feedback inputs
  sleepQuality?: SleepQuality;
  stressLevel?: number; // 1 (mínimo) a 10 (severo)
  lastRecoveryCheckIn?: string; // ISO date string
  // Bioimpedance & Body Composition Bluetooth integration
  bodyComposition?: BioimpedanceRecord;
  bioimpedanceHistory?: BioimpedanceRecord[];
  // Smartwatch & Health API Sleep Cycles (REM, Light, Deep)
  sleepStages?: SleepStageMetrics;
  connectedPlatforms?: ConnectedFitnessPlatform[];
  // Specific Athlete Goals for tailored AI periodization calibration
  specificGoal?: AthleteSpecificGoal;
  goalCalibration?: {
    repRangeTarget: string; // e.g. "3-5 reps (Força)", "8-12 reps (Hipertrofia)", "15-20 reps (Resistência)"
    restIntervalSeconds: number; // e.g. 180, 90, 45
    metabolicFocus: "tensão_mecanica" | "estresse_metabolico" | "capacidade_mitocondrial" | "queima_lipidica";
  };
}

export type AthleteSpecificGoal =
  | "ganhar_massa" // Hipertrofia miofibrilar & sarcoplasmática
  | "perder_gordura" // Emagrecimento, densidade metabólica & queima lipídica
  | "resistencia" // Resistência muscular, mitocôndrias & endurance
  | "forca_pura" // Força máxima, recrutamento de unidades motoras (1-5 reps)
  | "recomposicao"; // Troca de gordura por massa magra com estímulo híbrido

export interface PlanVersion {
  version: number;
  planId: string;
  title: string;
  createdAt: string;
  changelogSummary: string;
  rationale: string;
  sessions: WorkoutSession[];
  status: "applied" | "proposed" | "rejected";
}

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: "Barra" | "Halteres" | "Polia/Cabos" | "Máquina" | "Peso Corporal" | "Kettlebell" | "Elásticos";
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  instructions: string[];
  commonMistakes: string[];
  cues: string[];
  alternatives: string[]; // Exercise names or IDs
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: "warmup" | "working" | "dropset" | "failure";
  weightKg: number;
  targetReps: number;
  actualReps?: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  previousWeightKg?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  targetMuscle: MuscleGroup;
  restSeconds: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface PostWorkoutCardioProtocol {
  machine: "Escada" | "Esteira" | "Bicicleta" | "Elíptico";
  name: string;
  durationMin: number;
  intensity: string;
  parameters: string;
  estimatedKcal: number;
  benefits: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  dayLabel: string;
  muscleFocus: string;
  estimatedMinutes: number;
  warmupProtocol: string;
  cardioProtocol?: PostWorkoutCardioProtocol;
  planningWarnings?: string[];
  exercises: WorkoutExercise[];
  completedCount: number;
  lastPerformed?: string;
  isPremiumOnly?: boolean;
  tierBadge?: "GRÁTIS" | "PRO";
}

export type SportModalityId =
  | "musculacao"
  | "hyrox"
  | "luta"
  | "natacao"
  | "crossfit"
  | "futvolley"
  | "danca"
  | "calistenia"
  | "funcional_hiit"
  | "pilates";

export interface SportModality {
  id: SportModalityId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  category: "forca" | "hibrido" | "combate" | "aquatico" | "areia" | "ritmo" | "peso_corporal" | "mobilidade";
  intensity: "Média" | "Alta" | "Muito Alta" | "Extrema";
  estimatedKcalPerHour: number;
  iconName: string;
  accentColor: string;
  badge: string;
  keyBenefits: string[];
  equipmentNeeded: string[];
  presetPlan: WorkoutPlan;
  quickSessions: WorkoutSession[];
  isPremiumOnly?: boolean;
  tierBadge?: "GRÁTIS" | "PRO";
}

export interface SubscriptionPlanOption {
  id: "annual" | "semi_annual" | "monthly";
  name: string;
  priceFormatted: string;
  periodLabel: string;
  billedLabel?: string;
  originalPrice?: string;
  savingsPercent?: number;
  isPopular?: boolean;
  features: string[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  frequencyDaysPerWeek: number;
  sessions: WorkoutSession[];
  active: boolean;
  updatedAt: string;
  modalityId?: SportModalityId;
}

export interface CompletedWorkoutRecord {
  id: string;
  sessionId: string;
  title: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  perceivedEffortRpe: number;
  notes?: string;
  exercisesLogged: {
    name: string;
    targetMuscle: string;
    sets: { weightKg: number; reps: number; completed: boolean }[];
  }[];
  prsAchieved: string[];
  syncStatus?: "pending" | "synced" | "cached_offline";
  syncedAt?: string;
  integrityChecksum?: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  record: CompletedWorkoutRecord;
  checksum: string;
  queuedAt: string;
  syncStatus: "pending" | "syncing" | "synced" | "failed";
  retryCount: number;
  lastAttemptAt?: string;
  lastError?: string;
}

export interface SyncState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Meal {
  id: string;
  name: string;
  scheduledTime: string;
  completed: boolean;
  foods: FoodItem[];
  prepNotes?: string;
  recipeInstructions?: string[];
}

export interface DailyNutrition {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  consumedCalories: number;
  consumedProteinG: number;
  consumedCarbsG: number;
  consumedFatG: number;
  waterIntakeMl: number;
  waterGoalMl: number;
  meals: Meal[];
}

export interface GPSCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number; // m/s
  timestamp: number;
}

export interface ActivitySplit {
  kilometer: number;
  durationSeconds: number;
  paceMinPerKm: string;
  elevationGainM: number;
}

export interface GPSActivity {
  id: string;
  type: ActivityType;
  title: string;
  startedAt: string;
  durationSeconds: number;
  distanceKm: number;
  averagePaceMinPerKm: string;
  averageSpeedKmh: number;
  elevationGainM: number;
  caloriesBurnedEstimated: number;
  splits: ActivitySplit[];
  coordinates: GPSCoordinate[];
  sharedToFeed: boolean;
}

export interface SocialComment {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface SocialPost {
  id: string;
  authorId?: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  category: "workout" | "run" | "nutrition" | "record";
  workoutData?: {
    title: string;
    duration: string;
    volumeOrDistance: string;
    highlight: string;
    totalKgLifted?: number;
    exercisesSummary?: { name: string; setsDetail: string }[];
  };
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likesCount: number;
  likedByCurrentUser: boolean;
  reportedByCurrentUser?: boolean;
  comments: SocialComment[];
}

export interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  targetType: "days_count" | "total_distance_km" | "total_volume_kg";
  targetValue: number;
  currentValue: number;
  deadlineDaysLeft: number;
  participantsCount: number;
  joined: boolean;
  category: "Musculação" | "Corrida" | "Consistência";
  leaderboard: { name: string; avatar: string; score: string; rank: number }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: "treino" | "streak" | "outdoor" | "carga";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // "HH:mm" e.g. "08:00"
  daysOfWeek: number[]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  soundEnabled: boolean;
  lastNotifiedDate?: string; // "YYYY-MM-DD"
  advanceMinutes: number; // minutes before scheduled time (e.g. 0, 15, 30)
}

export interface WorkoutReminderEventDetail {
  workoutTitle: string;
  workoutId: string;
  muscleFocus: string;
  streakDays: number;
  message: string;
}

export type ThemeMode = "dark" | "light-hc";
export type AccentColor = "neon-blue" | "cobalt-blue" | "ultra-violet" | "hyper-orange" | "neon-green";

export interface DateWorkoutReminder {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  time: string; // "07:30"
  sessionId?: string;
  sessionName: string;
  customNote?: string;
  enabled: boolean;
  createdAt: string;
}

export interface VisionFormFeedback {
  timestamp: number;
  exerciseName: string;
  repCount: number;
  currentPhase: "eccentric" | "concentric" | "isometric" | "idle";
  formScore: number; // 0-100%
  jointAngleDeg: number;
  status: "perfect" | "warning" | "alert";
  message: string;
  audioPrompt?: string;
}

export type SorenessLevel = "baixa" | "moderada" | "alta" | "extrema";
export type SleepQualityRating = "restaurador" | "regular" | "insuficiente";

export interface RecoveryCheckInRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  timestamp: string; // ISO
  workoutId?: string;
  workoutTitle?: string;
  rpeResidual: number; // 1-10
  sorenessLevel: SorenessLevel;
  sleepRating: SleepQualityRating;
  targetMusclesAching?: string[];
  suggestedActiveRecovery: boolean;
  activeRecoveryApplied: boolean;
  notes?: string;
}

export type SmartwatchPlatform = "apple_watch" | "wearos" | "garmin";

export interface SmartwatchDevice {
  id: string;
  platform: SmartwatchPlatform;
  deviceName: string;
  batteryPercent: number;
  lastSyncedAt: string;
  autoSync: boolean;
  connected: boolean;
  syncWater: boolean;
  syncMacros: boolean;
  syncHeartRate: boolean;
  activeCaloriesBurnedToday: number;
}

export interface AIHydrationAdjustment {
  id: string;
  date: string;
  baseGoalMl: number;
  adjustedGoalMl: number;
  additionalWaterMl: number;
  workoutTitle: string;
  workoutDurationMin: number;
  workoutRpe: number;
  workoutVolumeKg?: number;
  estimatedSweatLossMl: number;
  electrolyteRecommendation: string;
  reasonExplanation: string;
  applied: boolean;
  appliedAt?: string;
}

export interface SmartwatchSyncTelemetry {
  lastSyncTimestamp: string;
  waterSyncedMl: number;
  waterGoalSyncedMl: number;
  caloriesBurnedSynced: number;
  proteinSyncedG: number;
  carbsSyncedG: number;
  fatSyncedG: number;
  devicePlatform: SmartwatchPlatform;
  syncDirection: "cloud_to_watch" | "watch_to_cloud" | "bidirectional";
}

export interface SleepStageMetrics {
  deepSleepMinutes: number; // Sono Profundo (ondas delta / recuperação tecidual)
  remSleepMinutes: number;  // Sono REM (consolidação neuromuscular)
  lightSleepMinutes: number;// Sono Leve (repouso)
  awakeMinutes: number;     // Minutos acordado
  totalSleepMinutes: number;// Total dormido
  sleepEfficiencyPercent: number; // e.g. 91%
  averageHeartRateBpm: number;
  restingHrvMs?: number;    // Variabilidade da FC em repouso (VFC/HRV)
  recordedDate: string;     // "YYYY-MM-DD"
  sourcePlatform: "apple_health" | "strava" | "zepp_os" | "wearos" | "garmin";
}

export interface DeepSleepLoadAdjustment {
  deepSleepMinutes: number;
  deepSleepPercent: number;
  status: "excelente" | "adequado" | "insuficiente";
  loadMultiplier: number; // ex: 1.05 (+5%) ou 0.88 (-12%)
  volumeSetsAdjustment: number;
  targetRpeRange: string;
  badgeLabel: string;
  explanation: string;
  applied: boolean;
  appliedAt?: string;
}

export interface ConnectedFitnessPlatform {
  id: "apple_watch" | "strava" | "zepp_os" | "wearos" | "garmin";
  name: string;
  displayName: string;
  category: "smartwatch" | "fitness_app" | "smart_ring";
  iconName: string;
  connected: boolean;
  lastSyncedAt?: string;
  supportedData: string[];
  batteryPercent?: number;
  deviceModel?: string;
}

