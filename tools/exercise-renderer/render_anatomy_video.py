"""Encode the isolated anatomical scene after its transform audit passed."""
import argparse, hashlib, json, sys
from pathlib import Path
import bpy

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('exercise_id')
parser.add_argument('--version',choices=['anatomy-v3','anatomy-v4'],default='anatomy-v3')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
out=ROOT/'output'/args.version;scene_file=out/f'{args.exercise_id}.blend'
qa=json.loads((out/f'{args.exercise_id}.motion-qa.json').read_text(encoding='utf8'))
scene_hash=hashlib.sha256(scene_file.read_bytes()).hexdigest()
passed=qa.get('checksPassed') if args.version=='anatomy-v4' else qa.get('motionPreserved')
if not passed or qa['sceneSha256']!=scene_hash:raise RuntimeError('Matching motion audit required')
bpy.ops.wm.open_mainfile(filepath=str(scene_file));scene=bpy.context.scene
if scene.render.engine=='CYCLES':
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='OPTIX'
    scene.cycles.device='GPU'
scene.frame_set(scene.frame_end//2)
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/f'{args.exercise_id}-poster.png')
bpy.ops.render.render(write_still=True)
scene.render.image_settings.file_format='FFMPEG';scene.render.ffmpeg.format='MPEG4';scene.render.ffmpeg.codec='H264'
scene.render.filepath=str(out/f'{args.exercise_id}.mp4');bpy.ops.render.render(animation=True)
clip=bpy.data.movieclips.load(scene.render.filepath)
metadata={'exerciseId':args.exercise_id,'style':args.version,'frames':clip.frame_duration,'fps':clip.fps,'width':clip.size[0],'height':clip.size[1],'sceneSha256':scene_hash,'videoSha256':hashlib.sha256(Path(scene.render.filepath).read_bytes()).hexdigest(),'visualReviewRequired':True}
(out/f'{args.exercise_id}.video.json').write_text(json.dumps(metadata,indent=2),encoding='utf8')
