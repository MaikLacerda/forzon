"""Decode actual MP4 keyframes for visual review, rather than re-rendering a scene."""
import argparse, hashlib, json, sys
from array import array
from pathlib import Path
import bpy

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('exercise_id')
parser.add_argument('--samples',type=int,default=5)
parser.add_argument('--version',choices=['anatomy-v3','anatomy-v4'],default='anatomy-v3')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
out=ROOT/'output'/args.version;review=out/'review';review.mkdir(exist_ok=True)
metadata=json.loads((out/f'{args.exercise_id}.video.json').read_text(encoding='utf8'))
video=out/f'{args.exercise_id}.mp4'
if hashlib.sha256(video.read_bytes()).hexdigest()!=metadata['videoSha256']:raise RuntimeError('MP4 changed after encoding')
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
scene.render.resolution_x=metadata['width'];scene.render.resolution_y=metadata['height'];scene.render.resolution_percentage=100
scene.render.fps=int(round(metadata['fps']));scene.view_settings.view_transform='Standard';scene.render.image_settings.file_format='PNG'
scene.render.use_sequencer=True;scene.render.use_compositing=False
scene.sequence_editor_create().strips.new_movie('Encoded anatomical demonstration',str(video),1,1)
hashes={}
frames=sorted({1,metadata['frames']//4,metadata['frames']//2,3*metadata['frames']//4,metadata['frames']}) if args.samples==5 else sorted({1+round(i*(metadata['frames']-1)/(max(2,min(args.samples,metadata['frames']))-1)) for i in range(max(2,min(args.samples,metadata['frames'])))})
for frame in frames:
    scene.frame_set(frame);scene.render.filepath=str(review/f'{args.exercise_id}-{frame}.png');bpy.ops.render.render(write_still=True)
    image=bpy.data.images.load(scene.render.filepath,check_existing=False);pixels=array('f',[0])*len(image.pixels);image.pixels.foreach_get(pixels)
    hashes[frame]=hashlib.sha256(pixels.tobytes()).hexdigest();bpy.data.images.remove(image)
if len(set(hashes.values()))<3:raise RuntimeError('Encoded demonstration has insufficient distinct frames')
(review/f'{args.exercise_id}.decoded{ "-detailed" if args.samples!=5 else ""}.json').write_text(json.dumps({'exerciseId':args.exercise_id,'videoSha256':metadata['videoSha256'],'framePixelSha256':hashes,'uniqueFrameCount':len(set(hashes.values()))},indent=2),encoding='utf8')

