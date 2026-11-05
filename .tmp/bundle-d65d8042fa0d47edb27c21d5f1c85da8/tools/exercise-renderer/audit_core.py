"""Core-specific joint alignment and actual mat support checks."""
import bpy
from mathutils import Vector
from audit_lower_special import surface_points,rendered_points,pelvis_surface_points

def audit_core(spec,rows,checks,rig,scene):
    family=spec['family']
    if family not in ['plank','crunch']:return
    if family=='plank' and spec.get('style')=='side':return audit_side_plank(spec,rows,checks,rig,scene)
    if family=='crunch' and spec.get('posture')!='lying':return
    forearms=[];feet=[];pelvis=[];body_min=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        feet.append(min(p.z for p in surface_points(body,('foot.','toe'))))
        forearms.append(min(p.z for p in surface_points(body,('lowerarm',))))
        pelvis.append(min(p.z for p in pelvis_surface_points(body,rig)))
        body_min.append(min(p.z for p in rendered_points(body)))
        r['coreSupport']={'feetMinimumZ':feet[-1],'forearmMinimumZ':forearms[-1],'pelvisMinimumZ':pelvis[-1],'bodyMinimumZ':body_min[-1]}
    checks['coreBodyClearsMat']=min(body_min)>.006
    checks['coreFeetOnMat']=all(.006<z<.031 for z in feet)
    if family=='plank':
        checks['plankForearmsOnMat']=all(.006<z<.031 for z in forearms)
        checks['plankElbowsUnderShoulders']=all(abs(r['elbows'][s][0]-r['shoulders'][s][0])<.002 and abs(r['elbows'][s][1]-r['shoulders'][s][1])<.002 for r in rows for s in [0,1])
        checks['plankElbowsAtRightAngle']=all(89<n<91 for r in rows for n in r['elbowAngles'])
        checks['plankStraightKnees']=all(n<4 for r in rows for n in r['kneeFlexion'])
        lines=[]
        for r in rows:
            a=(Vector(r['shoulders'][0])+Vector(r['shoulders'][1]))/2;b=(Vector(r['feet'][0])+Vector(r['feet'][1]))/2;p=Vector(r['hip'])
            d=(b-a).normalized();lines.append(((p-a)-d*(p-a).dot(d)).length)
        checks['plankShoulderHipHeelAlignment']=max(lines)<.035
    else:
        checks['crunchPelvisSupported']=all(.006<z<.031 for z in pelvis)
        checks['crunchFeetStayPlanted']=max((Vector(r['feet'][s])-Vector(rows[0]['feet'][s])).length for r in rows for s in [0,1])<.001
        heights=[sum(p[2] for p in r['shoulders'])/2 for r in rows]
        checks['crunchScapulaLift']=max(heights)-min(heights)>.08
        checks['crunchOneSecondHold']=sum(abs(z-max(heights))<.0001 for z in heights)>=24

def audit_side_plank(spec,rows,checks,rig,scene):
    feet=[];arms=[];minima=[];alignment=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        feet.append(min(p.z for p in surface_points(body,('foot.L','toe1-1.L','toe2-1.L','toe3-1.L','toe4-1.L','toe5-1.L'))))
        arms.append(min(p.z for p in surface_points(body,('lowerarm01.L','lowerarm02.L'))))
        minima.append(min(p.z for p in rendered_points(body)))
        a=(Vector(r['shoulders'][0])+Vector(r['shoulders'][1]))/2;b=(Vector(r['feet'][0])+Vector(r['feet'][1]))/2;p=Vector(r['hip']);d=(b-a).normalized()
        alignment.append(((p-a)-d*(p-a).dot(d)).length)
        r['sidePlankSupport']={'lowerFootMinimumZ':feet[-1],'forearmMinimumZ':arms[-1],'bodyMinimumZ':minima[-1],'hipLineError':alignment[-1]}
    checks['sidePlankBodyClearsMat']=min(minima)>.006
    checks['sidePlankLowerFootOnMat']=all(.006<z<.031 for z in feet)
    checks['sidePlankForearmOnMat']=all(.006<z<.031 for z in arms)
    checks['sidePlankElbowUnderShoulder']=all(abs(r['elbows'][0][0]-r['shoulders'][0][0])<.002 and abs(r['elbows'][0][1]-r['shoulders'][0][1])<.002 for r in rows)
    checks['sidePlankBodyAlignment']=max(alignment)<.045
    checks['sidePlankNearlyStraightLegs']=max(n for r in rows for n in r['kneeFlexion'])<18
