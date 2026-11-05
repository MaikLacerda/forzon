"""Guard, implement attachment, punch identity and floor support checks."""
import bpy
from mathutils import Vector
from audit_lower_special import surface_points

def audit_combat(spec,rows,checks,rig,scene):
    if spec['family']!='boxing':return
    soles=[];grip=[];guard=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        t=(r['frame']-1)/(spec['frames']-1);beat=min(3,int(t*4));active=0 if beat in [0,2] else 1
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        soles.append(min(p.z for p in surface_points(body,('foot.','toe'))))
        other=1-active
        guard.append((Vector(r['hands'][other])-Vector(r['shoulders'][other])-Vector((0,-.15,.12))).length)
        for i,s in enumerate(['L','R']):grip.append((bpy.data.objects[f'Dumbbell.{s}'].matrix_world.translation-Vector(r['hands'][i])).length)
    peaks=[round((beat+.40)/4*(len(rows)-1)) for beat in range(4)]
    checks['boxingStraightPunchesExtend']=all(rows[peaks[b]]['elbowAngles'][b]<40 for b in [0,1])
    checks['boxingHookBentElbow']=50<rows[peaks[2]]['elbowAngles'][0]<125
    checks['boxingUppercutRises']=rows[peaks[3]]['hands'][1][2]>rows[0]['hands'][1][2]+.03
    checks['boxingDefensiveHandStaysAtGuard']=max(guard)<.002
    checks['boxingDumbbellsInHands']=max(grip)<.002
    checks['boxingFeetClearFloor']=min(soles)>-.005
    checks['boxingGroundSupport']=max(soles)<.025
    checks['boxingActiveShoulderDrivesForward']=all(rows[peaks[b]]['shoulders'][i][1]<rows[0]['shoulders'][i][1]-.02 for b,i in [(0,0),(1,1),(2,0),(3,1)])
