"""Measure support clearances in a probe without approving production media."""
import bpy,sys,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent
exercise=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=str(root/'output'/f"{exercise}{'' if '--full' in sys.argv else '-probe'}.blend"))
bpy.context.scene.frame_set(int(sys.argv[sys.argv.index('--frame')+1]) if '--frame' in sys.argv else bpy.context.scene.frame_current)
bpy.context.view_layer.update()
body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
result={}
for name,thickness,groups in [('Spider chest pad',.07,('spine','breast')),('Preacher arm pad',.06,('upperarm',)),('Bench back',.08,('spine','breast')),('Hip thrust upper-back bench',.08,('spine','breast')),('Leg curl chest pad',.08,('spine','breast')),('Leg curl thigh pad',.08,('upperleg',)),('Leg extension seat',.08,('upperleg','pelvis','spine')),('Seated calf seat',.08,('upperleg','pelvis','spine')),('Abduction seat',.09,('upperleg','pelvis','spine'))]:
    pad=bpy.data.objects.get(name)
    if pad is None:continue
    indices={g.index for g in body.vertex_groups if g.name.startswith(groups)}
    points=[pad.matrix_world.inverted()@body.matrix_world@v.co for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in indices)>.55]
    halfx=max(v.co.x for v in pad.data.vertices);halfy=max(v.co.y for v in pad.data.vertices)
    selected=[p for p in points if abs(p.x)<halfx-.01 and abs(p.y)<halfy-.01]
    lowest=min(selected,key=lambda p:p.z)
    result[name]={'minimumSurfaceGap':lowest.z-thickness/2,'minimumLocal':list(lowest),'minimumWorld':list(pad.matrix_world@lowest),'maximumSurfaceGap':max(p.z for p in selected)-thickness/2}
    posterior=[(pad.matrix_world@p).z for p in points if .03<(pad.matrix_world@p).y<.33 and abs((pad.matrix_world@p).x)<.20]
    if posterior:result[name]['posteriorSeatMinimumWorldZ']=min(posterior)
rig=bpy.data.objects['Human Rig']
result['knees']={s:list(rig.matrix_world@rig.pose.bones[f'lowerleg01.{s}'].head) for s in ['L','R']}
result['elbows']={s:list(rig.matrix_world@rig.pose.bones[f'lowerarm01.{s}'].head) for s in ['L','R']}
print(json.dumps(result,indent=2))
