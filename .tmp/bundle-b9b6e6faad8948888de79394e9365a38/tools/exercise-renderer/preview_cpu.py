"""One CPU preview from an existing scene; never modifies production metadata."""
import bpy,sys
from pathlib import Path
root=Path(__file__).resolve().parent;exercise=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=str(root/'output'/f'{exercise}.blend'))
scene=bpy.context.scene;scene.frame_set(int(sys.argv[-1]) if sys.argv[-1].isdigit() else 60)
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=4
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'output'/f'{exercise}-cpu-preview.png')
bpy.ops.render.render(write_still=True)
