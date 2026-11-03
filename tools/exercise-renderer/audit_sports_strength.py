"""Double-pole cable contacts and ordered front-squat/overhead-press mechanics."""
import math
import bpy
from mathutils import Vector
from audit_lower_special import surface_points

def audit_sports_strength(spec,rows,checks,rig,scene):
    family=spec['family']
    if family=='muscle_up':
        from audit_muscle_up import audit_muscle_up
        return audit_muscle_up(spec,rows,checks,rig,scene)
    if family not in ['skierg','thruster']:return
    soles=[];attachments=[];head_clear=True;bar=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        soles.append(min(p.z for p in surface_points(body,('foot.','toe'))))
        if family=='skierg':
            for i,s in enumerate(['L','R']):
                handle=bpy.data.objects[f'Ski handle.{s}'];eye=handle.matrix_world@Vector((.075,0,0))
                attachments.append((handle.matrix_world.translation-Vector(r['hands'][i])).length)
                cord=bpy.data.objects[f'Ski cord.{s}'];end=cord.matrix_world@Vector((0,0,.5));attachments.append((end-eye).length)
        else:
            point=bpy.data.objects['Exercise implement'].matrix_world.translation.copy();bar.append(point)
            head=surface_points(body,('head','jaw'))
            nearby=[p for p in head if abs(p.z-point.z)<.025]
            if nearby and point.y>min(p.y for p in nearby)-.025:head_clear=False
            r['thrusterBar']=list(point)
    checks[family+'FixedFootSupport']=max((Vector(r['feet'][s])-Vector(rows[0]['feet'][s])).length for r in rows for s in [0,1])<.001
    floor=.03 if family=='skierg' else 0
    checks[family+'SolesOnPlatform']=all(floor-.004<z<floor+.008 for z in soles)
    if family=='skierg':
        checks['skiHandleAndCordContacts']=max(attachments)<.002
        checks['skiFullHandleStroke']=all(max(r['hands'][s][2] for r in rows)-min(r['hands'][s][2] for r in rows)>.95 for s in [0,1])
        checks['skiHipHingeRange']=max(r['rootLean'] for r in rows)>44 and min(r['rootLean'] for r in rows)<1
        checks['skiSoftKneesNotDeepSquat']=max(n for r in rows for n in r['kneeFlexion'])<80
        checks['skiSymmetricPull']=all(abs(r['hands'][0][2]-r['hands'][1][2])<.002 for r in rows)
        initial=rows[0];bottom=min(rows,key=lambda r:r['hands'][0][2])
        checks['skiBentArmsAtStart']=all(65<n<115 for n in initial['elbowAngles'])
        checks['skiArmsFinishAlongThighs']=all(5<n<70 for n in bottom['elbowAngles'])
    else:
        bottom=min(rows,key=lambda r:r['hip'][2]);peak=max(rows,key=lambda r:r['thrusterBar'][2])
        checks['thrusterHipBelowKnees']=all(bottom['hip'][2]<k[2] for k in bottom['knees'])
        checks['thrusterHighFrontRack']=abs(bottom['thrusterBar'][2]-bottom['shoulders'][0][2])<.08
        checks['thrusterLegDriveBeforePress']=all(max(r['kneeFlexion'])<30 for r in rows if r['thrusterBar'][2]-r['shoulders'][0][2]>.15)
        checks['thrusterOverheadExtension']=max(peak['elbowAngles'])<12
        checks['thrusterUprightLockout']=peak['rootLean']<1 and max(peak['kneeFlexion'])<25
        checks['thrusterBarOverBase']=abs(peak['thrusterBar'][1])<.02
        checks['thrusterBarClearsHead']=head_clear
