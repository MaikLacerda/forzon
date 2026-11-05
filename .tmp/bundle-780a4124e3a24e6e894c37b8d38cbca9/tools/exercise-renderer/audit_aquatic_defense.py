"""Exercise-specific checks for defensive sprawls and crawl stroke phases."""
import math
import bpy
from mathutils import Vector
from audit_lower_special import surface_points

def audit_aquatic_defense(spec,rows,checks,rig,scene):
    if spec['family'] not in ['sprawl','swim']:return
    swim=spec['family']=='swim';hip=[];face=[];catch=[];recover=[];soles=[];hands=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        hip.append(sum((rig.matrix_world@rig.pose.bones[f'upperleg01.{s}'].head).z for s in ['L','R'])/2)
        if swim:
            rotation=rig.matrix_world.to_3x3()@rig.pose.bones['head'].matrix.to_3x3()@rig.data.bones['head'].matrix_local.to_3x3().inverted()
            face.append((rotation@Vector((0,-1,0))).normalized())
            t=(r['frame']-1)/(spec['frames']-1)
            for i in [0,1]:
                u=(4*t+i*.5)%1
                if .25<u<.38:catch.append(r['elbows'][i][2]-r['hands'][i][2])
                if .75<u<.90:recover.append(r['elbows'][i][2]-r['hands'][i][2])
        else:
            rotation=rig.matrix_world.to_3x3()@rig.pose.bones['head'].matrix.to_3x3()@rig.data.bones['head'].matrix_local.to_3x3().inverted()
            r['sprawlHeadFacing']=list((rotation@Vector((0,-1,0))).normalized())
            soles.append(min(p.z for p in surface_points(body,('foot.','toe'))))
            hand_points=surface_points(body,('wrist.','finger'))
            hands.append(min(p.z for p in hand_points))
            r['sprawlSurfaceZ']={'feet':soles[-1],'hands':hands[-1]}
    if swim:
        scene.frame_set(1);start=bpy.data.objects['Motion reference'].matrix_world.translation.y
        scene.frame_set(spec['frames']);end=bpy.data.objects['Motion reference'].matrix_world.translation.y
        checks['crawlForwardTravel']=abs(end-start+9)<.002
        checks['crawlPoolRemainsFixed']=bpy.data.objects['Pool floor'].parent is None
        checks['crawlHorizontalBody']=max(hip)-min(hip)<.025
        checks['crawlHighElbowCatch']=min(catch)>.015
        checks['crawlHighElbowRecovery']=min(recover)>.015
        checks['crawlBilateralBreathing']=max(v.x for v in face)>.8 and min(v.x for v in face)<-.8
        checks['crawlReturnsFaceIntoWater']=face[0].z<-.95 and face[-1].z<-.95
        checks['crawlAlternatingFullStroke']=all(max(r['hands'][i][1] for r in rows)-min(r['hands'][i][1] for r in rows)>1 for i in [0,1])
    else:
        middle=rows[round(.50*(len(rows)-1))]
        checks['sprawlHipsDown']=min(hip)<.19
        checks['sprawlLegsBack']=all(f[1]>.85 for f in middle['feet'])
        checks['sprawlLegsExtended']=all(angle<20 for angle in middle['kneeFlexion'])
        checks['sprawlChestAboveHips']=all(s[2]>min(hip)+.2 for s in middle['shoulders'])
        checks['sprawlHeadUp']=middle['sprawlHeadFacing'][1]<-.85 and middle['sprawlHeadFacing'][2]>-.45
        checks['sprawlHandsAtMat']=all(abs(h[2]-.06)<.003 for h in middle['hands'])
        checks['sprawlContactSurfacesAtMat']=.012<soles[len(rows)//2]<.025 and .012<hands[len(rows)//2]<.025
        checks['sprawlNoHandOrFootPenetration']=min(hands)>.01 and min(soles)>.01
        checks['sprawlReturnsToStance']=abs(hip[-1]-hip[0])<.002
