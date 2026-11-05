"""Hip belt support, fixed footplate and selectorized cable travel."""
import bpy
from mathutils import Vector
from audit_lower_special import pad_gap,surface_points

def audit_hip_machine(spec,rows,checks,rig,scene):
    back=[];feet=[];belt=[];handles=[];cables=[];lengths={s:[] for s in ['L','R']};blocks=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        back.append(pad_gap(body,'Hip machine back bench',('spine','breast'),.04))
        feet.append(min(p.z for p in surface_points(body,('foot.','toe')))-.08)
        pad=bpy.data.objects['Hip machine moving belt'];belt.append(abs((pad.matrix_world.translation-Vector(r['hip'])).length-.16))
        for i,s in enumerate(['L','R']):
            sign=1 if s=='L' else -1
            handles.append((bpy.data.objects[f'Hip machine fixed grip.{s}'].matrix_world.translation-Vector(r['hands'][i])).length)
            points=[];total=0
            for index in range(4):
                cable=bpy.data.objects[f'Hip load cable.{s}.{index}'];a=cable.matrix_world@Vector((0,0,-.5));b=cable.matrix_world@Vector((0,0,.5))
                total+=(b-a).length
                if index==0:cables.append((a-pad.matrix_world@Vector((sign*.32,0,0))).length)
                if points:cables.append((a-points[-1]).length)
                points.append(b)
            lengths[s].append(total);blocks.append(bpy.data.objects[f'Hip active stack.{s}'].matrix_world.translation.z)
        r['hipMachineSupport']={'backGap':back[-1],'soleGap':feet[-1]}
    checks['hipMachineBackSupport']=all(-.015<g<.025 for g in back)
    checks['hipMachineFootplateContact']=all(-.004<g<.008 for g in feet)
    checks['hipMachineBeltOnPelvis']=max(belt)<.003
    checks['hipMachineFixedGrips']=max(handles)<.002
    checks['hipMachineCableConnections']=max(cables)<.002
    checks['hipMachineCableLengthConserved']=all(max(v)-min(v)<.003 for v in lengths.values())
    checks['hipMachineLoadMoves']=max(blocks)-min(blocks)>.15
    checks['hipMachineStackNeverRests']=min(blocks)-.06>.32
    peak=max(rows,key=lambda r:r['hip'][2])
    checks['hipMachineNeutralLockout']=85<peak['rootLean']<90
    checks['hipMachineLockoutKnees']=all(70<n<100 for n in peak['kneeFlexion'])
    checks['hipMachineOneSecondHold']=sum(abs(r['hip'][2]-peak['hip'][2])<.0001 for r in rows)>=24
