"""FORZON independent video prototype. Run with Blender --background --python.

Human geometry, rig, weights and phenotype deltas: MakeHuman core assets (CC0).
No commercial sample video is used as input to this renderer.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector, Matrix, Quaternion

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUT = ROOT / "output"
OUT.mkdir(exist_ok=True)
MOTIONS = json.loads((ROOT/"motions.json").read_text())
if (ROOT/"remaining-motion-specs.json").exists():
    MOTIONS.update(json.loads((ROOT/"remaining-motion-specs.json").read_text()))
args = argparse.ArgumentParser()
args.add_argument("--video", action="store_true")
args.add_argument("--scene-only",action="store_true")
args.add_argument("--probe",action="store_true",help="Author one pose without replacing the complete scene")
args.add_argument("--frame", type=int, default=30)
args.add_argument("--exercise", choices=list(MOTIONS), default="barbell-curl")
args.add_argument("--closeup", action="store_true")
args.add_argument("--engine", choices=["CYCLES","BLENDER_EEVEE_NEXT"], default="CYCLES")
args.add_argument("--device", choices=["AUTO","CPU"], default="AUTO")
opts = args.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
if opts.probe and opts.video:args.error('--probe cannot encode a complete video')
BENCH = opts.exercise == "bench-press"
SPEC = MOTIONS[opts.exercise]
CUSTOM = bool(SPEC.get("family"))

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Parse directly to preserve the original vertex indices used by skin weights.
vertices, faces = [], []
group = None
for line in (ASSETS / "base.obj").read_text().splitlines():
    fields = line.split()
    if not fields:
        continue
    if fields[0] == "v":
        vertices.append(Vector(tuple(map(float, fields[1:4]))))
    elif fields[0] == "g":
        group = fields[1]
    elif fields[0] == "f" and group == "body":
        faces.append([int(v.split("/")[0]) - 1 for v in fields[1:]])

for target_name, factor in json.loads((ROOT/"physique.json").read_text()).items():
    target = ASSETS/f"{target_name}.target"
    for line in target.read_text().splitlines():
        fields = line.split()
        if len(fields) == 4 and not line.startswith("#"):
            vertices[int(fields[0])] += Vector(tuple(map(float, fields[1:]))) * factor

floor = min(vertices[i].y for face in faces for i in face)
def convert(v):
    return Vector((v.x * .1, -v.z * .1, (v.y - floor) * .1))

converted = [convert(v) for v in vertices]
mesh = bpy.data.meshes.new("MakeHuman_CC0")
mesh.from_pydata(converted, [], faces)
mesh.update()
body = bpy.data.objects.new("FORZON Human", mesh)
bpy.context.collection.objects.link(body)
for face in mesh.polygons:
    face.use_smooth = True

rig_data = json.loads((ASSETS / "default.mhskel").read_text())
weights = json.loads((ASSETS / "default_weights.mhw").read_text())["weights"]
def joint(name):
    indices = rig_data["joints"][name]
    return sum((converted[i] for i in indices), Vector()) / len(indices)

# Use skeletal landmarks, rather than an assumed body height, for the chest.
PEC_CENTER_Z = joint(rig_data["bones"]["breast.L"]["tail"]).z+.025
ABS_LEVELS = [PEC_CENTER_Z-.12,PEC_CENTER_Z-.185,PEC_CENTER_Z-.25]

armature = bpy.data.armatures.new("Human Skeleton")
rig = bpy.data.objects.new("Human Rig", armature)
rig["exercise_id"] = MOTIONS[opts.exercise]["exerciseId"]
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
for name, spec in rig_data["bones"].items():
    bone = armature.edit_bones.new(name)
    bone.head, bone.tail = joint(spec["head"]), joint(spec["tail"])
    if (bone.tail - bone.head).length < .0001:
        bone.tail.z += .001
for name, spec in rig_data["bones"].items():
    if spec["parent"]:
        armature.edit_bones[name].parent = armature.edit_bones[spec["parent"]]
bpy.ops.object.mode_set(mode="OBJECT")

for name, entries in weights.items():
    vg = body.vertex_groups.new(name=name)
    for index, weight in entries:
        vg.add([index], weight, "REPLACE")

# An original surface sculpt clarifies the main superficial muscle masses.
# This is an athletic illustration, not a segmented medical anatomy atlas.
def gaussian(value, center, radius):
    return math.exp(-((value-center)/radius)**2)

for vertex in mesh.vertices:
    x,y,z = vertex.co
    normal = vertex.normal.normalized()
    front = max(0,min(1,(-normal.y-.12)/.7))
    back = max(0,min(1,(normal.y-.12)/.7))
    ax = abs(x)
    displacement = 0
    if .99 < z < PEC_CENTER_Z+.15 and ax < .225:
        # Paired pectoral bellies, lower border and central sternal separation.
        pec = .012*gaussian(ax,.095,.082)*gaussian(z,PEC_CENTER_Z,.075)
        pec -= .005*gaussian(z,PEC_CENTER_Z-.07+.05*(ax/.21)**2,.012)*gaussian(ax,.10,.095)
        sternum = .004*gaussian(x,0,.009)*gaussian(z,PEC_CENTER_Z,.115)
        abs_relief = sum(.012*gaussian(ax,.037,.03)*gaussian(z,level,.025) for level in ABS_LEVELS)
        linea_alba = .005*gaussian(x,0,.006)*gaussian(z,ABS_LEVELS[1],.115)
        transverse = sum(.0045*gaussian(z,level-.032,.008)*gaussian(x,0,.075) for level in ABS_LEVELS)
        displacement += front*(pec-sternum+abs_relief-linea_alba-transverse)
        # Spinal groove and paired back masses retain a readable posterior view.
        displacement += back*(.007*gaussian(ax,.075,.055)*gaussian(z,1.30,.19)-.004*gaussian(x,0,.009)*gaussian(z,1.31,.18))
    if .32 < z < .88 and ax < .29:
        # Quadriceps and tibial/calf surface relief; keep knee/ankle landmarks.
        quad = .006*gaussian(ax,.13,.065)*gaussian(z,.64,.16)
        quad -= .003*gaussian(ax,.13,.012)*gaussian(z,.65,.13)
        displacement += front*quad
    vertex.co += normal*displacement
mesh.update()
modifier = body.modifiers.new("Skin deformation", "ARMATURE")
modifier.object = rig
modifier.use_deform_preserve_volume = True
subdivision = body.modifiers.new("Surface smoothing", "SUBSURF")
subdivision.levels = 1
subdivision.render_levels = 1

def material(name, color, roughness=.6):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    return mat

skin = material("Matte grey", (.29, .32, .34))
active = material("Biceps region", (.66, .065, .045))
shorts = material("Training shorts", (.12, .16, .18))
metal = material("Equipment", (.16, .18, .2), .3)
body.data.materials.clear()
for mat in [skin, active, shorts]:
    body.data.materials.append(mat)
# A fitted shell gives the shorts real, straight hems instead of a jagged
# material boundary across the body's polygon grid. Deform weights are retained.
clothing = body.copy()
clothing.data = body.data.copy()
clothing.name = "Fitted training shorts"
bpy.context.collection.objects.link(clothing)
bm = bmesh.new()
bm.from_mesh(clothing.data)
for height, normal in [(1.015,(0,0,1)),(.775,(0,0,-1))]:
    bmesh.ops.bisect_plane(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
        plane_co=(0,0,height), plane_no=normal, clear_outer=True, dist=.00001)
bm.to_mesh(clothing.data)
bm.free()
clothing.data.materials.clear()
clothing.data.materials.append(shorts)
for face in clothing.data.polygons:
    face.material_index=0
shell = clothing.modifiers.new("Cloth thickness", "SOLIDIFY")
shell.thickness, shell.offset = .004, 1

# Smooth color falloff avoids painting a jagged polygon boundary on the arm.
colors = mesh.color_attributes.new(name="MuscleRegion", type="FLOAT_COLOR", domain="POINT")
def smooth(lo, hi, x):
    t = max(0, min(1, (x-lo)/(hi-lo)))
    return t*t*(3-2*t)
for vertex in mesh.vertices:
    x, y, z = vertex.co
    mask = smooth(.20,.26,abs(x)) * (1-smooth(.35,.40,abs(x)))
    mask *= smooth(1.10,1.17,z) * (1-smooth(1.40,1.47,z))
    mask *= 1-smooth(-.05,.04,y)
    if BENCH:
        pec_radius = math.sqrt(((abs(x)-.105)/.115)**2+((z-PEC_CENTER_Z)/.085)**2)
        mask = (1-smooth(.70,1.05,pec_radius))*max(0,min(1,(-vertex.normal.y-.1)/.7))
    colors.data[vertex.index].color = tuple(.29*(1-mask)+.66*mask if j==0 else [.32,.34][j-1]*(1-mask)+[.065,.045][j-1]*mask for j in range(3))+(1,)
node = skin.node_tree.nodes.new("ShaderNodeVertexColor")
node.layer_name = "MuscleRegion"
skin.node_tree.links.new(node.outputs["Color"], skin.node_tree.nodes.get("Principled BSDF").inputs["Base Color"])

# Fine illustrated striations follow each limb's rest-space axis and fan across
# the chest. Rest-space attributes deform with the skin rather than sliding.
fiber_phase = mesh.attributes.new(name="FiberPhase",type="FLOAT",domain="POINT")
fiber_mask = mesh.attributes.new(name="FiberMask",type="FLOAT",domain="POINT")
fiber_phase = mesh.attributes["FiberPhase"]
fiber_mask = mesh.attributes["FiberMask"]
limb_regions = []
for side in ["L","R"]:
    for part in ["upperarm","lowerarm","upperleg","lowerleg"]:
        first,last = f"{part}01.{side}",f"{part}02.{side}"
        start = joint(rig_data["bones"][first]["head"])
        end = joint(rig_data["bones"][last]["tail"])
        axis = (end-start).normalized()
        front_axis = Vector((0,-1,0))
        front_axis = (front_axis-axis*front_axis.dot(axis)).normalized()
        cross_axis = axis.cross(front_axis).normalized()
        membership = {}
        for name in [first,last]:
            for index,weight in weights.get(name,[]):
                membership[index] = membership.get(index,0)+weight
        limb_regions.append((start,end,front_axis,cross_axis,membership))
for vertex in mesh.vertices:
    x,y,z = vertex.co
    ax = abs(x)
    phase,mask = 0,0
    frontal = max(0,min(1,(-vertex.normal.y-.1)/.7))
    if ax < .225 and 1.0 < z < PEC_CENTER_Z+.12:
        if z > PEC_CENTER_Z-.085:
            phase = math.atan2(ax-.23,z-(PEC_CENTER_Z+.07))*48
            pec_radius = math.sqrt(((ax-.105)/.115)**2+((z-PEC_CENTER_Z)/.085)**2)
            mask = 1-smooth(.75,1.05,pec_radius)
        else:
            phase = x*1250
            mask = smooth(1.0,1.035,z)*(1-smooth(PEC_CENTER_Z-.12,PEC_CENTER_Z-.085,z))
        mask *= frontal*(1-smooth(.18,.225,ax))
    region = max(limb_regions,key=lambda r:r[4].get(vertex.index,0))
    membership = region[4].get(vertex.index,0)
    if membership > .55:
        start,end,front_axis,cross_axis,_ = region
        axis = end-start
        t = (vertex.co-start).dot(axis)/axis.length_squared
        radial = vertex.co-(start+axis*t)
        phase = math.atan2(radial.dot(cross_axis),radial.dot(front_axis))*32
        mask = smooth(.04,.18,t)*(1-smooth(.82,.98,t))*smooth(.55,.85,membership)
    fiber_phase.data[vertex.index].value = phase+.55*math.sin(z*65+ax*40)
    fiber_mask.data[vertex.index].value = mask

nodes,links = skin.node_tree.nodes,skin.node_tree.links
phase_node = nodes.new("ShaderNodeAttribute")
phase_node.attribute_name = "FiberPhase"
mask_node = nodes.new("ShaderNodeAttribute")
mask_node.attribute_name = "FiberMask"
def shader_math(operation,a,b=None):
    operation_node = nodes.new("ShaderNodeMath")
    operation_node.operation = operation
    for index,value in enumerate([a,b] if b is not None else [a]):
        if isinstance(value,(int,float)):
            operation_node.inputs[index].default_value = value
        else:
            links.new(value,operation_node.inputs[index])
    return operation_node.outputs[0]
wave = shader_math("POWER",shader_math("ADD",shader_math("MULTIPLY",shader_math("SINE",phase_node.outputs["Fac"]),.5),.5),4)
strands = shader_math("MULTIPLY",wave,mask_node.outputs["Fac"])
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = .35
bump.inputs["Distance"].default_value = .00045
links.new(strands,bump.inputs["Height"])
links.new(bump.outputs["Normal"],nodes.get("Principled BSDF").inputs["Normal"])
tint = nodes.new("ShaderNodeMixRGB")
tint.blend_type = "MULTIPLY"
tint.inputs[0].default_value = 1
links.new(node.outputs["Color"],tint.inputs[1])
links.new(shader_math("SUBTRACT",1,shader_math("MULTIPLY",strands,.075)),tint.inputs[2])
links.new(tint.outputs[0],nodes.get("Principled BSDF").inputs["Base Color"])

def aim(name, direction):
    pb = rig.pose.bones[name]
    # Set global orientation, then derive the local pose including the rest matrix.
    rest_rotation = pb.bone.matrix_local.to_quaternion()
    world_rotation = Vector((0, 1, 0)).rotation_difference(Vector(direction).normalized())
    if pb.parent:
        parent_rest = pb.parent.bone.matrix_local.to_quaternion()
        parent_pose = pb.parent.matrix.to_quaternion()
        local = rest_rotation.inverted() @ parent_rest @ parent_pose.inverted() @ world_rotation
    else:
        local = rest_rotation.inverted() @ world_rotation
    pb.rotation_mode = "QUATERNION"
    pb.rotation_quaternion = local
    bpy.context.view_layer.update()

def orient(name, world_rotation):
    pb = rig.pose.bones[name]
    rest_rotation = pb.bone.matrix_local.to_quaternion()
    parent_rest = pb.parent.bone.matrix_local.to_quaternion()
    parent_pose = pb.parent.matrix.to_quaternion()
    pb.rotation_mode = "QUATERNION"
    pb.rotation_quaternion = rest_rotation.inverted() @ parent_rest @ parent_pose.inverted() @ world_rotation
    bpy.context.view_layer.update()

def aim_without_twist(name, direction):
    pb = rig.pose.bones[name]
    current = (pb.tail-pb.head).normalized()
    orient(name, current.rotation_difference(Vector(direction).normalized()) @ pb.matrix.to_quaternion())

def close_hand(side, direction, neutral_fraction=0, pronated=False, across_override=None):
    """Orient the palm and curl each digit around the implement axis."""
    long = Vector(direction).normalized()
    across = Vector((1 if side == "L" else -1, 0, 0))
    if across_override is not None:
        across = Vector(across_override)
    wrist = rig.pose.bones[f"wrist.{side}"]
    index = rig.data.bones[f"finger2-1.{side}"].head_local
    pinky = rig.data.bones[f"finger5-1.{side}"].head_local
    middle = rig.data.bones[f"finger3-1.{side}"].head_local
    rest_long = (middle-wrist.bone.head_local).normalized()
    rest_across = pinky-index
    rest_across = (rest_across-rest_long*rest_across.dot(rest_long)).normalized()
    rest_basis = Matrix((rest_across, rest_long, rest_across.cross(rest_long))).transposed()
    target_across = (across-long*across.dot(long)).normalized()
    if target_across.length<.01:
        alternate = Vector((0,1,0))
        target_across = (alternate-long*alternate.dot(long)).normalized()
    # Rotate around the forearm for hammer grip or the supination phase of an
    # alternating curl; palm orientation and dumbbell orientation stay coupled.
    sign = 1 if side == "L" else -1
    neutral_across = Vector((0,long.z,-long.y)).normalized()*sign
    angle = neutral_fraction*math.pi/2
    target_across = (Quaternion(long,angle*sign)@target_across if CUSTOM else
                     target_across*math.cos(angle)+neutral_across*math.sin(angle))
    if pronated:
        target_across.negate()
    target_basis = Matrix((target_across, long, target_across.cross(long))).transposed()
    mapping = target_basis @ rest_basis.inverted()
    orient(f"wrist.{side}", (mapping @ wrist.bone.matrix_local.to_3x3()).to_quaternion())
    palm = -sign*target_across.cross(long).normalized()
    bases = [rig.pose.bones[f"finger{digit}-1.{side}"].head.copy() for digit in range(2,6)]
    # Press a bar through the heel of the palm rather than its fingertips.
    heel_grip=CUSTOM and ((SPEC.get('family')=='press' and SPEC.get('load') in ['barbell','machine']) or (SPEC.get('family')=='overhead_press' and SPEC.get('load')=='barbell'))
    center = sum(bases, Vector())/4 + long*(-.025 if heel_grip else .017) + palm*.021
    for digit in range(2,6):
        for segment, angle in enumerate([10,95,180], start=1):
            a = math.radians(angle)
            aim_without_twist(f"finger{digit}-{segment}.{side}", long*math.cos(a)+palm*math.sin(a))
    # The thumb opposes the four fingers, rather than extending away from the bar.
    for segment in [1,2,3]:
        pb = rig.pose.bones[f"finger1-{segment}.{side}"]
        target = center - long*.006
        aim_without_twist(pb.name, target-pb.head)
    return center, target_across

def solve_limb(upper,lower,side,target,pole):
    """Analytic two-segment IK, respecting the split MakeHuman limb bones."""
    start = rig.pose.bones[f"{upper}01.{side}"].head.copy()
    upper_length = sum(rig.data.bones[f"{upper}{part}.{side}"].length for part in ["01","02"])
    lower_length = sum(rig.data.bones[f"{lower}{part}.{side}"].length for part in ["01","02"])
    delta = target-start
    distance = max(.001,min(delta.length,upper_length+lower_length-.001))
    direction = delta.normalized()
    pole = Vector(pole)
    perpendicular = (pole-direction*pole.dot(direction)).normalized()
    along = (upper_length**2-lower_length**2+distance**2)/(2*distance)
    height = math.sqrt(max(0,upper_length**2-along**2))
    middle = start+direction*along+perpendicular*height
    for part in ["01","02"]:
        aim(f"{upper}{part}.{side}",middle-start)
    actual_middle = rig.pose.bones[f"{lower}01.{side}"].head.copy()
    for part in ["01","02"]:
        aim(f"{lower}{part}.{side}",target-actual_middle)
    return (target-actual_middle).normalized()

def cylinder(name, radius, depth, location, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(metal)
    bevel = obj.modifiers.new("Soft edges", "BEVEL")
    bevel.width, bevel.segments = .006, 3
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj

# The first movement is a standing straight-bar curl. Every new exercise must
# receive its own motion specification and visual review before publication.
equipment = []
def make_weight(name, length, radius, separation):
    handle = cylinder(name, .012, length, (0,0,0), (0,math.pi/2,0))
    # Bake the initial cylinder rotation so the object's local X is the handle axis.
    bpy.context.view_layer.objects.active = handle
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    for x in [-separation,separation]:
        plate = cylinder("Weight plate", radius, .045, (x,0,0), (0,math.pi/2,0))
        plate.parent = handle
        plate.matrix_parent_inverse = handle.matrix_world.inverted()
    return handle
if CUSTOM:
    pass
elif opts.exercise in ["barbell-curl","bench-press"]:
    equipment.append(make_weight("Straight bar", 1.8 if BENCH else 1.12, .18 if BENCH else .105, .73 if BENCH else .48))
else:
    equipment.extend(make_weight(f"Dumbbell {side}", .31, .075, .12) for side in ["L","R"])
anchors = {}
for side in ["L","R"]:
    anchor = bpy.data.objects.new(f"Grip.{side}",None)
    bpy.context.collection.objects.link(anchor)
    anchors[side] = anchor

scene = bpy.context.scene
engine = None
if CUSTOM:
    sys.path.insert(0,str(ROOT))
    from motion_engine import MotionEngine
    engine = MotionEngine(dict(rig=rig,body=body,clothing=clothing,metal=metal,shorts=shorts,
        material=material,aim=aim,orient=orient,aim_without_twist=aim_without_twist,
        solve_limb=solve_limb,close_hand=close_hand,anchors=anchors),SPEC)
if BENCH:
    def bench_box(name,location,scale,mat):
        bpy.ops.mesh.primitive_cube_add(size=1,location=location)
        obj = bpy.context.object
        obj.name = name
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        obj.data.materials.append(mat)
        bevel = obj.modifiers.new("Rounded corners","BEVEL")
        bevel.width,bevel.segments = .018,4
        return obj
    bench_box("Flat bench pad",(0,.15,.47),(.32,1.25,.08),shorts)
    for y in [-.29,.58]:
        bench_box("Bench support",(0,y,.23),(.07,.08,.43),metal)
        bench_box("Bench base",(0,y,.025),(.55,.12,.05),metal)
deformation_modifiers = list(body.modifiers)+list(clothing.modifiers)
for mod in deformation_modifiers:
    mod.show_viewport = False
total_frames = MOTIONS[opts.exercise]["frames"]
scene.frame_start, scene.frame_end, scene.render.fps = 1, total_frames, 24
for frame in ([opts.frame] if opts.probe else range(1, total_frames+1)):
    t = (frame - 1) / (total_frames-1)
    for pb in rig.pose.bones:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion.identity()
        pb.location = (0,0,0)
    bpy.context.view_layer.update()
    if engine:
        engine.pose(t)
    grips = []
    for index, side in enumerate([] if CUSTOM else ["L", "R"]):
        phase = (t*2-index*.5)%1 if opts.exercise == "alternating-curl" else t
        # Alternating curls have one moving arm at a time, not two mirrored curls.
        depth = (1-math.cos(2*math.pi*phase))/2
        if opts.exercise == "alternating-curl":
            local_t = t*2-index
            depth = (1-math.cos(2*math.pi*local_t))/2 if 0 <= local_t <= 1 else 0
        flexion = math.radians(12+112*depth)
        if BENCH:
            sign = 1 if side == "L" else -1
            desired_grip = Vector((sign*.36,-.62+.47*depth,1.39-.13*depth))
            wrist_target = desired_grip-Vector((0,-.11,-.02))
            for iteration in range(5):
                direction = solve_limb("upperarm","lowerarm",side,wrist_target,(sign*.40,.75,-.3))
                center,axis = close_hand(side,direction,pronated=True)
                wrist_target += desired_grip-center
            foot_bone = rig.data.bones[f"foot.{side}"]
            # Counter-rotate the supine body frame so the soles retain their
            # original standing orientation, rather than pointing the toes up.
            ankle_y = .62-foot_bone.head_local.z
            solve_limb("upperleg","lowerleg",side,Vector((sign*.13,ankle_y,.40)),(0,-.2,-1))
            orient(f"foot.{side}",Quaternion((1,0,0),math.pi/2)@foot_bone.matrix_local.to_quaternion())
        else:
            aim(f"upperarm01.{side}", (0, -.15, -1))
            direction = Vector((0,-math.sin(flexion),-math.cos(flexion)))
            aim(f"lowerarm01.{side}", direction)
            neutral_fraction = 1 if opts.exercise == "hammer-curl" else (1-smooth(.05,.6,depth) if opts.exercise == "alternating-curl" else 0)
            center, axis = close_hand(side, direction, neutral_fraction)
        grips.append(center)
        anchors[side].location = center
        anchors[side].rotation_mode = "QUATERNION"
        anchors[side].rotation_quaternion = Vector((1,0,0)).rotation_difference(axis)
        anchors[side].keyframe_insert("location",frame=frame)
        anchors[side].keyframe_insert("rotation_quaternion",frame=frame)
        if opts.exercise not in ["barbell-curl","bench-press"]:
            weight = equipment[index]
            weight.location = center
            weight.rotation_mode = "QUATERNION"
            weight.rotation_quaternion = Vector((1,0,0)).rotation_difference(axis)
            weight.keyframe_insert("location", frame=frame)
            weight.keyframe_insert("rotation_quaternion", frame=frame)
    for pb in rig.pose.bones:
        pb.keyframe_insert("rotation_quaternion", frame=frame)
        if CUSTOM:
            pb.keyframe_insert("location",frame=frame)
    if engine:
        engine.keyframe(frame)
    if opts.exercise in ["barbell-curl","bench-press"]:
        equipment[0].location = sum(grips,Vector())/2
        equipment[0].keyframe_insert("location", frame=frame)
for mod in deformation_modifiers:
    mod.show_viewport = True

if BENCH:
    human_root = bpy.data.objects.new("Supine body frame",None)
    bpy.context.collection.objects.link(human_root)
    human_root.rotation_euler.x = -math.pi/2
    human_root.location = (0,-1.1,.62)
    for obj in [rig,body,clothing,equipment[0],*anchors.values()]:
        obj.parent = human_root

ground = material("White studio", (.88, .88, .88))
bpy.ops.mesh.primitive_plane_add(size=200)
bpy.context.object.data.materials.append(ground)
bpy.context.object.is_shadow_catcher = True
bpy.context.object.hide_render = False
scene.render.film_transparent = True
scene.use_nodes = True
nodes = scene.node_tree.nodes
nodes.clear()
layers = nodes.new("CompositorNodeRLayers")
white = nodes.new("CompositorNodeAlphaOver")
white.inputs[1].default_value = (1,1,1,1)
scene.node_tree.links.new(layers.outputs["Image"],white.inputs[2])
composite = nodes.new("CompositorNodeComposite")
scene.node_tree.links.new(white.outputs[0],composite.inputs[0])
scene.world.use_nodes = True
scene.world.node_tree.nodes.get("Background").inputs["Color"].default_value = (.8,.8,.8,1)
scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = .5
def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()
for position, energy, size in [((3,-3,4), 260, 2.5), ((-3,-1,3), 80, 3), ((0,3,4), 140, 3)]:
    bpy.ops.object.light_add(type="AREA", location=position)
    light = bpy.context.object
    light.data.energy, light.data.shape, light.data.size = energy, "DISK", size
    point_at(light, (0, 0, 1))
bpy.ops.object.camera_add(location=(2.7, -4.5, 2.15))
camera = bpy.context.object
point_at(camera, (0, -.05, .98))
camera.data.type, camera.data.ortho_scale = "ORTHO", 2.25
if engine:
    camera.location = engine.camera_location
    point_at(camera,engine.camera_target)
    camera.data.ortho_scale = engine.camera_scale
    if SPEC.get("locomotion"):
        for obj in [camera,*[obj for obj in bpy.context.scene.objects if obj.type=="LIGHT"]]:
            obj.parent = engine.follow
if BENCH:
    camera.location = (2.5,-3.3,2.25)
    point_at(camera,(0,-.05,.70))
    camera.data.ortho_scale = 2.5
if opts.closeup:
    camera.location = (1.8,-4,1.6)
    point_at(camera,(0,-.17,1.2))
    camera.data.ortho_scale = .9
scene.camera = camera
scene.render.engine = opts.engine
scene.render.use_persistent_data = True
scene.cycles.samples = 16
scene.cycles.use_denoising = True
if opts.engine == "CYCLES" and opts.device == "AUTO":
    preferences = bpy.context.preferences.addons["cycles"].preferences
    for backend in ["OPTIX","CUDA"]:
        try:
            preferences.compute_device_type = backend
            preferences.get_devices()
            candidates = [device for device in preferences.devices if device.type == backend]
            if candidates:
                for device in preferences.devices:
                    device.use = device.type == backend
                scene.cycles.device = "GPU"
                if backend == "OPTIX":
                    scene.cycles.denoiser = "OPTIX"
                print(f"Render device: {backend} / {candidates[0].name}",flush=True)
                break
        except Exception:
            continue
scene.render.resolution_x = scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = "Standard"
scene.render.image_settings.file_format = "PNG"
scene.frame_set(opts.frame)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f"{opts.exercise}{'-probe' if opts.probe else ''}.blend"))
if opts.scene_only:
    print("Scene saved for mechanical review",flush=True)
elif opts.video:
    scene.frame_set(total_frames//4 if opts.exercise == "alternating-curl" else total_frames//2)
    scene.render.filepath = str(OUT/f"{opts.exercise}-poster.png")
    bpy.ops.render.render(write_still=True)
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.filepath = str(OUT / f"{opts.exercise}.mp4")
    bpy.ops.render.render(animation=True)
    clip = bpy.data.movieclips.load(scene.render.filepath)
    metadata = {"exerciseId":MOTIONS[opts.exercise]["exerciseId"],"width":clip.size[0],
                "height":clip.size[1],"frames":clip.frame_duration,"fps":clip.fps}
    (OUT/f"{opts.exercise}.video.json").write_text(json.dumps(metadata,indent=2))
else:
    scene.render.filepath = str(OUT / f"{opts.exercise}-{'closeup-' if opts.closeup else ''}frame-{opts.frame}.png")
    bpy.ops.render.render(write_still=True)
