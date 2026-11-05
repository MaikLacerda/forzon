"""Side-lying lateral raise: support contact and abduction relative to the torso."""
import math
import bpy
from mathutils import Vector
from audit_lower_special import pad_gap,surface_points

def audit_supported_raise(spec,rows,checks,rig,scene):
    back=[];hip=[];feet=[];floor=[];arcs=[]
    direction=Vector((0,math.cos(math.pi/6),math.sin(math.pi/6)))
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        back.append(pad_gap(body,'Bench back',('spine','breast'),.04))
        hip.append(pad_gap(body,'Side raise hip cushion',('pelvis','upperleg'),.04))
        feet.append(min(p.z for p in surface_points(body,('foot.','toe'))))
        weight=bpy.data.objects['Dumbbell.R'];deps=bpy.context.evaluated_depsgraph_get()
        floor.append(min((obj.evaluated_get(deps).matrix_world@v.co).z for obj in weight.children if obj.type=='MESH' for v in obj.evaluated_get(deps).data.vertices))
        upper=(Vector(r['elbows'][1])-Vector(r['shoulders'][1])).normalized()
        arcs.append(math.degrees(upper.angle(-direction)))
        r['supportedRaise']={'backGap':back[-1],'hipGap':hip[-1],'footMinimumZ':feet[-1],'abductionDegrees':arcs[-1]}
    checks['supportedRaiseBackContact']=all(-.015<g<.025 for g in back)
    checks['supportedRaiseHipContact']=all(-.015<g<.025 for g in hip)
    checks['supportedRaiseFootSupport']=all(-.006<z<.015 for z in feet)
    checks['supportedRaiseFixedElbowBend']=all(9<n<11 for r in rows for n in [r['elbowAngles'][1]])
    checks['supportedRaisePerpendicularToTrunk']=min(arcs)<13 and 89<max(arcs)<91
    checks['supportedRaiseWeightClearsFloor']=min(floor)>.10
    checks['supportedRaiseStableTrunk']=max((Vector(r['shoulders'][s])-Vector(rows[0]['shoulders'][s])).length for r in rows for s in [0,1])<.001
