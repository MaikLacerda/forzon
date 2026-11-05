import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=(name,fallback={})=>fs.existsSync(path.join(root,name))?JSON.parse(fs.readFileSync(path.join(root,name),'utf8')):fallback;
const plan=read('production-plan.json');
const specs=read('remaining-motion-specs.json');
const reviews=read('visual-reviews.json');
const results=plan.pendingIds.map(id=>{
 const spec=specs[id];
 const videoPath=path.join(root,'output',`${id}.mp4`);
 const qa=read(`output/${id}.qa.json`);
 const metadata=read(`output/${id}.video.json`);
 const exists=fs.existsSync(videoPath);
 const sha=exists?createHash('sha256').update(fs.readFileSync(videoPath)).digest('hex'):null;
 const videoValid=exists && metadata.exerciseId===id && metadata.frames===spec?.frames && metadata.fps===24 && metadata.width===640 && metadata.height===640;
 const mechanical=qa.exerciseId===id && qa.mechanicalChecksPassed===true && Boolean(qa.sceneSha256) && qa.sceneSha256===metadata.sceneSha256;
 const reviewed=videoValid && reviews[id]?.approved===true && reviews[id]?.videoSha256===sha;
 return {exerciseId:id,name:spec?.name,family:spec?.family,
   status:reviewed&&mechanical?'ready':videoValid?'awaiting-review':fs.existsSync(path.join(root,'output',`${id}.blend`))?'motion-draft':'specified',
   videoValid,mechanical,reviewed};
});
const report={deliveryMode:plan.deliveryMode,required:plan.pendingIds.length,
 ready:results.filter(r=>r.status==='ready').length,
 rendered:results.filter(r=>r.videoValid).length,
 complete:results.every(r=>r.status==='ready'),exercises:results};
fs.writeFileSync(path.join(root,'batch-status.json'),JSON.stringify(report,null,2)+'\n');
console.log(`${report.ready}/${report.required} prontos; ${report.rendered} videos renderizados. Entrega completa: ${report.complete?'SIM':'NAO'}.`);
