"""Step-touch floor support and rhythmic squat/arm excursion."""
import bpy
from mathutils import Vector
from audit_lower_special import surface_points

def audit_dance(spec,rows,checks,rig,scene):
    if spec['family']!='dance':return
    soles=[];contacts=[];sliding=[];previous={};hip=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        soles.append(min(p.z for p in surface_points(body,('foot.','toe'))));state=[]
        hip.append((rig.matrix_world@rig.pose.bones['upperleg01.L'].head).z)
        for side in ['L','R']:
            marker=bpy.data.objects[f'Check.Foot.{side}.actual'];point=marker.matrix_world.translation.copy();contact=bool(marker.get('contact',0));state.append(contact)
            if contact and side in previous and previous[side][1]:sliding.append((point-previous[side][0]).length)
            previous[side]=(point,contact)
        contacts.append(state)
    checks['danceGroundSupport']=all(any(s) for s in contacts)
    checks['danceFeetClearFloor']=min(soles)>-.005
    checks['dancePlantedFootDoesNotSlide']=max(sliding)<.003
    checks['danceLateralStepTouch']=max(r['feet'][0][0] for r in rows)-min(r['feet'][0][0] for r in rows)>.24
    second=hip[len(rows)//2:]
    checks['danceRhythmicSquatDepth']=max(second)-min(second)>.22
    checks['danceAlternatingArms']=all(max(r['hands'][i][2] for r in rows)-min(r['hands'][i][2] for r in rows)>.45 for i in [0,1])
