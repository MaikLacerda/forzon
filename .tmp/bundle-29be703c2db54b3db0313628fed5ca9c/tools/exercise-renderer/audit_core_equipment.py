"""Actual pads, cable attachments and leg paths for equipment-based core work."""
import bpy
from mathutils import Vector
from audit_lower_special import surface_points,pad_gap,rendered_points

def audit_core_equipment(spec,rows,checks,rig,scene):
    family=spec['family'];kneeling=family=='crunch' and spec.get('posture')=='kneeling'
    if family!='leg_raise' and not kneeling:return
    support=[];floor=[];attachments=[];knee_gaps=[];back=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        floor.append(min(p.z for p in rendered_points(body)))
        if family=='leg_raise':
            for s in ['L','R']:support.append(pad_gap(body,f'Captain forearm pad.{s}',('lowerarm',),.04))
            for i,s in enumerate(['L','R']):attachments.append((bpy.data.objects[f'Captain grip.{s}'].matrix_world.translation-Vector(r['hands'][i])).length)
            torso=[p for p in surface_points(body,('spine','breast')) if abs(p.x)<.20 and 1.02<p.z<1.68]
            back.append(.11-max(p.y for p in torso))
            r['captainSupport']={'forearmGaps':support[-2:],'backGap':back[-1],'minimumZ':floor[-1]}
        else:
            points=surface_points(body,('upperleg','lowerleg'))
            for knee in r['knees']:
                k=Vector(knee);near=[p.z for p in points if abs(p.x-k.x)<.07 and abs(p.y-k.y)<.10 and p.z<k.z+.10]
                knee_gaps.append(min(near)-.016)
            for i,s in enumerate(['L','R']):
                attachments.append((bpy.data.objects[f'Handle.{s}'].matrix_world.translation-Vector(r['hands'][i])).length)
                cable=bpy.data.objects[f'Cable.{i+1}'];end=cable.matrix_world@Vector((0,0,.5));attachments.append((end-Vector(r['hands'][i])).length)
            r['cableCrunchSupport']={'kneeGaps':knee_gaps[-2:],'minimumZ':floor[-1]}
    if family=='leg_raise':
        checks['captainForearmsSupported']=all(-.015<g<.025 for g in support)
        checks['captainFixedGrips']=max(attachments)<.002
        checks['captainStraightLegs']=max(n for r in rows for n in r['kneeFlexion'])<4
        checks['captainFeetClearFloor']=min(floor)>.15
        checks['captainPelvicCurl']=max(r['rootLean'] for r in rows)>11
        checks['captainBackStartsSupported']=abs(back[0])<.025
        checks['captainNoBackPadPenetration']=min(back)>-.025
        checks['captainLegsReachHorizontal']=max(r['feet'][0][2]-r['hip'][2] for r in rows)>.05
    else:
        checks['cableCrunchKneesOnMat']=all(-.010<g<.020 for g in knee_gaps)
        checks['cableCrunchBodyClearsMat']=min(floor)>.006
        checks['cableCrunchFixedPelvis']=max((Vector(r['hip'])-Vector(rows[0]['hip'])).length for r in rows)<.001
        heights=[sum(p[2] for p in r['shoulders'])/2 for r in rows]
        checks['cableCrunchSpinalFlexion']=max(heights)-min(heights)>.12
        checks['cableCrunchRopeAndHandles']=max(attachments)<.002
        checks['cableCrunchPeakHold']=sum(abs(z-min(heights))<.0001 for z in heights)>=24
        peak=min(rows,key=lambda r:sum(p[2] for p in r['shoulders']))
        checks['cableCrunchElbowsPointDownAtPeak']=all(peak['elbows'][s][2]<peak['shoulders'][s][2] and rows[0]['elbows'][s][2]-peak['elbows'][s][2]>.25 for s in [0,1])
