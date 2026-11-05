"""Decode review frames from the actual encoded MP4 using Blender's sequencer."""
import argparse
import hashlib
import json
import sys
from array import array
from pathlib import Path
import bpy

root = Path(__file__).resolve().parent
motions = json.loads((root/"motions.json").read_text())
motions.update(json.loads((root/'remaining-motion-specs.json').read_text(encoding='utf8')))
parser = argparse.ArgumentParser()
parser.add_argument("exercise",choices=list(motions))
parser.add_argument('--extra-frames',type=int,nargs='*',default=[])
opts = parser.parse_args(sys.argv[sys.argv.index("--")+1:])
spec = motions[opts.exercise]
frames=sorted({1,spec['frames']//4,spec['frames']//2,3*spec['frames']//4,spec['frames'],*spec.get('reviewKeyFrames',[]),*opts.extra_frames})
if any(frame<1 or frame>spec['frames'] for frame in frames):parser.error('Review frame outside video range')
out = root/"output"/"review"
out.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.resolution_x = scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.view_settings.view_transform = "Standard"
scene.render.image_settings.file_format = "PNG"
scene.render.use_sequencer = True
scene.render.use_compositing = False
editor = scene.sequence_editor_create()
strips = editor.strips if hasattr(editor,"strips") else editor.sequences
strips.new_movie("Encoded clip",str(root/"output"/f"{opts.exercise}.mp4"),1,1)
pixel_hashes={}
for frame in frames:
    scene.frame_set(frame)
    scene.render.filepath = str(out/f"{opts.exercise}-{frame}.png")
    bpy.ops.render.render(write_still=True)
    decoded_image=bpy.data.images.load(scene.render.filepath,check_existing=False)
    pixels=array('f',[0])*len(decoded_image.pixels)
    decoded_image.pixels.foreach_get(pixels)
    pixel_hashes[frame]=hashlib.sha256(pixels.tobytes()).hexdigest()
    bpy.data.images.remove(decoded_image)
(out/f'{opts.exercise}.decoded.json').write_text(json.dumps({
    'exerciseId':opts.exercise,
    'videoSha256':hashlib.sha256((root/'output'/f'{opts.exercise}.mp4').read_bytes()).hexdigest(),
    'frames':frames,
    'framePixelSha256':pixel_hashes,
    'uniqueFrameCount':len(set(pixel_hashes.values()))
},indent=2),encoding='utf8')
