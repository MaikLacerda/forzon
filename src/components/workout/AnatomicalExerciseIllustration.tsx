import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
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
  const [phase, setPhase] = useState<number>(0); // 0 (bottom stretch) to 1 (top contraction)
  const pattern = detectAnatomicalPattern(exercise);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Hevy style 2-phase cadence loop:
  // Phase 0: Bottom hold (~0.7s) -> smooth press up (~0.6s) -> Phase 1: Top hold (~0.7s) -> smooth descent down (~0.6s)
  useEffect(() => {
    if (!isPlaying && size !== "thumbnail") return;

    const totalCycleMs = 2600 / speed;

    const loop = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) % totalCycleMs;
      const progress = elapsed / totalCycleMs; // 0 to 1

      // Trapezoid curve: plateau at 0, rise to 1, plateau at 1, descend to 0
      let t = 0;
      if (progress < 0.25) {
        t = 0; // Hold bottom stretch
      } else if (progress < 0.5) {
        // Press up (smooth ease in out)
        const sub = (progress - 0.25) / 0.25;
        t = 0.5 - 0.5 * Math.cos(sub * Math.PI);
      } else if (progress < 0.75) {
        t = 1; // Hold top contraction
      } else {
        // Descend down (smooth ease in out)
        const sub = (progress - 0.75) / 0.25;
        t = 0.5 + 0.5 * Math.cos(sub * Math.PI);
      }

      setPhase(t);
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = null;
    };
  }, [isPlaying, speed, size]);

  const isConcentric = phase > 0.5;
  const phaseLabel = isConcentric ? "Fase Concêntrica (Pico de Força)" : "Fase Excêntrica (Alongamento)";
  const phaseColor = isConcentric ? "text-emerald-600" : "text-amber-600";

  // Thumbnail mode (for list items in routine, exactly like Hevy at 00:07)
  if (size === "thumbnail") {
    return (
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-sm ${className}`}
        title={`${exercise.name} (Anatomia Hevy)`}
      >
        <svg viewBox="0 0 400 320" className="w-full h-full object-contain">
          {renderHevyIsometricScene(pattern, phase)}
        </svg>
      </div>
    );
  }

  // Compact mode
  if (size === "compact") {
    return (
      <div className={`relative bg-white rounded-2xl border border-neutral-200 p-3 overflow-hidden shadow-sm ${className}`}>
        <div className="w-full aspect-[4/3] flex items-center justify-center">
          <svg viewBox="0 0 400 320" className="w-full h-full max-h-56 object-contain">
            {renderHevyIsometricScene(pattern, phase)}
          </svg>
        </div>
      </div>
    );
  }

  // Full Hero mode (exact layout and 3/4 isometric perspective of the Hevy app video)
  return (
    <div className={`relative bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col items-center select-none ${className}`}>
      {/* 3/4 Isometric Canvas Area */}
      <div className="w-full h-64 sm:h-80 relative flex items-center justify-center p-3">
        <svg viewBox="0 0 400 320" className="w-full h-full max-h-76 object-contain">
          {renderHevyIsometricScene(pattern, phase)}
        </svg>
      </div>

      {/* Discreet Playback Controls */}
      <div className="w-full px-4 py-2.5 bg-neutral-50/95 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
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
            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
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
// HEVY ISOMETRIC 3D SCENE RENDERING ENGINE
// Accurately renders 3/4 diagonal isometric perspective with medical anatomical
// muscular shading and intense glowing red muscles (#ef4444 / #dc2626)
// -----------------------------------------------------------------------------
function renderHevyIsometricScene(pattern: AnatomicalPattern, t: number) {
  const defs = (
    <defs>
      {/* Primary Medical Muscle Red (Exact Hevy Crimson) */}
      <linearGradient id="hevyMuscleRed" x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="35%" stopColor="#ef4444" />
        <stop offset="85%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>

      {/* Secondary Muscle Salmon/Coral */}
      <linearGradient id="hevyMuscleCoral" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="60%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>

      {/* Anatomical Shaded Grey Skin (Hevy Monochromatic Body) */}
      <linearGradient id="hevySkinLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      <linearGradient id="hevySkinDark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* Gym Bench Grey Leather Pad */}
      <linearGradient id="hevyBenchLeather" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="45%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* Metallic Bench Frame */}
      <linearGradient id="hevyBenchSteel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* Dumbbell Plates (Hex/Round Charcoal) */}
      <linearGradient id="hevyPlate" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Soft Contact Shadow on pure white */}
      <filter id="hevyContactShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.1   0 0 0 0 0.15   0 0 0 0 0.2  0 0 0 0.18 0" />
        <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
      </filter>
    </defs>
  );

  switch (pattern) {
    case "bench_press_incline":
      return renderIsometricInclineBench(defs, t);
    case "squat":
      return renderIsometricSquat(defs, t);
    case "lat_pulldown":
      return renderIsometricLatPulldown(defs, t);
    case "barbell_row":
      return renderIsometricRow(defs, t);
    case "shoulder_press":
      return renderIsometricShoulderPress(defs, t);
    case "lateral_raise":
      return renderIsometricLateralRaise(defs, t);
    case "biceps_curl":
      return renderIsometricBicepsCurl(defs, t);
    case "triceps_pushdown":
      return renderIsometricTriceps(defs, t);
    case "stiff_deadlift":
      return renderIsometricStiff(defs, t);
    case "crossover":
      return renderIsometricCrossover(defs, t);
    case "bench_press_flat":
    default:
      return renderIsometricFlatBench(defs, t);
  }
}

// -----------------------------------------------------------------------------
// 1. SUPINO RETO COM HALTERES (FLAT BENCH DUMBBELL PRESS)
// EXACT 3/4 ISOMETRIC PERSPECTIVE OF HEVY (Frames 00:00 - 00:06)
// Diagonal isometric bench from top-left (head) to bottom-right (feet)
// -----------------------------------------------------------------------------
function renderIsometricFlatBench(defs: React.ReactNode, t: number) {
  // t: 0 = halteres descidos junto ao peito (alongamento)
  // t: 1 = halteres empurrados no alto (pico de contração)
  // In 3/4 isometric perspective, pressing upward moves along (-Y, -X * 0.25)
  const pressDistY = t * 52;
  const pressDistX = t * 6;
  const elbowFlare = (1 - t) * 14;

  return (
    <g>
      {defs}
      {/* Soft Contact Shadow on Floor */}
      <ellipse cx="205" cy="265" rx="135" ry="24" fill="#e2e8f0" filter="url(#hevyContactShadow)" />

      {/* 3D Isometric Gym Bench (Angled ~30° from top-left to bottom-right) */}
      <g id="bench-isometric">
        {/* Steel Legs */}
        {/* Rear Head Leg */}
        <path d="M 125 155 L 125 210 L 138 210 L 138 155 Z" fill="url(#hevyBenchSteel)" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="131" cy="210" rx="14" ry="4" fill="#334155" />

        {/* Front Foot Leg */}
        <path d="M 275 215 L 275 255 L 288 255 L 288 215 Z" fill="url(#hevyBenchSteel)" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="281" cy="255" rx="16" ry="5" fill="#334155" />

        {/* Central Steel Frame Beam */}
        <path d="M 132 170 L 280 230 L 280 238 L 132 178 Z" fill="#64748b" stroke="#334155" strokeWidth="1" />

        {/* 3D Isometric Leather Pad Top & Thickness */}
        {/* Pad Thickness Side */}
        <path
          d="M 105 130 L 265 198 L 265 210 L 105 142 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        {/* Pad Front Edge */}
        <path
          d="M 265 198 L 295 212 L 295 224 L 265 210 Z"
          fill="#0f172a"
        />
        {/* Pad Top Surface */}
        <path
          d="M 105 130 L 135 116 L 295 184 L 265 198 Z"
          fill="url(#hevyBenchLeather)"
          stroke="#334155"
          strokeWidth="1.5"
        />
      </g>

      {/* Athlete Body Lying on Bench (3/4 Isometric Perspective) */}
      <g id="athlete-isometric">
        {/* Legs Planted on Floor on the right side */}
        {/* Far Left Leg */}
        <path
          d="M 260 195 Q 285 190 295 215 L 290 255"
          stroke="url(#hevySkinDark)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Far Foot */}
        <path d="M 285 255 L 305 255" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />

        {/* Near Right Leg (Foreground) */}
        <path
          d="M 245 200 Q 255 220 250 245 L 245 272"
          stroke="url(#hevySkinLight)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Near Foot Shoe */}
        <path d="M 240 272 L 265 272" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />

        {/* Athletic Shorts */}
        <path
          d="M 220 178 L 260 195 L 245 215 L 208 198 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="1.5"
        />

        {/* Torso & Ribcage along 3D diagonal */}
        <path
          d="M 135 130 L 225 180 L 205 200 L 125 145 Z"
          fill="url(#hevySkinDark)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Head on the Pad at upper left */}
        <g id="hevy-head">
          <ellipse cx="122" cy="120" rx="17" ry="14" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />
          {/* Defined jawline & ear */}
          <path d="M 125 125 Q 132 128 135 122" stroke="#475569" strokeWidth="1.5" fill="none" />
          <circle cx="118" cy="122" r="3.5" fill="#94a3b8" />
        </g>

        {/* PECTORAL MUSCLES — SOLID GLOWING RED (THE ICONIC HEVY CHEST) */}
        <g id="hevy-chest">
          {/* Far Pectoral (Left Chest) */}
          <path
            d="M 142 125 C 152 118, 172 125, 175 140 C 168 148, 148 145, 142 135 Z"
            fill="url(#hevyMuscleRed)"
            stroke="#991b1b"
            strokeWidth="2"
          />
          {/* Near Pectoral (Right Chest — Larger in perspective) */}
          <path
            d="M 160 138 C 172 130, 202 142, 206 160 C 196 172, 168 168, 158 152 Z"
            fill="url(#hevyMuscleRed)"
            stroke="#991b1b"
            strokeWidth="2.5"
          />
          {/* Muscle fiber striations (Anatomical Lines) */}
          <path d="M 168 142 Q 186 142 198 152" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 165 148 Q 182 148 194 158" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 146 130 Q 158 130 168 136" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Deltoids & Shoulders in soft coral highlight */}
        {/* Left Far Shoulder */}
        <ellipse cx="138" cy="122" rx="13" ry="11" fill="url(#hevyMuscleCoral)" stroke="#dc2626" strokeWidth="1.5" />
        {/* Right Near Shoulder */}
        <ellipse cx="156" cy="158" rx="15" ry="13" fill="url(#hevyMuscleCoral)" stroke="#dc2626" strokeWidth="1.5" />

        {/* --- FAR ARM (LEFT DUMBBELL) --- */}
        <g id="far-arm">
          {/* Far Upper Arm (Elbow flares out at bottom, straightens at top) */}
          <line
            x1="138"
            y1="122"
            x2={130 - elbowFlare}
            y2={110 - pressDistY * 0.45}
            stroke="url(#hevySkinDark)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Far Forearm */}
          <line
            x1={130 - elbowFlare}
            y1={110 - pressDistY * 0.45}
            x2={142 - pressDistX * 0.5}
            y2={90 - pressDistY}
            stroke="url(#hevySkinLight)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          {/* Far Hand clasp */}
          <circle cx={142 - pressDistX * 0.5} cy={90 - pressDistY} r="7" fill="#cbd5e1" />

          {/* Far 3D Isometric Dumbbell */}
          <g transform={`translate(${142 - pressDistX * 0.5}, ${90 - pressDistY})`}>
            {/* Chrome Bar Handle */}
            <line x1="-16" y1="-7" x2="16" y2="7" stroke="#e2e8f0" strokeWidth="5" />
            {/* Far Plate */}
            <ellipse cx="-16" cy="-7" rx="8" ry="18" fill="url(#hevyPlate)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="-16" cy="-7" r="3" fill="#94a3b8" />
            {/* Near Plate */}
            <ellipse cx="16" cy="7" rx="8" ry="18" fill="url(#hevyPlate)" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="16" cy="7" r="3" fill="#94a3b8" />
          </g>
        </g>

        {/* --- NEAR ARM (RIGHT DUMBBELL — FOREGROUND) --- */}
        <g id="near-arm">
          {/* Near Triceps / Upper Arm */}
          <line
            x1="156"
            y1="158"
            x2={172 + elbowFlare}
            y2={140 - pressDistY * 0.45}
            stroke="url(#hevyMuscleCoral)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Near Forearm */}
          <line
            x1={172 + elbowFlare}
            y1={140 - pressDistY * 0.45}
            x2={188 - pressDistX}
            y2={112 - pressDistY}
            stroke="url(#hevySkinLight)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          {/* Hand clasp */}
          <circle cx={188 - pressDistX} cy={112 - pressDistY} r="8.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />

          {/* Near 3D Isometric Dumbbell (Larger in foreground) */}
          <g transform={`translate(${188 - pressDistX}, ${112 - pressDistY})`}>
            {/* Chrome Bar */}
            <line x1="-18" y1="-8" x2="18" y2="8" stroke="#f8fafc" strokeWidth="6" />
            {/* Back Plate */}
            <ellipse cx="-18" cy="-8" rx="10" ry="22" fill="url(#hevyPlate)" stroke="#0f172a" strokeWidth="2" />
            <circle cx="-18" cy="-8" r="4" fill="#94a3b8" />
            {/* Front Plate */}
            <ellipse cx="18" cy="8" rx="10" ry="22" fill="url(#hevyPlate)" stroke="#0f172a" strokeWidth="2" />
            <circle cx="18" cy="8" r="4" fill="#94a3b8" />
          </g>
        </g>
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 2. SUPINO INCLINADO COM HALTERES (INCLINE DUMBBELL BENCH PRESS)
// EXACT 3/4 ISOMETRIC INCLINE OF HEVY (Frames 00:09 - 00:14)
// -----------------------------------------------------------------------------
function renderIsometricInclineBench(defs: React.ReactNode, t: number) {
  const pressDistY = t * 48;
  const pressDistX = t * 14;
  const elbowFlare = (1 - t) * 12;

  return (
    <g>
      {defs}
      <ellipse cx="205" cy="270" rx="130" ry="22" fill="#e2e8f0" filter="url(#hevyContactShadow)" />

      {/* 45° Incline Bench in 3/4 Isometric Perspective */}
      <g id="incline-bench-3d">
        <path d="M 120 260 L 290 260" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
        <path d="M 135 260 L 135 185 M 245 260 L 245 210" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
        {/* Inclined Backrest Pad */}
        <path
          d="M 120 190 L 195 95 L 222 108 L 147 203 Z"
          fill="url(#hevyBenchLeather)"
          stroke="#334155"
          strokeWidth="2"
        />
        {/* Seat Pad */}
        <path
          d="M 147 203 L 210 225 L 235 212 L 172 190 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      </g>

      {/* Athlete on 45° Incline */}
      <g id="athlete-incline-3d">
        {/* Legs */}
        <path d="M 210 215 L 240 235 L 235 272" stroke="url(#hevySkinLight)" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M 230 272 L 255 272" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" />

        {/* Torso reclined at 45° angle */}
        <path
          d="M 145 190 L 195 125 L 225 140 L 175 205 Z"
          fill="url(#hevySkinDark)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Head */}
        <ellipse cx="185" cy="98" rx="16" ry="14" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

        {/* CLAVICULAR PECTORAL (UPPER CHEST) — INTENSE RED GLOW */}
        <g id="incline-upper-chest">
          <path
            d="M 172 125 C 182 118, 212 128, 215 145 C 205 156, 178 152, 168 138 Z"
            fill="url(#hevyMuscleRed)"
            stroke="#991b1b"
            strokeWidth="2.5"
          />
          <path d="M 178 130 Q 196 132 208 142" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 175 136 Q 192 138 204 148" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Anterior Deltoids in Coral */}
        <ellipse cx="162" cy="132" rx="14" ry="12" fill="url(#hevyMuscleCoral)" stroke="#dc2626" strokeWidth="1.5" />
        <ellipse cx="218" cy="148" rx="14" ry="12" fill="url(#hevyMuscleCoral)" stroke="#dc2626" strokeWidth="1.5" />

        {/* Far Arm (Left) */}
        <g id="incline-far-arm">
          <line
            x1="162"
            y1="132"
            x2={148 - elbowFlare}
            y2={115 - pressDistY * 0.4}
            stroke="url(#hevySkinDark)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <line
            x1={148 - elbowFlare}
            y1={115 - pressDistY * 0.4}
            x2={165 - pressDistX * 0.5}
            y2={85 - pressDistY}
            stroke="url(#hevySkinLight)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <g transform={`translate(${165 - pressDistX * 0.5}, ${85 - pressDistY}) rotate(-18)`}>
            <line x1="-15" y1="-6" x2="15" y2="6" stroke="#e2e8f0" strokeWidth="5" />
            <ellipse cx="-15" cy="-6" rx="8" ry="18" fill="url(#hevyPlate)" />
            <ellipse cx="15" cy="6" rx="8" ry="18" fill="url(#hevyPlate)" />
          </g>
        </g>

        {/* Near Arm (Right — Foreground) */}
        <g id="incline-near-arm">
          <line
            x1="218"
            y1="148"
            x2={235 + elbowFlare}
            y2={130 - pressDistY * 0.4}
            stroke="url(#hevyMuscleCoral)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <line
            x1={235 + elbowFlare}
            y1={130 - pressDistY * 0.4}
            x2={220 + pressDistX}
            y2={95 - pressDistY}
            stroke="url(#hevySkinLight)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <g transform={`translate(${220 + pressDistX}, ${95 - pressDistY}) rotate(-18)`}>
            <line x1="-17" y1="-7" x2="17" y2="7" stroke="#f8fafc" strokeWidth="6" />
            <ellipse cx="-17" cy="-7" rx="9" ry="20" fill="url(#hevyPlate)" />
            <ellipse cx="17" cy="7" rx="9" ry="20" fill="url(#hevyPlate)" />
          </g>
        </g>
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 3. CROSSOVER NA POLIA / VOADOR (CABLE CROSSOVER)
// As seen at 00:08 in the list
// -----------------------------------------------------------------------------
function renderIsometricCrossover(defs: React.ReactNode, t: number) {
  const hugX = t * 38;
  const hugY = t * 18;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="110" ry="18" fill="#e2e8f0" />

      {/* Cable Towers */}
      <line x1="70" y1="50" x2="70" y2="265" stroke="#94a3b8" strokeWidth="6" />
      <line x1="330" y1="50" x2="330" y2="265" stroke="#94a3b8" strokeWidth="6" />

      {/* Athlete in 3/4 Frontal Stance */}
      <g id="crossover-body">
        {/* Legs split */}
        <path d="M 185 205 L 175 265 M 215 205 L 230 265" stroke="url(#hevySkinLight)" strokeWidth="16" strokeLinecap="round" />

        {/* Torso */}
        <path d="M 175 140 L 225 140 L 215 210 L 185 210 Z" fill="url(#hevySkinDark)" stroke="#475569" strokeWidth="1.5" />

        {/* Chest in Glowing Red */}
        <g id="crossover-chest">
          <path d="M 175 145 C 190 140, 198 140, 200 165 C 190 180, 180 180, 175 165 Z" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2" />
          <path d="M 225 145 C 210 140, 202 140, 200 165 C 210 180, 220 180, 225 165 Z" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2" />
        </g>

        <circle cx="200" cy="115" r="16" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

        {/* Cables running from high pulleys */}
        <line x1="70" y1="90" x2={145 + hugX} y2={180 + hugY} stroke="#64748b" strokeWidth="2.5" />
        <line x1="330" y1="90" x2={255 - hugX} y2={180 + hugY} stroke="#64748b" strokeWidth="2.5" />

        {/* Arms hugging inward */}
        <path
          d={`M 175 145 Q ${130 + hugX * 0.5} ${150 + hugY * 0.5} ${145 + hugX} ${180 + hugY}`}
          stroke="url(#hevySkinLight)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M 225 145 Q ${270 - hugX * 0.5} ${150 + hugY * 0.5} ${255 - hugX} ${180 + hugY}`}
          stroke="url(#hevySkinLight)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />

        {/* Stirrup Handles */}
        <circle cx={145 + hugX} cy={180 + hugY} r="6" fill="#1e293b" />
        <circle cx={255 - hugX} cy={180 + hugY} r="6" fill="#1e293b" />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 4. AGACHAMENTO LIVRE (SQUAT)
// 3/4 Isometric Side/Front View with Quadriceps Glowing Red
// -----------------------------------------------------------------------------
function renderIsometricSquat(defs: React.ReactNode, t: number) {
  // t: 0 = squat depth, 1 = standing lockout
  const depth = (1 - t) * 44;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="100" ry="18" fill="#e2e8f0" />

      {/* 3/4 Isometric Squat Athlete */}
      <g id="squat-3d">
        {/* Calves */}
        <path d="M 175 265 L 180 220 M 225 265 L 220 220" stroke="url(#hevySkinDark)" strokeWidth="16" strokeLinecap="round" />

        {/* QUADRICEPS (THIGHS) — VIBRANT HEVY RED */}
        <g id="squat-quads">
          <path
            d={`M 180 220 L ${165 - (1 - t) * 20} ${195 + depth * 0.5} L 185 ${170 + depth} Z`}
            fill="url(#hevyMuscleRed)"
            stroke="#991b1b"
            strokeWidth="2.5"
          />
          <path
            d={`M 220 220 L ${235 + (1 - t) * 20} ${195 + depth * 0.5} L 215 ${170 + depth} Z`}
            fill="url(#hevyMuscleRed)"
            stroke="#991b1b"
            strokeWidth="2.5"
          />
        </g>

        {/* Glutes & Pelvis */}
        <ellipse cx="200" cy={175 + depth} rx="28" ry="18" fill="url(#hevyMuscleCoral)" stroke="#dc2626" strokeWidth="1.5" />

        {/* Torso */}
        <path
          d={`M 185 ${170 + depth} L 215 ${170 + depth} L 210 ${105 + depth} L 190 ${105 + depth} Z`}
          fill="url(#hevySkinDark)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        <circle cx="200" cy={85 + depth} r="16" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

        {/* Barbell Across Traps (3D angled) */}
        <line x1="105" y1={98 + depth} x2="295" y2={108 + depth} stroke="#f8fafc" strokeWidth="7" />
        <rect x="105" y={75 + depth} width="14" height="52" rx="4" fill="url(#hevyPlate)" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="281" y={85 + depth} width="14" height="52" rx="4" fill="url(#hevyPlate)" stroke="#0f172a" strokeWidth="1.5" />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 5. PUXADA FRONTAL (LAT PULLDOWN)
// Dorsal Lats highlighted in intense red
// -----------------------------------------------------------------------------
function renderIsometricLatPulldown(defs: React.ReactNode, t: number) {
  const pullY = (1 - t) * 45;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="90" ry="16" fill="#e2e8f0" />

      {/* Lat Bar */}
      <path
        d={`M 115 ${70 + pullY} Q 200 ${60 + pullY} 285 ${70 + pullY}`}
        stroke="#f8fafc"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Athlete back */}
      <rect x="170" y="215" width="60" height="15" rx="4" fill="url(#hevyBenchLeather)" />

      {/* DORSAL LATS (V-TAPER) — VIBRANT RED */}
      <g id="hevy-lats">
        <path
          d="M 180 135 C 160 148, 162 175, 185 195 L 215 195 C 238 175, 240 148, 220 135 Z"
          fill="url(#hevyMuscleRed)"
          stroke="#991b1b"
          strokeWidth="2.5"
        />
        <path d="M 185 145 Q 175 165 190 185" stroke="#fecaca" strokeWidth="1.5" fill="none" />
        <path d="M 215 145 Q 225 165 210 185" stroke="#fecaca" strokeWidth="1.5" fill="none" />
      </g>

      <circle cx="200" cy="115" r="16" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

      {/* Arms pulling wide bar down */}
      <path
        d={`M 175 130 L 140 ${105 + pullY * 0.5} L 130 ${70 + pullY}`}
        stroke="url(#hevyMuscleCoral)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M 225 130 L 260 ${105 + pullY * 0.5} L 270 ${70 + pullY}`}
        stroke="url(#hevyMuscleCoral)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

// -----------------------------------------------------------------------------
// 6. REMADA CURVADA (BARBELL ROW)
// -----------------------------------------------------------------------------
function renderIsometricRow(defs: React.ReactNode, t: number) {
  const rowPull = t * 36;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="95" ry="16" fill="#e2e8f0" />

      {/* Bent Athlete in 3/4 Isometric Angle */}
      <path d="M 170 265 L 180 215 L 170 175" stroke="url(#hevySkinDark)" strokeWidth="16" strokeLinecap="round" />
      <path d="M 220 265 L 210 215 L 205 175" stroke="url(#hevySkinLight)" strokeWidth="16" strokeLinecap="round" />

      {/* Torso angled at 45° */}
      <path d="M 185 175 L 245 130" stroke="#475569" strokeWidth="32" strokeLinecap="round" />

      {/* Lats in Red */}
      <path d="M 195 165 C 220 140, 235 135, 240 145 C 235 155, 205 175, 195 165 Z" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2.5" />

      <circle cx="260" cy="118" r="15" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

      {/* Barbell moving up to waist */}
      <g transform={`translate(0, ${-rowPull})`}>
        <line x1="130" y1="215" x2="275" y2="215" stroke="#f8fafc" strokeWidth="6" />
        <rect x="130" y="195" width="10" height="40" rx="3" fill="url(#hevyPlate)" />
        <rect x="265" y="195" width="10" height="40" rx="3" fill="url(#hevyPlate)" />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 7. DESENVOLVIMENTO DE OMBROS (SHOULDER PRESS)
// -----------------------------------------------------------------------------
function renderIsometricShoulderPress(defs: React.ReactNode, t: number) {
  const pressUp = t * 44;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="85" ry="15" fill="#e2e8f0" />
      <rect x="188" y="140" width="24" height="110" rx="6" fill="url(#hevyBenchLeather)" />

      {/* Torso */}
      <rect x="180" y="150" width="40" height="70" rx="8" fill="url(#hevySkinDark)" />

      {/* DELTOIDS — INTENSE RED */}
      <ellipse cx="168" cy="155" rx="14" ry="12" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2" />
      <ellipse cx="232" cy="155" rx="14" ry="12" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2" />

      <circle cx="200" cy="125" r="16" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

      {/* Dumbbells pressing up overhead */}
      <g transform={`translate(155, ${120 - pressUp})`}>
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#f8fafc" strokeWidth="5" />
        <ellipse cx="-14" cy="0" rx="6" ry="16" fill="url(#hevyPlate)" />
        <ellipse cx="14" cy="0" rx="6" ry="16" fill="url(#hevyPlate)" />
      </g>
      <g transform={`translate(245, ${120 - pressUp})`}>
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#f8fafc" strokeWidth="5" />
        <ellipse cx="-14" cy="0" rx="6" ry="16" fill="url(#hevyPlate)" />
        <ellipse cx="14" cy="0" rx="6" ry="16" fill="url(#hevyPlate)" />
      </g>
    </g>
  );
}

// -----------------------------------------------------------------------------
// 8. ELEVAÇÃO LATERAL (LATERAL RAISE)
// -----------------------------------------------------------------------------
function renderIsometricLateralRaise(defs: React.ReactNode, t: number) {
  const raiseY = t * 45;
  const raiseX = t * 50;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="80" ry="15" fill="#e2e8f0" />

      <rect x="182" y="145" width="36" height="70" rx="8" fill="url(#hevySkinDark)" />

      {/* Lateral Deltoids in Red */}
      <ellipse cx="172" cy="150" rx="13" ry="11" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2" />
      <ellipse cx="228" cy="150" rx="13" ry="11" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2" />

      <circle cx="200" cy="120" r="16" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

      {/* Arms abducting */}
      <line x1="172" y1="150" x2={165 - raiseX} y2={195 - raiseY} stroke="url(#hevySkinLight)" strokeWidth="12" strokeLinecap="round" />
      <ellipse cx={165 - raiseX} cy={195 - raiseY} rx="8" ry="12" fill="url(#hevyPlate)" />

      <line x1="228" y1="150" x2={235 + raiseX} y2={195 - raiseY} stroke="url(#hevySkinLight)" strokeWidth="12" strokeLinecap="round" />
      <ellipse cx={235 + raiseX} cy={195 - raiseY} rx="8" ry="12" fill="url(#hevyPlate)" />
    </g>
  );
}

// -----------------------------------------------------------------------------
// 9. ROSCA DIRETA (BICEPS CURL)
// -----------------------------------------------------------------------------
function renderIsometricBicepsCurl(defs: React.ReactNode, t: number) {
  const curlAngle = t * Math.PI * 0.75;
  const handX = 220 + Math.sin(curlAngle) * 32;
  const handY = 205 - Math.cos(curlAngle) * 32;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="80" ry="15" fill="#e2e8f0" />

      <rect x="175" y="140" width="34" height="75" rx="8" fill="url(#hevySkinDark)" />
      <circle cx="190" cy="115" r="16" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

      {/* BICEPS — RED GLOW WITH PEAK CONTRACTION */}
      <ellipse cx="205" cy="165" rx={11 + t * 4} ry="14" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2.5" />

      <line x1="195" y1="145" x2="205" y2="185" stroke="url(#hevySkinDark)" strokeWidth="14" strokeLinecap="round" />
      <line x1="205" y1="185" x2={handX} y2={handY} stroke="url(#hevySkinLight)" strokeWidth="12" strokeLinecap="round" />

      <ellipse cx={handX} cy={handY} rx="10" ry="14" fill="url(#hevyPlate)" />
    </g>
  );
}

// -----------------------------------------------------------------------------
// 10. TRÍCEPS CORDA / TESTA (TRICEPS)
// -----------------------------------------------------------------------------
function renderIsometricTriceps(defs: React.ReactNode, t: number) {
  const pushY = t * 40;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="80" ry="15" fill="#e2e8f0" />

      <path d="M 175 140 L 185 210" stroke="url(#hevySkinDark)" strokeWidth="30" strokeLinecap="round" />
      <circle cx="180" cy="115" r="16" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

      {/* Triceps in Red */}
      <path d="M 190 145 C 180 155, 185 175, 198 180 L 205 160 Z" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2.5" />

      <line x1="205" y1="165" x2="215" y2={145 + pushY} stroke="url(#hevySkinLight)" strokeWidth="12" strokeLinecap="round" />
      <rect x="205" y={142 + pushY} width="20" height="8" rx="2" fill="#1e293b" />
    </g>
  );
}

// -----------------------------------------------------------------------------
// 11. STIFF / TERRA (DEADLIFT)
// -----------------------------------------------------------------------------
function renderIsometricStiff(defs: React.ReactNode, t: number) {
  const hinge = (1 - t) * 44;

  return (
    <g>
      {defs}
      <ellipse cx="200" cy="270" rx="90" ry="16" fill="#e2e8f0" />

      {/* Hamstrings & Glutes in Red */}
      <ellipse cx="190" cy="175" rx="16" ry="14" fill="url(#hevyMuscleRed)" stroke="#991b1b" strokeWidth="2" />

      <path
        d={`M 190 175 L ${235 + (1 - t) * 20} ${145 + hinge * 0.7}`}
        stroke="url(#hevySkinDark)"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <circle cx={250 + (1 - t) * 20} cy={135 + hinge * 0.7} r="15" fill="url(#hevySkinLight)" stroke="#64748b" strokeWidth="1.5" />

      {/* Barbell along shins */}
      <g transform={`translate(0, ${hinge})`}>
        <line x1="140" y1="205" x2="280" y2="205" stroke="#f8fafc" strokeWidth="6" />
        <rect x="140" y="185" width="10" height="40" rx="3" fill="url(#hevyPlate)" />
        <rect x="270" y="185" width="10" height="40" rx="3" fill="url(#hevyPlate)" />
      </g>
    </g>
  );
}
