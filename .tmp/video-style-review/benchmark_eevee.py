import bpy
from pathlib import Path
root=Path(r'C:\Users\Maikon Lacerda\Documents\forzon')
bpy.ops.wm.open_mainfile(filepath=str(root/'tools/exercise-renderer/output/anatomy-v3/ex-crucifixo-reto-halteres.blend'))
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=64
scene.frame_set(30);scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'.tmp/video-style-review/eevee-preview.png');bpy.ops.render.render(write_still=True)
scene.frame_set(60);scene.render.filepath=str(root/'.tmp/video-style-review/eevee-preview-60.png');bpy.ops.render.render(write_still=True)
