"""Mechanical checks on all frames; these do not replace visual review."""
import argparse
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

root = Path(__file__).resolve().parent
out = root/"output"
motions = json.loads((root/"motions.json").read_text())
parser = argparse.ArgumentParser()
parser.add_argument("exercise", choices=list(motions))
opts = parser.parse_args(sys.argv[sys.argv.index("--")+1:])
spec = motions[opts.exercise]
bpy.ops.wm.open_mainfile(filepath=str(out/f"{opts.exercise}.blend"))
scene = bpy.context.scene
rig = bpy.data.objects["Human Rig"]
is_bench = opts.exercise == "bench-press"
rows = []
for frame in range(scene.frame_start,scene.frame_end+1):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    elbows, grips, angles, gaps, shoulder_positions, ankle_positions, elbow_flexions, forearm_tilts = [], [], [], [], [], [], [], []
    for side in ["L","R"]:
        bone = rig.pose.bones[f"lowerarm01.{side}"]
        elbows.append(list(rig.matrix_world@bone.head))
        direction = (bone.tail-bone.head).normalized()
        angles.append(math.degrees(direction.angle(Vector((0,0,-1)))))
        anchor = bpy.data.objects[f"Grip.{side}"]
        grips.append(list(anchor.matrix_world.translation))
        weight = bpy.data.objects["Straight bar" if opts.exercise in ["barbell-curl","bench-press"] else f"Dumbbell {side}"]
        axis = (weight.matrix_world.to_3x3()@Vector((1,0,0))).normalized()
        delta = anchor.matrix_world.translation-weight.matrix_world.translation
        gaps.append((delta-axis*delta.dot(axis)).length)
        shoulder = rig.pose.bones[f"upperarm01.{side}"].head
        wrist = rig.pose.bones[f"wrist.{side}"].head
        shoulder_positions.append(list(rig.matrix_world@shoulder))
        ankle_positions.append(list(rig.matrix_world@rig.pose.bones[f"foot.{side}"].head))
        elbow_flexions.append(math.degrees((bone.head-shoulder).angle(wrist-bone.head)))
        world_forearm = (rig.matrix_world.to_3x3()@(wrist-bone.head)).normalized()
        forearm_tilts.append(math.degrees(world_forearm.angle(Vector((0,0,1)))))
    row = {"frame":frame,"elbows":elbows,"grips":grips,"flexionDegrees":angles,"gripAxisGapM":gaps,
           "shoulders":shoulder_positions,"ankles":ankle_positions,"elbowFlexionDegrees":elbow_flexions,"forearmTiltDegrees":forearm_tilts}
    if is_bench:
        row["barWorld"] = list(bpy.data.objects["Straight bar"].matrix_world.translation)
    rows.append(row)
drift = max((Vector(row["elbows"][i])-Vector(rows[0]["elbows"][i])).length for row in rows for i in [0,1])
gap = max(v for row in rows for v in row["gripAxisGapM"])
loop_gap = max((Vector(rows[-1]["grips"][i])-Vector(rows[0]["grips"][i])).length for i in [0,1])
max_step = max((Vector(rows[i]["grips"][s])-Vector(rows[i-1]["grips"][s])).length for i in range(1,len(rows)) for s in [0,1])
checks = {
    "exerciseIdentity":rig.get("exercise_id") == spec["exerciseId"],
    "gripAnchorsOnEquipmentAxis":gap<.002,
    "loopClosure":loop_gap<.002,
    "noGripPositionJump":max_step<.05,
}
if is_bench:
    lowest = min(rows,key=lambda row:row["barWorld"][2])
    highest = max(rows,key=lambda row:row["barWorld"][2])
    shoulder_drift = max((Vector(row["shoulders"][s])-Vector(rows[0]["shoulders"][s])).length for row in rows for s in [0,1])
    foot_drift = max((Vector(row["ankles"][s])-Vector(rows[0]["ankles"][s])).length for row in rows for s in [0,1])
    chest = rig.matrix_world@rig.data.bones["breast.L"].tail_local
    checks.update({
        "shouldersStayOnBench":shoulder_drift<.001,
        "feetStayStationary":foot_drift<.001,
        "barReachesChestLine":abs(lowest["barWorld"][1]-chest.y)<.035,
        "pressTravel":highest["barWorld"][2]-lowest["barWorld"][2]>.35,
        "forearmsStackedAtBottom":max(lowest["forearmTiltDegrees"])<30,
        "elbowRangeAtBottom":all(60<a<145 for a in lowest["elbowFlexionDegrees"]),
        "armExtensionAtTop":max(highest["elbowFlexionDegrees"])<30,
    })
    scene.frame_set(1)
    evaluated = bpy.data.objects["FORZON Human"].evaluated_get(bpy.context.evaluated_depsgraph_get())
    foot_minimums = []
    for side in ["L","R"]:
        group_ids = {group.index for group in evaluated.vertex_groups if group.name.endswith(f".{side}") and group.name.startswith(("foot.","toe"))}
        heights = [(evaluated.matrix_world@vertex.co).z for vertex in evaluated.data.vertices
                   if sum(group.weight for group in vertex.groups if group.group in group_ids)>.55]
        foot_minimums.append(min(heights))
    checks["solesOnFloor"] = all(-.015<height<.025 for height in foot_minimums)
    sole_angles = [math.degrees((rig.matrix_world.to_quaternion()@rig.pose.bones[f"foot.{side}"].matrix.to_quaternion()).rotation_difference(rig.data.bones[f"foot.{side}"].matrix_local.to_quaternion()).angle) for side in ["L","R"]]
    checks["feetFlatOrientation"] = max(sole_angles)<.5
else:
    checks["fixedElbows"] = drift<.001
    checks["fullFlexion"] = all(max(row["flexionDegrees"][s] for row in rows)>110 for s in [0,1])
if opts.exercise == "alternating-curl":
    checks["oneArmAtATime"] = all(sum(a>20 for a in row["flexionDegrees"])<=1 for row in rows)
elif not is_bench:
    checks["synchronizedArms"] = all(abs(row["flexionDegrees"][0]-row["flexionDegrees"][1])<.1 for row in rows)
report = {"exerciseId":spec["exerciseId"],"checks":checks,"mechanicalChecksPassed":all(checks.values()),
          "maxElbowDriftM":drift,"maxGripAnchorAxisGapM":gap,"loopGapM":loop_gap,"maxGripFrameStepM":max_step,
          "sampledFrames":[rows[i] for i in sorted({0,len(rows)//4,len(rows)//2,3*len(rows)//4,len(rows)-1})]}
if is_bench:
    report["lowestBarFrame"] = lowest
    report["highestBarFrame"] = highest
    report["footSoleMinWorldZ"] = foot_minimums
(out/f"{opts.exercise}.qa.json").write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if not all(checks.values()):
    raise RuntimeError("Mechanical check failed; do not publish this clip")
