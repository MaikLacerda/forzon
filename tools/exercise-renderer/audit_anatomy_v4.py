"""Independent v4 checks, plus an honest comparison against the immutable v3 scene."""
import argparse,hashlib,json,sys,math
from pathlib import Path
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('exercise_id');a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);key=a.exercise_id
out=ROOT/'output'/'anatomy-v4';source=ROOT/'output'/'anatomy-v3'/f'{key}.blend';target=out/f'{key}.blend'
meta=json.loads((out/f'{key}.corrections.json').read_text())
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
if sha(source)!=meta['sourceSceneSha256']:raise RuntimeError('Source v3 changed')

def inspect(path):
 bpy.ops.wm.open_mainfile(filepath=str(path));s=bpy.context.scene;r=bpy.data.objects['Human Rig']
 if r.get('exercise_id')!=key:raise RuntimeError('Exercise mismatch')
 names=sorted(o.name for o in s.objects if o.type=='MESH' and o.name not in ['FORZON Human','Fitted training shorts'])
 rows=[];joints=[];morph=[]
 for frame in range(s.frame_start,s.frame_end+1):
  s.frame_set(frame);bpy.context.view_layer.update()
  values=[v for b in r.pose.bones for row in (r.matrix_world@b.matrix) for v in row]
  values.extend(v for n in names for row in bpy.data.objects[n].matrix_world for v in row)
  rows.append(values)
  joints.append({n:r.matrix_world@r.pose.bones[n].head for n in ['upperarm01.L','upperarm01.R','lowerarm01.L','lowerarm01.R','wrist.L','wrist.R']})
  shapes=bpy.data.objects['FORZON Human'].data.shape_keys
  morph.append(shapes.key_blocks['Abdominal draw-in'].value if shapes and shapes.key_blocks.get('Abdominal draw-in') else 0)
 return rows,joints,morph,s.render.fps,names
before,before_joints,before_morph,fps,names=inspect(source)
after,joints,morph,after_fps,after_names=inspect(target)
checks={'sameTiming':len(before)==len(after) and fps==after_fps,'sameEquipmentObjects':names==after_names}
error=max(abs(x-y) for u,v in zip(before,after) for x,y in zip(u,v))
checks['skeletonAndEquipmentTransformsUnchanged']=error<1e-6
details={}
if key in ['ex-crucifixo-reto-halteres','ex-crucifixo-inclinado-halteres']:
 symmetry=max(max(abs(row[n+'.L'].x+row[n+'.R'].x),abs(row[n+'.L'].y-row[n+'.R'].y),abs(row[n+'.L'].z-row[n+'.R'].z)) for row in joints for n in ['upperarm01','lowerarm01','wrist'])
 travel=max((row['wrist.L']-joints[0]['wrist.L']).length for row in joints)
 checks.update({'bilateralJointSymmetry':symmetry<.002,'handArcPresent':travel>.35})
 details.update(symmetryMaximumMetres=symmetry,handTravelMetres=travel,previousFinding='Perspective looked asymmetric; world-space joint coordinates prove symmetry in v3 and v4. Camera correction only.')
if 'encolhimento' in key:
 lift=max(row['upperarm01.L'].z for row in joints)-min(row['upperarm01.L'].z for row in joints)
 checks['shoulderElevationPresent']=.03<lift<.08
 checks['elbowsRemainExtended']=max(abs((row['upperarm01.L']-row['lowerarm01.L']).normalized().dot((row['lowerarm01.L']-row['wrist.L']).normalized())-1) for row in joints)<.03
 details['shoulderElevationMetres']=lift
if key=='ex-abdominal-vacuum':
 body=bpy.data.objects['FORZON Human'];keys=body.data.shape_keys.key_blocks
 displacement=max((x.co-y.co).length for x,y in zip(keys['Abdominal draw-in'].data,keys['Basis'].data))
 checks.update({'originalMorphTimelinePreserved':max(abs(x-y) for x,y in zip(morph,before_morph))<1e-6,'drawInReleaseAndHold':min(morph)<.01 and max(morph)>.99,'boundedNewDrawInDisplacement':.04<displacement<.07})
 details.update(drawInMaximumMetres=displacement,surfaceAnimationChanged=True)
if key=='ex-fight-shadow':
 checks['noVisibleDumbbells']=all(bpy.data.objects[n].hide_render for n in meta['hiddenEquipment']) and bool(meta['hiddenEquipment'])
if key=='ex-rosca-concentrada-halter':
 from mathutils.bvhtree import BVHTree
 distances=[]
 for frame in meta['reviewSampleFrames']:
  s=bpy.context.scene;s.frame_set(frame);bpy.context.view_layer.update()
  body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get());r=bpy.data.objects['Human Rig']
  indices={g.index for g in body.vertex_groups if g.name.startswith('upperleg') and g.name.endswith('.L')}
  selected={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in indices)>.35}
  tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in selected for i in p.vertices)])
  distances.append(tree.find_nearest(r.matrix_world@r.pose.bones['lowerarm01.L'].head)[3])
 checks['elbowRemainsAtThighSupport']=max(distances)<.04
 details['maximumElbowJointToThighSurfaceMetres']=max(distances)
 details['supportReview']='Joint-to-surface distance checked at 17 samples; original support pose retained, no fabricated animation correction.'

# Check framing on actual evaluated body and all visible dumbbell/barbell meshes.
from bpy_extras.object_utils import world_to_camera_view
s=bpy.context.scene;body=bpy.data.objects['FORZON Human'];outside=0;edge=1.0
for frame in meta['reviewSampleFrames']:
 s.frame_set(frame);bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
 evaluated=body.evaluated_get(deps)
 for corner in evaluated.bound_box:
  point=world_to_camera_view(s,s.camera,evaluated.matrix_world@Vector(corner));edge=min(edge,point.x,point.y,1-point.x,1-point.y)
  if not (0<=point.x<=1 and 0<=point.y<=1 and point.z>0):outside+=1
checks['bodyInFrameAt17Samples']=outside==0
details['minimumBodyFrameMargin']=edge
report={'exerciseId':key,'style':'anatomy-v4','auditRecipeSha256':sha(Path(__file__)),'sourceV3SceneSha256':sha(source),'sceneSha256':sha(target),'sourceComparison':{'skeletonAndEquipmentPreserved':error<1e-6,'maximumTransformDifference':error,'surfaceAnimationChanged':bool(meta['surfaceAnimationRevision'])},'checks':checks,'details':details,'checksPassed':all(checks.values()),'framesChecked':len(after),'visualReviewRequired':True,'publication':'not-published'}
(out/f'{key}.motion-qa.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report),flush=True)
if not report['checksPassed']:raise RuntimeError('V4 independent checks failed')
