"""Report visible contact geometry in a saved full or probe scene."""
import argparse,json,sys
from pathlib import Path
import bpy
sys.path.insert(0,str(Path(__file__).resolve().parent))
from audit_lower_special import surface_points
p=argparse.ArgumentParser();p.add_argument('exercise');p.add_argument('--frame',type=int,default=1);p.add_argument('--probe',action='store_true')
a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'output'/f'{a.exercise}{"-probe" if a.probe else ""}.blend'))
bpy.context.scene.frame_set(a.frame);bpy.context.view_layer.update()
body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
result={}
for label,prefixes in [('feet',('foot.','toe')),('hands',('wrist.','finger'))]:
    points=surface_points(body,prefixes);point=min(points,key=lambda p:p.z)
    result[label]={'minimum':list(point),'maximumZ':max(p.z for p in points)}
print(json.dumps(result,indent=2))
