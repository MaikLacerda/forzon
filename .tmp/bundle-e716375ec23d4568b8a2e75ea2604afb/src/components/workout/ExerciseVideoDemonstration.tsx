import React, { useState } from "react";
import { Exercise } from "../../types";
import { getExerciseVideoAsset } from "../../data/exerciseVideoAssets";

export function ExerciseVideoDemonstration({ exercise }: { exercise: Exercise }) {
  const asset = getExerciseVideoAsset(exercise.id);
  const source = asset?.video;
  const [failedClip, setFailedClip] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  if (!source) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <p className="text-sm font-bold text-white">Vídeo ainda não disponível</p>
        <p className="mt-2 text-xs text-neutral-400">
          A demonstração de {exercise.name} ainda não foi produzida. Consulte a aba Instruções para ver a execução descrita.
        </p>
      </div>
    );
  }

  if (failedClip === source) {
    return (
      <div role="alert" className="rounded-2xl border border-amber-500/30 bg-neutral-900 p-6 text-center">
        <p className="text-sm font-bold text-white">Não foi possível carregar o vídeo</p>
        <p className="mt-2 text-xs text-neutral-400">Este exercício já tem vídeo. Verifique sua conexão e tente novamente.</p>
        <button type="button" onClick={() => { setFailedClip(null); setAttempt(value=>value+1); }}
          className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-neutral-950">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-neutral-800 bg-white">
      <video
        key={`${source}:${attempt}`}
        src={source}
        poster={asset?.poster}
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label={`Demonstração de ${exercise.name}`}
        onError={() => setFailedClip(source)}
        className="aspect-square max-h-[360px] w-full object-contain"
      />
      <figcaption className="bg-neutral-950 px-3 py-2 text-xs text-neutral-300">
        {exercise.name} · Demonstração em vídeo
      </figcaption>
    </figure>
  );
}
