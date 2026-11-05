"""Review actual knee pivots, roller contacts and forefoot support geometry."""
import math
import bpy
from mathutils import Vector

def seat_gap(body,name,half_height):
    from audit_lower_special import surface_points
    pad=bpy.data.objects[name]
    points=[pad.matrix_world.inverted()@p for p in surface_points(body,('upperleg','pelvis','spine'))]
    halfx=max(v.co.x for v in pad.data.vertices);halfy=max(v.co.y for v in pad.data.vertices)
    return min(p.z for p in points if abs(p.x)<halfx-.01 and abs(p.y)<halfy-.01)-half_height

def audit_seated_curl(spec,rows,checks,rig,scene):
    for key in ['knees','shoulders','hands']:
        checks['seatedCurlFixed'+key.title()]=max((Vector(r[key][s])-Vector(rows[0][key][s])).length for r in rows for s in [0,1])<.001
    angles=[n for r in rows for n in r['kneeFlexion']]
    checks['seatedCurlKneeRange']=min(angles)<8 and 105<max(angles)<115
    checks['seatedCurlPeakHold']=sum(min(r['kneeFlexion'])>109.99 for r in rows)>=24
    gaps=[];roller_errors=[];pivot_errors=[];restraint_gaps=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        gaps.append(seat_gap(body,'Seated curl seat',.04));r['seatSurfaceGap']=gaps[-1]
        knee=(Vector(r['knees'][0])+Vector(r['knees'][1]))/2
        ankle=sum((rig.matrix_world@rig.pose.bones[f'foot.{s}'].head for s in ['L','R']),Vector())/2
        direction=(ankle-knee).normalized();normal=Vector((0,-direction.z,direction.y))
        roller=bpy.data.objects['Seated curl ankle roller'].matrix_world.translation
        roller_errors.append((roller-knee-direction*.34-normal*.09).length)
        for s in ['L','R']:
            lever=bpy.data.objects[f'Seated curl lever.{s}'];a=lever.matrix_world@Vector((0,0,-.5));b=lever.matrix_world@Vector((0,0,.5))
            pivot_errors.extend([math.hypot(a.y-knee.y,a.z-knee.z),math.hypot(b.y-roller.y,b.z-roller.z)])
        pad=bpy.data.objects['Seated curl thigh restraint'];groups={g.index for g in body.vertex_groups if g.name.startswith('upperleg')}
        points=[body.matrix_world@v.co for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55]
        under=[p.z for p in points if abs(p.y-pad.location.y)<.03]
        restraint_gaps.append(pad.location.z-.06-max(under))
        r['thighRestraintGap']=restraint_gaps[-1]
    checks['seatedCurlSeatContact']=all(-.015<g<.025 for g in gaps)
    checks['seatedCurlPosteriorAnkleRoller']=max(roller_errors)<.003
    checks['seatedCurlKneeAxis']=max(pivot_errors)<.003
    checks['seatedCurlThighRestraint']=all(-.015<g<.025 for g in restraint_gaps)

def audit_leg_machines(spec,rows,checks,rig,scene):
    family=spec['family'];load=spec.get('load');style=spec.get('style');seated=spec.get('posture')=='seated';single=load=='single-dumbbell'
    def stable(key,sides=[0,1]):return max((Vector(r[key][s])-Vector(rows[0][key][s])).length for r in rows for s in sides)<.001
    if family=='leg_isolation':
        if style=='seated-curl':return audit_seated_curl(spec,rows,checks,rig,scene)
        checks['fixedKneeAxis']=stable('knees');checks['fixedUpperBody']=stable('shoulders')
        checks['fixedHandSupport']=stable('hands')
        angles=[n for r in rows for n in r['kneeFlexion']]
        checks['specifiedKneeRange']=(min(angles)<8 and 85<max(angles)<95) if style=='extension' else (min(angles)<8 and 105<max(angles)<115)
        target=min(angles) if style=='extension' else max(angles)
        checks['oneSecondContractionHold']=sum(all(abs(n-target)<.01 for n in r['kneeFlexion']) for r in rows)>=24
        radii=[];contact=[];pivots=[];handles=[];support_gaps=[]
        for r in rows:
            scene.frame_set(r['frame']);bpy.context.view_layer.update()
            body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
            if style=='extension':support_gaps.append(seat_gap(body,'Leg extension seat',.04))
            if style=='prone-curl':
                for name,prefixes in [('Leg curl chest pad',('spine','breast')),('Leg curl thigh pad',('upperleg',))]:
                    pad=bpy.data.objects[name];groups={g.index for g in body.vertex_groups if g.name.startswith(prefixes)}
                    points=[pad.matrix_world.inverted()@body.matrix_world@v.co for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55]
                    halfx=max(v.co.x for v in pad.data.vertices);halfy=max(v.co.y for v in pad.data.vertices)
                    support_gaps.append(min(p.z for p in points if abs(p.x)<halfx-.01 and abs(p.y)<halfy-.01)-.04)
            roller=bpy.data.objects['Leg contact roller'].matrix_world.translation
            knee=(Vector(r['knees'][0])+Vector(r['knees'][1]))/2
            ankle=sum((rig.matrix_world@rig.pose.bones[f'foot.{s}'].head for s in ['L','R']),Vector())/2
            direction=(ankle-knee).normalized();delta=roller-knee
            contact.append(abs(delta.dot(direction)-.34));radii.append((delta-direction*delta.dot(direction)).length)
            for i,side in enumerate(['L','R']):
                lever=bpy.data.objects[f'Leg load lever.{side}'];a=lever.matrix_world@Vector((0,0,-.5));b=lever.matrix_world@Vector((0,0,.5))
                pivots.append(math.hypot(a.y-knee.y,a.z-knee.z));contact.append(math.hypot(b.y-roller.y,b.z-roller.z))
                handles.append((bpy.data.objects[f'Leg machine grip.{side}'].matrix_world.translation-Vector(r['hands'][i])).length)
        checks['rollerAboveAnkles']=max(contact)<.003
        checks['rollerOnShinSurface']=all(abs(n-.09)<.003 for n in radii)
        checks['machinePivotMatchesKnees']=max(pivots)<.002
        checks['handsOnFixedGrips']=max(handles)<.002
        if support_gaps:checks['bodyOnMachinePads']=all(-.015<gap<.025 for gap in support_gaps)
    elif family=='abduction':
        checks['stableTorso']=stable('shoulders');checks['fixedHands']=stable('hands')
        checks['seatedKneesBent']=all(80<n<95 for r in rows for n in r['kneeFlexion'])
        checks['symmetricHipOpening']=all(abs(r['knees'][0][0]+r['knees'][1][0])<.003 for r in rows)
        checks['hipAbductionRange']=max(abs(r['knees'][0][0]-r['knees'][1][0]) for r in rows)-min(abs(r['knees'][0][0]-r['knees'][1][0]) for r in rows)>.35
        checks['forwardTrunkIncline']=all(abs(r['rootLean']-22)<.1 for r in rows)
        peak=max(rows,key=lambda r:r['knees'][0][0]);checks['oneSecondOpenHold']=sum(abs(r['knees'][0][0]-peak['knees'][0][0])<.00001 for r in rows)>=24
        gaps=[];lengths=[];seat_gaps=[]
        for r in rows:
            scene.frame_set(r['frame']);bpy.context.view_layer.update()
            body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get());gap=seat_gap(body,'Abduction seat',.045)
            seat_gaps.append(gap);r['seatSurfaceGap']=gap
            for i,side in enumerate(['L','R']):
                pad=bpy.data.objects[f'Abduction knee pad.{side}'];knee=Vector(r['knees'][i])
                gaps.append(abs((pad.matrix_world.translation-knee).length-.11))
                lengths.append(bpy.data.objects[f'Abduction radial lever.{side}'].scale.z)
        checks['padsFollowOuterKnees']=max(gaps)<.002
        checks['rigidAbductionLevers']=max(lengths)-min(lengths)<.002
        checks['bodyOnAbductionSeat']=all(-.015<gap<.025 for gap in seat_gaps)
    elif family=='calf':
        sides=['L'] if single else ['L','R'];indices=[0] if single else [0,1]
        toe_points={s:[] for s in sides};heels={s:[] for s in sides};toe_soles=[];handle_gaps=[];pad_gaps=[];seat_gaps=[]
        for r in rows:
            scene.frame_set(r['frame']);bpy.context.view_layer.update()
            body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
            if seated:
                gap=seat_gap(body,'Seated calf seat',.04);seat_gaps.append(gap);r['seatSurfaceGap']=gap
            for s in sides:
                toe_points[s].append(rig.matrix_world@rig.pose.bones[f'toe2-1.{s}'].head)
                groups={g.index for g in body.vertex_groups if g.name==f'foot.{s}'}
                heel_indices=[v.index for v in bpy.data.objects['FORZON Human'].data.vertices if v.co.y>0 and sum(g.weight for g in v.groups if g.group in groups)>.55]
                heels[s].append(min((body.matrix_world@body.data.vertices[i].co).z for i in heel_indices))
                groups={g.index for g in body.vertex_groups if g.name.startswith(('toe1-','toe2-')) and g.name.endswith('.'+s)}
                toe_soles.append(min((body.matrix_world@v.co).z for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55))
            if not seated and not single:
                carriage=bpy.data.objects['Calf moving shoulder carriage']
                for i,sign in enumerate([1,-1]):
                    handle=carriage.matrix_world@Vector((sign*.30,-.55,-.27));handle_gaps.append((handle-Vector(r['hands'][i])).length)
                    pad=carriage.matrix_world@Vector((sign*.186,-.42,-.04));pad_gaps.append(abs(pad.z-r['shoulders'][i][2]-.11))
        step=.12 if seated else .15
        checks['fixedMetatarsalSupport']=all(max((p-points[0]).length for p in points)<.002 for points in toe_points.values())
        checks['forefootOnStep']=all(step-.012<z<step+.015 for z in toe_soles)
        checks['heelLowersAndRises']=all(min(points)<step-.01 and max(points)>step+.04 for points in heels.values())
        checks['controlledCalfRange']=all(max(points)-min(points)>.08 for points in heels.values())
        checks['peakContractionHold']=all(sum(abs(z-max(points))<.0001 for z in points)>=(32 if seated else 48) for points in heels.values())
        if seated:
            checks['bodyOnCalfSeat']=all(-.015<gap<.025 for gap in seat_gaps)
            checks['stableSeat']=stable('shoulders')
            checks['bentKneeCalfWork']=all(65<n<115 for r in rows for n in r['kneeFlexion'])
        else:
            checks['uprightCalfPosture']=all(r['rootLean']<.1 for r in rows)
            checks['noSquattingDuringCalfRaise']=all(r['kneeFlexion'][i]<30 for r in rows for i in indices)
        if single:
            checks['oppositeHandStaysOnRail']=stable('hands',[1])
            checks['nonworkingFootSuspended']=all(r['feet'][1][2]>.35 for r in rows)
        elif not seated:
            checks['handsOnCarriageGrips']=max(handle_gaps)<.002
            checks['shouldersUnderMovingPads']=max(pad_gaps)<.002
