import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Exercise } from "../../types";

interface AnatomicalExerciseIllustrationProps {
  exercise: Exercise;
  size?: "thumbnail" | "compact" | "full";
  className?: string;
  autoPlay?: boolean;
}

// Biomechanical pattern classification
export type AnatomicalPattern =
  | "bench_press_flat"
  | "bench_press_incline"
  | "squat"
  | "leg_press"
  | "lat_pulldown"
  | "barbell_row"
  | "shoulder_press"
  | "lateral_raise"
  | "biceps_curl"
  | "triceps_pushdown"
  | "stiff_deadlift"
  | "leg_extension"
  | "leg_curl"
  | "hip_thrust"
  | "crossover"
  | "crunch_core"
  | "cardio_generic";

export function detectAnatomicalPattern(ex: Exercise): AnatomicalPattern {
  const name = (ex.name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const muscle = (ex.primaryMuscle || "").toLowerCase();

  if (
    name.includes("esteira") ||
    name.includes("escada") ||
    name.includes("bicicleta") ||
    muscle.includes("cardio")
  ) {
    return "cardio_generic";
  }
  if (name.includes("inclinad") && (name.includes("supino") || muscle.includes("peit"))) {
    return "bench_press_incline";
  }
  if (name.includes("crossover") || name.includes("cross over") || name.includes("peck deck") || name.includes("voador")) {
    return "crossover";
  }
  if (name.includes("supino") || name.includes("flexao") || (muscle.includes("peit") && name.includes("halter"))) {
    return "bench_press_flat";
  }
  if (name.includes("agachamento") || name.includes("hack") || name.includes("bulgaro") || name.includes("afundo")) {
    return "squat";
  }
  if (name.includes("leg press")) {
    return "leg_press";
  }
  if (name.includes("puxada") || name.includes("barra fixa") || name.includes("pulley")) {
    return "lat_pulldown";
  }
  if (name.includes("remada") || name.includes("serrote") || name.includes("cavalinho") || name.includes("crucifixo invert")) {
    return "barbell_row";
  }
  if (name.includes("desenvolvimento") || (muscle.includes("ombro") && name.includes("militar"))) {
    return "shoulder_press";
  }
  if (name.includes("elevacao lateral") || name.includes("lateral")) {
    return "lateral_raise";
  }
  if (name.includes("rosca") || muscle.includes("bicep")) {
    return "biceps_curl";
  }
  if (name.includes("triceps") || name.includes("paralela") || name.includes("testa")) {
    return "triceps_pushdown";
  }
  if (name.includes("extensora")) {
    return "leg_extension";
  }
  if (name.includes("flexora")) {
    return "leg_curl";
  }
  if (name.includes("pelvica") || name.includes("hip thrust")) {
    return "hip_thrust";
  }
  if (name.includes("stiff") || name.includes("terra") || name.includes("rdl")) {
    return "stiff_deadlift";
  }
  if (muscle.includes("abdomen") || muscle.includes("core") || name.includes("crunch") || name.includes("abdominal")) {
    return "crunch_core";
  }
  return "bench_press_flat";
}

export const AnatomicalExerciseIllustration: React.FC<AnatomicalExerciseIllustrationProps> = ({
  exercise,
  size = "full",
  className = "",
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<0.5 | 1>(1);
  const [progress, setProgress] = useState(0); // 0 to 1
  const pattern = detectAnatomicalPattern(exercise);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Smooth repetition loop (2.6s complete rep: 1.6s eccentric + 1.0s concentric)
  useEffect(() => {
    if (!isPlaying && size !== "thumbnail") return;

    const cycleDurationMs = 2600 / speed;

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
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
  }, [isPlaying, speed, size]);

  // Motion parameter t: 0 (bottom/stretch) -> 1 (top/press peak) -> 0
  // Sine curve creates natural human acceleration and deceleration
  const t = Math.sin(progress * Math.PI); // 0 -> 1 -> 0

  // Movement Phase
  const isConcentric = progress >= 0.5;
  const phaseLabel = isConcentric ? "Fase Concêntrica (Subida)" : "Fase Excêntrica (Descida)";
  const phaseColor = isConcentric ? "text-emerald-500" : "text-amber-500";

  // Thumbnail mode (tiny 44x44 circular/rounded badge in workout list)
  if (size === "thumbnail") {
    return (
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-sm ${className}`}
        title={`${exercise.name} (Demonstração Anatômica)`}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {renderAnatomicalScene(pattern, t, true)}
        </svg>
      </div>
    );
  }

  // Compact mode (for small cards or summary cards)
  if (size === "compact") {
    return (
      <div className={`relative bg-white rounded-2xl border border-neutral-200 p-2 overflow-hidden shadow-sm ${className}`}>
        <div className="w-full aspect-[4/3] flex items-center justify-center">
          <svg viewBox="0 0 320 240" className="w-full h-full max-h-52">
            {renderAnatomicalScene(pattern, t, false)}
          </svg>
        </div>
      </div>
    );
  }

  // Full Hero mode (exact style of the video: clean white card with anatomically shaded athlete)
  return (
    <div className={`relative bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col items-center select-none ${className}`}>
      {/* Visual Canvas Area */}
      <div className="w-full h-64 sm:h-80 relative flex items-center justify-center p-3">
        {/* Subtle bench shadow on white */}
        <div className="absolute bottom-6 w-3/4 h-5 bg-neutral-300/40 rounded-full blur-md pointer-events-none" />

        <svg viewBox="0 0 400 300" className="w-full h-full max-h-72">
          {renderAnatomicalScene(pattern, t, false)}
        </svg>
      </div>

      {/* Discreet Playback Bar inside card */}
      <div className="w-full px-4 py-2 bg-neutral-50/90 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            title={isPlaying ? "Pausar loop" : "Reproduzir"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <span className={`font-mono text-[11px] font-bold ${phaseColor}`}>
            {phaseLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSpeed(speed === 1 ? 0.5 : 1)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
              speed === 0.5
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            {speed === 0.5 ? "0.5x (Lento)" : "1.0x"}
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// ANATOMICAL SCENE RENDERING ENGINE
// Generates accurate, high-contrast monochrome pencil/shaded figure with glowing
// anatomical red muscle highlight (#ef4444) exactly matching the user's video!
// -----------------------------------------------------------------------------
function renderAnatomicalScene(pattern: AnatomicalPattern, t: number, isThumb: boolean) {
  // Gradients for medical anatomy illumination
  const defs = (
    <defs>
      {/* Primary Muscle Glow (Vibrant Red like in Hevy / Strong) */}
      <linearGradient id="muscleRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="40%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>

      {/* Secondary Muscle Glow (Soft Red / Salmon) */}
      <linearGradient id="muscleSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="100%" stopColor="#f87171" />
      </linearGradient>

      {/* Anatomical Shading for Skin / Inactive Muscle (Monochrome Grey/Graphite) */}
      <linearGradient id="skinShade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d1d5db" />
        <stop offset="50%" stopColor="#9ca3af" />
        <stop offset="100%" stopColor="#6b7280" />
      </linearGradient>

      {/* Bench & Steel Chrome */}
      <linearGradient id="steelChrome" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* Dumbbell Plates (Dark Charcoal) */}
      <linearGradient id="plateCharcoal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Muscle highlight filter glow */}
      <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#ef4444" floodOpacity="0.4" />
      </filter>
    </defs>
  );

  switch (pattern) {
    case "bench_press_incline":
      return renderInclineBenchPress(defs, t, isThumb);
    case "squat":
      return renderSquat(defs, t, isThumb);
    case "lat_pulldown":
      return renderLatPulldown(defs, t, isThumb);
    case "barbell_row":
      return renderBarbellRow(defs, t, isThumb);
    case "shoulder_press":
      return renderShoulderPress(defs, t, isThumb);
    case "lateral_raise":
      return renderLateralRaise(defs, t, isThumb);
    case "biceps_curl":
      return renderBicepsCurl(defs, t, isThumb);
    case "triceps_pushdown":
      return renderTricepsPushdown(defs, t, isThumb);
    case "stiff_deadlift":
      return renderStiffDeadlift(defs, t, isThumb);
    case "crossover":
      return renderCrossover(defs, t, isThumb);
    case "bench_press_flat":
    default:
      return renderFlatBenchPress(defs, t, isThumb);
  }
}

// -----------------------------------------------------------------------------
// 1. SUPINO RETO COM HALTERES (FLAT BENCH DUMBBELL PRESS)
// As shown in the user's video at 00:00 - 00:06!
// -----------------------------------------------------------------------------
function renderFlatBenchPress(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = halteres no peito (descida total), 1 = halteres no alto (braços estendidos)
  const armExtendY = t * 46; // how much hands move upward
  const armSpreadX = (1 - t) * 16; // arms flare wider at bottom, converge at top

  return (
    <g>
      {defs}
      {/* Gym Bench Structure */}
      <g id="bench">
        {/* Bench Legs */}
        <path d="M 120 210 L 120 260 M 270 210 L 270 260" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
        <path d="M 100 260 L 140 260 M 250 260 L 290 260" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        {/* Bench Pad */}
        <rect x="90" y="195" width="220" height="24" rx="8" fill="url(#steelChrome)" stroke="#475569" strokeWidth="2" />
        {/* Support Pillar */}
        <rect x="180" y="218" width="18" height="42" fill="#64748b" />
      </g>

      {/* Human Athlete Figure on Bench */}
      <g id="athlete">
        {/* Legs planted on ground */}
        <path d="M 280 205 L 305 235 L 305 270" stroke="#64748b" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 295 270 L 325 270" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

        {/* Torso lying on bench */}
        <path d="M 120 185 Q 190 190 270 200" stroke="#6b7280" strokeWidth="36" strokeLinecap="round" />

        {/* Head on bench pad */}
        <circle cx="110" cy="180" r="18" fill="url(#skinShade)" stroke="#475569" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="122" y="176" width="16" height="12" rx="4" fill="#9ca3af" />

        {/* PECTORAL MUSCLE — VIBRANT RED GLOW (PRIMARY MUSCLE) */}
        <g id="pectorals" filter="url(#redGlow)">
          {/* Main Chest Plate Glowing Red */}
          <path
            d="M 148 165 C 160 155, 195 155, 208 175 C 200 190, 160 190, 148 175 Z"
            fill="url(#muscleRed)"
            stroke="#b91c1c"
            strokeWidth="2"
          />
          {/* Muscle fiber striations */}
          <path d="M 155 168 Q 175 163 195 170" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 158 174 Q 178 170 198 176" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Secondary Muscles: Deltoids & Triceps (Soft Coral Highlight) */}
        <circle cx="146" cy="170" r="14" fill="url(#muscleSecondary)" stroke="#ef4444" strokeWidth="1.5" />

        {/* Left Arm (Behind / Perspective) */}
        <g id="left-arm">
          {/* Upper arm */}
          <line
            x1="146"
            y1="165"
            x2={142 - armSpreadX}
            y2={150 - armExtendY * 0.4}
            stroke="#9ca3af"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Forearm */}
          <line
            x1={142 - armSpreadX}
            y1={150 - armExtendY * 0.4}
            x2={144 - armSpreadX * 0.6}
            y2={130 - armExtendY}
            stroke="#cbd5e1"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Left Dumbbell */}
          <g transform={`translate(${144 - armSpreadX * 0.6}, ${130 - armExtendY})`}>
            {/* Dumbbell bar */}
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#e2e8f0" strokeWidth="5" />
            {/* Plates */}
            <rect x="-24" y="-14" width="8" height="28" rx="2" fill="url(#plateCharcoal)" stroke="#0f172a" strokeWidth="1" />
            <rect x="16" y="-14" width="8" height="28" rx="2" fill="url(#plateCharcoal)" stroke="#0f172a" strokeWidth="1" />
          </g>
        </g>

        {/* Right Arm (Foreground / Camera) */}
        <g id="right-arm">
          {/* Triceps / Upper arm */}
          <line
            x1="180"
            y1="172"
            x2={186 + armSpreadX}
            y2={152 - armExtendY * 0.4}
            stroke="url(#muscleSecondary)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Forearm */}
          <line
            x1={186 + armSpreadX}
            y1={152 - armExtendY * 0.4}
            x2={182 + armSpreadX * 0.6}
            y2={130 - armExtendY}
            stroke="#cbd5e1"
            strokeWidth="13"
            strokeLinecap="round"
          />
          {/* Hand clasp */}
          <circle cx={182 + armSpreadX * 0.6} cy={130 - armExtendY} r="7" fill="#d1d5db" />

          {/* Right Dumbbell */}
          <g transform={`translate(${182 + armSpreadX * 0.6}, ${130 - armExtendY})`}>
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#e2e8f0" strokeWidth="5" />
            <rect x="-26" y="-16" width="10" height="32" rx="3" fill="url(#plateCharcoal)" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="16" y="-16" width="10" height="32" rx="3" fill="url(#plateCharcoal)" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        </g>
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 2. SUPINO INCLINADO COM HALTERES (INCLINE DUMBBELL BENCH PRESS)
// As shown in the user's video at 00:09 - 00:14!
// -----------------------------------------------------------------------------
function renderInclineBenchPress(defs: React.ReactNode, t: number, isThumb: boolean) {
  const armExtend = t * 44; // hand extension along the 45 degree incline line
  const armSpread = (1 - t) * 14;

  return (
    <g>
      {defs}
      {/* 45° Incline Bench Structure */}
      <g id="incline-bench">
        {/* Base Frame */}
        <path d="M 100 260 L 290 260" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
        <path d="M 130 260 L 130 190 M 230 260 L 230 220" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
        {/* Inclined Backrest Pad (45°) */}
        <line x1="120" y1="210" x2="220" y2="110" stroke="url(#steelChrome)" strokeWidth="22" strokeLinecap="round" />
        {/* Seat Pad */}
        <line x1="215" y1="215" x2="260" y2="230" stroke="url(#steelChrome)" strokeWidth="18" strokeLinecap="round" />
      </g>

      {/* Athlete on Incline Bench */}
      <g id="athlete-incline">
        {/* Legs */}
        <path d="M 245 225 L 275 240 L 275 270" stroke="#64748b" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 270 270 L 295 270" stroke="#334155" strokeWidth="9" strokeLinecap="round" />

        {/* Torso reclined at 45° */}
        <line x1="135" y1="195" x2="215" y2="125" stroke="#6b7280" strokeWidth="34" strokeLinecap="round" />

        {/* Head */}
        <circle cx="115" cy="105" r="17" fill="url(#skinShade)" stroke="#475569" strokeWidth="1.5" />

        {/* CLAVICULAR PECTORAL (UPPER CHEST) — VIBRANT RED GLOW */}
        <g id="upper-chest" filter="url(#redGlow)">
          <path
            d="M 140 135 C 150 120, 185 110, 195 130 C 185 145, 150 150, 140 135 Z"
            fill="url(#muscleRed)"
            stroke="#b91c1c"
            strokeWidth="2"
          />
          <path d="M 145 132 Q 165 125 185 133" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Anterior Deltoids (Shoulders) — Coral Highlight */}
        <circle cx="140" cy="140" r="13" fill="url(#muscleSecondary)" stroke="#ef4444" strokeWidth="1.5" />

        {/* Left Arm & Dumbbell */}
        <g id="incline-left-arm">
          <line
            x1="135"
            y1="135"
            x2={125 - armSpread}
            y2={110 - armExtend * 0.4}
            stroke="#9ca3af"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <line
            x1={125 - armSpread}
            y1={110 - armExtend * 0.4}
            x2={130 - armSpread * 0.5 + armExtend * 0.2}
            y2={85 - armExtend}
            stroke="#cbd5e1"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <g transform={`translate(${130 - armSpread * 0.5 + armExtend * 0.2}, ${85 - armExtend}) rotate(-25)`}>
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#e2e8f0" strokeWidth="5" />
            <rect x="-24" y="-13" width="8" height="26" rx="2" fill="url(#plateCharcoal)" />
            <rect x="16" y="-13" width="8" height="26" rx="2" fill="url(#plateCharcoal)" />
          </g>
        </g>

        {/* Right Arm & Dumbbell */}
        <g id="incline-right-arm">
          <line
            x1="170"
            y1="135"
            x2={180 + armSpread}
            y2={115 - armExtend * 0.4}
            stroke="url(#muscleSecondary)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <line
            x1={180 + armSpread}
            y1={115 - armExtend * 0.4}
            x2={175 + armSpread * 0.5 + armExtend * 0.2}
            y2={85 - armExtend}
            stroke="#cbd5e1"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <g transform={`translate(${175 + armSpread * 0.5 + armExtend * 0.2}, ${85 - armExtend}) rotate(-25)`}>
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#e2e8f0" strokeWidth="5" />
            <rect x="-25" y="-15" width="9" height="30" rx="3" fill="url(#plateCharcoal)" />
            <rect x="16" y="-15" width="9" height="30" rx="3" fill="url(#plateCharcoal)" />
          </g>
        </g>
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 3. AGACHAMENTO LIVRE (SQUAT)
// Quadriceps & Gluteus highlighted in vibrant red!
// -----------------------------------------------------------------------------
function renderSquat(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = agachado no fundo, 1 = em pé no topo
  const depth = (1 - t) * 45; // hips sink down
  const kneeBend = (1 - t) * 25;

  return (
    <g>
      {defs}
      {/* Floor */}
      <line x1="80" y1="265" x2="320" y2="265" stroke="#cbd5e1" strokeWidth="4" />

      {/* Squat Athlete */}
      <g id="squat-athlete">
        {/* Calves & Feet */}
        <path d="M 170 265 L 175 220" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />
        <path d="M 230 265 L 225 220" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />

        {/* QUADRICEPS (THIGHS) — VIBRANT RED GLOW (PRIMARY) */}
        <g id="quads" filter="url(#redGlow)">
          {/* Left Thigh */}
          <path
            d={`M 175 220 L ${160 - kneeBend} ${190 + depth * 0.4} L ${185} ${170 + depth} Z`}
            fill="url(#muscleRed)"
            stroke="#b91c1c"
            strokeWidth="2"
          />
          {/* Right Thigh */}
          <path
            d={`M 225 220 L ${240 + kneeBend} ${190 + depth * 0.4} L ${215} ${170 + depth} Z`}
            fill="url(#muscleRed)"
            stroke="#b91c1c"
            strokeWidth="2"
          />
        </g>

        {/* Glutes & Pelvis */}
        <ellipse cx="200" cy={175 + depth} rx="26" ry="18" fill="url(#muscleSecondary)" />

        {/* Torso with athletic lean */}
        <path
          d={`M 185 ${170 + depth} Q 200 ${135 + depth} 200 ${105 + depth}`}
          stroke="#475569"
          strokeWidth="32"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="200" cy={85 + depth} r="16" fill="url(#skinShade)" />

        {/* Barbell Across Upper Back / Traps */}
        <line x1="110" y1={102 + depth} x2="290" y2={102 + depth} stroke="#e2e8f0" strokeWidth="6" />
        {/* Large Olympic Plates */}
        <rect x="110" y={75 + depth} width="12" height="54" rx="4" fill="url(#plateCharcoal)" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="278" y={75 + depth} width="12" height="54" rx="4" fill="url(#plateCharcoal)" stroke="#0f172a" strokeWidth="1.5" />

        {/* Arms holding the barbell */}
        <path
          d={`M 182 ${110 + depth} L 165 ${120 + depth} L 160 ${105 + depth}`}
          stroke="#cbd5e1"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M 218 ${110 + depth} L 235 ${120 + depth} L 240 ${105 + depth}`}
          stroke="#cbd5e1"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 4. PUXADA FRONTAL / BARRA FIXA (LAT PULLDOWN)
// Latissimus dorsi (costas) highlighted in vibrant red!
// -----------------------------------------------------------------------------
function renderLatPulldown(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = barra no queixo (contração máxima dorsal), 1 = braços estendidos no alto
  const pullDown = (1 - t) * 44;

  return (
    <g>
      {defs}
      {/* Lat Machine Cable & Pulley Frame */}
      <line x1="200" y1="20" x2="200" y2="40" stroke="#94a3b8" strokeWidth="8" />
      <circle cx="200" cy="40" r="10" fill="#64748b" />
      <line x1="200" y1="40" x2="200" y2={60 + pullDown} stroke="#475569" strokeWidth="3" />

      {/* Lat Pulldown Wide Curved Bar */}
      <path
        d={`M 110 ${75 + pullDown} Q 200 ${65 + pullDown} 290 ${75 + pullDown}`}
        stroke="#e2e8f0"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Machine Seat & Thigh Pad */}
      <rect x="170" y="210" width="60" height="15" rx="4" fill="url(#steelChrome)" />
      <rect x="175" y="180" width="50" height="10" rx="3" fill="#334155" />

      {/* Seated Athlete */}
      <g id="lat-athlete">
        {/* Legs under pads */}
        <path d="M 185 220 L 185 190 L 175 255" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />
        <path d="M 215 220 L 215 190 L 225 255" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />

        {/* LATISSIMUS DORSI (WINGS/BACK) — VIBRANT RED GLOW (PRIMARY) */}
        <g id="lats" filter="url(#redGlow)">
          <path
            d="M 180 135 C 160 145, 160 175, 185 195 L 215 195 C 240 175, 240 145, 220 135 Z"
            fill="url(#muscleRed)"
            stroke="#b91c1c"
            strokeWidth="2"
          />
          {/* V-Taper back lines */}
          <path d="M 185 145 Q 175 165 190 185" stroke="#fca5a5" strokeWidth="1.5" />
          <path d="M 215 145 Q 225 165 210 185" stroke="#fca5a5" strokeWidth="1.5" />
        </g>

        {/* Head tilted slightly back */}
        <circle cx="200" cy="115" r="16" fill="url(#skinShade)" />

        {/* Arms pulling wide bar down */}
        <path
          d={`M 175 130 L ${140 - (1 - t) * 15} ${110 + pullDown * 0.5} L 125 ${75 + pullDown}`}
          stroke="url(#muscleSecondary)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={`M 225 130 L ${260 + (1 - t) * 15} ${110 + pullDown * 0.5} L 275 ${75 + pullDown}`}
          stroke="url(#muscleSecondary)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 5. REMADA CURVADA COM BARRA (BARBELL ROW)
// -----------------------------------------------------------------------------
function renderBarbellRow(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = barra alongada perto do chão, 1 = barra puxada no abdômen
  const rowPull = t * 38;

  return (
    <g>
      {defs}
      <line x1="90" y1="265" x2="310" y2="265" stroke="#cbd5e1" strokeWidth="4" />

      {/* Bent-Over Athlete */}
      <g id="row-athlete">
        {/* Legs bent at 25° */}
        <path d="M 170 265 L 180 215 L 170 175" stroke="#64748b" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 220 265 L 210 215 L 205 175" stroke="#64748b" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />

        {/* Torso angled at 45 degrees */}
        <path d="M 185 175 L 245 130" stroke="#475569" strokeWidth="32" strokeLinecap="round" />

        {/* DORSAL & RHOMBOIDS — RED GLOW */}
        <g id="row-back" filter="url(#redGlow)">
          <path d="M 195 165 C 220 140, 235 135, 240 145 C 235 155, 205 175, 195 165 Z" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
        </g>

        {/* Head aligned with neutral spine */}
        <circle cx="260" cy="118" r="15" fill="url(#skinShade)" />

        {/* Arms pulling barbell to belly */}
        <path
          d={`M 235 140 L ${215 - rowPull * 0.3} ${170 - rowPull * 0.4} L ${200} ${215 - rowPull}`}
          stroke="url(#muscleSecondary)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Barbell & Plates */}
        <g transform={`translate(0, ${-rowPull})`}>
          <line x1="125" y1="215" x2="275" y2="215" stroke="#e2e8f0" strokeWidth="6" />
          <rect x="125" y="195" width="10" height="40" rx="3" fill="url(#plateCharcoal)" />
          <rect x="265" y="195" width="10" height="40" rx="3" fill="url(#plateCharcoal)" />
        </g>
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 6. DESENVOLVIMENTO DE OMBROS (SHOULDER PRESS)
// Deltoides em vermelho vibrante!
// -----------------------------------------------------------------------------
function renderShoulderPress(defs: React.ReactNode, t: number, isThumb: boolean) {
  const pressUp = t * 44;

  return (
    <g>
      {defs}
      {/* Bench backrest */}
      <rect x="188" y="130" width="24" height="120" rx="6" fill="url(#steelChrome)" />
      <rect x="160" y="235" width="80" height="16" rx="4" fill="#334155" />

      {/* Seated Athlete */}
      <g id="press-athlete">
        <path d="M 180 240 L 165 265 M 220 240 L 235 265" stroke="#64748b" strokeWidth="14" strokeLinecap="round" />

        {/* Torso upright */}
        <rect x="180" y="145" width="40" height="75" rx="8" fill="#475569" />

        {/* DELTOIDS (SHOULDERS) — VIBRANT RED GLOW (PRIMARY) */}
        <g id="delts" filter="url(#redGlow)">
          <ellipse cx="168" cy="150" rx="14" ry="12" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
          <ellipse cx="232" cy="150" rx="14" ry="12" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
        </g>

        {/* Head */}
        <circle cx="200" cy="122" r="16" fill="url(#skinShade)" />

        {/* Left Arm & Dumbbell */}
        <path
          d={`M 165 150 L ${145 - (1 - t) * 12} ${140 - pressUp * 0.4} L 155 ${115 - pressUp}`}
          stroke="url(#muscleSecondary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <g transform={`translate(155, ${115 - pressUp})`}>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#e2e8f0" strokeWidth="4" />
          <rect x="-20" y="-10" width="6" height="20" rx="2" fill="url(#plateCharcoal)" />
          <rect x="14" y="-10" width="6" height="20" rx="2" fill="url(#plateCharcoal)" />
        </g>

        {/* Right Arm & Dumbbell */}
        <path
          d={`M 235 150 L ${255 + (1 - t) * 12} ${140 - pressUp * 0.4} L 245 ${115 - pressUp}`}
          stroke="url(#muscleSecondary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <g transform={`translate(245, ${115 - pressUp})`}>
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#e2e8f0" strokeWidth="4" />
          <rect x="-20" y="-10" width="6" height="20" rx="2" fill="url(#plateCharcoal)" />
          <rect x="14" y="-10" width="6" height="20" rx="2" fill="url(#plateCharcoal)" />
        </g>
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 7. ELEVAÇÃO LATERAL (LATERAL RAISE)
// Deltoide lateral destacado em vermelho
// -----------------------------------------------------------------------------
function renderLateralRaise(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = braços colados ao lado do corpo, 1 = braços abduzidos a 90°
  const raiseY = t * 45;
  const raiseX = t * 50;

  return (
    <g>
      {defs}
      <line x1="120" y1="265" x2="280" y2="265" stroke="#cbd5e1" strokeWidth="4" />

      {/* Standing Athlete */}
      <path d="M 190 210 L 185 265 M 210 210 L 215 265" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />
      <rect x="182" y="145" width="36" height="70" rx="8" fill="#475569" />

      {/* LATERAL DELTOIDS — RED GLOW */}
      <g id="lat-delts" filter="url(#redGlow)">
        <ellipse cx="172" cy="150" rx="12" ry="10" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
        <ellipse cx="228" cy="150" rx="12" ry="10" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
      </g>

      <circle cx="200" cy="120" r="16" fill="url(#skinShade)" />

      {/* Left Arm abducting to 90° */}
      <line x1="172" y1="150" x2={165 - raiseX} y2={195 - raiseY} stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
      <g transform={`translate(${165 - raiseX}, ${195 - raiseY})`}>
        <rect x="-8" y="-7" width="16" height="14" rx="2" fill="url(#plateCharcoal)" />
      </g>

      {/* Right Arm abducting to 90° */}
      <line x1="228" y1="150" x2={235 + raiseX} y2={195 - raiseY} stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
      <g transform={`translate(${235 + raiseX}, ${195 - raiseY})`}>
        <rect x="-8" y="-7" width="16" height="14" rx="2" fill="url(#plateCharcoal)" />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 8. ROSCA DIRETA (BICEPS CURL)
// Bíceps braquial em vermelho vivo com pico de contração
// -----------------------------------------------------------------------------
function renderBicepsCurl(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = braço estendido embaixo, 1 = antebraço flexionado em cima
  const curlAngle = t * Math.PI * 0.75; // 0 to 135 deg
  const handX = 220 + Math.sin(curlAngle) * 32;
  const handY = 205 - Math.cos(curlAngle) * 32;

  return (
    <g>
      {defs}
      <line x1="120" y1="265" x2="280" y2="265" stroke="#cbd5e1" strokeWidth="4" />

      {/* Athlete Side/3Q Profile */}
      <path d="M 185 210 L 180 265 M 205 210 L 205 265" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />
      <rect x="175" y="140" width="34" height="75" rx="8" fill="#475569" />
      <circle cx="190" cy="115" r="16" fill="url(#skinShade)" />

      {/* BICEPS — VIBRANT RED GLOW (PRIMARY) */}
      <g id="biceps" filter="url(#redGlow)">
        {/* Muscle peaks larger at full flexion (t) */}
        <ellipse cx="205" cy="165" rx={10 + t * 4} ry="14" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
      </g>

      {/* Upper Arm pinned to ribcage */}
      <line x1="195" y1="145" x2="205" y2="185" stroke="#9ca3af" strokeWidth="13" strokeLinecap="round" />

      {/* Forearm Curling */}
      <line x1="205" y1="185" x2={handX} y2={handY} stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />

      {/* Dumbbell / Barbell */}
      <g transform={`translate(${handX}, ${handY})`}>
        <rect x="-10" y="-8" width="20" height="16" rx="3" fill="url(#plateCharcoal)" stroke="#0f172a" strokeWidth="1" />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 9. TRÍCEPS CORDA / TESTA (TRICEPS PUSHDOWN)
// Cabeça lateral e longa do tríceps em vermelho
// -----------------------------------------------------------------------------
function renderTricepsPushdown(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = cotovelo a 90° em cima, 1 = extensão total para baixo
  const pushY = t * 40;

  return (
    <g>
      {defs}
      {/* Cable Pulley */}
      <circle cx="215" cy="65" r="8" fill="#64748b" />
      <line x1="215" y1="65" x2="215" y2={145 + pushY} stroke="#475569" strokeWidth="3" />

      {/* Standing Athlete */}
      <path d="M 170 210 L 165 265 M 190 210 L 185 265" stroke="#64748b" strokeWidth="14" strokeLinecap="round" />
      <path d="M 175 140 L 185 210" stroke="#475569" strokeWidth="30" strokeLinecap="round" />
      <circle cx="180" cy="115" r="16" fill="url(#skinShade)" />

      {/* TRICEPS (POSTERIOR ARM) — RED GLOW */}
      <g id="triceps" filter="url(#redGlow)">
        <path d="M 190 145 C 180 155, 185 175, 198 180 L 205 160 Z" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
      </g>

      {/* Forearms extending cable down */}
      <line x1="205" y1="165" x2="215" y2={145 + pushY} stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />

      {/* Cable Rope / Bar Attachment */}
      <g transform={`translate(215, ${145 + pushY})`}>
        <rect x="-12" y="-4" width="24" height="8" rx="2" fill="#334155" />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 10. STIFF / LEVANTAMENTO TERRA (DEADLIFT & POSTERIOR)
// Posterior de coxa (isquiotibiais) e glúteos destacados
// -----------------------------------------------------------------------------
function renderStiffDeadlift(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = dobradiça de quadril profunda, 1 = em pé ereto
  const hinge = (1 - t) * 45;

  return (
    <g>
      {defs}
      <line x1="100" y1="265" x2="300" y2="265" stroke="#cbd5e1" strokeWidth="4" />

      {/* Athlete */}
      <g id="stiff-athlete">
        {/* Soft Knees */}
        <path d="M 180 265 L 185 215 L 175 175" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />
        <path d="M 210 265 L 215 215 L 205 175" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />

        {/* HAMSTRINGS & GLUTES — RED GLOW (PRIMARY) */}
        <g id="hamstrings" filter="url(#redGlow)">
          <path d="M 185 215 L 175 175 L 195 175 Z" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
          <ellipse cx="190" cy="175" rx="16" ry="14" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
        </g>

        {/* Torso hinging forward */}
        <path
          d={`M 190 175 L ${235 + (1 - t) * 20} ${145 + hinge * 0.7}`}
          stroke="#475569"
          strokeWidth="30"
          strokeLinecap="round"
        />

        <circle cx={250 + (1 - t) * 20} cy={135 + hinge * 0.7} r="15" fill="url(#skinShade)" />

        {/* Barbell descending along shins */}
        <g transform={`translate(0, ${hinge})`}>
          <line x1="140" y1="205" x2="280" y2="205" stroke="#e2e8f0" strokeWidth="6" />
          <rect x="140" y="185" width="10" height="40" rx="3" fill="url(#plateCharcoal)" />
          <rect x="270" y="185" width="10" height="40" rx="3" fill="url(#plateCharcoal)" />
        </g>
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 11. CROSSOVER NA POLIA / VOADOR (PECK DECK / CABLE CROSSOVER)
// Frontal view of chest squeeze as shown at 00:08 in the user's video!
// -----------------------------------------------------------------------------
function renderCrossover(defs: React.ReactNode, t: number, isThumb: boolean) {
  // t: 0 = braços abertos (alongamento), 1 = mãos unidas no centro (pico de contração)
  const spreadX = (1 - t) * 45;
  const spreadY = (1 - t) * 20;

  return (
    <g>
      {defs}
      {/* Dual Cable Towers */}
      <line x1="80" y1="40" x2="80" y2="265" stroke="#94a3b8" strokeWidth="6" />
      <line x1="320" y1="40" x2="320" y2="265" stroke="#94a3b8" strokeWidth="6" />
      <circle cx="80" cy="90" r="8" fill="#64748b" />
      <circle cx="320" cy="90" r="8" fill="#64748b" />

      {/* Cable Lines running to hands */}
      <line x1="80" y1="90" x2={165 - spreadX} y2={160 - spreadY} stroke="#64748b" strokeWidth="2.5" />
      <line x1="320" y1="90" x2={235 + spreadX} y2={160 - spreadY} stroke="#64748b" strokeWidth="2.5" />

      {/* Athlete Frontal Posture */}
      <g id="crossover-athlete">
        {/* Split Stance Legs */}
        <path d="M 185 215 L 180 265 M 215 215 L 225 265" stroke="#64748b" strokeWidth="15" strokeLinecap="round" />

        {/* Torso */}
        <rect x="180" y="145" width="40" height="75" rx="8" fill="#475569" />

        {/* PECTORAL MUSCLES (BOTH SIDES) — GLOWING RED (PRIMARY) */}
        <g id="cross-chest" filter="url(#redGlow)">
          <path d="M 180 155 C 190 150, 198 150, 200 170 C 195 185, 185 185, 180 170 Z" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
          <path d="M 220 155 C 210 150, 202 150, 200 170 C 205 185, 215 185, 220 170 Z" fill="url(#muscleRed)" stroke="#b91c1c" strokeWidth="2" />
        </g>

        {/* Head */}
        <circle cx="200" cy="120" r="16" fill="url(#skinShade)" />

        {/* Left Arm hugging tree */}
        <path
          d={`M 180 155 Q ${140 - spreadX * 0.8} ${140 - spreadY} ${165 - spreadX} ${160 - spreadY}`}
          stroke="#cbd5e1"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Arm */}
        <path
          d={`M 220 155 Q ${260 + spreadX * 0.8} ${140 - spreadY} ${235 + spreadX} ${160 - spreadY}`}
          stroke="#cbd5e1"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />

        {/* Stirrup Handles */}
        <circle cx={165 - spreadX} cy={160 - spreadY} r="6" fill="#334155" />
        <circle cx={235 + spreadX} cy={160 - spreadY} r="6" fill="#334155" />
      </g>
    </g>
  );
}
