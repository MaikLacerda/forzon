"""Kneeling wheel contact and controlled torso rotation with a plate."""
import math
import bpy
from mathutils import Vector
from audit_lower_special import surface_points,rendered_points,pelvis_surface_points

def audit_roll_twist(spec,rows,checks,rig,scene):
    family=spec['family']
    if family not in ['rollout','twist']:return
    minima=[];pelvis=[];feet=[];attachments=[];wheel_y=[];wheel_z=[];angles=[];wheel_spin=[];knee_gaps=[];plate_floor=[]
    last_y=None;last_rotation=None
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
        body=bpy.data.objects['FORZON Human'].evaluated_get(deps)
        minima.append(min(p.z for p in rendered_points(body)))
        pelvis.append(min(p.z for p in pelvis_surface_points(body,rig)))
        feet.append(min(p.z for p in surface_points(body,('foot.','toe'))))
        if family=='rollout':
            axle=bpy.data.objects['Ab wheel axle'].matrix_world.translation;wheel_y.append(axle.y);wheel_z.append(axle.z)
            for i,sign in enumerate([1,-1]):attachments.append((Vector(r['hands'][i])-axle-Vector((sign*.14,0,0))).length)
            rotation=bpy.data.objects['Ab wheel tire'].rotation_quaternion
            if last_rotation is not None:
                increment=last_rotation.rotation_difference(rotation).angle
                increment=min(increment,2*math.pi-increment)
                wheel_spin.append(abs(increment-abs(axle.y-last_y)/.12))
            last_rotation=rotation.copy();last_y=axle.y
            points=surface_points(body,('upperleg','lowerleg'))
            for knee in r['knees']:
                k=Vector(knee);knee_gaps.append(min(p.z for p in points if abs(p.x-k.x)<.07 and abs(p.y-k.y)<.10 and p.z<k.z+.10)-.016)
            r['rolloutSupport']={'kneeGaps':knee_gaps[-2:],'bodyMinimumZ':minima[-1],'wheelY':axle.y,'wheelSpinError':wheel_spin[-1] if wheel_spin else 0}
        else:
            plate=bpy.data.objects['Russian twist plate']
            for i,sign in enumerate([1,-1]):attachments.append((Vector(r['hands'][i])-plate.matrix_world@Vector((sign*.145,0,0))).length)
            for child in plate.children:
                obj=child.evaluated_get(deps);plate_floor.append(min((obj.matrix_world@v.co).z for v in obj.data.vertices))
            axis=rig.matrix_world.to_quaternion().inverted()@(Vector(r['shoulders'][0])-Vector(r['shoulders'][1]))
            angles.append(math.degrees(math.atan2(axis.y,axis.x)))
            r['twistSupport']={'pelvisMinimumZ':pelvis[-1],'bodyMinimumZ':minima[-1],'shoulderRotation':angles[-1]}
    checks[family+'BodyClearsMat']=min(minima)>.006
    checks[family+'HandsOnImplement']=max(attachments)<.002
    if family=='rollout':
        checks['rolloutKneesOnMat']=all(-.010<g<.020 for g in knee_gaps)
        checks['rolloutKneesFixed']=max((Vector(r['knees'][s])-Vector(rows[0]['knees'][s])).length for r in rows for s in [0,1])<.002
        checks['rolloutWheelOnMat']=all(abs(z-.136)<.001 for z in wheel_z)
        checks['rolloutWheelRollsWithoutSlip']=max(wheel_spin)<.003
        checks['rolloutForwardRange']=max(wheel_y)-min(wheel_y)>.70
        checks['rolloutNearlyStraightArms']=max(n for r in rows for n in r['elbowAngles'])<35
    else:
        checks['twistPelvisOnMat']=all(.006<z<.031 for z in pelvis)
        checks['twistFeetOnMat']=all(.006<z<.031 for z in feet)
        checks['twistStableFeet']=max((Vector(r['feet'][s])-Vector(rows[0]['feet'][s])).length for r in rows for s in [0,1])<.001
        checks['twistStablePelvis']=max((Vector(r['hip'])-Vector(rows[0]['hip'])).length for r in rows)<.001
        checks['twistBothDirections']=min(angles)<-35 and max(angles)>35
        checks['twistPlateClearsFloor']=min(plate_floor)>.025
