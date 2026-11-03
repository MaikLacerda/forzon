"""Frame-by-frame contacts for lunges, hip thrust and ankle-cable extension."""
import math
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

def audit_lower_functional(spec,rows,checks,rig,scene):
    family=spec['family'];style=spec.get('style')
    def stable(key,sides=[0,1]):return max((Vector(r[key][s])-Vector(rows[0][key][s])).length for r in rows for s in sides)<.001
    contact_drift=[];toe_soles=[];rear_bench=[];body_bench=[];weight_floor=[];cuff_gaps=[];cable_gaps=[];cable_clear=True
    previous={};follow_positions=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
        body=bpy.data.objects['FORZON Human'].evaluated_get(deps);extra={'ankles':[],'toeAnchors':[],'footMinimumZ':[]}
        follow_positions.append(list(bpy.data.objects['Motion reference'].matrix_world.translation))
        for i,s in enumerate(['L','R']):
            ankle=rig.matrix_world@rig.pose.bones[f'foot.{s}'].head;toe=rig.matrix_world@rig.pose.bones[f'toe2-1.{s}'].head
            extra['ankles'].append(list(ankle));extra['toeAnchors'].append(list(toe))
            groups={g.index for g in body.vertex_groups if (g.name.startswith(('foot.','toe')) and g.name.endswith('.'+s))}
            points=[body.matrix_world@v.co for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55]
            extra['footMinimumZ'].append(min(p.z for p in points))
            contact=bool(bpy.data.objects[f'Check.Foot.{s}.actual'].get('contact',0))
            if contact:
                if s in previous and previous[s][1]:contact_drift.append((toe-previous[s][0]).length)
                toe_soles.append(min(p.z for p in points if p.y<ankle.y-.06))
            previous[s]=(toe,contact)
            if family=='lunge' and style=='bulgarian' and s=='R':
                on_bench=[p.z for p in points if .315<p.y<.765];rear_bench.append(min(on_bench) if on_bench else -10)
        if family=='lunge':
            for s in ['L','R']:
                for child in bpy.data.objects[f'Dumbbell.{s}'].children:
                    if child.type!='MESH':continue
                    mesh=child.evaluated_get(deps);weight_floor.append(min((mesh.matrix_world@v.co).z for v in mesh.data.vertices))
        if family=='hip_thrust':
            groups={g.index for g in body.vertex_groups if g.name.startswith(('spine','breast'))}
            points=[body.matrix_world@v.co for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55]
            pad=bpy.data.objects['Hip thrust upper-back bench'];inverse=pad.matrix_world.inverted()
            halfx=max(v.co.x for v in pad.data.vertices);halfy=max(v.co.y for v in pad.data.vertices)
            supported=[p.z for p in points if abs((inverse@p).x)<halfx-.01 and abs((inverse@p).y)<halfy-.01]
            body_bench.append(min(supported));extra['upperBackSurfaceZ']=min(supported)
            bar=bpy.data.objects['Exercise implement'].matrix_world.translation
            extra['barCenter']=list(bar)
        if family=='kickback':
            cuff=bpy.data.objects['Glute ankle cuff'];eye=bpy.data.objects['Glute cuff eye'].matrix_world.translation
            cuff_gaps.append(abs((cuff.matrix_world.translation-Vector(extra['ankles'][0])).length-.055))
            cable=bpy.data.objects['Cable.0'];a=cable.matrix_world@Vector((0,0,-.5));b=cable.matrix_world@Vector((0,0,.5));delta=b-a
            cable_gaps.append((b-eye).length)
            groups={g.index for g in body.vertex_groups if g.name.startswith(('spine','breast','pelvis','upperleg','lowerleg','foot','toe','head','jaw'))}
            indices={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
            tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in indices for i in p.vertices)])
            hit=tree.ray_cast(a,delta.normalized(),max(0,delta.length-.025))[0]
            if hit is not None:extra['cableHit']=list(hit);cable_clear=False
        r['lowerReview']=extra
    if family=='lunge':
        checks['straightWeightBearingArms']=all(n<1 for r in rows for n in r['elbowAngles'])
        checks['weightsClearFloor']=min(weight_floor)>.025
        checks['groundContactsDoNotSlide']=not contact_drift or max(contact_drift)<.003
        checks['plantedForefootAtFloor']=all(-.012<z<.015 for z in toe_soles)
        checks['kneesClearFloor']=all(p[2]>.055 for r in rows for p in r['knees'])
        if style=='bulgarian':
            bottom=min(rows,key=lambda r:r['hip'][2])
            checks['fixedSplitStance']=stable('feet')
            checks['rearFootOnBench']=all(.385<z<.415 for z in rear_bench)
            checks['frontKneeRange']=85<max(r['kneeFlexion'][0] for r in rows)<120
            checks['frontThighNearParallel']=abs(bottom['hip'][2]-bottom['knees'][0][2])<.085
            checks['rearKneeLowers']=bottom['knees'][1][2]<.25
        else:
            checks['twoForwardSteps']=abs(follow_positions[-1][1]-follow_positions[0][1]+1.70)<.002
            for index,side in [(len(rows)//4,0),(3*len(rows)//4,1)]:
                r=rows[index];checks[f'leadingKneeBends{side}']=80<r['kneeFlexion'][side]<135
                checks[f'leadingThighParallel{side}']=abs(r['hip'][2]-r['knees'][side][2])<.085
            checks['alternatingLeadingLegs']=rows[len(rows)//4]['lowerReview']['ankles'][0][1]<rows[len(rows)//4]['lowerReview']['ankles'][1][1] and rows[3*len(rows)//4]['lowerReview']['ankles'][1][1]<rows[3*len(rows)//4]['lowerReview']['ankles'][0][1]
    elif family=='hip_thrust':
        checks['feetStayPlanted']=stable('feet')
        checks['upperBackOnBench']=all(.48<z<.52 for z in body_bench)
        checks['hipLiftRange']=max(r['hip'][2] for r in rows)-min(r['hip'][2] for r in rows)>.25
        peak=max(rows,key=lambda r:r['hip'][2]);checks['horizontalTorsoAtTop']=85<peak['rootLean']<=90
        checks['kneesBentAtLockout']=all(70<n<100 for n in peak['kneeFlexion'])
        checks['noFootSliding']=not contact_drift or max(contact_drift)<.002
        checks['barMovesWithPelvis']=all(abs((Vector(r['lowerReview']['barCenter'])-Vector(r['hip'])).length-.16)<.003 for r in rows)
        checks['oneSecondLockout']=sum(abs(r['hip'][2]-peak['hip'][2])<.00001 for r in rows)>=24
    elif family=='kickback':
        checks['stableSupportLeg']=stable('feet',[1]);checks['fixedHands']=stable('hands');checks['stableTrunk']=stable('shoulders')
        checks['slightFixedWorkingKneeBend']=all(7<n<9 for r in rows for n in [r['kneeFlexion'][0]])
        checks['workingLegMovesBack']=max(r['lowerReview']['ankles'][0][1] for r in rows)-min(r['lowerReview']['ankles'][0][1] for r in rows)>.30
        checks['workingFootClearsFloor']=min(r['lowerReview']['footMinimumZ'][0] for r in rows)>-.004
        checks['cuffStaysAboveAnkle']=max(cuff_gaps)<.002
        checks['cableJoinsCuff']=max(cable_gaps)<.002
        checks['cableClearsLegsAndTorso']=cable_clear
