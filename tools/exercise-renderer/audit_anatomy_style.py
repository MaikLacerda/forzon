"""Verify every animated joint and equipment transform against the approved source."""
import argparse
import hashlib
import json
import sys
from pathlib import Path
import bpy

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('exercise')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
specs=json.loads((ROOT/'motions.json').read_text(encoding='utf8'))
specs.update(json.loads((ROOT/'remaining-motion-specs.json').read_text(encoding='utf8')))
spec=specs[args.exercise];exercise_id=spec['exerciseId']
source=ROOT/'output'/f'{args.exercise}.blend'
out=ROOT/'output'/'anatomy-v3';styled=out/f'{exercise_id}.blend'
metadata=json.loads((out/f'{exercise_id}.style.json').read_text(encoding='utf8'))
if metadata['sourceSceneSha256']!=hashlib.sha256(source.read_bytes()).hexdigest():raise RuntimeError('Source changed after restyling')

def inspect(path, names=None):
    bpy.ops.wm.open_mainfile(filepath=str(path));scene=bpy.context.scene
    rig=bpy.data.objects['Human Rig']
    if rig['exercise_id']!=exercise_id:raise RuntimeError('Wrong exercise scene')
    if names is None:
        names=[o.name for o in scene.objects if o.type=='MESH' and o.name not in ['FORZON Human','Fitted training shorts']]
    frames=[]
    for frame in range(scene.frame_start,scene.frame_end+1):
        scene.frame_set(frame);bpy.context.view_layer.update()
        values=[]
        for bone in rig.pose.bones:
            values.extend(value for row in (rig.matrix_world@bone.matrix) for value in row)
        for name in names:
            values.extend(value for row in bpy.data.objects[name].matrix_world for value in row)
        frames.append(values)
    return frames,names,scene.render.fps

reference,names,fps=inspect(source)
actual,_,actual_fps=inspect(styled,names)
if len(actual)!=len(reference) or fps!=actual_fps:raise RuntimeError('Timing changed')
error=max(abs(a-b) for first,second in zip(reference,actual) for a,b in zip(first,second))
if error>1e-6:raise RuntimeError(f'Motion or equipment changed: {error}')
report={'exerciseId':exercise_id,'sourceSceneSha256':metadata['sourceSceneSha256'],'sceneSha256':hashlib.sha256(styled.read_bytes()).hexdigest(),'framesChecked':len(actual),'fps':fps,'maximumJointOrEquipmentTransformDifference':error,'motionPreserved':True,'visualReviewRequired':True}
(out/f'{exercise_id}.motion-qa.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report),flush=True)
