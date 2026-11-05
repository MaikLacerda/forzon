import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  HeartPulse,
  Info,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Zap,
  X,
  Dumbbell,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WorkoutPlan,
  CompletedWorkoutRecord,
  RecoveryCheckInRecord,
  SorenessLevel,
  SleepQualityRating,
} from "../../types";
import { recoveryService } from "../../services/recoveryService";

interface RecoveryCheckInCardProps {
  plan: WorkoutPlan;
  recentWorkouts: CompletedWorkoutRecord[];
  onPlanUpdated?: (updatedPlan: WorkoutPlan) => void;
  onOpenCoachWithPrompt?: (prompt: string) => void;
  onStartActiveRecovery?: (sessionId: string) => void;
}

export const RecoveryCheckInCard: React.FC<RecoveryCheckInCardProps> = ({
  plan,
  recentWorkouts,
  onPlanUpdated,
  onOpenCoachWithPrompt,
  onStartActiveRecovery,
}) => {
  // Today's existing check-in or null
  const [todayCheckIn, setTodayCheckIn] = useState<RecoveryCheckInRecord | null>(() =>
    recoveryService.getTodayCheckIn()
  );

  // Form interactive states
  const [rpe, setRpe] = useState<number>(() => todayCheckIn?.rpeResidual ?? 5);
  const [soreness, setSoreness] = useState<SorenessLevel>(() => todayCheckIn?.sorenessLevel ?? "moderada");
  const [sleep, setSleep] = useState<SleepQualityRating>(() => todayCheckIn?.sleepRating ?? "regular");
  const [notes, setNotes] = useState<string>(() => todayCheckIn?.notes ?? "");

  // UI state
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(() => !todayCheckIn);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  // Check if active recovery is already active in the plan
  const isRecoveryInPlan = recoveryService.isPlanActiveRecoveryActive(plan);

  // Detect intense workout trigger
  const trigger = recoveryService.detectIntenseWorkout(recentWorkouts);

  // Sync with custom events (e.g. if updated elsewhere)
  useEffect(() => {
    const handleCheckInSaved = (e: Event) => {
      const custom = e as CustomEvent<RecoveryCheckInRecord>;
      if (custom.detail) {
        setTodayCheckIn(custom.detail);
      }
    };
    const handleApplied = () => {
      setTodayCheckIn(recoveryService.getTodayCheckIn());
    };
    const handleReverted = () => {
      setTodayCheckIn(recoveryService.getTodayCheckIn());
    };

    window.addEventListener("athlynx_recovery_checkin_saved", handleCheckInSaved);
    window.addEventListener("athlynx_active_recovery_applied", handleApplied);
    window.addEventListener("athlynx_active_recovery_reverted", handleReverted);
    return () => {
      window.removeEventListener("athlynx_recovery_checkin_saved", handleCheckInSaved);
      window.removeEventListener("athlynx_active_recovery_applied", handleApplied);
      window.removeEventListener("athlynx_active_recovery_reverted", handleReverted);
    };
  }, []);

  const isHighIntensityFatigue = rpe >= 8 || soreness === "alta" || soreness === "extrema";

  // RPE label and styling helper
  const getRpeDescription = (val: number) => {
    if (val <= 3) return { label: "Leve / Recuperado", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" };
    if (val <= 6) return { label: "Moderado / Normal", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" };
    if (val === 7) return { label: "Intenso / Cansaço Notável", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" };
    if (val <= 9) return { label: "Muito Alto / Fadiga & DOMS Severa", color: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/15" };
    return { label: "Extremo / Sobrecarga Máxima SNC", color: "text-rose-400", border: "border-rose-500/50", bg: "bg-rose-500/20" };
  };

  const currentRpeMeta = getRpeDescription(rpe);

  // Submit check-in and apply Active Recovery
  const handleApplyActiveRecovery = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { updatedPlan, recoverySession } = recoveryService.applyActiveRecoveryToPlan(plan);

    const record: RecoveryCheckInRecord = {
      id: todayCheckIn?.id || `rec-checkin-${Date.now()}`,
      date: todayStr,
      timestamp: new Date().toISOString(),
      workoutId: trigger.workout?.id,
      workoutTitle: trigger.workout?.title,
      rpeResidual: rpe,
      sorenessLevel: soreness,
      sleepRating: sleep,
      suggestedActiveRecovery: true,
      activeRecoveryApplied: true,
      notes,
    };

    recoveryService.saveCheckIn(record);
    setTodayCheckIn(record);
    setIsExpanded(false);
    setNotificationSuccess("Plano atualizado! Sessão de 'Active Recovery & Mobilidade' agendada para hoje.");

    if (onPlanUpdated) {
      onPlanUpdated(updatedPlan);
    }

    setTimeout(() => setNotificationSuccess(null), 5000);
  };

  // Submit check-in without changing the plan
  const handleConfirmStandardWorkout = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const record: RecoveryCheckInRecord = {
      id: todayCheckIn?.id || `rec-checkin-${Date.now()}`,
      date: todayStr,
      timestamp: new Date().toISOString(),
      workoutId: trigger.workout?.id,
      workoutTitle: trigger.workout?.title,
      rpeResidual: rpe,
      sorenessLevel: soreness,
      sleepRating: sleep,
      suggestedActiveRecovery: isHighIntensityFatigue,
      activeRecoveryApplied: false,
      notes,
    };

    recoveryService.saveCheckIn(record);
    setTodayCheckIn(record);
    setIsExpanded(false);
    setNotificationSuccess("Check-in de recuperação registrado. Treino padrão mantido.");

    setTimeout(() => setNotificationSuccess(null), 4000);
  };

  // Revert active recovery back to original plan
  const handleRevertActiveRecovery = () => {
    const restored = recoveryService.revertActiveRecovery(plan);
    setTodayCheckIn(recoveryService.getTodayCheckIn());
    setNotificationSuccess("Sessão de Active Recovery removida. Cronograma original restaurado.");
    if (onPlanUpdated) {
      onPlanUpdated(restored);
    }
    setTimeout(() => setNotificationSuccess(null), 4000);
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" />
          <span>Check-in de Recuperação disponível</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-emerald-400 hover:underline font-medium cursor-pointer"
        >
          Abrir Avaliação
        </button>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800/90 overflow-hidden shadow-xl shadow-black/40 transition-all">
      {/* Decorative top accent line */}
      <div
        className={`h-1 w-full ${
          isRecoveryInPlan
            ? "bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400"
            : isHighIntensityFatigue
            ? "bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
            : "bg-gradient-to-r from-emerald-500 to-cyan-500"
        }`}
      />

      {/* Header Notification Banner */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/60">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              isHighIntensityFatigue
                ? "bg-orange-500/15 border-orange-500/30 text-orange-400 shadow-sm shadow-orange-500/10"
                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10"
            }`}
          >
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Notificação de Bio-Feedback
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <span className="text-xs text-neutral-400 font-mono">Check-in de Recuperação</span>

              {todayCheckIn && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Hoje: RPE {todayCheckIn.rpeResidual}/10
                </span>
              )}

              {isRecoveryInPlan && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Active Recovery Ativo
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {todayCheckIn
                ? isRecoveryInPlan
                  ? "Recuperação Ativa em Andamento no Plano"
                  : "Feedback de Recuperação Registrado"
                : trigger.hasIntenseWorkout
                ? "Como está seu corpo após o último treino intenso?"
                : "Avaliação Subjetiva de Recuperação e Prontidão"}
            </h3>

            {trigger.workout && (
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>
                  Última sessão: <strong className="text-neutral-200">{trigger.workout.title}</strong>
                  {trigger.workout.perceivedEffortRpe
                    ? ` · RPE ${trigger.workout.perceivedEffortRpe}/10`
                    : ""}
                  {trigger.workout.totalVolumeKg
                    ? ` · ${trigger.workout.totalVolumeKg.toLocaleString()} kg volume`
                    : ""}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{isExpanded ? "Recolher" : todayCheckIn ? "Ver Detalhes / Refazer" : "Fazer Check-in"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Ocultar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {notificationSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-950/40 border-b border-emerald-500/30 px-5 py-3 flex items-center gap-3 text-xs text-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{notificationSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Interactive Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5 sm:p-6 space-y-6"
          >
            {/* Step 1: Subjective Residual Effort & Fatigue (RPE 1-10) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
                    <span>1. Esforço Residual / Fadiga Subjetiva (Escala RPE)</span>
                    <span className="text-neutral-500 text-[10px]">(Borg CR10)</span>
                  </label>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Como você avalia a sensação de cansaço ou sobrecarga muscular remanescente hoje?
                  </p>
                </div>

                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono font-bold border ${currentRpeMeta.bg} ${currentRpeMeta.border} ${currentRpeMeta.color} self-start sm:self-auto`}
                >
                  <span>RPE {rpe} / 10</span>
                  <span className="text-[11px] font-normal opacity-90">· {currentRpeMeta.label}</span>
                </div>
              </div>

              {/* RPE 1-10 Button Selector */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                  const isSelected = rpe === val;
                  let bgVariant = "hover:bg-neutral-800 text-neutral-300 border-neutral-800";
                  if (isSelected) {
                    if (val <= 3) bgVariant = "bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold";
                    else if (val <= 6) bgVariant = "bg-cyan-500 text-neutral-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-bold";
                    else if (val === 7) bgVariant = "bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-400/20 font-bold";
                    else if (val <= 9) bgVariant = "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20 font-bold";
                    else bgVariant = "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 font-bold";
                  }

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRpe(val)}
                      className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer font-mono text-sm ${bgVariant}`}
                    >
                      <span className="text-base">{val}</span>
                      <span className="text-[9px] uppercase tracking-tighter opacity-80">
                        {val <= 3 ? "Leve" : val <= 6 ? "Médio" : val <= 8 ? "Alto" : "Extr."}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Muscle Soreness & Sleep Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Soreness */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-300">
                    2. Dor Muscular Tardia (DOMS)
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono capitalize">{soreness}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["baixa", "moderada", "alta", "extrema"] as SorenessLevel[]).map((level) => {
                    const active = soreness === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSoreness(level)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer text-center border ${
                          active
                            ? level === "alta" || level === "extrema"
                              ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                              : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sleep / Rest */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-300">
                    3. Qualidade do Repouso / Sono
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono capitalize">{sleep}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["restaurador", "regular", "insuficiente"] as SleepQualityRating[]).map((rating) => {
                    const active = sleep === rating;
                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setSleep(rating)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer text-center border ${
                          active
                            ? rating === "insuficiente"
                              ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                              : "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {rating}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Optional Observation / Soreness Area */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400">
                Observações subjetivas ou grupamento com maior rigidez (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Peitoral e ombros muito rígidos após o supino pesado; lombar cansada..."
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dynamic Suggestion Box: If High RPE (>= 8) or severe soreness */}
            {isHighIntensityFatigue ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-gradient-to-br from-orange-950/30 via-neutral-950/80 to-neutral-900 border border-orange-500/40 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                        Recomendação Automática: Sobrecarga Elevada (RPE {rpe}/10)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                        Risco de Overreaching
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Seu bio-feedback indica alta fadiga residual acumulada no sistema nervoso e microlesões musculares. Treinar com alta intensidade hoje elevaria o cortisol e atrasaria a supercompensação. Recomendamos substituir o dia de hoje por uma sessão de <strong>Active Recovery</strong> para restaurar o fluxo sanguíneo e acelerar a recuperação.
                    </p>
                  </div>
                </div>

                {/* Proposed Active Recovery Preview */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sessão Sugerida: Recuperação Ativa & Mobilidade</span>
                    </div>
                    <span className="font-mono text-emerald-400">30 min · 4 blocos</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5 bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>1. Liberação Miofascial Foam Roller (8 min)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>2. Mobilidade 90/90 & Rotação Torácica (10 min)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>3. Cardio Z1 55-65% FCmax (10 min)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>4. Descompressão Espinhal & Respiração (5 min)</span>
                    </div>
                  </div>
                </div>

                {/* Actions for High RPE */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyActiveRecovery}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 hover:brightness-110 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-950" />
                    <span>Aplicar Active Recovery no Plano de Treinos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmStandardWorkout}
                    className="py-3 px-4 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer text-center"
                  >
                    Manter Treino Programado Mesmo Assim
                  </button>

                  {onOpenCoachWithPrompt && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenCoachWithPrompt(
                          `Fiz um check-in de recuperação com RPE residual de ${rpe}/10 e dor ${soreness}. Me dê orientações científicas sobre descanso ativo vs passivo e nutrição para acelerar minha regeneração.`
                        )
                      }
                      className="py-3 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      title="Consultar Coach IA sobre estratégias de recuperação"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Dúvida Coach IA</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Moderate or Low RPE: Good readiness */
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      Prontidão Ótima para a Sessão (RPE {rpe}/10)
                    </h4>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Seu corpo assimilou a carga recente com boa supercompensação. Você está liberado para o treino programado!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmStandardWorkout}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer shrink-0 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirmar e Seguir Treino</span>
                </button>
              </div>
            )}

            {/* If Active recovery is already in the plan, offer revert shortcut */}
            {isRecoveryInPlan && (
              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Sua sessão de hoje está configurada como 'Active Recovery'.</span>
                </div>
                <button
                  type="button"
                  onClick={handleRevertActiveRecovery}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-white underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar treino original do cronograma</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
