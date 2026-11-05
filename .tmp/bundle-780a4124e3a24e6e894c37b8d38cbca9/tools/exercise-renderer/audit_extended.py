"""Additional posture-specific checks for individually authored exercise clips."""
import math
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

def audit_extended(spec,rows,checks,rig,scene):
    family=spec['family'];posture=spec.get('posture');load=spec.get('load')
    def travel(key,s):return max((Vector(r[key][s])-Vector(rows[0][key][s])).length for r in rows)
    def stable(key):return all(travel(key,s)<.001 for s in [0,1])
    if family=='hinge' and spec.get('style') in ['rdl','good-morning']:
        checks['feetStayPlanted']=stable('feet')
        checks['hipHingeRange']=min(r['rootLean'] for r in rows)<1 and 60<max(r['rootLean'] for r in rows)<70
        checks['hipsMoveBack']=max(r['hip'][1] for r in rows)-min(r['hip'][1] for r in rows)>.20
        checks['slightKneeBend']=all(0<=n<35 for r in rows for n in r['kneeFlexion'])
        checks['limitedHipDrop']=max(r['hip'][2] for r in rows)-min(r['hip'][2] for r in rows)<.05
        checks['rigidTrunk']=all(abs((Vector(r['shoulders'][0])-Vector(r['hip'])).length-(Vector(rows[0]['shoulders'][0])-Vector(rows[0]['hip'])).length)<.002 for r in rows)
        if load!='back-bar':
            checks['straightArms']=all(n<3 for r in rows for n in r['elbowAngles'])
            checks['weightsStayOffFloor']=all(p[2]>.25 for r in rows for p in r['hands'])
            checks['verticalWeightStroke']=all(max(r['hands'][s][2] for r in rows)-min(r['hands'][s][2] for r in rows)>.25 for s in [0,1])
        else:
            checks['barOnUpperBack']=all(abs(r['hands'][s][1]-r['shoulders'][s][1]-(.06*math.cos(math.radians(r['rootLean']))-.02*math.sin(math.radians(r['rootLean']))))<.002 and abs(r['hands'][s][2]-r['shoulders'][s][2]-(.06*math.sin(math.radians(r['rootLean']))+.02*math.cos(math.radians(r['rootLean']))))<.002 for r in rows for s in [0,1])
    if family=='curl':
        active=[0] if load=='single-dumbbell' else [0,1]
        checks['stableUpperArms']=all(travel('elbows',s)<.001 for s in active)
        checks['stableShoulders']=stable('shoulders');checks['stableFeet']=stable('feet')
        checks['stableTrunk']=max(r['rootLean'] for r in rows)-min(r['rootLean'] for r in rows)<.1
        if posture=='incline':checks['incline45Posture']=all(abs(r['rootLean']-45)<.1 for r in rows)
        if posture=='spider':checks['prone45Posture']=all(abs(r['rootLean']-45)<.1 for r in rows)
        if posture=='preacher':
            pad=bpy.data.objects['Preacher arm pad'];gaps=[]
            for r in rows:
                scene.frame_set(r['frame']);bpy.context.view_layer.update()
                for s in [0,1]:
                    p=(Vector(r['shoulders'][s])+Vector(r['elbows'][s]))/2
                    gaps.append((pad.matrix_world.inverted()@p).z-.03)
            checks['upperArmsAgainstScottPad']=all(.025<g<.075 for g in gaps)
        if posture=='concentration':
            checks['fixedWorkingElbow']=travel('elbows',0)<.001
            r=rows[0];e=Vector(r['elbows'][0]);k=Vector(r['knees'][0])
            checks['elbowInsideWorkingThigh']=.03<k.x-e.x<.17 and abs(k.y-e.y)<.18 and .01<e.z-k.z<.15
        if load=='cable-rope':
            checks['neutralHammerGrip']=all(r['palmX'][0]<-.9 and r['palmX'][1]>.9 for r in rows)
    if family=='upright_row':
        checks['stableShoulders']=stable('shoulders');checks['stableFeet']=stable('feet')
        peak=rows[len(rows)//2]
        checks['elbowsLeadHands']=all(peak['elbows'][s][2]-peak['hands'][s][2]>.18 for s in [0,1])
        checks['elbowsNearShoulderLevel']=all(abs(peak['elbows'][s][2]-peak['shoulders'][s][2])<.06 for s in [0,1])
        checks['uprightPosture']=all(r['rootLean']<.1 for r in rows)
        checks['handsRiseTogether']=all(abs(r['hands'][0][2]-r['hands'][1][2])<.001 for r in rows)
    if family=='triceps' and posture in ['overhead','overhead-cable','kickback']:
        active=[0] if load in ['single-dumbbell','single-cable'] else [0,1]
        checks['stableUpperArms']=all(travel('elbows',s)<.001 for s in active)
        checks['stableFeet']=stable('feet');checks['stableShoulders']=stable('shoulders')
        checks['tricepsExtensionRange']=all(min(r['elbowAngles'][s] for r in rows)<10 and 85<max(r['elbowAngles'][s] for r in rows)<115 for s in active)
        if posture=='kickback':
            checks['fixedHipHinge']=all(abs(r['rootLean']-65)<.1 for r in rows)
            extended=rows[len(rows)//2]
            checks['handExtendsBehindElbow']=extended['hands'][0][1]-extended['elbows'][0][1]>.25
            checks['oneSecondExtensionHold']=sum((Vector(r['hands'][0])-Vector(extended['hands'][0])).length<.00001 for r in rows)>=24
        else:
            checks['elbowsAboveShoulders']=all(r['elbows'][s][2]-r['shoulders'][s][2]>.20 for r in rows for s in active)
    if load=='cable-rope' and (family=='curl' or posture=='overhead-cable'):
        lengths=[];gaps=[]
        for r in rows:
            scene.frame_set(r['frame']);bpy.context.view_layer.update()
            main=bpy.data.objects['Cable.0'];junction=main.matrix_world@Vector((0,0,.5))
            for i in [1,2]:
                cable=bpy.data.objects[f'Cable.{i}'];a=cable.matrix_world@Vector((0,0,-.5));b=cable.matrix_world@Vector((0,0,.5))
                lengths.append((b-a).length);gaps.extend([(a-junction).length,(b-Vector(r['hands'][i-1])).length])
        expected=.42 if posture=='overhead-cable' else .38
        checks['fixedRopeLength']=all(abs(n-expected)<.002 for n in lengths)
        checks['ropeConnections']=max(gaps)<.002
    if (family=='curl' and load=='cable-rope') or (family=='triceps' and posture in ['overhead-cable','kickback']):
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        groups={g.index for g in body.vertex_groups if g.name.startswith(('spine','breast','pelvis','upperleg','lowerleg','foot','toe','head','jaw'))}
        indices={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
        tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in indices for i in p.vertices)])
        clear=True;gaps=[]
        for r in rows:
            scene.frame_set(r['frame']);bpy.context.view_layer.update()
            for i in range(3 if load=='cable-rope' else 1):
                cable=bpy.data.objects[f'Cable.{i}'];a=cable.matrix_world@Vector((0,0,-.5));b=cable.matrix_world@Vector((0,0,.5));delta=b-a
                hit=tree.ray_cast(a,delta.normalized(),max(0,delta.length-.015))[0]
                if hit is not None:r.setdefault('cableBodyHits',[]).append({'segment':i,'point':list(hit)})
                clear=clear and hit is None
                if load=='single-cable':gaps.append((b-Vector(r['hands'][0])).length)
        checks['cableClearsBody']=clear
        if gaps:checks['cableAttachedToWorkingHand']=max(gaps)<.002
    if family in ['curl','triceps'] and load in ['ez-bar','dumbbells','single-dumbbell']:
        head_clear=True;support_gaps=[]
        for r in rows:
            scene.frame_set(r['frame']);bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
            body=bpy.data.objects['FORZON Human'].evaluated_get(deps)
            if posture in ['preacher','spider']:
                pad=bpy.data.objects['Preacher arm pad' if posture=='preacher' else 'Spider chest pad']
                groups={g.index for g in body.vertex_groups if g.name.startswith(('upperarm',) if posture=='preacher' else ('spine','breast'))}
                points=[pad.matrix_world.inverted()@body.matrix_world@v.co for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55]
                halfx=max(v.co.x for v in pad.data.vertices);halfy=max(v.co.y for v in pad.data.vertices)
                selected=[p.z for p in points if abs(p.x)<halfx-.01 and abs(p.y)<halfy-.01]
                gap=min(selected)-(.03 if posture=='preacher' else .035)
                support_gaps.append(gap);r['supportSurfaceGap']=gap
            groups={g.index for g in body.vertex_groups if g.name in ['head','jaw']}
            indices={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
            head=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in indices for i in p.vertices)])
            roots=[bpy.data.objects['Exercise implement']] if load=='ez-bar' else [bpy.data.objects[f'Dumbbell.{s}'] for s in (['L'] if load=='single-dumbbell' else ['L','R'])]
            for root in roots:
                for child in root.children:
                    if child.type!='MESH':continue
                    mesh=child.evaluated_get(deps);tree=BVHTree.FromPolygons([mesh.matrix_world@v.co for v in mesh.data.vertices],[list(p.vertices) for p in mesh.data.polygons])
                    head_clear=head_clear and not bool(tree.overlap(head))
        checks['implementClearsHeadEveryFrame']=head_clear
        if support_gaps:checks['bodyRestsOnPadSurface']=all(-.012<gap<.035 for gap in support_gaps)
    if family=='vacuum':
        body=bpy.data.objects['FORZON Human'];key=body.data.shape_keys.key_blocks['Abdominal draw-in'];values=[]
        for r in rows:
            scene.frame_set(r['frame']);values.append(key.value)
        checks['stableStandingPosture']=stable('feet') and stable('shoulders')
        checks['stableIsometricSkeleton']=all(stable(key) for key in ['elbows','wrists','knees'])
        checks['drawInAndRelease']=values[0]<.001 and values[-1]<.001 and max(values)>.99
        checks['tenSecondHold']=sum(n>.999 for n in values)>=240
        checks['visibleAbdominalRetraction']=max((a.co-b.co).length for a,b in zip(key.data,body.data.shape_keys.key_blocks['Basis'].data))>.02
