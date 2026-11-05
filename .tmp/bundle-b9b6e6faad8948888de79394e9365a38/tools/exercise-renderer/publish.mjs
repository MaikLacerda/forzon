import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { EXERCISE_LIBRARY } from "../../src/data/exercises.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const motions = JSON.parse(fs.readFileSync(path.join(root,"motions.json"),"utf8"));
const ids = new Set(EXERCISE_LIBRARY.map(ex=>ex.id));
const records = [];
let reviews = {};
const planPath = path.join(root,"production-plan.json");
const plan = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath,"utf8")) : null;
if (plan?.deliveryMode === "single-complete-batch") {
  Object.assign(motions,JSON.parse(fs.readFileSync(path.join(root,'remaining-motion-specs.json'),'utf8')));
  const authored = new Set(Object.values(motions).map(spec=>spec.exerciseId));
  const missing = [...plan.existingIds,...plan.pendingIds].filter(id=>!authored.has(id));
  if (authored.size!==plan.requiredTotal || missing.length) {
    throw new Error(`Entrega unica bloqueada: ${missing.length} exercicios ausentes do inventario de producao.`);
  }
  const reviewsPath = path.join(root,"visual-reviews.json");
  reviews = fs.existsSync(reviewsPath) ? JSON.parse(fs.readFileSync(reviewsPath,"utf8")) : {};
  for (const id of plan.pendingIds) {
    const review = reviews[id];
    if (!review?.approved || !review.videoSha256) throw new Error(`Revisao visual pendente: ${id}`);
  }
}
for (const [motion,spec] of Object.entries(motions)) {
  const qa = JSON.parse(fs.readFileSync(path.join(root,"output",`${motion}.qa.json`),"utf8"));
  const video = JSON.parse(fs.readFileSync(path.join(root,"output",`${motion}.video.json`),"utf8"));
  if (!ids.has(spec.exerciseId) || qa.exerciseId!==spec.exerciseId || !qa.mechanicalChecksPassed ||
      video.exerciseId!==spec.exerciseId || video.frames!==spec.frames || video.fps!==24 ||
      video.width!==640 || video.height!==640) throw new Error(`Publication check failed: ${motion}`);
  const source = path.join(root,"output",`${motion}.mp4`);
  if (!fs.existsSync(source) || fs.statSync(source).size<10000) throw new Error(`Missing video: ${motion}`);
  if (plan?.pendingIds.includes(spec.exerciseId)) {
    const sceneHash = createHash('sha256').update(fs.readFileSync(path.join(root,'output',`${motion}.blend`))).digest('hex');
    if (!qa.sceneSha256 || video.sceneSha256!==qa.sceneSha256 || sceneHash!==qa.sceneSha256) {
      throw new Error(`A cena renderizada nao corresponde a auditoria: ${spec.exerciseId}`);
    }
    const actualHash = createHash('sha256').update(fs.readFileSync(source)).digest('hex');
    if (reviews[spec.exerciseId]?.videoSha256 !== actualHash) {
      throw new Error(`O video mudou depois da revisao visual: ${spec.exerciseId}`);
    }
    const decoded = JSON.parse(fs.readFileSync(path.join(root,'output','review',`${motion}.decoded.json`),'utf8'));
    if (decoded.videoSha256!==actualHash || !(decoded.uniqueFrameCount>=2) || !reviews[spec.exerciseId].reviewedFrames.every(frame=>decoded.frames.includes(frame))) {
      throw new Error(`Os quadros revisados nao correspondem ao MP4: ${spec.exerciseId}`);
    }
  }
  records.push({motion,spec,source});
}
const destination = path.resolve(root,"../../public/assets/exercise-videos");
fs.mkdirSync(destination,{recursive:true});
fs.copyFileSync(path.join(root,"assets/LICENSE.CC0.txt"),path.join(destination,"LICENSE.MAKEHUMAN.txt"));
fs.writeFileSync(path.join(destination,"NOTICE.txt"),
  "Rendered for FORZON using MakeHuman core geometry, rig, weights and phenotype data (CC0).\n"+
  "The rendered exercise clips were produced by the FORZON Blender pipeline.\n"+
  "No MoveKit or Hevy video was used as input to this production.\n"+
  "Source asset license: LICENSE.MAKEHUMAN.txt\n");
const manifest = {};
for (const {motion,spec,source} of records) {
  const version = createHash("sha256").update(fs.readFileSync(source)).digest("hex").slice(0,10);
  fs.copyFileSync(source,path.join(destination,`${spec.exerciseId}.mp4`));
  fs.copyFileSync(path.join(root,"output",`${motion}-poster.png`),path.join(destination,`${spec.exerciseId}.png`));
  manifest[spec.exerciseId] = {
    video:`/assets/exercise-videos/${spec.exerciseId}.mp4?v=${version}`,
    poster:`/assets/exercise-videos/${spec.exerciseId}.png?v=${version}`,
    durationSeconds:spec.frames/24,
    provenance:"FORZON / MakeHuman CC0",
  };
}
fs.writeFileSync(path.resolve(root,"../../src/data/ownedExerciseVideos.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(`${records.length} vídeos próprios publicados com correspondência exata de ID.`);
