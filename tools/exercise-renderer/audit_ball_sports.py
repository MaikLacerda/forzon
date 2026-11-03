"""Validate visible foot support and independent projectile/catch motion."""
import math
import bpy
from mathutils import Vector
from audit_lower_special import surface_points

def audit_ball_sports(spec,rows,checks,rig,scene):
    if spec['family']=='header_jump':return audit_header(spec,rows,checks,rig,scene)
    if spec['family']!='wall_ball':return
    positions=[];hips=[];knees=[];soles=[];contacts=[]
    duration=(spec['frames']-1)/24;impact=.45
    vz=(3-1.85+.5*9.81*impact**2)/impact
    return_time=((vz-9.81*impact)+math.sqrt((vz-9.81*impact)**2+2*9.81*(3-1.85)))/9.81
    catch=.5+(impact+return_time)/duration
    flight=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        ball=bpy.data.objects['Wall ball'].matrix_world.translation.copy();positions.append(ball)
        hips.append((rig.matrix_world@rig.pose.bones['upperleg01.L'].head).z)
        knees.append((rig.matrix_world@rig.pose.bones['lowerleg01.L'].head).z)
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        soles.append(min(p.z for p in surface_points(body,('foot.','toe'))))
        t=(r['frame']-1)/(spec['frames']-1)
        if t<=.5 or t>=catch:
            contacts.extend(abs((Vector(h)-ball).length-.16) for h in r['hands'])
        else:
            s=(t-.5)*duration
            if s<impact:expected=Vector((0,-.25-1.2*s,1.85+vz*s-.5*9.81*s*s))
            else:
                s-=impact;expected=Vector((0,-.79+.54/return_time*s,3+(vz-9.81*impact)*s-.5*9.81*s*s))
            flight.append((ball-expected).length)
        r['wallBallCenter']=list(ball)
    checks['wallBallHeldAgainstPalms']=max(contacts)<.003
    checks['wallBallIndependentBallisticFlight']=len(flight)>15 and max(flight)<.0001
    checks['wallBallReachesThreeMetreTarget']=max(p.z for p in positions)>2.99 and min(p.y for p in positions)<-.76
    checks['wallBallDeepSquat']=hips[0]<knees[0] and hips[-1]<knees[-1]
    checks['wallBallLegDriveBeforeRelease']=hips[round(.41*(len(rows)-1))]>.88
    checks['wallBallGroundedFeet']=all(-.005<z<.012 for z in soles)
    checks['wallBallLoopClosed']=(positions[0]-positions[-1]).length<.001

def audit_header(spec,rows,checks,rig,scene):
    soles=[];hip=[];forehead_gap=None;balls=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        soles.append([min(p.z for p in surface_points(body,tuple([f'foot.{s}']+[f'toe{digit}-{segment}.{s}' for digit in range(1,6) for segment in range(1,4)]))) for s in ['L','R']])
        hip.append((rig.matrix_world@rig.pose.bones['upperleg01.L'].head).z)
        ball=bpy.data.objects['Header football'].matrix_world.translation.copy();balls.append(ball)
        if r['frame']==64:
            visible={i for p in body.data.polygons for i in p.vertices}
            points=[body.matrix_world@body.data.vertices[i].co for i in visible];top=max(p.z for p in points)
            forehead=min((p for p in points if abs(p.x)<.025 and top-.085<p.z<top-.055),key=lambda p:p.y)
            forehead_gap=(ball-forehead).length-.11
        r['headerFootballCenter']=list(ball)
        r['headerFootSurfaceZ']=soles[-1]
    checks['headerForeheadContactAtApex']=forehead_gap is not None and abs(forehead_gap-.006)<.003
    checks['headerTwoFootTakeoff']=all(.008<z<.025 for z in soles[0])
    checks['headerAirborneAtContact']=min(soles[63])>.30
    checks['headerThirtyFiveCentimetreJump']=abs(hip[63]-hip[0]-.35)<.01
    checks['headerLandingCushion']=hip[round(.60*(len(rows)-1))]<hip[0]-.20
    checks['headerNoGroundPenetration']=min(z for pair in soles for z in pair)>.002
    checks['headerBallReversesAtContact']=balls[62].y<balls[63].y and balls[64].y<balls[63].y
