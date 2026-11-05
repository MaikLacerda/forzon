"""Support surfaces and constrained machine travel for special lower motions."""
import math
import bpy
from mathutils import Vector

_surface_indices={}
_rendered_indices={}

def rendered_points(body):
    key=(body.name,len(body.data.vertices),len(body.data.polygons))
    if key not in _rendered_indices:_rendered_indices[key]={i for p in body.data.polygons for i in p.vertices}
    return [body.matrix_world@body.data.vertices[i].co for i in _rendered_indices[key]]

def pelvis_surface_points(body,rig):
    inverse=rig.matrix_world.inverted()
    hip=(rig.pose.bones['upperleg01.L'].head+rig.pose.bones['upperleg01.R'].head)/2
    selected=[]
    for point in rendered_points(body):
        local=inverse@point
        if abs(local.x)<.23 and hip.z-.13<local.z<hip.z+.08 and local.y>hip.y+.015:selected.append(point)
    return selected

def surface_points(body,prefixes):
    key=(body.name,prefixes,len(body.data.vertices))
    if key not in _surface_indices:
        groups={g.index for g in body.vertex_groups if g.name.startswith(prefixes)}
        visible={i for p in body.data.polygons for i in p.vertices}
        _surface_indices[key]=[v.index for v in body.data.vertices if v.index in visible and sum(g.weight for g in v.groups if g.group in groups)>.55]
    return [body.matrix_world@body.data.vertices[i].co for i in _surface_indices[key]]

def pad_gap(body,name,prefixes,half):
    pad=bpy.data.objects[name];inverse=pad.matrix_world.inverted()
    hx=max(v.co.x for v in pad.data.vertices);hy=max(v.co.y for v in pad.data.vertices)
    points=[inverse@p for p in surface_points(body,prefixes)]
    inside=[p.z for p in points if abs(p.x)<hx-.01 and abs(p.y)<hy-.01]
    return min(inside)-half if inside else 10

def audit_sissy(spec,rows,checks,rig,scene):
    toes={s:[] for s in ['L','R']};soles=[];lines=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        soles.append(min(p.z for p in surface_points(body,('toe',))))
        for s in ['L','R']:toes[s].append(rig.matrix_world@rig.pose.bones[f'toe2-1.{s}'].head)
        shoulder=(Vector(r['shoulders'][0])+Vector(r['shoulders'][1]))/2;hip=Vector(r['hip']);knee=(Vector(r['knees'][0])+Vector(r['knees'][1]))/2
        lines.append((shoulder-hip).normalized().dot((hip-knee).normalized()))
    checks['sissyForefootAtFloor']=all(-.006<z<.012 for z in soles)
    checks['sissyForefootFixed']=all(max((p-ps[0]).length for p in ps)<.002 for ps in toes.values())
    checks['sissySupportedHand']=max((Vector(r['hands'][0])-Vector((.48,.05,1.10))).length for r in rows)<.002
    checks['sissyKneeRange']=all(100<max(r['kneeFlexion'][s] for r in rows)<120 for s in [0,1])
    checks['sissyExtendedHips']=min(lines)>.99
    checks['sissyBackwardLean']=max(r['rootLean'] for r in rows)>54

def audit_leg_press_calf(spec,rows,checks,rig,scene):
    along=Vector((0,1,1)).normalized();normal=Vector((0,-1,1)).normalized()
    toes={s:[] for s in ['L','R']};ankles={s:[] for s in ['L','R']};soles=[];gaps=[];travel=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        gaps.append(pad_gap(body,'Leg press back pad',('spine','breast'),.04))
        plate=bpy.data.objects['Leg press foot platform'];inverse=plate.matrix_world.inverted()
        points=[inverse@p for p in surface_points(body,('foot.','toe'))]
        inside=[p.z for p in points if abs(p.x)<.465 and abs(p.y)<.28]
        soles.append(max(inside)+.025);r['legPressCalfSoleGap']=soles[-1]
        for s in ['L','R']:
            toes[s].append(rig.matrix_world@rig.pose.bones[f'toe2-1.{s}'].head)
            ankles[s].append(rig.matrix_world@rig.pose.bones[f'foot.{s}'].head)
        travel.append(normal.dot(bpy.data.objects['Leg press moving sled'].matrix_world.translation))
    checks['calfLegPressBackSupport']=all(-.015<g<.025 for g in gaps)
    checks['calfLegPressForefootContact']=all(-.012<g<.015 for g in soles)
    checks['calfLegPressToesDoNotSlide']=all(max(along.dot(p) for p in points)-min(along.dot(p) for p in points)<.002 for points in toes.values())
    checks['calfLegPressAnkleNormalFixed']=all(max(normal.dot(p) for p in points)-min(normal.dot(p) for p in points)<.002 for points in ankles.values())
    checks['calfLegPressAnkleDrivesSled']=max(travel)-min(travel)>.09
    checks['calfLegPressSoftKnees']=all(5<n<40 for r in rows for n in r['kneeFlexion'])
    checks['calfLegPressTorsoStable']=max((Vector(r['shoulders'][s])-Vector(rows[0]['shoulders'][s])).length for r in rows for s in [0,1])<.001

def audit_hack(spec,rows,checks,rig,scene):
    gaps=[];soles=[];positions=[];pad_distances=[];handles=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        gaps.append(pad_gap(body,'Hack back pad',('spine','breast'),.04))
        soles.append(min(p.z for p in surface_points(body,('foot.','toe')))-.10)
        positions.append(list(bpy.data.objects['Hack moving carriage'].matrix_world.translation))
        for i,s in enumerate(['L','R']):
            handles.append((bpy.data.objects[f'Hack grip.{s}'].matrix_world.translation-Vector(r['hands'][i])).length)
        r['hackBackGap']=gaps[-1];r['hackSoleGap']=soles[-1]
    checks['hackBackContact']=all(-.015<g<.025 for g in gaps)
    checks['hackSolesOnPlatform']=all(-.004<g<.008 for g in soles)
    checks['hackHandles']=max(handles)<.002
    checks['hackRigid45DegreeTorso']=all(abs(r['rootLean']-45)<.1 for r in rows)
    checks['hack45DegreeCarriageTravel']=max(p[1]-p[2] for p in positions)-min(p[1]-p[2] for p in positions)<.002
    checks['hackDepth']=all(100<max(r['kneeFlexion'][s] for r in rows)<145 for s in [0,1])
    checks['hackFootStability']=max((Vector(r['feet'][s])-Vector(rows[0]['feet'][s])).length for r in rows for s in [0,1])<.001

def audit_lower_special(spec,rows,checks,rig,scene):
    family=spec['family'];style=spec.get('style')
    if spec.get('load')=='hack-sled':return audit_hack(spec,rows,checks,rig,scene)
    if spec.get('load')=='sissy-support':return audit_sissy(spec,rows,checks,rig,scene)
    if family=='calf' and spec.get('posture')=='leg-press':return audit_leg_press_calf(spec,rows,checks,rig,scene)
    if family!='leg_press' and style!='back-extension':return
    def stable(key):return max((Vector(r[key][s])-Vector(rows[0][key][s])).length for r in rows for s in [0,1])<.001
    gaps=[];soles=[];sled=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        if family=='leg_press':
            gaps.append(pad_gap(body,'Leg press back pad',('spine','breast'),.04))
            plate=bpy.data.objects['Leg press foot platform'];inverse=plate.matrix_world.inverted()
            points=[inverse@p for p in surface_points(body,('foot.','toe'))]
            soles.append(max(p.z for p in points)+.025)
            sled.append(list(bpy.data.objects['Leg press moving sled'].matrix_world.translation))
        else:
            for sign in [-1,1]:gaps.append(pad_gap(body,f'Roman chair thigh pad.{sign}',('upperleg',),.05))
            platform=bpy.data.objects['Roman chair foot platform'];inverse=platform.matrix_world.inverted()
            soles.append(min((inverse@p).z for p in surface_points(body,('foot.','toe')))-.025)
        r['specialSupportGaps']=gaps[-(1 if family=='leg_press' else 2):];r['platformSoleGap']=soles[-1]
    checks['specialPadsContactBody']=all(-.015<g<.025 for g in gaps)
    checks['solesContactMachinePlatform']=all(-.012<g<.015 for g in soles)
    if family=='leg_press':
        checks['stableLegPressTorso']=stable('shoulders');checks['fixedLegPressGrips']=stable('hands')
        checks['legPressKneeDepth']=all(90<max(r['kneeFlexion'][s] for r in rows)<115 for s in [0,1])
        checks['legPressSoftKneeLockout']=all(5<min(r['kneeFlexion'][s] for r in rows)<30 for s in [0,1])
        checks['legPress45DegreeTravel']=max(p[1]+p[2] for p in sled)-min(p[1]+p[2] for p in sled)<.002
        checks['legPressSledMoves']=max(p[2] for p in sled)-min(p[2] for p in sled)>.18
    else:
        checks['backExtensionFixedLegs']=stable('feet') and stable('knees')
        checks['backExtensionHipHinge']=min(r['rootLean'] for r in rows)<46 and max(r['rootLean'] for r in rows)>98
        checks['backExtensionStraightKnees']=max(n for r in rows for n in r['kneeFlexion'])<3
