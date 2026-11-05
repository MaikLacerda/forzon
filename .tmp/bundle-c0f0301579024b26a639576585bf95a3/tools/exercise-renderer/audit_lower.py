"""Lower-body equipment, support and joint-path review over the full cycle."""
import math
import bpy
from mathutils import Vector

def audit_lower(spec,rows,checks,rig,scene):
    family=spec['family'];load=spec.get('load');style=spec.get('style')
    if load in ['hack-sled','sissy-support']:return
    if load=='hip-thrust-machine':
        from audit_hip_machine import audit_hip_machine
        return audit_hip_machine(spec,rows,checks,rig,scene)
    if family=='calf' and spec.get('posture')=='leg-press':return
    if family not in ['squat','lunge','hip_thrust','kickback','abduction','calf','leg_isolation'] and not (family=='hinge' and style=='deadlift'):return
    def stable(key):return max((Vector(r[key][s])-Vector(rows[0][key][s])).length for r in rows for s in [0,1])<.001
    if family=='squat' or (family=='hinge' and style=='deadlift'):
        checks['feetRemainPlanted']=stable('feet')
        bottom=min(rows,key=lambda r:r['hip'][2]);top=max(rows,key=lambda r:r['hip'][2])
        checks['controlledKneeFlexion']=all(85<max(r['kneeFlexion'][s] for r in rows)<150 for s in [0,1])
        checks['uprightLockout']=top['rootLean']<1
        checks['allPoseTargetsAccurate']=max(e for r in rows for e in r['errors'])<.002
        soles=[];bar_positions=[];sumo_gaps=[];sumo_radii=[];toe_out=[]
        for r in rows:
            scene.frame_set(r['frame']);bpy.context.view_layer.update()
            body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
            groups={g.index for g in body.vertex_groups if g.name.startswith(('foot.','toe'))}
            soles.append(min((body.matrix_world@v.co).z for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55))
            if family=='squat':
                toe_out.extend((1 if s=='L' else -1)*((rig.matrix_world@rig.pose.bones[f'toe2-1.{s}'].head).x-(rig.matrix_world@rig.pose.bones[f'foot.{s}'].head).x) for s in ['L','R'])
            if style=='sumo':
                weight=bpy.data.objects['Dumbbell.L'];center=weight.matrix_world.translation
                for p in r['hands']:
                    sumo_gaps.append(abs(p[2]-center.z-.1525));sumo_radii.append(math.hypot(p[0]-center.x,p[1]-center.y))
                r['weightBottom']=center.z-.2075
            else:bar_positions.append(list(bpy.data.objects['Exercise implement'].matrix_world.translation))
        floor=.15 if style=='sumo' else 0
        checks['solesOnSupport']=all(floor-.004<z<floor+.008 for z in soles)
        if family=='squat':
            checks['feetTurnOutward']=min(toe_out)>.015
            checks['thighsReachParallel']=all(bottom['hip'][2]<=k[2]+.065 for k in bottom['knees'])
            checks['squatTravel']=top['hip'][2]-bottom['hip'][2]>.42
            if load=='front-bar':
                peak=rows[len(rows)//2]
                checks['frontRackElbowsForward']=all(peak['elbows'][s][1]<peak['shoulders'][s][1]-.12 for s in [0,1])
                checks['frontRackElbowsHigh']=all(abs(peak['elbows'][s][2]-peak['shoulders'][s][2])<.12 for s in [0,1])
            if load=='smith-bar':checks['verticalSmithPath']=max(p[1] for p in bar_positions)-min(p[1] for p in bar_positions)<.002
            if style=='sumo':
                checks['palmsUnderUpperPlate']=max(sumo_gaps)<.003 and max(sumo_radii)<.10 and min(n for r in rows for n in r['palmZ'])>.8
                checks['weightPassesBetweenSteps']=min(r['weightBottom'] for r in rows)<.15 and min(r['weightBottom'] for r in rows)>.02
        else:
            checks['nearVerticalDeadliftBarPath']=max(p[1] for p in bar_positions)-min(p[1] for p in bar_positions)<.003
            checks['straightDeadliftArms']=max(n for r in rows for n in r['elbowAngles'])<3
            checks['platesReachFloor']=abs(min(p[2] for p in bar_positions)-.17)<.012
            checks['fullDeadliftStroke']=max(p[2] for p in bar_positions)-min(p[2] for p in bar_positions)>.50
            checks['hingedStart']=40<bottom['rootLean']<50
    elif family in ['leg_isolation','abduction','calf']:
        from audit_leg_machines import audit_leg_machines
        audit_leg_machines(spec,rows,checks,rig,scene)
    elif family in ['lunge','hip_thrust','kickback']:
        from audit_lower_functional import audit_lower_functional
        audit_lower_functional(spec,rows,checks,rig,scene)
