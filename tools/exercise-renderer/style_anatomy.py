"""Original anatomical restyling of existing FORZON scenes; never edits the source clip.

Only skin appearance, muscle relief, studio lighting and camera are changed.
The original animated skeleton, equipment and timing remain untouched.
"""
import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output' / 'anatomy-v3'
OUT.mkdir(exist_ok=True)
SPECS = json.loads((ROOT / 'motions.json').read_text(encoding='utf8'))
SPECS.update(json.loads((ROOT / 'remaining-motion-specs.json').read_text(encoding='utf8')))
parser = argparse.ArgumentParser()
parser.add_argument('--exercise', required=True, choices=list(SPECS))
parser.add_argument('--frame', type=int, default=30)
parser.add_argument('--video', action='store_true')
parser.add_argument('--engine', choices=['CYCLES', 'BLENDER_EEVEE_NEXT'], default='CYCLES')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
spec = SPECS[args.exercise]
exercise_id = spec['exerciseId']
source = ROOT / 'output' / f'{args.exercise}.blend'
bpy.ops.wm.open_mainfile(filepath=str(source))
scene = bpy.context.scene
body = bpy.data.objects['FORZON Human']
rig = bpy.data.objects['Human Rig']
mesh = body.data
mesh.update()
chest_z = rig.data.bones['breast.L'].tail_local.z + .025

# The source is a skin model. Remove nipple/areola relief in this muscle-study
# presentation, while retaining the broad pectoral volume and shoulder insertion.
bm=bmesh.new();bm.from_mesh(mesh)
patch=[]
for vertex in bm.verts:
    x,y,z=vertex.co
    if vertex.normal.y < -.15 and ((abs(x)-.095)/.047)**2+((z-(chest_z-.020))/.045)**2 < 1:
        patch.append(vertex)
for _ in range(30):
    bmesh.ops.smooth_vert(bm,verts=patch,factor=.85,use_axis_x=False,use_axis_y=True,use_axis_z=False)
bm.to_mesh(mesh);bm.free();mesh.update()
chest_z = rig.data.bones['breast.L'].tail_local.z + .025
shoulder_z = rig.data.bones['upperarm01.L'].head_local.z
memberships = {g.index: g.name for g in body.vertex_groups}

def smooth(a, b, x):
    t = max(0., min(1., (x - a) / (b - a)))
    return t*t*(3-2*t)

def bell(x, c, r):
    return math.exp(-((x-c)/r)**2)

limbs = []
for side in ['L', 'R']:
    for part in ['upperarm', 'lowerarm', 'upperleg', 'lowerleg']:
        start = rig.data.bones[f'{part}01.{side}'].head_local
        end = rig.data.bones[f'{part}02.{side}'].tail_local
        axis = end-start
        front = Vector((0, -1, 0))
        front = (front-axis.normalized()*front.dot(axis.normalized())).normalized()
        across = axis.normalized().cross(front)
        limbs.append((side, part, start.copy(), axis.copy(), front, across))

# Local muscle bellies taper before wrists, elbows, knees and ankles.
# Rest joint positions are never moved, preserving the authored kinematics.
details = mesh.attributes.get('AnatomicalDetail') or mesh.attributes.new(name='AnatomicalDetail', type='FLOAT', domain='POINT')
fibers = mesh.attributes.get('AnatomicalFiber') or mesh.attributes.new(name='AnatomicalFiber', type='FLOAT', domain='POINT')
regions = []
for vertex in mesh.vertices:
    weights = {}
    for group in vertex.groups:
        name = memberships.get(group.group, '')
        for part in ['upperarm', 'lowerarm', 'upperleg', 'lowerleg', 'shoulder']:
            if name.startswith(part): weights[part] = weights.get(part, 0) + group.weight
    regions.append(weights)

for vertex, region in zip(mesh.vertices, regions):
    x, y, z = vertex.co
    normal = vertex.normal.normalized()
    ax = abs(x)
    front = smooth(.05, .75, -normal.y)
    back = smooth(.05, .75, normal.y)
    amount, detail, phase = 0., 0., x*180
    if ax < .26 and chest_z-.39 < z < chest_z+.18:
        # Pectoral fan and sternal border, eight abdominal blocks, serratus slips.
        pec_radius = ((ax-.105)/.118)**2 + ((z-chest_z)/.086)**2
        pec = math.exp(-pec_radius*1.25)
        amount += front*(.035*pec - .008*bell(x, 0, .010)*bell(z, chest_z, .11))
        amount -= front*.007*bell(z, chest_z-.077+.07*(ax/.23)**2, .009)*bell(ax,.105,.105)
        abdominal = 0.
        for level in range(4):
            center = chest_z-.13-.060*level
            abdominal += .015*bell(ax,.043,.034)*bell(z,center,.023)
            amount -= front*.0035*bell(z,center-.029,.006)*bell(x,0,.085)
        amount += front*(abdominal-.005*bell(x,0,.007)*bell(z,chest_z-.22,.15))
        serratus = 0.
        for slip in range(4):
            line = chest_z-.065-.034*slip-.40*(ax-.16)
            serratus += .004*bell(z,line,.008)*bell(ax,.177,.035)
        amount += front*serratus
        # Posterior latissimus and spinal separation.
        amount += back*(.018*bell(ax,.105,.09)*bell(z,chest_z-.04,.16)-.007*bell(x,0,.012)*bell(z,chest_z,.22))
        detail = max(front*pec, front*bell(x,0,.13)*bell(z,chest_z-.23,.14), back*.7)
        phase = math.atan2(z-(chest_z+.065), .28-ax)*70
        if z < chest_z-.105: phase = x*420 + z*55
    selected = max(limbs, key=lambda r: region.get(r[1],0) if (x >= 0) == (r[0] == 'L') else -1)
    side, part, start, axis, local_front, across = selected
    membership = region.get(part, 0)
    if membership > .45:
        t = (vertex.co-start).dot(axis)/axis.length_squared
        radial = vertex.co-(start+axis*t)
        theta = math.atan2(radial.dot(across), radial.dot(local_front))
        belly = smooth(.07,.24,t)*(1-smooth(.72,.96,t))*smooth(.45,.85,membership)
        mass = {'upperarm':.033,'lowerarm':.012,'upperleg':.030,'lowerleg':.020}[part]
        lobes = 3 if part in ['upperarm','upperleg'] else 2
        amount += belly*(mass + .0045*math.cos(theta*lobes+.8*t))
        # Longitudinal fascicle direction and distinct heads of each muscle.
        phase = theta*24 + 4.5*math.sin(t*math.pi) + (2*t if part=='upperarm' else 0)
        detail = max(detail, belly)
    # Deltoid cap receives volume but the arm/torso insertion remains continuous.
    shoulder = max(region.get('shoulder',0),region.get('upperarm',0)*bell(z,shoulder_z-.065,.065))
    if shoulder > .35:
        amount += .026*shoulder
        phase = math.atan2(z-(shoulder_z-.16), ax-.22)*34
        detail = max(detail, shoulder)
    vertex.co += normal*amount
    # A muscle-study chest is a continuous pectoral surface, without the
    # source skin model's nipple topology protruding through the highlight.
    px,py,pz=vertex.co
    radius=((abs(px)-.104)/.123)**2+((pz-chest_z)/.108)**2
    if py < -.045 and radius < 1.0 and abs(px) < .225:
        muscle_surface=-.104-.055*max(0,1-radius)**.65
        blend=1-smooth(.65,1.0,radius)
        vertex.co.y=py*(1-blend)+muscle_surface*blend
        phase=math.atan2(pz-(chest_z+.065),.29-abs(px))*70
        detail=max(detail,1-smooth(.75,1.0,radius))
    details.data[vertex.index].value = min(1, detail)
    fibers.data[vertex.index].value = phase
mesh.update()

# Skin-model breast weights can pinch a muscle-study surface into a rosette
# during shoulder adduction. Anchor the pectoral belly to the thoracic segment;
# fade to the original shoulder weights at the lateral insertion.
thorax=body.vertex_groups.get('spine02')
for vertex in mesh.vertices:
    x,y,z=vertex.co
    radius=((abs(x)-.104)/.123)**2+((z-chest_z)/.108)**2
    if y < -.045 and radius < 1:
        factor=1-smooth(.50,1.0,radius)
        previous=[(g.group,g.weight) for g in vertex.groups]
        parent_weight=next((w for index,w in previous if index==thorax.index),0)
        for index,weight in previous:
            body.vertex_groups[index].add([vertex.index],weight*(1-factor),'REPLACE')
        thorax.add([vertex.index],parent_weight*(1-factor)+factor,'REPLACE')

# Emphasis follows the exercise's own target, with a sharper anatomical border.
mode = spec.get('highlight', 'chest' if args.exercise == 'bench-press' else 'biceps')
colors = mesh.color_attributes['MuscleRegion']
def glute_mask(point, normal):
    x,y,z=point
    back=smooth(.04,.65,normal.y)
    side=smooth(.1,.8,abs(normal.x))
    if exercise_id=='ex-cadeira-abdutora':
        return max(side,back*.45)*math.exp(-((abs(x)-.16)/.075)**4-((z-.965)/.085)**4)
    return max(back,side*.30)*math.exp(-(x/.21)**4-((z-.90)/.115)**4)

for vertex, region in zip(mesh.vertices, regions):
    x,y,z = vertex.co
    front = smooth(.04,.65,-vertex.normal.y)
    back = smooth(.04,.65,vertex.normal.y)
    if mode == 'chest':
        # Fan-shaped pectoralis major; exclude sternum, abdomen and anterior arm.
        outer = .225-.17*max(0,(chest_z+.08-z))
        lower = chest_z-.087+.045*(abs(x)/.22)**2
        mask = (1 if y < -.045 else 0)*smooth(.006,.021,abs(x))*(1-smooth(outer-.025,outer+.005,abs(x)))
        mask *= smooth(lower-.009,lower+.012,z)*(1-smooth(chest_z+.073,chest_z+.105,z))
    elif mode=='shoulders':
        side='L' if x>=0 else 'R'
        head=rig.data.bones[f'upperarm01.{side}'].head_local
        end=rig.data.bones[f'upperarm02.{side}'].tail_local
        center=head+(end-head)*.15+Vector((.035 if x>=0 else -.035,0,0))
        cap=math.exp(-((x-center.x)/.085)**4-((z-center.z)/.105)**4)
        cap*=smooth(abs(head.x)-.006,abs(head.x)+.030,abs(x))
        orientation=max(front,.9*abs(vertex.normal.x))
        if exercise_id.startswith('ex-elevacao-lateral'):orientation=max(front*.4,1.4*abs(vertex.normal.x))
        if exercise_id.startswith('ex-elevacao-frontal'):orientation=front
        if exercise_id=='ex-face-pull-corda':orientation=back
        mask=cap*min(1,orientation)
    elif mode in ['biceps','triceps','calves']:
        part='lowerleg' if mode=='calves' else 'upperarm'
        side='L' if x>=0 else 'R'
        limb=next(item for item in limbs if item[0]==side and item[1]==part)
        start,axis=limb[2],limb[3]
        t=(vertex.co-start).dot(axis)/axis.length_squared
        envelope=smooth(.08,.20,t)*(1-smooth(.75,.95,t))
        if mode=='calves':
            envelope=smooth(.08,.20,t)*(1-smooth(.55,.83,t))
            if exercise_id=='ex-panturrilha-sentado-soleo':envelope=smooth(.28,.45,t)*(1-smooth(.72,.91,t))
        mask=region.get(part,0)*envelope*(front if mode=='biceps' else back)
    elif mode=='glutes':mask=glute_mask(vertex.co,vertex.normal)
    elif exercise_id in ['ex-levantamento-terra-convencional','ex-extensao-lombar-banco']:
        mask=back*math.exp(-((abs(x)-.052)/.043)**4-((z-(chest_z-.14))/.21)**4)
    elif mode=='core':
        rectus=front*math.exp(-(x/.10)**4-((z-(chest_z-.20))/.15)**4)
        oblique=max(.4*front,abs(vertex.normal.x))*math.exp(-((abs(x)-.135)/.06)**4-((z-(chest_z-.20))/.14)**4)
        mask=oblique if exercise_id in ['ex-prancha-lateral-estatica','ex-russian-twist-anilha'] else max(rectus,.35*oblique)
    else:
        old = colors.data[vertex.index].color
        mask = max(0,min(1,(old[0]-.29)/(.66-.29)))
        mask = smooth(.08,.65,mask)
    colors.data[vertex.index].color = (.43*(1-mask)+.79*mask,.48*(1-mask)+.075*mask,.48*(1-mask)+.045*mask,1)

skin = mesh.materials[0]
nodes, links = skin.node_tree.nodes, skin.node_tree.links
bsdf = nodes.get('Principled BSDF')
bsdf.inputs['Roughness'].default_value = .72
bsdf.inputs['Specular IOR Level'].default_value = .15
for input_name in ['Subsurface Weight', 'Coat Weight']:
    if input_name in bsdf.inputs: bsdf.inputs[input_name].default_value = 0
color_node = nodes.new('ShaderNodeVertexColor'); color_node.layer_name = 'MuscleRegion'
phase_node = nodes.new('ShaderNodeAttribute'); phase_node.attribute_name = 'AnatomicalFiber'
mask_node = nodes.new('ShaderNodeAttribute'); mask_node.attribute_name = 'AnatomicalDetail'
def math_node(op, a, b=None):
    node=nodes.new('ShaderNodeMath');node.operation=op
    for i,value in enumerate([a] if b is None else [a,b]):
        if isinstance(value,(int,float)):node.inputs[i].default_value=value
        else:links.new(value,node.inputs[i])
    return node.outputs[0]
wave = math_node('POWER',math_node('ADD',math_node('MULTIPLY',math_node('SINE',phase_node.outputs['Fac']),.5),.5),5)
relief = math_node('MULTIPLY',wave,mask_node.outputs['Fac'])
bump = nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.50;bump.inputs['Distance'].default_value=.0009
links.new(relief,bump.inputs['Height']);links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
tint=nodes.new('ShaderNodeMixRGB');tint.blend_type='MULTIPLY';tint.inputs[0].default_value=1
links.new(color_node.outputs['Color'],tint.inputs[1]);links.new(math_node('SUBTRACT',1,math_node('MULTIPLY',relief,.10)),tint.inputs[2]);links.new(tint.outputs[0],bsdf.inputs['Base Color'])
for mod in body.modifiers:
    if mod.type == 'SUBSURF':mod.render_levels=2

# Preserve coverage with a neutral, light fitted short rather than a dark block.
cloth=bpy.data.objects.get('Fitted training shorts')
if cloth and mode != 'glutes':
    short_mat=cloth.data.materials[0]
    short_mat.diffuse_color=(.26,.31,.31,1)
    if short_mat.use_nodes:
        short_mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.26,.31,.31,1)
elif cloth and mode=='glutes':
    attribute=cloth.data.color_attributes.get('MuscleRegion')
    if attribute:
        for vertex in cloth.data.vertices:
            mask=max(0,min(1,glute_mask(vertex.co,vertex.normal)))
            attribute.data[vertex.index].color=(.26*(1-mask)+.79*mask,.31*(1-mask)+.075*mask,.31*(1-mask)+.045*mask,1)

scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.33
for light in [o for o in scene.objects if o.type=='LIGHT']:
    if light.location.y < -2:light.data.size=1.65;light.data.energy=330
if spec.get('family')=='fly' and spec.get('load')=='dumbbells':
    camera=scene.camera
    camera.location=(2.9,-1.2,2.3)
    camera.rotation_euler=(Vector((0,.10,.70))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=1.95

scene.render.engine=args.engine
if args.engine=='CYCLES':
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='OPTIX';prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='OPTIX'
    scene.cycles.device='GPU';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=scene.render.resolution_y=768
scene.render.resolution_percentage=100
scene.frame_set(args.frame)
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(OUT/f'{exercise_id}-frame-{args.frame}.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/f'{exercise_id}.blend'))
bpy.ops.render.render(write_still=True)
metadata={'exerciseId':exercise_id,'style':'anatomy-v3','styleRecipeSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'sourceSceneSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'frames':scene.frame_end-scene.frame_start+1,'fps':scene.render.fps,'width':768,'height':768,'highlight':mode,'productionStatus':'preview'}
if args.video:
    scene.render.image_settings.file_format='FFMPEG';scene.render.ffmpeg.format='MPEG4';scene.render.ffmpeg.codec='H264'
    scene.render.filepath=str(OUT/f'{exercise_id}.mp4')
    bpy.ops.render.render(animation=True)
    metadata['productionStatus']='rendered-awaiting-motion-and-visual-review'
(OUT/f'{exercise_id}.style.json').write_text(json.dumps(metadata,indent=2),encoding='utf8')
