import bpy,json
from pathlib import Path
from mathutils.bvhtree import BVHTree
bpy.ops.wm.open_mainfile(filepath=str(Path.cwd()/'tools/exercise-renderer/output/anatomy-v3/ex-rosca-concentrada-halter.blend'))
s=bpy.context.scene;s.frame_set(60);bpy.context.view_layer.update();r=bpy.data.objects['Human Rig'];o=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
groups={g.index for g in o.vertex_groups if g.name.startswith('upperleg') and g.name.endswith('.L')}
ids={v.index for v in o.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.35}
polys=[list(p.vertices) for p in o.data.polygons if all(i in ids for i in p.vertices)]
tree=BVHTree.FromPolygons([o.matrix_world@v.co for v in o.data.vertices],polys)
joint=r.matrix_world@r.pose.bones['lowerarm01.L'].head
hit=tree.find_nearest(joint)
print(json.dumps({'elbow':list(joint),'nearestThigh':list(hit[0]),'distance':hit[3]}),flush=True)
