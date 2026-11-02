import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  Share2,
  Dumbbell,
  Clock,
  Flame,
  ArrowRight,
  WifiOff,
  ShieldCheck,
  Zap,
  Headphones,
  Music,
  Minimize2,
  Maximize2,
  Minus,
  Plus,
  ChevronLeft,
  Camera,
  AlertOctagon,
  Eye,
  Activity,
  Lock,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { WorkoutSession, WorkoutExercise, WorkoutSet, CompletedWorkoutRecord } from "../../types";
import { EXERCISE_LIBRARY } from "../../data/exercises";
import { storage } from "../../services/storage";
import { StoryShareModal, StoryData } from "../social/StoryShareModal";
import { PowerPlaylistWidget } from "./PowerPlaylistWidget";
import { LiveVisionCoachOverlay, PostureFeedbackState } from "./LiveVisionCoachOverlay";

interface LiveWorkoutModalProps {
  session: WorkoutSession;
  isPremium?: boolean;
  onClose: () => void;
  onFinishWorkout: (record: CompletedWorkoutRecord, shareToFeed: boolean) => void;
  onOpenCoachWithPrompt: (prompt: string) => void;
  onOpenUpgradeModal?: (feature?: string) => void;
}

export const LiveWorkoutModal: React.FC<LiveWorkoutModalProps> = ({
  session,
  isPremium = false,
  onClose,
  onFinishWorkout,
  onOpenCoachWithPrompt,
  onOpenUpgradeModal,
}) => {
  // Total elapsed workout timer
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);

  // Active exercise index in session
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);

  // Deep clone of session exercises to track live logging
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() =>
    JSON.parse(JSON.stringify(session.exercises))
  );

  // Rest Timer state
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [restTotalTarget, setRestTotalTarget] = useState<number>(60);
  const [isRestPaused, setIsRestPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Animated set switching and loading states (framer-motion)
  const [justCompletedSetInfo, setJustCompletedSetInfo] = useState<{
    setNumber: number;
    weightKg: number;
    reps: number;
  } | null>(null);
  const [isSwitchingExercise, setIsSwitchingExercise] = useState(false);

  // Post workout completion review
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<CompletedWorkoutRecord | null>(null);
  const [sessionRpe, setSessionRpe] = useState<number>(8);
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);
  const [isMinimalistMode, setIsMinimalistMode] = useState(false);
  const [isVisionCoachOpen, setIsVisionCoachOpen] = useState(false);
  const [latestPostureFeedback, setLatestPostureFeedback] = useState<PostureFeedbackState | null>(null);

  const workoutTimerRef = useRef<number | null>(null);
  const restTimerRef = useRef<number | null>(null);

  // Total session timer
  useEffect(() => {
    if (!isWorkoutPaused && !isCompleted) {
      workoutTimerRef.current = window.setInterval(() => {
        setTotalSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    }
    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [isWorkoutPaused, isCompleted]);

  // Rest countdown timer
  useEffect(() => {
    if (restSecondsRemaining !== null && restSecondsRemaining > 0 && !isRestPaused) {
      restTimerRef.current = window.setInterval(() => {
        setRestSecondsRemaining((r) => {
          if (r === null || r <= 1) {
            playBeep();
            return null;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [restSecondsRemaining, isRestPaused]);

  // Web Audio synthetic pip/chime when rest finishes
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 chime
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // AudioContext could be blocked by browser policy without user gesture
    }
  };

  const currentExercise = exercises[activeExerciseIdx] || exercises[0];
  const nextUncompletedSet =
    currentExercise.sets.find((s) => !s.completed) ||
    currentExercise.sets[currentExercise.sets.length - 1];
  const allSetsInCurrentExerciseDone = currentExercise.sets.every((s) => s.completed);

  const handleUpdateSet = (
    setId: string,
    field: "weightKg" | "actualReps" | "completed" | "type",
    val: any
  ) => {
    setExercises((prev) =>
      prev.map((ex, exIdx) => {
        if (exIdx !== activeExerciseIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            const updated = { ...s, [field]: val };
            if (field === "completed" && val === true) {
              if (updated.actualReps === undefined) {
                updated.actualReps = s.targetReps;
              }
            }
            return updated;
          }),
        };
      })
    );

    // If a set is completed, automatically trigger rest timer & animated transition
    if (field === "completed" && val === true) {
      const setCompleted = currentExercise.sets.find((s) => s.id === setId);
      if (setCompleted) {
        setJustCompletedSetInfo({
          setNumber: setCompleted.setNumber,
          weightKg: setCompleted.weightKg,
          reps: setCompleted.actualReps || setCompleted.targetReps,
        });
        setTimeout(() => setJustCompletedSetInfo(null), 3200);
      }

      const targetRest = currentExercise.restSeconds || 75;
      setRestTotalTarget(targetRest);
      setRestSecondsRemaining(targetRest);
      setIsRestPaused(false);
    }
  };

  const handleStartCustomRest = (seconds: number) => {
    setRestTotalTarget(seconds);
    setRestSecondsRemaining(seconds);
    setIsRestPaused(false);
  };

  const handleCompleteWorkout = () => {
    // Calculate stats
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    const prs: string[] = [];

    exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          const reps = s.actualReps || s.targetReps;
          totalVolume += s.weightKg * reps;
          totalSets += 1;
          totalReps += reps;

          // Check if PR (weight greater than previous)
          if (s.previousWeightKg && s.weightKg > s.previousWeightKg) {
            prs.push(`${ex.name}: +${s.weightKg - s.previousWeightKg}kg de sobrecarga superada!`);
          }
        }
      });
    });

    const record: CompletedWorkoutRecord = {
      id: `workout-rec-${Date.now()}`,
      sessionId: session.id,
      title: session.title,
      startedAt: new Date(Date.now() - totalSeconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: totalSeconds,
      totalVolumeKg: totalVolume,
      totalSets,
      totalReps,
      perceivedEffortRpe: sessionRpe,
      notes: sessionNotes,
      exercisesLogged: exercises.map((e) => ({
        name: e.name,
        targetMuscle: e.targetMuscle,
        sets: e.sets.map((s) => ({
          weightKg: s.weightKg,
          reps: s.actualReps || s.targetReps,
          completed: s.completed,
        })),
      })),
      prsAchieved: prs.length > 0 ? prs : ["Sessão executada com 100% de consistência!"],
    };

    setCompletedRecord(record);
    setIsCompleted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00d2ff", "#3b82f6", "#ffffff"],
      });
    } catch {}
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Access control guard
  if (session.isPremiumOnly && !isPremium) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-lg bg-neutral-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white text-center space-y-6">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>CONTEÚDO EXCLUSIVO FORZON PRO</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {session.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
              Esta sessão é exclusiva para membros do plano pago FORZON Pro. Os treinos básicos (Sessões A e B) continuam 100% gratuitos para você treinar à vontade.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                if (onOpenUpgradeModal) onOpenUpgradeModal(session.title);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Crown className="w-4 h-4 fill-neutral-950" />
              <span>Ver Planos e Desbloquear</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              Voltar aos Treinos Gratuitos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Minimizar / Cancelar"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-emerald-400 font-mono uppercase tracking-wider">
              Treino ao Vivo
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {session.title}
            </h1>
          </div>
        </div>

        {/* Stopwatch & Audio controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Minimalist Focus Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsMinimalistMode(!isMinimalistMode)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              isMinimalistMode
                ? "bg-emerald-500 text-neutral-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400"
                : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
            }`}
            title={isMinimalistMode ? "Sair da Interface Minimalista" : "Ativar Modo Minimalista (Foco sem distrações)"}
          >
            {isMinimalistMode ? (
              <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {isMinimalistMode ? "Minimalista: ON" : "Modo Minimalista"}
            </span>
          </button>

          {/* Power Playlist toggle button */}
          {!isMinimalistMode && (
            <button
              type="button"
              onClick={() => setShowMusicPlayer(!showMusicPlayer)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                showMusicPlayer
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
              title="Playlist por Intensidade do Treino"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Power Playlist</span>
            </button>
          )}

          {/* Live Biomechanics & Camera Coach Toggle (MediaPipe Pose & Web Speech) */}
          <button
            type="button"
            onClick={() => setIsVisionCoachOpen((prev) => !prev)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              isVisionCoachOpen
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
            }`}
            title="Abrir Coach Visual em Tempo Real com MediaPipe e Alerta por Voz"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {isVisionCoachOpen ? "MediaPipe Ativo" : "Coach MediaPipe"}
            </span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Sons ativados" : "Sons mudos"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold text-white tabular-nums flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatTimer(totalSeconds)}</span>
          </div>

          <button
            onClick={() => setIsWorkoutPaused(!isWorkoutPaused)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
            title={isWorkoutPaused ? "Retomar Cronômetro" : "Pausar Cronômetro"}
          >
            {isWorkoutPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Discreet Sponsor Bar for Free Plan Users */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs shrink-0 z-20">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 uppercase font-bold shrink-0">
              Patrocinador
            </span>
            <span className="text-neutral-300 truncate">
              <strong>MAX TITANIUM</strong> · Cupom <span className="font-mono text-emerald-400 font-bold">FORZON15</span> para 15% OFF em suplementação
            </span>
          </div>
          {onOpenUpgradeModal && (
            <button
              type="button"
              onClick={() => onOpenUpgradeModal("Remover Anúncios do Treino")}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 shrink-0 ml-3 cursor-pointer hover:underline"
            >
              <span>Remover anúncios com Pro</span>
            </button>
          )}
        </div>
      )}

      {/* Main Body */}
      {isMinimalistMode ? (
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col justify-between space-y-6">
          {/* Set Completion Animated Toast Indicator */}
          <AnimatePresence>
            {justCompletedSetInfo && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between text-xs text-white shadow-lg shadow-emerald-500/10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-400">
                      Série {justCompletedSetInfo.setNumber} Concluída!
                    </span>{" "}
                    <span className="text-neutral-300 font-mono">
                      ({justCompletedSetInfo.weightKg}kg × {justCompletedSetInfo.reps} reps)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300 font-mono text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Descanso Ativado</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimalist Top Indicator */}
          <div className="flex items-center justify-between bg-neutral-900/60 border border-neutral-800/80 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Modo Foco Minimalista Ativo
              </span>
            </div>
            <button
              onClick={() => setIsMinimalistMode(false)}
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sair do Modo</span>
            </button>
          </div>

          {/* Center Minimalist HUD Card */}
          <div className="bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-7 shadow-2xl text-center relative overflow-hidden my-auto">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Current Exercise Title & Set Index */}
            <div className="space-y-1.5 relative z-10">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                Exercício {activeExerciseIdx + 1} de {exercises.length} · {currentExercise.targetMuscle}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {currentExercise.name}
              </h2>
              <div className="text-xs sm:text-sm text-neutral-400 font-mono">
                Série {nextUncompletedSet.setNumber} de {currentExercise.sets.length}
                {nextUncompletedSet.completed && " (Concluída ✓)"}
              </div>
            </div>

            {/* 1. Cronômetro do Descanso (Hero Rest Timer) */}
            <div className="relative z-10 py-1">
              {restSecondsRemaining !== null && restSecondsRemaining > 0 ? (
                <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-3xl p-5 sm:p-7 space-y-2 shadow-lg shadow-emerald-500/10">
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Intervalo de Descanso</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-6xl sm:text-7xl font-black font-mono text-emerald-400 tracking-tight tabular-nums"
                  >
                    {restSecondsRemaining}s
                  </motion.div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setRestSecondsRemaining((r) => (r ? r + 15 : 15))}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-emerald-500 text-xs font-mono text-neutral-200 transition-colors cursor-pointer"
                    >
                      +15s
                    </button>
                    <button
                      onClick={() => setRestSecondsRemaining(null)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Pular Descanso
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-950/70 border border-neutral-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">Cronômetro de Descanso</div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-200">Pronto para a Série</div>
                  </div>
                  <button
                    onClick={() => handleStartCustomRest(currentExercise.restSeconds || 60)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
                  >
                    Iniciar {currentExercise.restSeconds || 60}s
                  </button>
                </div>
              )}
            </div>

            {/* 2. Carga do Próximo Set & Repetições */}
            <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-4 relative z-10">
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Carga do Próximo Set
              </div>

              {/* Large Load Display with Quick +/- 2.5kg Adjusters */}
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSet(
                      nextUncompletedSet.id,
                      "weightKg",
                      Math.max(0, (nextUncompletedSet.weightKg || 0) - 2.5)
                    )
                  }
                  className="w-12 h-12 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
                  title="Reduzir 2.5 kg"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={nextUncompletedSet.weightKg}
                      onChange={(e) =>
                        handleUpdateSet(
                          nextUncompletedSet.id,
                          "weightKg",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="text-5xl sm:text-6xl font-black font-mono text-white text-center bg-transparent focus:outline-none w-40 sm:w-48 tracking-tight"
                    />
                    <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">kg</span>
                  </div>
                  <div className="text-xs font-mono text-neutral-400 mt-1">
                    Meta:{" "}
                    <strong className="text-white font-mono">
                      {nextUncompletedSet.targetReps} reps
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSet(
                      nextUncompletedSet.id,
                      "weightKg",
                      (nextUncompletedSet.weightKg || 0) + 2.5
                    )
                  }
                  className="w-12 h-12 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
                  title="Aumentar 2.5 kg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Set Completion Main Action Button */}
              <div className="pt-2">
                {nextUncompletedSet.completed ? (
                  <button
                    onClick={() => handleUpdateSet(nextUncompletedSet.id, "completed", false)}
                    className="w-full py-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-sm tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Série {nextUncompletedSet.setNumber} Concluída (Reabrir)</span>
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateSet(nextUncompletedSet.id, "completed", true)}
                    className="w-full py-4 sm:py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-3"
                  >
                    <Check className="w-6 h-6 stroke-[3]" />
                    <span>CONCLUIR SÉRIE {nextUncompletedSet.setNumber} ({nextUncompletedSet.weightKg}kg)</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Exercise Navigation in Minimalist Mode */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                disabled={activeExerciseIdx === 0}
                onClick={() => setActiveExerciseIdx((i) => Math.max(0, i - 1))}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-mono cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {activeExerciseIdx < exercises.length - 1 ? (
                <button
                  onClick={() => setActiveExerciseIdx((i) => Math.min(exercises.length - 1, i + 1))}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold cursor-pointer"
                >
                  <span>Próximo Exercício</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteWorkout}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 text-xs font-black cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <span>Finalizar Treino</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
          {/* Set Completion Animated Toast Indicator */}
          <AnimatePresence>
          {justCompletedSetInfo && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between text-xs text-white shadow-lg shadow-emerald-500/10"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="font-bold text-emerald-400">
                    Série {justCompletedSetInfo.setNumber} Concluída!
                  </span>{" "}
                  <span className="text-neutral-300 font-mono">
                    ({justCompletedSetInfo.weightKg}kg × {justCompletedSetInfo.reps} reps)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 font-mono text-[11px]">
                <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Intervalo Ativado</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rest Timer Floating Banner (Animated with Framer Motion) */}
        <AnimatePresence>
          {restSecondsRemaining !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg shadow-emerald-500/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center font-mono text-lg font-black text-emerald-400 tabular-nums shadow-sm"
                  >
                    {restSecondsRemaining}s
                  </motion.div>
                  <div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                      <span>Descanso entre Séries</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="text-sm font-bold text-white">
                      Respire fundo · Hidrate-se
                    </div>
                  </div>
                </div>

                {/* Animated countdown progress track */}
                <div className="hidden sm:block flex-1 max-w-xs mx-4">
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{
                        width: `${Math.max(0, Math.min(100, (restSecondsRemaining / restTotalTarget) * 100))}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRestSecondsRemaining((prev) => (prev ? prev + 15 : 15))}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 hover:text-white cursor-pointer transition-colors"
                  >
                    +15s
                  </button>
                  <button
                    onClick={() => setRestSecondsRemaining(null)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-xs font-bold text-neutral-950 hover:bg-emerald-400 cursor-pointer transition-colors shadow-sm"
                  >
                    Pular
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulated Power Playlist Generator & Workout-Specific Music Player */}
        <AnimatePresence>
          {showMusicPlayer && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <PowerPlaylistWidget
                currentExerciseName={currentExercise.name}
                targetMuscle={currentExercise.targetMuscle}
                isResting={restSecondsRemaining !== null && restSecondsRemaining > 0}
                currentSetIndex={
                  currentExercise.sets.findIndex((s) => !s.completed) !== -1
                    ? currentExercise.sets.findIndex((s) => !s.completed)
                    : currentExercise.sets.length - 1
                }
                totalSets={currentExercise.sets.length}
                weightKg={currentExercise.sets[0]?.weightKg || 80}
                previousWeightKg={currentExercise.sets[0]?.previousWeightKg}
                isSoundMuted={!soundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise Switcher Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {exercises.map((ex, idx) => {
            const isSelected = idx === activeExerciseIdx;
            const completedSetsCount = ex.sets.filter((s) => s.completed).length;
            const allCompleted = completedSetsCount === ex.sets.length;

            return (
              <motion.button
                key={ex.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (idx !== activeExerciseIdx) {
                    setIsSwitchingExercise(true);
                    setActiveExerciseIdx(idx);
                    setTimeout(() => setIsSwitchingExercise(false), 200);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-neutral-900 border-emerald-500 text-white shadow-sm"
                    : allCompleted
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                    : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span>
                  {idx + 1}. {ex.name}
                </span>
                <span className="font-mono text-[10px] tabular-nums">
                  ({completedSetsCount}/{ex.sets.length})
                </span>
                {allCompleted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </motion.button>
            );
          })}
        </div>

        {/* Active Exercise Detail Card with Smooth Animated Presence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.id || activeExerciseIdx}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <span>EXERCÍCIO {activeExerciseIdx + 1} DE {exercises.length}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-400 font-normal">{currentExercise.targetMuscle}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {currentExercise.name}
                </h2>
                {currentExercise.notes && (
                  <p className="text-xs text-neutral-400 mt-1 italic">
                    "{currentExercise.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    onOpenCoachWithPrompt(
                      `O aparelho para "${currentExercise.name}" está ocupado na minha academia. Qual substituição rápida posso fazer aqui mesmo?`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Aparelho Ocupado</span>
                  <span className="sm:hidden">Substituir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVisionCoachOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 text-xs font-medium text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title="Analisar execução biomecânica e cadência via câmera"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Analisar Postura</span>
                </button>
              </div>
            </div>

            {/* Real-time Posture & Range of Motion Status Card */}
            {latestPostureFeedback?.isIncorrect ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsVisionCoachOpen(true)}
                className="p-3.5 bg-rose-500/15 border border-rose-500/50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-500/20 transition-all shadow-lg shadow-rose-500/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <AlertOctagon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                      <span>🚨 {latestPostureFeedback.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-200 border border-rose-800">
                        {latestPostureFeedback.romPercentage}% ROM
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-200/90 font-medium truncate">
                      {latestPostureFeedback.correctiveCue}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right font-mono text-xs text-rose-300 font-bold flex items-center gap-1">
                  <span>Ver Câmera IA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ) : (
              <div
                onClick={() => setIsVisionCoachOpen(true)}
                className="p-2.5 bg-neutral-950/70 hover:bg-neutral-950 border border-neutral-800/80 hover:border-cyan-500/40 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-neutral-300">
                    Detecção de Pose em Tempo Real:{" "}
                    <span className="font-bold text-emerald-400">
                      {latestPostureFeedback
                        ? `${latestPostureFeedback.title} (${latestPostureFeedback.romPercentage}% ROM)`
                        : "Forma Biomecânica & Amplitude Prontas para Análise"}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1 shrink-0">
                  <span>Abrir Câmera</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            )}

            {/* Sets Logging Table */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-mono text-neutral-400 uppercase tracking-wider px-2">
                <div className="col-span-2">Série</div>
                <div className="col-span-3">Anterior</div>
                <div className="col-span-3">Carga (kg)</div>
                <div className="col-span-2">Reps</div>
                <div className="col-span-2 text-center">Concluir</div>
              </div>

              <div className="space-y-2">
                {currentExercise.sets.map((set, sIdx) => (
                  <motion.div
                    key={set.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: sIdx * 0.04 }}
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition-all ${
                      set.completed
                        ? "bg-emerald-950/20 border-emerald-500/40 text-white shadow-sm shadow-emerald-500/5"
                        : "bg-neutral-950/70 border-neutral-800 text-neutral-200 hover:border-neutral-700"
                    }`}
                  >
                    {/* Set Number & Type */}
                    <div className="col-span-2 flex items-center gap-1.5 font-mono text-xs">
                      <span className="font-bold text-white">{set.setNumber}</span>
                      <span className="text-[10px] text-neutral-500 uppercase">{set.type.slice(0, 4)}</span>
                    </div>

                    {/* Previous Reference */}
                    <div className="col-span-3 text-xs font-mono text-neutral-400 tabular-nums">
                      {set.previousWeightKg ? (
                        <span>{set.previousWeightKg}kg × {set.previousReps}</span>
                      ) : (
                        <span>—</span>
                      )}
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.5"
                        value={set.weightKg}
                        onChange={(e) =>
                          handleUpdateSet(set.id, "weightKg", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-sm font-bold text-white text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={set.actualReps !== undefined ? set.actualReps : set.targetReps}
                        onChange={(e) =>
                          handleUpdateSet(set.id, "actualReps", parseInt(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-sm font-bold text-white text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Completed Checkbox with scale bounce */}
                    <div className="col-span-2 flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => handleUpdateSet(set.id, "completed", !set.completed)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          set.completed
                            ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40"
                            : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Rest presets */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-800 text-xs">
              <span className="text-neutral-400 font-medium">Intervalo manual:</span>
              <div className="flex gap-2">
                {[45, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleStartCustomRest(sec)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono cursor-pointer transition-colors"
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

        {/* Navigation between exercises & Finish button */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={() => setActiveExerciseIdx(Math.max(0, activeExerciseIdx - 1))}
            disabled={activeExerciseIdx === 0}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 disabled:opacity-40 cursor-pointer"
          >
            ← Anterior
          </button>

          {activeExerciseIdx < exercises.length - 1 ? (
            <button
              onClick={() => setActiveExerciseIdx(activeExerciseIdx + 1)}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>Próximo Exercício</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteWorkout}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              CONCLUIR TREINO COMPLETO
            </button>
          )}
        </div>
      </div>
      )}

      {/* Completion Modal Overlay */}
      {isCompleted && completedRecord && (
        <div className="fixed inset-0 z-60 bg-neutral-950/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Flame className="w-8 h-8 fill-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Treino Finalizado com Sucesso!
              </h2>
              <p className="text-xs text-neutral-400">
                Parabéns! Todas as cargas foram computadas e sincronizadas no seu histórico FORZON.
              </p>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase">Tempo</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {Math.round(completedRecord.durationSeconds / 60)} min
                </div>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase">Volume Total</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {completedRecord.totalVolumeKg.toLocaleString()} kg
                </div>
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase">Séries / Reps</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {completedRecord.totalSets} / {completedRecord.totalReps}
                </div>
              </div>
            </div>

            {/* PRs achieved */}
            {completedRecord.prsAchieved.length > 0 && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl text-xs space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Conquistas da Sessão:
                </div>
                {completedRecord.prsAchieved.map((pr, i) => (
                  <div key={i} className="text-neutral-200">
                    · {pr}
                  </div>
                ))}
              </div>
            )}

            {/* RPE & Notes input */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Percepção Subjetiva de Esforço (RPE: {sessionRpe}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-0.5">
                  <span>1 (Leve)</span>
                  <span>7-8 (Ótimo/RIR 2)</span>
                  <span>10 (Falha Máxima)</span>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Observações Pessoais (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: pegada firme, ombro 100% sem dor, boa cadência..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Offline Cache Notice */}
            {!storage.isNetworkOnline() && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Modo Offline ativo: este treino será protegido no cache local com integridade criptográfica e sincronizado automaticamente assim que a conexão retornar.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    completedRecord.perceivedEffortRpe = sessionRpe;
                    completedRecord.notes = sessionNotes;
                    onFinishWorkout(completedRecord, true);
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Salvar & Publicar no Feed</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(true)}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 cursor-pointer"
                  title="Criar Story 9:16 para WhatsApp e Instagram"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Story Whats & Insta</span>
                </button>

                <button
                  onClick={() => {
                    completedRecord.perceivedEffortRpe = sessionRpe;
                    completedRecord.notes = sessionNotes;
                    onFinishWorkout(completedRecord, false);
                  }}
                  className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Apenas Salvar Privado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9:16 Social Story Modal for WhatsApp & Instagram */}
      {completedRecord && (
        <StoryShareModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          storyData={{
            type: "workout",
            title: completedRecord.title.toUpperCase(),
            subtitle: "Sessão Concluída no FORZON",
            badgeText: "Treino Pago",
            athleteName: storage.getProfile().name || "Gabriel Silva",
            dateStr: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
            metrics: [
              {
                label: "Tempo Total",
                value: `${Math.round(completedRecord.durationSeconds / 60)} min`,
                icon: "clock",
              },
              {
                label: "Volume Total",
                value: `${completedRecord.totalVolumeKg.toLocaleString()} kg`,
                change: "Carga Registrada",
                isPositive: true,
                icon: "dumbbell",
              },
              {
                label: "Séries / Reps",
                value: `${completedRecord.totalSets} / ${completedRecord.totalReps}`,
                icon: "trending",
              },
              {
                label: "Esforço Percebido",
                value: `RPE ${sessionRpe} / 10`,
                icon: "zap",
              },
            ],
            highlights:
              completedRecord.prsAchieved.length > 0
                ? completedRecord.prsAchieved
                : ["Todas as séries cumpridas com cadência ótima", "Volume de sobrecarga computado com sucesso"],
            quoteOrDiagnostic: sessionNotes || "Sessão concluída com sobrecarga progressiva e foco total.",
          }}
        />
      )}

      {/* Live Biomechanics & Form Posture Analysis Overlay */}
      {isVisionCoachOpen && (
        <LiveVisionCoachOverlay
          exercise={currentExercise}
          currentSetIndex={activeExerciseIdx}
          onClose={() => setIsVisionCoachOpen(false)}
          onPostureStatusChange={(feedback) => setLatestPostureFeedback(feedback)}
          onValidRepCounted={(reps) => {
            // Automatically log counted rep to the current uncompleted set
            setExercises((prev) => {
              const copy = [...prev];
              const ex = copy[activeExerciseIdx];
              if (!ex) return prev;
              const setIdx = ex.sets.findIndex((s) => !s.completed);
              if (setIdx !== -1) {
                ex.sets[setIdx].actualReps = reps;
              }
              return copy;
            });
          }}
        />
      )}
    </div>
  );
};
