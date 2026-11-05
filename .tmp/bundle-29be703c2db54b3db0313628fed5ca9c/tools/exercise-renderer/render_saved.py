"""Encode a scene only after its mechanical audit has passed."""
import argparse,json,sys,hashlib
from pathlib import Path
import bpy
root=Path(__file__).resolve().parent
specs=json.loads((root/'remaining-motion-specs.json').read_text(encoding='utf8'))
parser=argparse.ArgumentParser();parser.add_argument('exercise',choices=list(specs))
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);spec=specs[args.exercise]
out=root/'output'
qa=json.loads((out/f'{args.exercise}.qa.json').read_text(encoding='utf8'))
if not qa.get('mechanicalChecksPassed') or qa['exerciseId']!=spec['exerciseId']:
    raise RuntimeError('Mechanical audit required before encoding')
scene_hash=hashlib.sha256((out/f'{args.exercise}.blend').read_bytes()).hexdigest()
if qa.get('sceneSha256')!=scene_hash:raise RuntimeError('Scene changed after audit; rerun mechanical audit')
bpy.ops.wm.open_mainfile(filepath=str(out/f'{args.exercise}.blend'))
scene=bpy.context.scene
if scene.render.engine=='CYCLES':
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='OPTIX';prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='OPTIX'
    scene.cycles.device='GPU'
scene.frame_set(spec['frames']//(4 if spec.get('alternating') else 2))
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(out/f'{args.exercise}-poster.png')
bpy.ops.render.render(write_still=True)
scene.render.image_settings.file_format='FFMPEG'
scene.render.ffmpeg.format='MPEG4';scene.render.ffmpeg.codec='H264'
scene.render.filepath=str(out/f'{args.exercise}.mp4')
bpy.ops.render.render(animation=True)
clip=bpy.data.movieclips.load(scene.render.filepath)
metadata={'exerciseId':spec['exerciseId'],'width':clip.size[0],'height':clip.size[1],
          'frames':clip.frame_duration,'fps':clip.fps,'sceneSha256':scene_hash}
(out/f'{args.exercise}.video.json').write_text(json.dumps(metadata,indent=2),encoding='utf8')
