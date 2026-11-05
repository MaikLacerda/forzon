import bpy,sys,json
from pathlib import Path
root=Path(r'C:\Users\Maikon Lacerda\Documents\forzon\tools\exercise-renderer');sys.path.insert(0,str(root))
from anatomical_surfaces import add_muscle_surfaces
bpy.ops.wm.open_mainfile(filepath=str(root/'output/anatomy-v3/ex-crucifixo-reto-halteres.blend'))
scene=bpy.context.scene;body=bpy.data.objects['FORZON Human'];rig=bpy.data.objects['Human Rig']
spec=json.loads((root/'remaining-motion-specs.json').read_text(encoding='utf8'))['ex-crucifixo-reto-halteres']
created=add_muscle_surfaces(body,rig,spec);print('SURFACES',json.dumps(created))
p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='OPTIX';p.get_devices()
for d in p.devices:d.use=d.type=='OPTIX'
scene.cycles.device='GPU';scene.frame_set(30);scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'../../.tmp/video-style-review/rich-anatomy.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(root/'output/anatomy-v3/rich-pilot.blend'))
