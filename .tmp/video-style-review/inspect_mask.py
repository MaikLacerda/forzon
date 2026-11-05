import bpy,json
from pathlib import Path
from mathutils import Vector
p=Path.cwd()/'tools/exercise-renderer/output/anatomy-v4/ex-cadeira-extensora.blend'
bpy.ops.wm.open_mainfile(filepath=str(p));r=bpy.data.objects['Human Rig'];o=bpy.data.objects['FORZON Human'];m=o.data
a=r.data.bones['upperleg01.L'].head_local;b=r.data.bones['upperleg02.L'].tail_local;axis=b-a
front=Vector((0,-1,0));front=(front-axis.normalized()*front.dot(axis.normalized())).normalized()
bins={i:[] for i in range(10)}
for v in m.vertices:
 if .10<v.co.x<.28:
  t=(v.co-a).dot(axis)/axis.length_squared
  radial=v.co-a-axis*t;f=radial.dot(front)/max(radial.length,.001)
  if 0<t<1 and f>.4:
   c=m.color_attributes['MuscleRegion'].data[v.index].color
   bins[int(t*10)].append(c[0])
print(json.dumps({'start':list(a),'end':list(b),'bins':{i:[len(v),round(sum(v)/len(v),3) if v else 0] for i,v in bins.items()}}),flush=True)
