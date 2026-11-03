import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { EXERCISE_LIBRARY } from '../../src/data/exercises.ts';

const workspace=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(workspace,'src/data/ownedExerciseVideos.json'),'utf8'));
const ids=new Set(EXERCISE_LIBRARY.map(exercise=>exercise.id));
assert.equal(ids.size,EXERCISE_LIBRARY.length,'Duplicate exercise ID');
assert.deepEqual(new Set(Object.keys(manifest)),ids,'Catalog/manifest coverage differs');
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
for(const id of ids){
  const asset=manifest[id];
  for(const [kind,extension] of [['video','mp4'],['poster','png']]){
    const url=new URL(asset[kind],'https://forzon.test');
    assert.equal(url.pathname,`/assets/exercise-videos/${id}.${extension}`,'Incorrect exercise asset');
    const publicFile=path.join(workspace,'public',url.pathname);
    const bytes=fs.readFileSync(publicFile);
    if(kind==='video'){
      assert(bytes.length>10000,'Video is empty');
      assert.equal(bytes.toString('ascii',4,8),'ftyp','Not an MP4');
      assert.equal(url.searchParams.get('v'),hash(bytes).slice(0,10),'Stale video version');
    }else{
      assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16),640);assert.equal(bytes.readUInt32BE(20),640);
    }
    if(process.argv.includes('--build'))assert.equal(hash(fs.readFileSync(path.join(workspace,'dist',url.pathname))),hash(bytes),'Build asset differs');
  }
}
console.log(`${ids.size} exercise IDs: matching MP4 and PNG files${process.argv.includes('--build')?' in public and dist':''}.`);
