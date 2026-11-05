import React, { useState } from "react";
import { Exercise } from "../../types";
import ownedVideos from "../../data/ownedExerciseVideos.json";

interface OwnedVideo {
  video: string;
  poster: string;
  durationSeconds: number;
  provenance: string;
}
const OWNED_VIDEOS = ownedVideos as Record<string, OwnedVideo>;

// Exact matches only: a flat fly is never used for an incline fly or press.
const PREVIEW_CLIPS: Record<string, string> = {
  "ex-crucifixo-reto-halteres": "dumbbell-chest-fly.mp4",
  "ex-barra-fixa-pronada": "pull-ups.mp4",
};

export function ExerciseVideoDemonstration({ exercise }: { exercise: Exercise }) {
  const clip = PREVIEW_CLIPS[exercise.id];
  const owned = OWNED_VIDEOS[exercise.id];
  const source = owned?.video || (clip ? `/api/exercise-preview/${clip}` : null);
  const [failedClip, setFailedClip] = useState<string | null>(null);

  if (!source || failedClip === source) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <p className="text-sm font-bold text-white">Vídeo em preparação</p>
        <p className="mt-2 text-xs text-neutral-400">
          A demonstração específica de {exercise.name} ainda não está disponível.
        </p>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-neutral-800 bg-white">
      <video
        key={source}
        src={source}
        poster={owned?.poster}
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
