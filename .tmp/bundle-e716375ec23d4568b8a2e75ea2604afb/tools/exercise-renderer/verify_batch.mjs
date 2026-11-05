import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const plan=read('production-plan.json');
const specs=read('remaining-motion-specs.json');
const reviews=read('visual-reviews.json');
async function sha(file){
  const hash=createHash('sha256');
  for await(const chunk of fs.createReadStream(file))hash.update(chunk);
  return hash.digest('hex');
}
const results=[];
for(const id of plan.pendingIds){
  const problems=[];
  try{
    const spec=specs[id],qa=read(`output/${id}.qa.json`),video=read(`output/${id}.video.json`);
    const sceneHash=await sha(path.join(root,'output',`${id}.blend`));
    const videoHash=await sha(path.join(root,'output',`${id}.mp4`));
    if(!qa.mechanicalChecksPassed)problems.push('mechanical-audit');
    if(sceneHash!==qa.sceneSha256||sceneHash!==video.sceneSha256)problems.push('scene-hash');
    if(video.width!==640||video.height!==640||video.fps!==24||video.frames!==spec.frames)problems.push('video-format');
    const review=reviews[id];
    if(!review?.approved||review.videoSha256!==videoHash)problems.push('visual-review');
    const decoded=read(`output/review/${id}.decoded.json`);
    if(decoded.videoSha256!==videoHash||!review?.reviewedFrames?.every(frame=>decoded.frames.includes(frame)))problems.push('decoded-frames');
    if(!(decoded.uniqueFrameCount>=2))problems.push('no-verified-pixel-motion');
    const poster=fs.readFileSync(path.join(root,'output',`${id}-poster.png`));
    if(poster.toString('hex',0,8)!=='89504e470d0a1a0a'||poster.readUInt32BE(16)!==640||poster.readUInt32BE(20)!==640)problems.push('poster');
  }catch(error){problems.push(error.code??error.message);}
  results.push({exerciseId:id,problems});
}
const failed=results.filter(item=>item.problems.length);
const report={required:plan.pendingIds.length,verified:results.length-failed.length,complete:!failed.length,results};
fs.writeFileSync(path.join(root,'integrity-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({verified:report.verified,required:report.required,failed},null,2));
if(process.argv.includes('--require-complete')&&failed.length)process.exitCode=1;
