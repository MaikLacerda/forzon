import ownedVideos from "./ownedExerciseVideos.json";

export interface ExerciseVideoAsset {
  video: string;
  poster?: string;
  durationSeconds?: number;
  provenance?: string;
}

const OWNED_VIDEOS = ownedVideos as Record<string, ExerciseVideoAsset>;
const LOCAL_PREVIEWS: Record<string,string> = {
  "ex-crucifixo-reto-halteres": "dumbbell-chest-fly.mp4",
  "ex-barra-fixa-pronada": "pull-ups.mp4",
};

export function getExerciseVideoAsset(id: string): ExerciseVideoAsset | undefined {
  if (OWNED_VIDEOS[id]) return OWNED_VIDEOS[id];
  // These licensed samples are not deployed and must not be advertised online.
  if (import.meta.env?.DEV && LOCAL_PREVIEWS[id]) {
    return { video: `/api/exercise-preview/${LOCAL_PREVIEWS[id]}` };
  }
  return undefined;
}

export function hasExerciseVideo(id: string): boolean {
  return Boolean(getExerciseVideoAsset(id));
}
