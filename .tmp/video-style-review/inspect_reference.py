import bpy,json
from pathlib import Path
src=Path(r'C:\Users\Maikon Lacerda\Downloads\dumbbell-chest-fly.mp4')
out=Path(r'C:\Users\Maikon Lacerda\Documents\forzon\.tmp\video-style-review')
bpy.ops.wm.read_factory_settings(use_empty=True)
clip=bpy.data.movieclips.load(str(src))
w,h=clip.size; duration=clip.frame_duration
print('REFERENCE_METADATA',json.dumps({'width':w,'height':h,'frames':duration,'fps':clip.fps}))
scene=bpy.context.scene
scale=min(1,1000/max(w,h));scene.render.resolution_x=int(w*scale);scene.render.resolution_y=int(h*scale);scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard';scene.render.image_settings.file_format='PNG';scene.render.use_sequencer=True;scene.render.use_compositing=False
editor=scene.sequence_editor_create();editor.strips.new_movie('Reference for visual analysis',str(src),1,1)
for i,frame in enumerate([1,max(1,duration//4),max(1,duration//2),max(1,3*duration//4)]):
 scene.frame_set(frame);scene.render.filepath=str(out/f'reference-{i}.png');bpy.ops.render.render(write_still=True)
