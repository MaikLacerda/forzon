import React, { useState } from "react";
import { Exercise } from "../../types";
import { getHevyIllustration } from "../../data/hevyAssetMap";
import { KineticVectorDiagram } from "./KineticVectorDiagram";

interface AnatomicalExerciseIllustrationProps {
  exercise: Exercise;
  size?: "thumbnail" | "compact" | "full";
  className?: string;
  autoPlay?: boolean;
}

export const AnatomicalExerciseIllustration: React.FC<AnatomicalExerciseIllustrationProps> = ({
  exercise,
  size = "full",
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  // If full size is requested, use the pristine, biomechanically accurate KineticVectorDiagram!
  if (size === "full") {
    return <KineticVectorDiagram exercise={exercise} className={className} />;
  }

  // Retrieve the static Hevy technical demonstration image
  const imageSrc = getHevyIllustration(exercise.id, exercise.primaryMuscle);

  // Accurate fallback image based on muscle group (never force bench press onto squats or rows)
  const getSafeFallback = (muscle?: string) => {
    const m = (muscle || "").toLowerCase();
    if (m.includes("cost") || m.includes("dors")) return "/assets/hevy/bent_over_row__barbell_.jpg";
    if (m.includes("bicep") || m.includes("bícep")) return "/assets/hevy/bicep_curl__barbell_.jpg";
    if (m.includes("tricep") || m.includes("trícep")) return "/assets/hevy/triceps_rope_pushdown.jpg";
    if (m.includes("quad") || m.includes("pern")) return "/assets/hevy/squat__barbell_.jpg";
    if (m.includes("post") || m.includes("isquio")) return "/assets/hevy/romanian_deadlift__barbell_.jpg";
    if (m.includes("ombr") || m.includes("delt")) return "/assets/hevy/overhead_press__dumbbell_.jpg";
    if (m.includes("abd") || m.includes("core")) return "/assets/hevy/plank.jpg";
    if (m.includes("cardio")) return "/assets/hevy/running.jpg";
    return "/assets/hevy/bench_press__barbell_.jpg";
  };

  // =========================================================================
  // 1. THUMBNAIL VARIANT (For workout exercise lists, selection modals)
  // =========================================================================
  if (size === "thumbnail") {
    return (
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center overflow-hidden border border-neutral-700/60 shadow-sm relative group ${className}`}
        title={`${exercise.name} - Demonstração técnica`}
      >
        <img
          src={hasError ? getSafeFallback(exercise.primaryMuscle) : imageSrc}
          alt={exercise.name}
          className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. COMPACT VARIANT (For widgets and side panels)
  // =========================================================================
  return (
    <div
      className={`w-full h-44 bg-neutral-900 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-neutral-800 shadow-md ${className}`}
    >
      <img
        src={hasError ? getSafeFallback(exercise.primaryMuscle) : imageSrc}
        alt={exercise.name}
        className="w-full h-full object-contain filter drop-shadow-sm"
        loading="lazy"
        onError={() => setHasError(true)}
      />
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
        {exercise.primaryMuscle}
      </div>
    </div>
  );
};
