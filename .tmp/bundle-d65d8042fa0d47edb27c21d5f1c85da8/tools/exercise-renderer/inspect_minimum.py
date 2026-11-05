"""Report the actual lowest evaluated skin point and its rig influences."""
import bpy,sys,json
from pathlib import Path
root=Path(__file__).resolve().parent;exercise=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=str(root/'output'/f'{exercise}.blend'))
bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
v=min(body.data.vertices,key=lambda v:(body.matrix_world@v.co).z)
faces=[p.index for p in body.data.polygons if v.index in p.vertices]
visible={i for p in body.data.polygons for i in p.vertices}
surface=min((body.data.vertices[i] for i in visible),key=lambda v:(body.matrix_world@v.co).z)
print(json.dumps({'minimum':list(body.matrix_world@v.co),'faces':faces,'renderedMinimum':list(body.matrix_world@surface.co),'renderedGroups':[(body.vertex_groups[g.group].name,g.weight) for g in surface.groups],'groups':[(body.vertex_groups[g.group].name,g.weight) for g in v.groups]},indent=2))
