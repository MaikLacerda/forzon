"""Versioned corrections of the 31 flagged v3 clips. Never writes public assets."""
import argparse, hashlib, json, math, sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('exercise_id');parser.add_argument('--preview',action='store_true')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);key=args.exercise_id
source=ROOT/'output'/'anatomy-v3'/f'{key}.blend'
out=ROOT/'output'/'anatomy-v4';out.mkdir(exist_ok=True)
review=json.loads((ROOT/'anatomy-v3-visual-review.json').read_text(encoding='utf-8-sig'))
if key not in [e['exerciseId'] for e in review['exercises'] if e['status']=='needs-correction']:raise RuntimeError('Not a flagged clip')
bpy.ops.wm.open_mainfile(filepath=str(source));scene=bpy.context.scene
body=bpy.data.objects['FORZON Human'];rig=bpy.data.objects['Human Rig'];mesh=body.data
old=json.loads((source.parent/f'{key}.style.json').read_text(encoding='utf-8-sig'));mode=old['highlight']
specs=json.loads((ROOT/'remaining-motion-specs.json').read_text(encoding='utf8'))
spec=next((s for s in specs.values() if s['exerciseId']==key),{})
chest_z=rig.data.bones['breast.L'].tail_local.z+.025
shoulder_z=rig.data.bones['upperarm01.L'].head_local.z
groups={g.index:g.name for g in body.vertex_groups}
# Derive the anatomical front of each limb from the flexion plane, not the
# arbitrary roll of the imported rig's bone axes. This avoids painting the
# inner thigh when the seated machine pose rotates the skin around the femur.
scene.frame_set(max(2,scene.frame_end//4));bpy.context.view_layer.update()
deformations={name:rig.matrix_world.to_3x3()@bone.matrix.to_3x3()@bone.bone.matrix_local.to_3x3().inverted() for name,bone in rig.pose.bones.items()}
anterior={}
for side in ['L','R']:
 world=lambda name:rig.matrix_world@rig.pose.bones[f'{name}.{side}'].head
 for part,top,middle,end in [('upperarm','upperarm01','lowerarm01','wrist'),('upperleg','upperleg01','lowerleg01','foot')]:
  axis=(world(middle)-world(top)).normalized();following=(world(end)-world(middle)).normalized()
  bend=following-axis*following.dot(axis)
  if part=='upperleg':bend=-bend
  if bend.length<.08:
   wanted=Vector((0,0,1)) if abs(axis.z)<.4 else Vector((0,-1,0))
   bend=wanted-axis*wanted.dot(axis)
  anterior[(side,part)]=bend.normalized()
 axis=(world('foot')-world('lowerleg01')).normalized()
 toes=(world('toe2-1')-world('foot')).normalized()
 anterior[(side,'lowerleg')]=(toes-axis*toes.dot(axis)).normalized()

def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def limb_mask(vertex,part,orientation='front',active=None):
 side='L' if vertex.co.x>=0 else 'R'
 if active and side!=active:return 0
 start=rig.data.bones[f'{part}01.{side}'].head_local
 axis=rig.data.bones[f'{part}02.{side}'].tail_local-start
 t=(vertex.co-start).dot(axis)/axis.length_squared
 radial=vertex.co-start-axis*t
 weights=[(groups.get(g.group,''),g.weight) for g in vertex.groups if groups.get(g.group,'').startswith(part) and groups.get(g.group,'').endswith('.'+side)]
 world_radial=sum((deformations[name]@radial*w for name,w in weights),Vector())
 frontness=world_radial.dot(anterior[(side,part)])/max(world_radial.length,.001)
 weight=sum(g.weight for g in vertex.groups if groups.get(g.group,'').startswith(part) and groups.get(g.group,'').endswith('.'+side))
 along=smooth(.06,.17,t)*(1-smooth(.80,.96,t))
 if part=='lowerleg':along=smooth(.12,.25,t)*(1-smooth(.72,.91,t))
 facing=smooth(-.20,.35,frontness if orientation=='front' else -frontness)
 return smooth(.25,.65,weight)*along*facing
def glutes(point,normal):
 x,y,z=point
 # Include the posterolateral surface so a fitted short does not conceal the cue.
 facing=max(smooth(-.05,.45,normal.y),.85*abs(normal.x))
 if key=='ex-cadeira-abdutora':return facing*math.exp(-((abs(x)-.16)/.085)**4-((z-.96)/.10)**4)
 return facing*math.exp(-(x/.24)**4-((z-.91)/.14)**4)
def mask(vertex):
 x,y,z=vertex.co;normal=vertex.normal
 front=smooth(-.1,.5,-normal.y);back=smooth(-.1,.5,normal.y)
 if mode=='quads':return limb_mask(vertex,'upperleg')
 if mode=='hamstrings':return limb_mask(vertex,'upperleg','back')
 if mode=='calves':return limb_mask(vertex,'lowerleg','back')
 if mode=='glutes':return glutes(vertex.co,normal)
 if mode=='triceps':return limb_mask(vertex,'upperarm','back',spec.get('side','L') if key=='ex-triceps-frances-unilateral' else None)
 if mode=='biceps':return limb_mask(vertex,'upperarm','front',spec.get('side','L'))
 if mode=='core':
  return max(front,.7*abs(normal.x))*math.exp(-(x/.16)**4-((z-(chest_z-.23))/.17)**4)
 if mode=='back':
  if 'encolhimento' in key:
   width=.20-.9*max(0,z-shoulder_z)
   return back*(1-smooth(max(.04,width-.025),max(.06,width+.015),abs(x)))*smooth(shoulder_z-.13,shoulder_z-.07,z)*(1-smooth(shoulder_z+.10,shoulder_z+.14,z))
  if key in ['ex-extensao-lombar-banco','ex-levantamento-terra-convencional']:
   return back*math.exp(-((abs(x)-.055)/.045)**4-((z-(chest_z-.23))/.18)**4)
  return back*math.exp(-(x/.24)**4-((z-(chest_z-.02))/.24)**4)
 return None

colors=mesh.color_attributes['MuscleRegion']
for vertex in mesh.vertices:
 amount=mask(vertex)
 if amount is None:continue
 amount=max(0,min(1,amount))
 colors.data[vertex.index].color=(.43+.36*amount,.48-.405*amount,.48-.435*amount,1)
if mode=='glutes':
 cloth=bpy.data.objects.get('Fitted training shorts')
 if cloth and cloth.data.color_attributes.get('MuscleRegion'):
  for vertex in cloth.data.vertices:
   a=max(0,min(1,glutes(vertex.co,vertex.normal)))
   cloth.data.color_attributes['MuscleRegion'].data[vertex.index].color=(.26+.53*a,.31-.235*a,.31-.265*a,1)
if key in ['ex-crossfit-thruster','ex-hyrox-wall-balls']:
 # These are compound demonstrations: retain the shoulder cue and add quads.
 for vertex in mesh.vertices:
  a=limb_mask(vertex,'upperleg')
  if a>.05:colors.data[vertex.index].color=(.43+.36*a,.48-.405*a,.48-.435*a,1)

removed=[]
if key=='ex-fight-shadow':
 for name in ['Dumbbell.L','Dumbbell.R']:
  obj=bpy.data.objects.get(name)
  if obj:
   for child in [obj,*obj.children_recursive]:child.hide_render=True;removed.append(child.name)

surface_revision=None
if key=='ex-abdominal-vacuum':
 basis=body.data.shape_keys.key_blocks['Basis'];shape=body.data.shape_keys.key_blocks['Abdominal draw-in']
 for point,base in zip(shape.data,basis.data):point.co=base.co+(point.co-base.co)*1.65
 surface_revision='vacuum-draw-in-v4: original timeline, displacement x1.65'

directions={
 'ex-abdominal-vacuum':(4,-3,.7),'ex-agachamento-sumo-halter':(3,4,1),
 'ex-cadeira-abdutora':(5,.8,1),'ex-cadeira-extensora':(2,-4,2),
 'ex-cadeira-flexora':(4,.7,.4),'ex-cal-muscle-up':(2,4,.8),
 'ex-crossfit-thruster':(2,-4,1),'ex-crucifixo-inclinado-halteres':(0,-4,2.7),
 'ex-crucifixo-reto-halteres':(0,-4,2.7),'ex-elevacao-pelvica-barra':(4,1,.5),
 'ex-elevacao-pelvica-maquina':(4,.2,.5),'ex-encolhimento-barra':(1,4,.6),
 'ex-encolhimento-halteres':(1,4,.6),'ex-extensao-lombar-banco':(3,3,1),
 'ex-fight-shadow':(2,-4,.7),'ex-flexao-solo-deficit':(4,-1,.5),
 'ex-fut-sand-header-jump':(3,4,.8),'ex-good-morning-barra':(3,4,.6),
 'ex-hyrox-sled-push':(4,-3,.7),'ex-hyrox-wall-balls':(4,0,.8),
 'ex-levantamento-terra-convencional':(3,4,.8),'ex-panturrilha-leg-press-45':(4,-2,.5),
 'ex-panturrilha-sentado-soleo':(4,3,.5),'ex-prancha-isometrica':(4,-2,.5),
 'ex-roda-abdominal-abwheel':(4,-1,.5),'ex-rosca-concentrada-halter':(4,-3,.6),
 'ex-stiff-barra':(3,4,.7),'ex-stiff-halteres':(3,4,.7),
 'ex-triceps-frances-unilateral':(3,-4,.7),'ex-triceps-testa-barra-w':(4,-2,.5),
 'ex-triceps-testa-halteres':(4,-2,.5),
}
direction=Vector(directions[key]).normalized();rotation=(-direction).to_track_quat('-Z','Y')
right=rotation@Vector((1,0,0));up=rotation@Vector((0,1,0))
essential=[body]
for obj in scene.objects:
 if obj.name.startswith(('Dumbbell.','Weight bar','Barbell','Bar.','Exercise implement','Medicine ball','Header ball','Wall ball','Fixed pullup bar')):
  essential.extend([obj,*obj.children_recursive])
essential=list({o.name:o for o in essential if not o.hide_render and o.type=='MESH'}.values())
samples=sorted({1+round(i*(scene.frame_end-1)/16) for i in range(17)})
points=[]
for frame in samples:
 scene.frame_set(frame);bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
 for obj in essential:
  evaluated=obj.evaluated_get(deps)
  points.extend(evaluated.matrix_world@Vector(corner) for corner in evaluated.bound_box)
# Include the wall-ball target without framing the unused outer wall.
if key=='ex-hyrox-wall-balls':
 for obj in scene.objects:
  if 'target' in obj.name.lower():points.extend(obj.matrix_world@Vector(c) for c in obj.bound_box)
xs=[p.dot(right) for p in points];ys=[p.dot(up) for p in points];ds=[p.dot(direction) for p in points]
target=right*((min(xs)+max(xs))/2)+up*((min(ys)+max(ys))/2)+direction*((min(ds)+max(ds))/2)
camera=scene.camera;camera.data.type='ORTHO';camera.rotation_euler=rotation.to_euler();camera.location=target+direction*5
camera.data.ortho_scale=max(max(xs)-min(xs),max(ys)-min(ys))*1.16
scene['anatomy_version']='v4';scene['source_v3_sha256']=hashlib.sha256(source.read_bytes()).hexdigest()
scene.frame_set(scene.frame_end//2)
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/f'{key}-preview.png')
bpy.ops.wm.save_as_mainfile(filepath=str(out/f'{key}.blend'))
metadata={'exerciseId':key,'style':'anatomy-v4','recipeSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'sourceSceneSha256':scene['source_v3_sha256'],'surfaceAnimationRevision':surface_revision,'hiddenEquipment':removed,'cameraDirection':list(direction),'cameraScale':camera.data.ortho_scale,'reviewSampleFrames':samples,'publication':'not-published'}
(out/f'{key}.corrections.json').write_text(json.dumps(metadata,indent=2),encoding='utf8')
if args.preview:
 prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
 for device in prefs.devices:device.use=device.type=='OPTIX'
 scene.cycles.device='GPU';bpy.ops.render.render(write_still=True)
