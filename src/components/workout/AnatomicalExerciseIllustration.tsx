import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, FastForward } from "lucide-react";
import { Exercise } from "../../types";
import { getExerciseIllustration, ExerciseIllustrationAsset } from "../../data/exerciseAssetMap";

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
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<0.5 | 1>(1);
  const [currentFrame, setCurrentFrame] = useState<0 | 1>(0);
  const [imagesLoaded, setImagesLoaded] = useState({ frame0: false, frame1: false });
  const [loadError, setLoadError] = useState(false);

  const asset: ExerciseIllustrationAsset = getExerciseIllustration(
    exercise.id,
    exercise.primaryMuscle
  );

  // Preload both illustration frames
  useEffect(() => {
    let active = true;
    const img0 = new Image();
    const img1 = new Image();

    img0.src = asset.frame0;
    img0.onload = () => {
      if (active) setImagesLoaded((prev) => ({ ...prev, frame0: true }));
    };
    img0.onerror = () => {
      if (active) setLoadError(true);
    };

    img1.src = asset.frame1;
    img1.onload = () => {
      if (active) setImagesLoaded((prev) => ({ ...prev, frame1: true }));
    };
    img1.onerror = () => {
      if (active) setLoadError(true);
    };

    return () => {
      active = false;
    };
  }, [asset.frame0, asset.frame1]);

  // Cadence timer matching Hevy's 2-phase rhythm:
  // Phase 0: Stretched / Start (~1.2s at 1x)
  // Phase 1: Peak contraction (~1.2s at 1x)
  useEffect(() => {
    if (!isPlaying && size !== "thumbnail") return;

    const intervalMs = (size === "thumbnail" ? 1500 : 1250) / speed;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev === 0 ? 1 : 0));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, speed, size]);

  // =========================================================================
  // 1. THUMBNAIL VARIANT (For workout list items, exercise selection cards)
  // =========================================================================
  if (size === "thumbnail") {
    return (
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center overflow-hidden border border-neutral-700/60 shadow-sm relative group ${className}`}
        title={`${exercise.name} - Demonstração anatômica`}
      >
        <img
          src={currentFrame === 0 ? asset.frame0 : asset.frame1}
          alt={exercise.name}
          className="w-full h-full object-contain filter drop-shadow-sm transition-opacity duration-300"
          loading="lazy"
          onError={(e) => {
            // Fallback to frame 0 if frame 1 fails
            if (currentFrame === 1) {
              (e.currentTarget as HTMLImageElement).src = asset.frame0;
            }
          }}
        />

        {/* Small phase indicator dot on hover */}
        <div className="absolute bottom-1 right-1 flex gap-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className={`w-1 h-1 rounded-full ${
              currentFrame === 0 ? "bg-amber-500" : "bg-neutral-300"
            }`}
          />
          <span
            className={`w-1 h-1 rounded-full ${
              currentFrame === 1 ? "bg-rose-500" : "bg-neutral-300"
            }`}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. COMPACT VARIANT (For mini previews / widgets)
  // =========================================================================
  if (size === "compact") {
    return (
      <div
        className={`w-full h-44 bg-white rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden border border-slate-700/40 shadow-md ${className}`}
      >
        <img
          src={currentFrame === 0 ? asset.frame0 : asset.frame1}
          alt={exercise.name}
          className="w-full h-full object-contain filter drop-shadow-sm transition-opacity duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[11px] font-semibold text-neutral-800 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-200 shadow-xs">
          <span>{currentFrame === 0 ? "Início / Alongamento" : "Pico de Contração"}</span>
          <button
            type="button"
            onClick={() => setCurrentFrame((f) => (f === 0 ? 1 : 0))}
            className="text-cyan-700 hover:text-cyan-900 font-bold"
          >
            Trocar
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. FULL VARIANT (Matches the Hevy Exercise Modal)
  // =========================================================================
  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Authentic Hevy-style Pure White Card Container */}
      <div className="w-full aspect-[4/3] max-h-[310px] bg-white rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden border border-slate-200/20 shadow-xl group">
        {/* Anatomical Looping Images with Smooth Cross-fade */}
        <div className="w-full h-full flex items-center justify-center relative">
          <img
            src={asset.frame0}
            alt={`${exercise.name} - Posição Inicial`}
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-md transition-opacity duration-300 ${
              currentFrame === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
          <img
            src={asset.frame1}
            alt={`${exercise.name} - Pico de Contração`}
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-md transition-opacity duration-300 ${
              currentFrame === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        </div>

        {/* Top Badges: Anatomical Line Art source and Exercise Type */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5 pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/10 text-slate-800 backdrop-blur-sm border border-slate-900/10">
            {exercise.primaryMuscle || "Anatomia 3D"}
          </span>
          {exercise.equipment && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900/5 text-slate-600 border border-slate-900/10">
              {exercise.equipment}
            </span>
          )}
        </div>

        {/* Phase Step Selectors (Frame 1 vs Frame 2 dots at top right) */}
        <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-slate-900/5 backdrop-blur-sm p-1 rounded-full border border-slate-900/10">
          <button
            type="button"
            onClick={() => {
              setCurrentFrame(0);
              setIsPlaying(false);
            }}
            title="Ver Fase Excêntrica (Alongamento)"
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
              currentFrame === 0
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fase 1
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentFrame(1);
              setIsPlaying(false);
            }}
            title="Ver Pico de Contração"
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
              currentFrame === 1
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fase 2
          </button>
        </div>

        {/* Bottom Control Bar: Play/Pause, Phase Description, Speed */}
        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-md">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            title={isPlaying ? "Pausar loop" : "Reproduzir loop"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-slate-700" />
            ) : (
              <Play className="w-4 h-4 fill-current text-slate-700 ml-0.5" />
            )}
          </button>

          {/* Phase Badge & Description */}
          <div className="flex flex-col items-center text-center px-2">
            <span
              className={`text-xs font-bold transition-colors ${
                currentFrame === 0 ? "text-amber-600" : "text-rose-600"
              }`}
            >
              {currentFrame === 0
                ? "Fase Excêntrica (Alongamento)"
                : "Pico de Contração Muscular"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {currentFrame === 0
                ? "Fibras estendidas sob carga controlada"
                : "Recrutamento máximo das fibras primárias"}
            </span>
          </div>

          {/* Speed Toggle (1.0x / 0.5x) */}
          <button
            type="button"
            onClick={() => setSpeed((s) => (s === 1 ? 0.5 : 1))}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition-all cursor-pointer shadow-xs shrink-0"
            title="Alternar velocidade"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
};
