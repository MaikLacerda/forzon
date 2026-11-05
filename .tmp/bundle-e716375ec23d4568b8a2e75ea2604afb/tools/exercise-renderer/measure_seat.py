"""Measure candidate seat planes against evaluated pelvis surfaces over a cycle."""
import bpy,sys,json,math
from pathlib import Path
root=Path(__file__).resolve().parent;exercise=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=str(root/'output'/f'{exercise}.blend'))
scene=bpy.context.scene;source=bpy.data.objects['FORZON Human']
groups={g.index for g in source.vertex_groups if g.name.startswith(('upperleg','pelvis','spine'))}
indices=[v.index for v in source.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55]
options={(width,front,back,angle):[] for width in [.44,.52] for front in [-.05,.03] for back in [.35,.45] for angle in [0,10,15]}
for frame in range(scene.frame_start,scene.frame_end+1):
    scene.frame_set(frame);bpy.context.view_layer.update();body=source.evaluated_get(bpy.context.evaluated_depsgraph_get())
    points=[body.matrix_world@body.data.vertices[i].co for i in indices]
    for (width,front,back,angle),values in options.items():
        a=math.radians(angle)
        values.append(min(p.z*math.cos(a)-p.y*math.sin(a) for p in points if abs(p.x)<width/2-.01 and front+.01<p.y<back-.01))
print(json.dumps([{'width':key[0],'front':key[1],'back':key[2],'angle':key[3],'minProjection':min(values),'maxProjection':max(values),'variation':max(values)-min(values)} for key,values in sorted(options.items(),key=lambda kv:max(kv[1])-min(kv[1]))],indent=2))
