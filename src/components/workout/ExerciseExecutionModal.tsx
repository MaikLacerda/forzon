import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Dumbbell,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
  Gauge,
  Flame,
  Info,
  Repeat,
  ExternalLink,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "../../types";
import { getExerciseVideoInfo } from "../../services/exerciseVideoService";

interface ExerciseExecutionModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onOpenCoachWithPrompt?: (prompt: string) => void;
  onSwapExercise?: (newExerciseName: string) => void;
}

// Biomechanical pattern classification for animated simulation
type MovementPattern =
  | "push_horizontal" // Supino reto, articulado, halteres
  | "push_incline" // Supino inclinado
  | "push_vertical" // Desenvolvimento militar, halteres
  | "pull_vertical" // Puxada frontal, barra fixa
  | "pull_horizontal" // Remada curvada, baixa, cavalinho
  | "squat" // Agachamento, leg press, hack
  | "hinge" // Levantamento terra, stiff, RDL
  | "knee_flexion" // Cadeira flexora, mesa flexora
  | "knee_extension" // Cadeira extensora
  | "biceps_curl" // Rosca direta, alternada, martelo
  | "triceps_extension" // Tríceps corda, testa, francês, paralelas
  | "lateral_raise" // Elevação lateral
  | "core" // Abdominal, crunch polia
  | "cardio"; // Escada, esteira, bicicleta

function detectMovementPattern(ex: Exercise): MovementPattern {
  const name = ex.name.toLowerCase();
  const muscle = ex.primaryMuscle?.toLowerCase() || "";

  if (muscle.includes("cardio") || name.includes("esteira") || name.includes("escada") || name.includes("bicicleta") || name.includes("hiit")) {
    return "cardio";
  }
  if (name.includes("inclinad") && (name.includes("supino") || muscle.includes("peitor"))) {
    return "push_incline";
  }
  if (name.includes("supino") || name.includes("flexão") || (muscle.includes("peitor") && name.includes("articulad"))) {
    return "push_horizontal";
  }
  if (name.includes("desenvolvimento") || (muscle.includes("ombro") && name.includes("militar"))) {
    return "push_vertical";
  }
  if (name.includes("lateral") && muscle.includes("ombro")) {
    return "lateral_raise";
  }
  if (name.includes("puxada") || name.includes("barra fixa") || name.includes("pulley")) {
    return "pull_vertical";
  }
  if (name.includes("remada") || name.includes("cavalinho") || name.includes("crucifixo invertido") || name.includes("face pull")) {
    return "pull_horizontal";
  }
  if (name.includes("agachamento") || name.includes("leg press") || name.includes("hack") || name.includes("afundo") || name.includes("búlgaro")) {
    return "squat";
  }
  if (name.includes("stiff") || name.includes("terra") || name.includes("rdl") || name.includes("elevação pélvica")) {
    return "hinge";
  }
  if (name.includes("flexora")) {
    return "knee_flexion";
  }
  if (name.includes("extensora")) {
    return "knee_extension";
  }
  if (name.includes("rosca") || muscle.includes("bíceps") || muscle.includes("biceps")) {
    return "biceps_curl";
  }
  if (name.includes("tríceps") || name.includes("triceps") || name.includes("paralela") || name.includes("testa")) {
    return "triceps_extension";
  }
  if (muscle.includes("abdômen") || muscle.includes("core") || name.includes("crunch") || name.includes("abdominal")) {
    return "core";
  }
  return "push_horizontal";
}

// Estimated electromyography (EMG) muscle activation distribution
function getMuscleRecruitment(ex: Exercise) {
  const primary = ex.primaryMuscle;
  const secondaries = ex.secondaryMuscles || [];

  return [
    { muscle: primary, percentage: 70, isPrimary: true },
    ...secondaries.slice(0, 3).map((m, idx) => ({
      muscle: m,
      percentage: idx === 0 ? 20 : 10,
      isPrimary: false,
    })),
  ];
}

export const ExerciseExecutionModal: React.FC<ExerciseExecutionModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onOpenCoachWithPrompt,
  onSwapExercise,
}) => {
  const [viewMode, setViewMode] = useState<"video" | "biomechanics">("video");
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [progress, setProgress] = useState(0.2); // 0 to 1
  const [showAngles, setShowAngles] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [activeTab, setActiveTab] = useState<"passo_a_passo" | "biomecanica" | "erros" | "cues" | "substituicoes">("passo_a_passo");
  const [isSoundMuted, setIsSoundMuted] = useState(true);

  const videoInfo = getExerciseVideoInfo(exercise.name, exercise.primaryMuscle);
  const pattern = detectMovementPattern(exercise);
  const recruitment = getMuscleRecruitment(exercise);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Smooth animation loop for the biomechanical canvas simulation
  useEffect(() => {
    if (!isOpen) return;

    const cycleDurationMs = 3800 / speed; // ~3.8 seconds per complete rep (3s eccentric + 0.8s concentric)

    const animate = (time: number) => {
      if (lastTimeRef.current !== null && isPlaying) {
        const delta = time - lastTimeRef.current;
        setProgress((prev) => (prev + delta / cycleDurationMs) % 1);
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    };
  }, [isOpen, isPlaying, speed]);

  if (!isOpen) return null;

  // Determine motion phase: Eccentric (0 -> 0.65), Isometric (0.65 -> 0.75), Concentric (0.75 -> 1.0)
  let phaseName = "Fase Excêntrica (Alongamento)";
  let phaseColor = "text-cyan-400";
  let phaseSub = "Descida controlada · 3 segundos";
  let motionT = 0; // 0 = start/lockout, 1 = maximum stretch/depth

  if (progress < 0.6) {
    // Eccentric descent
    motionT = progress / 0.6;
    phaseName = "Fase Excêntrica (Descida Controlada)";
    phaseColor = "text-cyan-400";
    phaseSub = "Tensão contínua · Sem despencar a carga";
  } else if (progress < 0.72) {
    // Bottom turnaround / isometric pause
    motionT = 1;
    phaseName = "Ponto de Inversão / Máximo Alongamento";
    phaseColor = "text-amber-400";
    phaseSub = "Pausa anatômica · Sem rebote articular";
  } else {
    // Concentric drive
    motionT = 1 - (progress - 0.72) / 0.28;
    phaseName = "Fase Concêntrica (Pico de Força)";
    phaseColor = "text-emerald-400";
    phaseSub = "Aceleração intencional · Esmague o músculo";
  }

  // Interactive joint angle computation
  const primaryAngle = Math.round(160 - motionT * 75); // e.g. 160° down to 85°
  const secondaryAngle = Math.round(55 + motionT * 35); // e.g. 55° up to 90°

  // Search video link for human reference demo
  const searchVideoQuery = encodeURIComponent(
    `execução perfeita ${exercise.name} musculação biomecânica`
  );
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchVideoQuery}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-neutral-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-start justify-between gap-4 bg-neutral-950/80">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {exercise.primaryMuscle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
                {exercise.equipment}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {exercise.difficulty}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-400">
                Cadência Recomendada: 3-0-1-0
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {exercise.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 border border-neutral-700 transition-colors"
              title="Abrir demonstração em vídeo HD no YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
              <span>Vídeo HD Externo</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* 1. EXPLANATORY VIDEO HD & BIOMECHANICAL MOTION PLAYER */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 p-4 sm:p-6 shadow-inner">
            {/* Top Switcher: Vídeo Explicativo HD vs Simulação Biomecânica */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setViewMode("video")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    viewMode === "video"
                      ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Vídeo Explicativo HD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("biomechanics")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    viewMode === "biomechanics"
                      ? "bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Simulação Biomecânica</span>
                </button>
              </div>

              {viewMode === "video" ? (
                <div className="flex items-center gap-2">
                  <a
                    href={videoInfo.directWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 border border-neutral-700 transition-colors"
                    title="Assistir em tela cheia no YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                    <span>Tela Cheia / YouTube</span>
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? "bg-cyan-400" : "bg-neutral-500"}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? "bg-cyan-500" : "bg-neutral-600"}`} />
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-300">
                    Simulação 60 FPS
                  </span>
                </div>
              )}
            </div>

            {/* VIDEO PLAYER VIEW (DEFAULT) */}
            {viewMode === "video" ? (
              <div className="space-y-4 animate-fade-in">
                {/* 16:9 HD Embedded Player */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
                  <iframe
                    src={videoInfo.embedUrl}
                    title={`Vídeo Explicativo: ${exercise.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                {/* Video Info Strip */}
                <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white text-sm">{videoInfo.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-mono">
                      <span>Canal: {videoInfo.channel}</span>
                      <span>·</span>
                      <span className="text-emerald-400">Execução Técnica Certificada</span>
                    </div>
                  </div>

                  <a
                    href={videoInfo.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 underline"
                  >
                    <span>Mais variações deste exercício</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Key Execution Cues */}
                <div className="bg-neutral-950/60 border border-neutral-850 rounded-xl p-3 sm:p-4 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dicas Fundamentais de Execução:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {videoInfo.keyInstructions.map((inst, i) => (
                      <div key={i} className="flex items-start gap-2 bg-neutral-900/70 p-2 rounded-lg border border-neutral-800">
                        <span className="text-emerald-400 font-bold font-mono">0{i + 1}.</span>
                        <span className="text-neutral-300">{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Speed & Overlay Toggles */}
                <div className="flex items-center justify-between gap-1.5 text-xs mb-3">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Controles Anatômicos:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAngles(!showAngles)}
                      className={`px-2 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                        showAngles ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-neutral-800 text-neutral-500"
                      }`}
                      title="Exibir arcos angulares articulares"
                    >
                      Ângulos {showAngles ? "ON" : "OFF"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTrajectory(!showTrajectory)}
                      className={`px-2 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                        showTrajectory ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-neutral-800 text-neutral-500"
                      }`}
                      title="Exibir linha de trajetória da barra/carga"
                    >
                      Bar Path {showTrajectory ? "ON" : "OFF"}
                    </button>

                    <div className="flex items-center rounded-lg bg-neutral-800 p-0.5 border border-neutral-700">
                      <button
                        type="button"
                        onClick={() => setSpeed(0.5)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                          speed === 0.5 ? "bg-emerald-500 text-neutral-950" : "text-neutral-400"
                        }`}
                      >
                        0.5x
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeed(1)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                          speed === 1 ? "bg-emerald-500 text-neutral-950" : "text-neutral-400"
                        }`}
                      >
                        1.0x
                      </button>
                    </div>
                  </div>
                </div>

            {/* Central Motion Canvas / Vector Athlete */}
            <div className="relative h-64 sm:h-72 w-full rounded-xl bg-neutral-950 border border-neutral-800/80 overflow-hidden flex items-center justify-center select-none">
              {/* Dynamic Grid Background */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#06b6d4 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 12px 12px",
                }}
              />

              {/* Vector Biomechanical Simulator SVG */}
              <svg className="w-full h-full max-w-lg" viewBox="0 0 400 240" fill="none">
                <defs>
                  <radialGradient id="muscleGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="barPathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Trajectory Guide (Bar Path) */}
                {showTrajectory && (
                  <g opacity="0.6">
                    <line x1="200" y1="50" x2="200" y2="180" stroke="url(#barPathGrad)" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx="200" cy={65 + motionT * 95} r="4" fill="#06b6d4" />
                  </g>
                )}

                {/* 1. SQUAT PATTERN */}
                {pattern === "squat" && (
                  <g>
                    {/* Floor Line */}
                    <line x1="80" y1="210" x2="320" y2="210" stroke="#334155" strokeWidth="3" />
                    {/* Head */}
                    <circle cx="200" cy={55 + motionT * 55} r="14" fill="#38bdf8" />
                    {/* Torso */}
                    <line x1="200" y1={70 + motionT * 55} x2="195" y2={125 + motionT * 50} stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                    {/* Quadriceps (Thigh) */}
                    <line
                      x1="195"
                      y1={125 + motionT * 50}
                      x2={165 + motionT * 20}
                      y2={165 + motionT * 10}
                      stroke={showGlow && motionT > 0.6 ? "#10b981" : "#06b6d4"}
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    {/* Shin / Calf */}
                    <line x1={165 + motionT * 20} y1={165 + motionT * 10} x2="185" y2="210" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
                    {/* Foot */}
                    <line x1="175" y1="210" x2="205" y2="210" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
                    {/* Barbell Across Traps */}
                    <rect x="130" y={62 + motionT * 55} width="140" height="6" rx="3" fill="#cbd5e1" />
                    <rect x="120" y={52 + motionT * 55} width="10" height="26" rx="2" fill="#ef4444" />
                    <rect x="270" y={52 + motionT * 55} width="10" height="26" rx="2" fill="#ef4444" />
                  </g>
                )}

                {/* 2. PUSH HORIZONTAL (SUPINO / BENCH PRESS) */}
                {(pattern === "push_horizontal" || pattern === "push_incline") && (
                  <g>
                    {/* Bench Frame */}
                    <line x1="110" y1="160" x2="290" y2="160" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                    <line x1="130" y1="160" x2="130" y2="210" stroke="#334155" strokeWidth="4" />
                    <line x1="270" y1="160" x2="270" y2="210" stroke="#334155" strokeWidth="4" />
                    {/* Torso on Bench */}
                    <line x1="135" y1="152" x2="245" y2="152" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                    {/* Chest Muscle Glow */}
                    {showGlow && (
                      <circle cx="205" cy="148" r={16 + (1 - motionT) * 8} fill="url(#muscleGlow)" opacity={0.7} />
                    )}
                    {/* Head */}
                    <circle cx="125" cy="148" r="12" fill="#38bdf8" />
                    {/* Shoulder & Arm */}
                    <line x1="180" y1="150" x2={165 + motionT * 20} y2={130 + motionT * 22} stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" />
                    {/* Forearm pushing bar */}
                    <line x1={165 + motionT * 20} y1={130 + motionT * 22} x2="200" y2={60 + motionT * 85} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
                    {/* Barbell & Plates */}
                    <rect x="130" y={55 + motionT * 85} width="140" height="8" rx="4" fill="#f8fafc" />
                    <rect x="120" y={42 + motionT * 85} width="10" height="34" rx="2" fill="#10b981" />
                    <rect x="270" y={42 + motionT * 85} width="10" height="34" rx="2" fill="#10b981" />
                  </g>
                )}

                {/* 3. PULL VERTICAL / LAT PULLDOWN / CHIN UP */}
                {pattern === "pull_vertical" && (
                  <g>
                    {/* Seat & Pulley Cable */}
                    <line x1="160" y1="190" x2="240" y2="190" stroke="#475569" strokeWidth="6" />
                    <line x1="200" y1="20" x2="200" y2={40 + motionT * 70} stroke="#94a3b8" strokeWidth="3" />
                    {/* Pulley Bar */}
                    <line x1="130" y1={40 + motionT * 70} x2="270" y2={40 + motionT * 70} stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
                    {/* Athlete Head & Torso */}
                    <circle cx="200" cy="120" r="13" fill="#38bdf8" />
                    <line x1="200" y1="133" x2="200" y2="185" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
                    {/* Latissimus Dorsi Back Glow */}
                    {showGlow && (
                      <circle cx="200" cy="150" r={15 + motionT * 10} fill="url(#muscleGlow)" opacity={0.8} />
                    )}
                    {/* Arms Pulling Down */}
                    <line x1="190" y1="138" x2={165 + (1 - motionT) * 15} y2={90 + motionT * 40} stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" />
                    <line x1={165 + (1 - motionT) * 15} y1={90 + motionT * 40} x2="160" y2={40 + motionT * 70} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
                    <line x1="210" y1="138" x2={235 - (1 - motionT) * 15} y2={90 + motionT * 40} stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" />
                    <line x1={235 - (1 - motionT) * 15} y1={90 + motionT * 40} x2="240" y2={40 + motionT * 70} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
                  </g>
                )}

                {/* 4. BICEPS CURL / TRICEPS EXTENSION */}
                {(pattern === "biceps_curl" || pattern === "triceps_extension") && (
                  <g>
                    {/* Floor */}
                    <line x1="100" y1="210" x2="300" y2="210" stroke="#334155" strokeWidth="3" />
                    {/* Head & Torso */}
                    <circle cx="185" cy="65" r="13" fill="#38bdf8" />
                    <line x1="185" y1="78" x2="185" y2="160" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />
                    <line x1="185" y1="160" x2="185" y2="210" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
                    {/* Upper Arm (humérus parado) */}
                    <line x1="185" y1="90" x2="185" y2="135" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
                    {/* Forearm flexing up/down */}
                    <line
                      x1="185"
                      y1="135"
                      x2={pattern === "biceps_curl" ? 215 - (1 - motionT) * 20 : 185}
                      y2={pattern === "biceps_curl" ? 135 - (1 - motionT) * 50 : 135 + motionT * 45}
                      stroke={showGlow ? "#10b981" : "#38bdf8"}
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    {/* Dumbbell / Cable handle */}
                    <circle
                      cx={pattern === "biceps_curl" ? 215 - (1 - motionT) * 20 : 185}
                      cy={pattern === "biceps_curl" ? 135 - (1 - motionT) * 50 : 135 + motionT * 45}
                      r="8"
                      fill="#f59e0b"
                    />
                  </g>
                )}

                {/* 5. CARDIO (STAIRS / TREADMILL / BIKE) */}
                {pattern === "cardio" && (
                  <g>
                    {/* Machine Base */}
                    <rect x="90" y="170" width="220" height="14" rx="4" fill="#334155" />
                    <line x1="110" y1="170" x2="140" y2="90" stroke="#475569" strokeWidth="5" />
                    <line x1="140" y1="90" x2="170" y2="90" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" />
                    {/* Dynamic Running / Climbing Legs */}
                    <circle cx="210" cy="80" r="13" fill="#38bdf8" />
                    <line x1="210" y1="93" x2="200" y2="145" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                    <line x1="200" y1="145" x2={180 + Math.sin(progress * Math.PI * 4) * 25} y2="175" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
                    <line x1="200" y1="145" x2={220 - Math.sin(progress * Math.PI * 4) * 25} y2="175" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" />
                  </g>
                )}

                {/* GENERAL FALLBACK / HINGE / PUSH VERTICAL */}
                {pattern !== "squat" &&
                  pattern !== "push_horizontal" &&
                  pattern !== "push_incline" &&
                  pattern !== "pull_vertical" &&
                  pattern !== "biceps_curl" &&
                  pattern !== "triceps_extension" &&
                  pattern !== "cardio" && (
                    <g>
                      <line x1="90" y1="210" x2="310" y2="210" stroke="#334155" strokeWidth="3" />
                      <circle cx="200" cy={65 + motionT * 40} r="13" fill="#38bdf8" />
                      <line x1="200" y1={78 + motionT * 40} x2="195" y2={145 + motionT * 25} stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                      <line x1="195" y1={145 + motionT * 25} x2="195" y2="210" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
                      <line x1="200" y1={95 + motionT * 40} x2="200" y2={45 + motionT * 85} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
                      <rect x="140" y={40 + motionT * 85} width="120" height="7" rx="3" fill="#cbd5e1" />
                    </g>
                  )}

                {/* Dynamic Articular Angle Overlay */}
                {showAngles && (
                  <g>
                    <rect x="250" y="25" width="130" height="52" rx="8" fill="#090d16" fillOpacity="0.85" stroke="#1e293b" />
                    <text x="260" y="44" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      ÂNGULO PRINCIPAL:
                    </text>
                    <text x="260" y="66" fill="#38bdf8" fontSize="16" fontWeight="bold" fontFamily="monospace">
                      {primaryAngle}° {primaryAngle <= 90 ? "✓ IDEAL" : ""}
                    </text>
                  </g>
                )}
              </svg>

              {/* Bottom Scrubber & Phase Indicator Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-neutral-950/90 border-t border-neutral-800 p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                    title={isPlaying ? "Pausar" : "Reproduzir"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgress(0)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Reiniciar repetição"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className={`text-xs font-bold font-mono ${phaseColor}`}>
                      {phaseName}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {phaseSub}
                    </div>
                  </div>
                </div>

                {/* Progress bar scrubber */}
                <div className="flex-1 max-w-xs min-w-[120px] flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={progress}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setProgress(parseFloat(e.target.value));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

          {/* 2. NAVIGATION SUBTABS */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("passo_a_passo")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "passo_a_passo"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Passo a Passo da Execução
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("biomecanica")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "biomecanica"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Músculos & Ativação EMG
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("erros")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "erros"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Erros Comuns ({exercise.commonMistakes?.length || 2})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cues")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "cues"
                  ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Cues Mentais ({exercise.cues?.length || 3})
            </button>

            {exercise.alternatives && exercise.alternatives.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("substituicoes")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "substituicoes"
                    ? "bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20"
                    : "bg-neutral-900 text-neutral-400 hover:text-white"
                }`}
              >
                Substituições Imediatas
              </button>
            )}
          </div>

          {/* 3. SUBTAB CONTENTS */}
          {activeTab === "passo_a_passo" && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sequência de Execução Biomecânica</span>
              </div>

              <div className="space-y-2.5">
                {(exercise.instructions || [
                  "Posicionamento inicial: estabilize pés, core e curvatura neutra da coluna.",
                  "Fase Excêntrica: desça o peso de forma controlada por 2 a 3 segundos.",
                  "Pico de Contração: estenda ou puxe com aceleração constante sem trancos."
                ]).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex items-start gap-3 text-xs"
                  >
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-neutral-200 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tempo & Breathing Protocol Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-950 to-neutral-900 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    Cadência de Tempo (3-0-1-0)
                  </div>
                  <div className="text-neutral-300 mt-1">
                    3s descendo (fase excêntrica) · 0s pausa · 1s subindo explosivo · 0s no topo sem descanso.
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    Padrão Respiratório
                  </div>
                  <div className="text-neutral-300 mt-1">
                    Inspire profundamente na descida (enchendo a caixa torácica) e expire no esforço máximo concêntrico.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "biomecanica" && (
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Grau de Recrutamento Muscular Estimado</span>
              </div>

              <div className="space-y-3">
                {recruitment.map((item, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.isPrimary ? "bg-emerald-400" : "bg-cyan-400"}`} />
                        <span className="font-bold text-white">{item.muscle}</span>
                        {item.isPrimary && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            MOTOR PRIMÁRIO
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-neutral-300">
                        ~{item.percentage}% Ativação
                      </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.isPrimary ? "bg-emerald-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                <strong className="text-neutral-200">Nota Fisiológica:</strong> A tensão mecânica na fase excêntrica prolongada estimula a hipertrofia por microlesão controlada das miofibrilas e aumento da síntese proteica ribossomal.
              </div>
            </div>
          )}

          {activeTab === "erros" && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Erros Críticos que Destroem Seus Ganhos e Articulações</span>
              </div>

              <div className="space-y-2.5">
                {(exercise.commonMistakes || [
                  "Usar impulso do corpo para movimentar a carga ao invés da força do músculo alvo.",
                  "Encurtar a amplitude de movimento para conseguir colocar mais peso."
                ]).map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3 text-xs"
                  >
                    <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                    <div className="space-y-1">
                      <div className="font-bold text-rose-200">
                        {mistake}
                      </div>
                      <div className="text-neutral-400 text-[11px]">
                        <strong>Como evitar:</strong> Reduza 10% a 15% da carga e foque em 3 segundos de descida mantendo escápulas travadas.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "cues" && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cues Mentais dos Melhores Treinadores</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(exercise.cues || [
                  "Conexão mente-músculo profunda",
                  "Retraia e deprima as escápulas",
                  "Controle total na descida"
                ]).map((cue, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5"
                  >
                    <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      Cue #{idx + 1}
                    </div>
                    <div className="text-xs font-bold text-white">
                      "{cue}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "substituicoes" && exercise.alternatives && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aparelho Ocupado? Variações Equivalentes</span>
              </div>

              <div className="space-y-2">
                {exercise.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-400 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white">{alt}</span>
                    </div>

                    {onSwapExercise && (
                      <button
                        type="button"
                        onClick={() => {
                          onSwapExercise(alt);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                      >
                        Substituir no Treino
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {onOpenCoachWithPrompt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCoachWithPrompt(
                    `Gostaria de calibrar a execução de "${exercise.name}". Quais são as melhores recomendações biomecânicas de pegada, amplitude e ativação muscular para o meu nível?`
                  );
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Perguntar ao Coach IA</span>
              </button>
            )}

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-mono"
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
              <span>Vídeo HD</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black font-mono transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
          >
            Entendido, Continuar Treino
          </button>
        </div>
      </motion.div>
    </div>
  );
};
