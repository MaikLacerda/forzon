import fs from "node:fs";
import { EXERCISE_LIBRARY } from "../../src/data/exercises.ts";
const motions = JSON.parse(fs.readFileSync(new URL("./motions.json",import.meta.url),"utf8"));
const published = JSON.parse(fs.readFileSync(new URL("../../src/data/ownedExerciseVideos.json",import.meta.url),"utf8"));

// A known exercise ID is mandatory: no guesses based on a muscle or substring.
const catalog = EXERCISE_LIBRARY.map((exercise) => ({
  id: exercise.id,
  name: exercise.name,
  equipment: exercise.equipment,
  primaryMuscle: exercise.primaryMuscle,
  status: published[exercise.id] ? "available" : Object.values(motions).some(m=>m.exerciseId===exercise.id) ? "in-production" : "not-produced",
  publishedVideo: published[exercise.id]?.video || null,
  techniqueSources: Object.values(motions).find(m=>m.exerciseId===exercise.id)?.techniqueSources || [],
}));
fs.writeFileSync(new URL("./catalog.json", import.meta.url), JSON.stringify(catalog, null, 2) + "\n");
console.log(`${catalog.length} exercícios cadastrados; ${catalog.filter(ex=>ex.status==="available").length} vídeos próprios disponíveis.`);
