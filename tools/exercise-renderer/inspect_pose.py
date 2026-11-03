"""Inspect one authored pose; deliberately emits no publication approval."""
import argparse,json,math,sys
from pathlib import Path
import bpy
from mathutils import Vector
root=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('exercise');p.add_argument('--frame',type=int,default=60);p.add_argument('--render',action='store_true')
a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
if not (root/'output'/f'{a.exercise}-probe.blend').exists():raise FileNotFoundError(a.exercise)
bpy.ops.wm.open_mainfile(filepath=str(root/'output'/f'{a.exercise}-probe.blend'))
bpy.context.scene.frame_set(a.frame);bpy.context.view_layer.update()
rig=bpy.data.objects['Human Rig'];data={'exerciseId':rig['exercise_id'],'probeOnly':True,'frame':a.frame,'arms':{}}
for side in ['L','R']:
    shoulder=rig.matrix_world@rig.pose.bones[f'upperarm01.{side}'].head
    elbow=rig.matrix_world@rig.pose.bones[f'lowerarm01.{side}'].head
    wrist=rig.matrix_world@rig.pose.bones[f'wrist.{side}'].head
    data['arms'][side]={'elbowFlexion':math.degrees((elbow-shoulder).angle(wrist-elbow)),
       'forearmTilt':math.degrees((wrist-elbow).angle(Vector((0,0,1)))),
       'shoulder':list(shoulder),'elbow':list(elbow),'wrist':list(wrist)}
data['maximumTargetErrorM']=rig.get('max_constraint_error')
data['legs']={}
data['kneeSurface']={}
evaluated=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
for side in ['L','R']:
    knee=rig.matrix_world@rig.pose.bones[f'lowerleg01.{side}'].head
    groups={g.index for g in evaluated.vertex_groups if g.name.endswith(f'.{side}') and g.name.startswith(('upperleg','lowerleg'))}
    points=[evaluated.matrix_world@vertex.co for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
    near=[p for p in points if (p-knee).length<.10]
    data['kneeSurface'][side]={'minimumZ':min(p.z for p in near),'bone':list(knee)}
foot_groups={g.index for g in evaluated.vertex_groups if g.name.startswith(('foot.','toe'))}
data['minimumFootSurfaceZ']=min((evaluated.matrix_world@vertex.co).z for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in foot_groups)>.55)
head_groups={g.index for g in evaluated.vertex_groups if g.name in ['head','jaw']}
data['minimumHeadSurfaceY']=min((evaluated.matrix_world@vertex.co).y for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in head_groups)>.55)
data['chin']=list(rig.matrix_world@rig.pose.bones['jaw'].tail)
for side in ['L','R']:
    hip=rig.matrix_world@rig.pose.bones[f'upperleg01.{side}'].head
    knee=rig.matrix_world@rig.pose.bones[f'lowerleg01.{side}'].head
    ankle=rig.matrix_world@rig.pose.bones[f'foot.{side}'].head
    data['legs'][side]={'hip':list(hip),'knee':list(knee),'ankle':list(ankle),'flexion':math.degrees((knee-hip).angle(ankle-knee))}
rollers=[obj for obj in bpy.data.objects if obj.name in ['Decline ankle roller','Decline heel roller']]
if rollers:
    body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
    groups={group.index for group in body.vertex_groups if group.name.startswith(('foot.','toe'))}
    points=[body.matrix_world@vertex.co for vertex in body.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
    data['footRollerSurfaceGapM']={}
    for roller in rollers:
        axis=(roller.matrix_world.to_3x3()@Vector((0,0,1))).normalized()
        center=roller.matrix_world.translation
        gaps=[]
        for point in points:
            delta=point-center
            if abs(delta.dot(axis))<.26:gaps.append((delta-axis*delta.dot(axis)).length-.065)
        data['footRollerSurfaceGapM'][roller.name]=min(gaps)
(root/'output'/f'{a.exercise}-probe.json').write_text(json.dumps(data,indent=2),encoding='utf8')
print(json.dumps(data,indent=2))
if a.render:
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='OPTIX';prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='OPTIX'
    scene=bpy.context.scene;scene.cycles.device='GPU'
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath=str(root/'output'/f'{a.exercise}-frame-{a.frame}.png')
    bpy.ops.render.render(write_still=True)
