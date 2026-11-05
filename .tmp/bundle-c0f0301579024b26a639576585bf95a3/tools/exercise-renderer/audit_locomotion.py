"""World-space foot support, cadence and alternating step review."""
import math
import bpy
from mathutils import Vector

def audit_locomotion(spec,rows,checks,rig,scene):
    if spec['family'] not in ['run','sled_push']:return
    running=spec['family']=='run'
    indices={};previous={};drift=[];soles=[];contact_soles=[];contacts=[];travel=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        travel.append(bpy.data.objects['Motion reference'].matrix_world.translation.y);state=[]
        for s in ['L','R']:
            if s not in indices:
                groups={g.index for g in body.vertex_groups if g.name.startswith(('foot.','toe')) and g.name.endswith('.'+s)}
                visible={i for p in body.data.polygons for i in p.vertices}
                indices[s]=[v.index for v in body.data.vertices if v.index in visible and sum(g.weight for g in v.groups if g.group in groups)>.55]
            points=[body.matrix_world@body.data.vertices[i].co for i in indices[s]];low=min(p.z for p in points);soles.append(low)
            contact=bool(bpy.data.objects[f'Check.Foot.{s}.actual'].get('contact',0));state.append(contact)
            toe=rig.matrix_world@rig.pose.bones[f'toe2-1.{s}'].head
            if contact:
                contact_soles.append(low)
                if s in previous and previous[s][1]:drift.append((toe-previous[s][0]).length)
            previous[s]=(toe,contact)
        contacts.append(state);r['runningSupport' if running else 'sledSupport']={'contacts':state,'footMinimumZ':soles[-2:]}
    if not running:
        handles=[]
        for r in rows:
            for s,sign in enumerate([1,-1]):handles.append((Vector(r['hands'][s])-Vector((sign*.27,-.94,1.03))).length)
        checks['sledFixedPostGrip']=max(handles)<.002
        checks['sledContinuousGroundSupport']=all(a or b for a,b in contacts)
        checks['sledIncludesDoubleSupport']=any(a and b for a,b in contacts)
        checks['sledStanceDoesNotSlide']=max(drift)<.003
        checks['sledFootContactOnTrack']=all(.004<z<.025 for z in contact_soles)
        checks['sledFeetClearTrack']=min(soles)>.002
        checks['sledForwardTravel']=abs(travel[-1]-travel[0]+1.8)<.002
        checks['sledForwardLean45']=all(abs(r['rootLean']-45)<.1 for r in rows)
        return
    landings=sum(contacts[0])+sum(sum(now[s] and not before[s] for s in [0,1]) for before,now in zip(contacts[:-2],contacts[1:-1]))
    checks['runningCadence168']=165<=landings/(spec['frames']/24)*60<=175
    checks['runningAlternatingContacts']=all(not(a and b) for a,b in contacts)
    checks['runningIncludesFlight']=any(not(a or b) for a,b in contacts)
    checks['runningStanceFootDoesNotSlide']=max(drift)<.003
    checks['runningFootContactOnTrack']=all(.006<z<.026 for z in contact_soles)
    checks['runningFeetClearTrack']=min(soles)>.004
    checks['runningForwardTravel']=abs(travel[-1]-travel[0]+10.5)<.002
    checks['runningUprightLean']=all(abs(r['rootLean']-5)<.1 for r in rows)
    checks['runningBentElbows']=all(89<n<91 for r in rows for n in r['elbowAngles'])
    checks['runningSwingKneeFlexion']=max(n for r in rows for n in r['kneeFlexion'])>105
