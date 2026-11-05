import React, { useState } from "react";
import { Exercise } from "../../types";
import { getHevyIllustration } from "../../data/hevyAssetMap";

interface AnatomicalExerciseIllustrationProps {
  exercise: Exercise;
  size?: "thumbnail" | "compact" | "full";
  className?: string;
  autoPlay?: boolean; // kept for backwards compatibility with props
}

export const AnatomicalExerciseIllustration: React.FC<AnatomicalExerciseIllustrationProps> = ({
  exercise,
  size = "full",
  className = "",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Retrieve the authentic static Hevy technical demonstration image
  const imageSrc = getHevyIllustration(exercise.id, exercise.primaryMuscle);

  // Unknown/custom exercises must never inherit another movement's image.
  if (!imageSrc || hasError) {
    const dimensions = size === "thumbnail"
      ? "w-12 h-12 sm:w-14 sm:h-14 rounded-xl"
      : size === "compact"
        ? "w-full h-44 rounded-2xl"
        : "w-full aspect-[4/3] max-h-[300px] sm:max-h-[320px] rounded-3xl";
    return (
      <div className={`${dimensions} bg-white border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-center p-3 ${className}`}>
        <span className="text-slate-400 text-lg" aria-hidden="true">＋</span>
        {size !== "thumbnail" && <span className="text-xs font-medium text-slate-500">Demonstração visual indisponível para este exercício</span>}
      </div>
    );
  }

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
          src={imageSrc}
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
  if (size === "compact") {
    return (
      <div
        className={`w-full h-44 bg-white rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-slate-700/40 shadow-md ${className}`}
      >
        <img
          src={imageSrc}
          alt={exercise.name}
          className="w-full h-full object-contain filter drop-shadow-sm"
          loading="lazy"
          onError={() => setHasError(true)}
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-800 text-[10px] font-bold">
          {exercise.primaryMuscle}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. FULL VARIANT (Matches the Heavy app interface demonstration modal)
  // =========================================================================
  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Authentic Heavy-style minimalist white card container */}
      <div className="w-full aspect-[4/3] max-h-[300px] sm:max-h-[320px] bg-white rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden border border-slate-200/20 shadow-xl">
        {/* Subtle loading placeholder */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center animate-pulse">
            <span className="text-xs font-medium text-slate-400">Carregando visualizador técnico...</span>
          </div>
        )}

        {/* Technical Demonstration Image */}
        <img
          src={imageSrc}
          alt={`${exercise.name} - Demonstração técnica`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full max-h-[250px] object-contain filter drop-shadow-sm transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Minimalist Top Muscle Pill */}
        <div className="absolute top-3.5 left-4 flex items-center gap-1.5 pointer-events-none">
          <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/10 text-slate-800 backdrop-blur-xs border border-slate-900/10">
            {exercise.primaryMuscle || "Anatomia"}
          </span>
          {exercise.equipment && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-900/5 text-slate-600 border border-slate-900/10">
              {exercise.equipment}
            </span>
          )}
        </div>

        {/* Minimalist Technical Angle Indicator Badge */}
        <div className="absolute bottom-3.5 right-4 pointer-events-none">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-900/5 text-slate-500 border border-slate-900/10">
            Vista Isométrica 3D
          </span>
        </div>
      </div>
    </div>
  );
};
