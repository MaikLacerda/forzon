import React, { useState, useEffect } from "react";
import {
  Play,
  Flame,
  Droplets,
  Trophy,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  CheckCircle2,
  Bell,
  BarChart3,
  Share2,
  Scale,
  Bluetooth,
  Calendar as CalendarIcon,
  Crown,
  Lock,
  Dumbbell,
  Moon,
  Watch,
  Activity,
} from "lucide-react";
import { UserProfile, WorkoutPlan, DailyNutrition, CompletedWorkoutRecord, GroupChallenge, GPSActivity, NotificationSettings, Exercise } from "../../types";
import { resolveExerciseDetails } from "../../data/exercises";
import { ExerciseExecutionModal } from "../workout/ExerciseExecutionModal";
import { AnatomicalExerciseIllustration } from "../workout/AnatomicalExerciseIllustration";
import { WeeklyVolumeChart } from "../dashboard/WeeklyVolumeChart";
import { DailyWaterTracker } from "../dashboard/DailyWaterTracker";
import { DailyRecoveryCard } from "../dashboard/DailyRecoveryCard";
import { WorkoutReminderModal } from "../workout/WorkoutReminderModal";
import { ProgressReportView } from "./ProgressReportView";
import { StoryShareModal, StoryData } from "../social/StoryShareModal";
import { MonthlyWorkoutCalendar } from "../calendar/MonthlyWorkoutCalendar";
import { notificationService } from "../../services/notificationService";
import { RecoveryCheckInCard } from "../recovery/RecoveryCheckInCard";
import { AdBanner } from "../common/AdBanner";
import { SmartwatchHydrationSyncCard } from "../dashboard/SmartwatchHydrationSyncCard";
import { SmartwatchConnectivityWidget } from "../dashboard/SmartwatchConnectivityWidget";
import { smartwatchSyncService } from "../../services/smartwatchSyncService";
import { ForzonBrandBanner } from "../brand/ForzonBrandBanner";

interface TodayViewProps {
  profile: UserProfile;
  plan: WorkoutPlan;
  nutrition: DailyNutrition;
  onUpdateNutrition: (updated: DailyNutrition) => void;
  onStartWorkout: (sessionId: string) => void;
  onOpenCoachWithPrompt: (prompt: string) => void;
  onNavigateTab: (tab: string) => void;
  recentWorkouts: CompletedWorkoutRecord[];
  challenges: GroupChallenge[];
  gpsActivities?: GPSActivity[];
  onOpenReminderModal?: () => void;
  onOpenProfile?: () => void;
  onOpenUpgradeModal?: (feature?: string) => void;
  onPlanUpdated?: (updatedPlan: WorkoutPlan) => void;
  onOpenAIIntake?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  profile,
  plan,
  nutrition,
  onUpdateNutrition,
  onStartWorkout,
  onOpenCoachWithPrompt,
  onNavigateTab,
  recentWorkouts,
  challenges,
  gpsActivities = [],
  onOpenReminderModal,
  onOpenProfile,
  onOpenUpgradeModal,
  onPlanUpdated,
  onOpenAIIntake,
}) => {

  const [quickWaterAdded, setQuickWaterAdded] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<"hoje" | "calendario">("hoje");
  const [selectedSessionId, setSelectedSessionId] = useState<string>(plan.sessions[0]?.id || "");
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [activeStoryData, setActiveStoryData] = useState<StoryData | null>(null);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() =>
    notificationService.getSettings()
  );

  const todayStoryData: StoryData = React.useMemo(() => {
    const totalVol = recentWorkouts.slice(0, 10).reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0) || 104250;
    const totalDist = gpsActivities.slice(0, 10).reduce((acc, g) => acc + (g.distanceKm || 0), 0) || 78.4;
    return {
      type: "progress-30d",
      title: "EVOLUÇÃO 30 DIAS",
      subtitle: "Sobrecarga & Consistência",
      badgeText: "Mesociclo Ativo",
      athleteName: profile.name || "Gabriel Silva",
      dateStr: "Outubro 2026",
      metrics: [
        {
          label: "Volume Total",
          value: `${totalVol.toLocaleString()} kg`,
          change: "+13.6%",
          isPositive: true,
          icon: "dumbbell",
        },
        {
          label: "Distância Total",
          value: `${totalDist.toFixed(1)} km`,
          change: "+22.1%",
          isPositive: true,
          icon: "navigation",
        },
        {
          label: "Streak Atual",
          value: "7 dias seguidos",
          change: "Consistência 100%",
          isPositive: true,
          icon: "flame",
        },
        {
          label: "Meta Calórica",
          value: `${nutrition.consumedCalories} / ${nutrition.targetCalories} kcal`,
          change: "92% atingido",
          isPositive: true,
          icon: "zap",
        },
      ],
      highlights: [
        "Recorde no Supino Reto: 80kg x 6 reps",
        "Meta de sobrecarga progressiva cumprida",
        "4 semanas ininterruptas de treinamento",
      ],
      quoteOrDiagnostic: "Evolução exemplar com supercompensação adequada e equilíbrio metabólico.",
    };
  }, [profile.name, recentWorkouts, gpsActivities, nutrition]);

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationSettings>;
      if (customEvent.detail) {
        setNotifSettings(customEvent.detail);
      } else {
        setNotifSettings(notificationService.getSettings());
      }
    };
    window.addEventListener("athlynx_notification_settings_change", handleSettingsChange);
    return () => window.removeEventListener("athlynx_notification_settings_change", handleSettingsChange);
  }, []);

  // If user requested full 30-day comparative progress report
  if (showProgressReport) {
    return (
      <ProgressReportView
        recentWorkouts={recentWorkouts}
        gpsActivities={gpsActivities}
        onClose={() => setShowProgressReport(false)}
        onOpenCoachWithPrompt={onOpenCoachWithPrompt}
        onStartWorkout={() => onStartWorkout(plan.sessions[0].id)}
        athleteName={profile.name}
      />
    );
  }

  // Today's scheduled or selected session
  const todaySession =
    plan.sessions.find((s) => s.id === selectedSessionId) || plan.sessions[0];
  const activeChallenge = challenges.find((c) => c.joined) || challenges[0];

  // Water quick-add with automatic smartwatch sync
  const handleAddWater = (ml: number) => {
    const updated = {
      ...nutrition,
      waterIntakeMl: Math.min(nutrition.waterGoalMl * 1.5, nutrition.waterIntakeMl + ml),
    };
    onUpdateNutrition(updated);
    smartwatchSyncService.syncNutritionWithWatch(updated);
    setQuickWaterAdded(true);
    setTimeout(() => setQuickWaterAdded(false), 1200);
  };

  const caloriesPercent = Math.min(100, Math.round((nutrition.consumedCalories / nutrition.targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((nutrition.consumedProteinG / nutrition.targetProteinG) * 100));
  const waterPercent = Math.min(100, Math.round((nutrition.waterIntakeMl / nutrition.waterGoalMl) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
      {/* FORZON Brand Positioning & Value Proposition Hero */}
      <ForzonBrandBanner onNavigateTab={onNavigateTab} />

      {/* Athlete Welcome & Day Briefing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Temporada de Treino 2026</span>
            <span aria-hidden="true">·</span>
            <span>Semana 4 de 12</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-medium">Consistência 92%</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Bom dia, {profile.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Hoje seu foco é estímulo de força e hipertrofia em peitorais e ombros. Recuperação muscular estimada em nível ótimo.
          </p>
        </div>

        {/* Action badges & 30-Day Evolution report shortcut */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowProgressReport(true)}
            className="flex items-center gap-3 bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-emerald-500/40 rounded-2xl p-3 shrink-0 transition-all cursor-pointer group text-left"
            title="Abrir Relatório Comparativo de 30 Dias (Volume & Distância)"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                <span>Evolução 30d</span>
                <span className="text-[10px] text-emerald-400 font-bold">+13.6%</span>
              </div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">Ver Relatório</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-3 bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/40 rounded-2xl p-3 shrink-0 transition-all cursor-pointer group text-left"
            title="Ver Perfil do Atleta e Conquistas Desbloqueadas"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 flex items-center gap-1">
                <span>Sequência Ativa</span>
                <span className="text-[10px] text-amber-400">· Emblemas</span>
              </div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">7 dias seguidos</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-3 bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800/80 hover:border-cyan-500/40 rounded-2xl p-3 shrink-0 transition-all cursor-pointer group text-left"
            title="Bioimpedância Bluetooth: Peso, % Gordura e Massa Muscular"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                <span>Bioimpedância</span>
                <span className="text-[10px] text-cyan-400 font-bold">{profile.bodyComposition?.bodyFatPercentage ?? 14.8}% BF</span>
              </div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">
                {profile.bodyComposition?.muscleMassKg ?? 38.6}kg Músculo
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* View SubTab Switcher: Visão de Hoje vs Calendário Mensal */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-900/90 rounded-2xl border border-neutral-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveViewTab("hoje")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeViewTab === "hoje"
              ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Visão de Hoje</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab("calendario")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeViewTab === "calendario"
              ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Calendário</span>
        </button>
      </div>

      {activeViewTab === "calendario" ? (
        <MonthlyWorkoutCalendar
          plan={plan}
          recentWorkouts={recentWorkouts}
          onStartWorkout={onStartWorkout}
          onOpenCoachWithPrompt={onOpenCoachWithPrompt}
        />
      ) : (
        <>
          {/* Recovery Check-in & Subjective RPE Alert / Active Recovery Suggestion */}
          <RecoveryCheckInCard
            plan={plan}
            recentWorkouts={recentWorkouts}
            onPlanUpdated={onPlanUpdated}
            onOpenCoachWithPrompt={onOpenCoachWithPrompt}
            onStartActiveRecovery={onStartWorkout}
          />

          {/* Daily Sleep Quality & Stress Recovery Tracker (Bio-feedback Check-in) */}
          <DailyRecoveryCard
            profile={profile}
            session={todaySession}
          />

          {/* Sponsored Ad Banner for Free Plan */}
          <AdBanner
            isPremium={profile.isPremium}
            onOpenUpgradeModal={() => onOpenUpgradeModal?.()}
          />

          {/* Quick Session Selector with Free vs Pro Tier Indicators */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
              Sessões do Plano:
            </span>
            {plan.sessions.map((sess) => {
              const isSelected = sess.id === todaySession.id;
              const isLocked = Boolean(sess.isPremiumOnly && !profile.isPremium);
              return (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? isLocked
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                        : "bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  ) : (
                    <Dumbbell className="w-3 h-3 shrink-0" />
                  )}
                  <span>{sess.dayLabel.split(" ")[0]} · {sess.title.split("—")[0].trim()}</span>
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold ${
                      isLocked
                        ? "bg-amber-500/30 text-amber-200"
                        : isSelected
                        ? "bg-neutral-950/30 text-neutral-950"
                        : "bg-neutral-800 text-emerald-400"
                    }`}
                  >
                    {isLocked ? "PRO" : "GRÁTIS"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hero: Next Scheduled Workout Card */}
          {(() => {
            const isSessionLocked = Boolean(todaySession.isPremiumOnly && !profile.isPremium);
            return (
              <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
                        <span className={isSessionLocked ? "text-amber-400" : "text-emerald-400"}>
                          SESSÃO PROGRAMADA DE HOJE
                        </span>
                        <span aria-hidden="true" className="text-neutral-600">·</span>
                        <span className="text-neutral-400 font-normal">{todaySession.dayLabel}</span>
                        {isSessionLocked ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-400" /> PRO (PLANO PAGO)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                            GRÁTIS
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => (onOpenReminderModal ? onOpenReminderModal() : setIsReminderModalOpen(true))}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700/60 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Configurar Lembrete e Notificação Push de Treino"
                      >
                        <Bell className={`w-3.5 h-3.5 ${notifSettings.enabled ? "text-emerald-400 fill-emerald-400/20" : "text-neutral-500"}`} />
                        <span className="font-mono text-[11px]">
                          {notifSettings.enabled ? `Lembrete ${notifSettings.reminderTime}` : "Ativar Lembrete"}
                        </span>
                      </button>
                    </div>

                    {/* Adaptive Bio-feedback Banner based on Sleep & Stress */}
                    {(profile.sleepQuality || profile.sleepStages) && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenProfile && onOpenProfile()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 transition-colors cursor-pointer text-left"
                          title="Abrir detalhes dos ciclos de sono e dispositivos"
                        >
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-neutral-300">
                            Calibração IA: Sono <strong>{profile.sleepQuality || "Boa"}</strong> · Estresse <strong>{profile.stressLevel ?? 3}/10</strong>
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            {(profile.stressLevel && profile.stressLevel >= 7) || profile.sleepQuality === "Ruim" || profile.sleepQuality === "Péssima"
                              ? "(Intensidade reduzida)"
                              : profile.sleepQuality === "Excelente" && (profile.stressLevel ?? 3) <= 3
                              ? "(Prontidão Máxima para PRs)"
                              : "(Carga & RPE Mantidos)"}
                          </span>
                        </button>

                        {profile.sleepStages && (
                          <button
                            type="button"
                            onClick={() => onOpenProfile && onOpenProfile()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-colors cursor-pointer"
                            title="Ver hipnograma de sono e dispositivos conectados"
                          >
                            <Moon className="w-3 h-3 text-cyan-400" />
                            <span>
                              Sono Profundo: <strong>{Math.floor(profile.sleepStages.deepSleepMinutes / 60)}h {profile.sleepStages.deepSleepMinutes % 60}m</strong>
                            </span>
                            <span className="text-cyan-400 font-bold">
                              {profile.sleepStages.deepSleepMinutes >= 90 ? "(+5% Carga)" : profile.sleepStages.deepSleepMinutes < 60 ? "(-12% Carga)" : "(Padrão)"}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {todaySession.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-neutral-300">
                      {todaySession.muscleFocus} · {todaySession.warmupProtocol}
                    </p>

                    {isSessionLocked && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200 font-mono">
                        <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Este treino é exclusivo do plano pago FORZON Pro. Faça upgrade para desbloquear ou selecione um treino da faixa gratuita na aba de treinos.</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{todaySession.estimatedMinutes} min estimativa</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <span>{todaySession.exercises.length} exercícios estruturados</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {todaySession.exercises.reduce((acc, curr) => acc + curr.sets.length, 0)} séries totais
                      </span>
                    </div>

                    {/* Exercise preview: Clickable cards opening execution video guide */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                        <span>Exercícios da Sessão (clique para consultar a execução):</span>
                        <span className="text-emerald-400 text-[10px] font-bold">Instruções de execução</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {todaySession.exercises.map((ex, i) => (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() => {
                              const details = resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle);
                              setSelectedExerciseForModal(details);
                            }}
                            className="bg-neutral-800/80 hover:bg-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-200 border border-neutral-700/60 hover:border-emerald-500/50 flex items-center gap-2 text-xs transition-all cursor-pointer group shadow-sm text-left"
                            title="Ver execução e instruções do exercício"
                          >
                            <AnatomicalExerciseIllustration
                              exercise={resolveExerciseDetails(ex.name || ex.exerciseId, ex.targetMuscle)}
                              size="thumbnail"
                              className="w-7 h-7 !p-0"
                            />
                            <span className="font-medium group-hover:text-emerald-300 transition-colors">
                              {ex.name}
                            </span>
                            <Play className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 fill-current ml-0.5 shrink-0 transition-colors" />
                          </button>
                        ))}
                        {todaySession.cardioProtocol && (
                          <button
                            type="button"
                            onClick={() => {
                              const details = resolveExerciseDetails(todaySession.cardioProtocol!.name, "Cardio & Resistência");
                              setSelectedExerciseForModal(details);
                            }}
                            className="bg-cyan-950/90 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-400/60 hover:border-cyan-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-cyan-500/20 cursor-pointer transition-all"
                            title="Ver instruções do cardio pós-treino"
                          >
                            <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Final: {todaySession.cardioProtocol.machine} ({todaySession.cardioProtocol.durationMin} min)</span>
                            <Play className="w-3 h-3 text-cyan-400 fill-current ml-0.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Integrated Post-Workout Cardio Protocol Badge */}
                    {todaySession.cardioProtocol && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/50 to-neutral-900 border border-cyan-500/30 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span>{todaySession.cardioProtocol.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                {todaySession.cardioProtocol.durationMin} MIN · ~{todaySession.cardioProtocol.estimatedKcal} KCAL
                              </span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-cyan-400">
                                {todaySession.cardioProtocol.intensity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const details = resolveExerciseDetails(todaySession.cardioProtocol!.name, "Cardio & Resistência");
                                  setSelectedExerciseForModal(details);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Ver instruções do cardio"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>Ver execução</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            {todaySession.cardioProtocol.parameters} · {todaySession.cardioProtocol.benefits}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    {isSessionLocked ? (
                      <button
                        onClick={() => (onOpenUpgradeModal ? onOpenUpgradeModal(todaySession.title) : onNavigateTab("treinos"))}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                      >
                        <Crown className="w-4 h-4 fill-neutral-950" />
                        <span>DESBLOQUEAR COM FORZON PRO</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartWorkout(todaySession.id)}
                        className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-neutral-950" />
                        <span>INICIAR TREINO AGORA</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        onOpenCoachWithPrompt(
                          "Hoje estou com pouco tempo (apenas 25 minutos). Como você condensaria o Treino A de peito e ombros sem perder intensidade?"
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Condensar para 25 min (IA)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateTab("treinos")}
                      className="px-4 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Outros Esportes (HYROX, Luta, Natação...)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

      {/* Weekly Training Volume Chart Card (Recharts) — Posicionado acima do resumo nutricional */}
      <WeeklyVolumeChart
        recentWorkouts={recentWorkouts}
        gpsActivities={gpsActivities}
      />

      {/* 30-Day Evolution Report Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/80 border border-neutral-800/90 hover:border-emerald-500/30 p-5 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Relatório 30d vs 30d anteriores
              </span>
              <span className="text-xs text-neutral-400">Sobrecarga Progressiva & Cardio</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <span>Evolução do Ciclo:</span>
              <span className="text-emerald-400 font-mono font-semibold">+13.6% volume (kg)</span>
              <span className="text-neutral-500" aria-hidden="true">·</span>
              <span className="text-cyan-400 font-mono font-semibold">+22.1% distância (km)</span>
            </h3>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Comparativo detalhado de tonelagem total levantada (104.250 kg vs 91.800 kg) e distância outdoor (78.4 km vs 64.2 km) entre os últimos 30 dias e os 30 dias anteriores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveStoryData(todayStoryData);
                setIsStoryModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-white font-semibold text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Compartilhar evolução no Story do Whats ou Insta"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Story</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProgressReport(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <BarChart3 className="w-4 h-4 fill-neutral-950" />
              <span>VER RELATÓRIO COMPLETO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Smartwatch Connectivity Infrastructure Widget (Strava, Zepp OS & HealthKit) */}
      <SmartwatchConnectivityWidget onOpenDetailsModal={onOpenProfile} />

      {/* Smartwatch Nutrition & Water Sync (WearOS & Apple Watch) + AI Hydration Adjustments based on Workout Intensity */}
      <SmartwatchHydrationSyncCard
        nutrition={nutrition}
        recentWorkouts={recentWorkouts}
        onUpdateNutrition={onUpdateNutrition}
      />

      {/* Daily Water Intake Tracker with quick logging buttons and hourly progress chart */}
      <DailyWaterTracker
        waterIntakeMl={nutrition.waterIntakeMl}
        waterGoalMl={nutrition.waterGoalMl}
        onAddWater={handleAddWater}
      />

      {/* 3-Column Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Calories & Nutrition */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-neutral-400 font-medium">Balanço Nutricional Diário</div>
            <button
              onClick={() => onNavigateTab("nutricao")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              Ver Dieta <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Energia Ingerida</span>
                <span className="font-mono tabular-nums font-semibold text-white">
                  {nutrition.consumedCalories} / {nutrition.targetCalories} kcal
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${caloriesPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Proteínas (Síntese Muscular)</span>
                <span className="font-mono tabular-nums font-semibold text-white">
                  {nutrition.consumedProteinG}g / {nutrition.targetProteinG}g
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-neutral-800/60 text-[11px] text-neutral-400">
            Faltam 43g de proteína para fechar a meta do dia. Sugestão: 1 dose de whey ou omelete noturno.
          </div>
        </div>

        {/* Metric 2: Hydration Tracker */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Hidratação Celular</span>
            </div>
            {quickWaterAdded && (
              <span className="text-[11px] text-sky-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3 h-3" /> Registrado!
              </span>
            )}
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold text-white font-mono tabular-nums">
                {(nutrition.waterIntakeMl / 1000).toFixed(2)}{" "}
                <span className="text-xs font-normal text-neutral-400">L</span>
              </span>
              <span className="text-xs text-neutral-400 font-mono tabular-nums">
                Meta: {(nutrition.waterGoalMl / 1000).toFixed(1)} L ({waterPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleAddWater(250)}
              className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700/80 text-xs font-medium text-neutral-200 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 text-sky-400" />
              <span>250 ml</span>
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700/80 text-xs font-medium text-neutral-200 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 text-sky-400" />
              <span>500 ml</span>
            </button>
          </div>
        </div>

        {/* Metric 3: Active Challenge Tracker */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Desafio em Andamento</span>
            </div>
            <button
              onClick={() => onNavigateTab("comunidade")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              Ranking <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-white truncate">
              {activeChallenge.title}
            </div>
            <p className="text-xs text-neutral-400 line-clamp-2">
              {activeChallenge.description}
            </p>

            <div className="pt-1">
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Progresso do Desafio</span>
                <span className="font-mono tabular-nums font-semibold text-amber-400">
                  {activeChallenge.currentValue} / {activeChallenge.targetValue}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((activeChallenge.currentValue / activeChallenge.targetValue) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 pt-2 flex items-center justify-between">
            <span>{activeChallenge.deadlineDaysLeft} dias restantes</span>
            <span className="text-neutral-300 font-medium">Você está em 2º lugar</span>
          </div>
        </div>
      </div>

      {/* AI Contextual Coach Widget */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-base font-semibold text-white">
                FORZON Coach — Análise de Sobrecarga
              </h3>
              <span className="text-xs text-neutral-500 font-mono">IA adaptativa sincronizada</span>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              "Na última sessão de Supino Reto você completou 80kg x 6 repetições com RPE 8.5. Conforme a regra de progressão do protocolo FORZON, você está apto a tentar <strong>82kg para 5-6 repetições</strong> na 4ª série hoje, ou manter 80kg buscando 8 repetições completas com máxima amplitude."
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() =>
                  onOpenCoachWithPrompt(
                    "Quero entender melhor como aplicar o RPE (percepção subjetiva de esforço) para evitar lesões no ombro hoje."
                  )
                }
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 rounded-lg border border-neutral-700/50 transition-colors cursor-pointer"
              >
                Como dosar o RPE hoje?
              </button>
              <button
                onClick={() =>
                  onOpenCoachWithPrompt(
                    "Se o banco de supino estiver ocupado, quais são as melhores opções equivalentes?"
                  )
                }
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 rounded-lg border border-neutral-700/50 transition-colors cursor-pointer"
              >
                Aparelho ocupado: alternativas
              </button>
              <button
                onClick={() =>
                  onOpenCoachWithPrompt(
                    "Monte uma lista prática de compras para atingir meus 175g de proteína nesta semana."
                  )
                }
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 rounded-lg border border-neutral-700/50 transition-colors cursor-pointer"
              >
                Lista de compras semanal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Highlights */}
      {recentWorkouts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Última Atividade Concluída
              </h3>
              {recentWorkouts[0].syncStatus === "cached_offline" ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                  <Clock className="w-2.5 h-2.5" /> Cache Offline
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Nuvem Sincronizada
                </span>
              )}
            </div>
            <span className="text-xs text-neutral-400">Registrado com precisão</span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                {recentWorkouts[0].title}
              </div>
              <div className="text-xs text-neutral-400 flex flex-wrap gap-3 font-mono tabular-nums">
                <span>Duração: {Math.round(recentWorkouts[0].durationSeconds / 60)} min</span>
                <span aria-hidden="true">·</span>
                <span>Volume Total: {recentWorkouts[0].totalVolumeKg.toLocaleString()} kg</span>
                <span aria-hidden="true">·</span>
                <span>{recentWorkouts[0].totalSets} séries realizadas</span>
              </div>
              {recentWorkouts[0].prsAchieved.length > 0 && (
                <div className="text-xs text-emerald-400 font-medium pt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{recentWorkouts[0].prsAchieved[0]}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const rw = recentWorkouts[0];
                  const wStory: StoryData = {
                    type: "workout",
                    title: rw.title.toUpperCase(),
                    subtitle: "Sessão Concluída no FORZON",
                    badgeText: "Treino Pago",
                    athleteName: profile.name || "Gabriel Silva",
                    dateStr: new Date(rw.completedAt || rw.startedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),
                    metrics: [
                      {
                        label: "Tempo Total",
                        value: `${Math.round(rw.durationSeconds / 60)} min`,
                        icon: "clock",
                      },
                      {
                        label: "Volume Total",
                        value: `${rw.totalVolumeKg.toLocaleString()} kg`,
                        change: "Carga Registrada",
                        isPositive: true,
                        icon: "dumbbell",
                      },
                      {
                        label: "Séries / Reps",
                        value: `${rw.totalSets} / ${rw.totalReps}`,
                        icon: "trending",
                      },
                      {
                        label: "Esforço Percebido",
                        value: `RPE ${rw.perceivedEffortRpe || 8.5}/10`,
                        icon: "zap",
                      },
                    ],
                    highlights:
                      rw.prsAchieved.length > 0
                        ? rw.prsAchieved
                        : ["Todas as séries cumpridas com cadência controlada", "Meta de sobrecarga atingida"],
                    quoteOrDiagnostic: rw.notes || "Sobrecarga progressiva constante! Sem atalhos, cada repetição construiu a evolução.",
                  };
                  setActiveStoryData(wStory);
                  setIsStoryModalOpen(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                title="Compartilhar no Story do Whats ou Insta"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Story Whats & Insta</span>
              </button>

              <button
                onClick={() => onNavigateTab("treinos")}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Ver Histórico Completo
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Workout Push Reminder Configuration Modal */}
      <WorkoutReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        nextWorkoutTitle={todaySession.title}
        muscleFocus={todaySession.muscleFocus}
        streakDays={7}
      />

      {/* 9:16 Social Story Modal for WhatsApp & Instagram */}
      {isStoryModalOpen && (
        <StoryShareModal
          isOpen={isStoryModalOpen}
          onClose={() => {
            setIsStoryModalOpen(false);
            setActiveStoryData(null);
          }}
          storyData={activeStoryData || todayStoryData}
        />
      )}

      {/* Exercise Video Demonstration & Biomechanical Technique Modal */}
      {selectedExerciseForModal && (
        <ExerciseExecutionModal
          exercise={selectedExerciseForModal}
          isOpen={Boolean(selectedExerciseForModal)}
          onClose={() => setSelectedExerciseForModal(null)}
          onOpenCoachWithPrompt={onOpenCoachWithPrompt}
        />
      )}
    </div>
  );
};
