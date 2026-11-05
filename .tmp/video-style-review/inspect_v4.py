import bpy,json
from pathlib import Path
root=Path.cwd()/'tools/exercise-renderer/output/anatomy-v3'
result={}
for key in ['ex-crucifixo-reto-halteres','ex-encolhimento-halteres','ex-abdominal-vacuum','ex-fight-shadow','ex-rosca-concentrada-halter']:
 bpy.ops.wm.open_mainfile(filepath=str(root/f'{key}.blend'))
 s=bpy.context.scene;r=bpy.data.objects['Human Rig'];body=bpy.data.objects['FORZON Human']
 data={'camera':list(s.camera.location),'scale':s.camera.data.ortho_scale,'rigParent':r.parent.name if r.parent else None,'objects':[o.name for o in s.objects if o.type in ['MESH','EMPTY']], 'shapes':[k.name for k in body.data.shape_keys.key_blocks] if body.data.shape_keys else [],'frames':[]}
 for frame in [1,s.frame_end//2,s.frame_end]:
  s.frame_set(frame);bpy.context.view_layer.update()
  data['frames'].append({'frame':frame,'bones':{n:list(r.matrix_world@r.pose.bones[n].head) for n in ['upperarm01.L','upperarm01.R','lowerarm01.L','lowerarm01.R','wrist.L','wrist.R']}})
 result[key]=data
(Path.cwd()/'.tmp/video-style-review/v4-inspect.json').write_text(json.dumps(result,indent=2))
