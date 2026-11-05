"""Fixed-bar contact, pull/turnover/dip ordering and body clearance."""
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from audit_lower_special import surface_points

def audit_muscle_up(spec,rows,checks,rig,scene):
    soles=[];bar_clear=True;contacts=[];normal_steps=[]
    for r in rows:
        scene.frame_set(r['frame']);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        soles.append(min(p.z for p in surface_points(body,('foot.','toe'))))
        for i,sign in enumerate([1,-1]):contacts.append((Vector(r['hands'][i])-Vector((sign*.30,-.13,2.05))).length)
        groups={g.index for g in body.vertex_groups if g.name.startswith(('head','jaw','spine','breast','pelvis','upperleg','lowerleg','foot','toe'))}
        indices={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
        tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in indices for i in p.vertices)])
        hit=tree.ray_cast(Vector((-.70,-.13,2.05)),Vector((1,0,0)),1.40)[0]
        if hit is not None:r['muscleUpBarHit']=list(hit);bar_clear=False
        r['muscleUpFootMinimumZ']=soles[-1]
    for previous,current in zip(rows,rows[1:]):
        for s in [0,1]:
            a=Vector((previous['palmX'][s],previous['palmY'][s],previous['palmZ'][s]));b=Vector((current['palmX'][s],current['palmY'][s],current['palmZ'][s]))
            normal_steps.append(a.angle(b))
    peak=max(rows,key=lambda r:r['hip'][2]);transition=rows[round(.40*(len(rows)-1))]
    checks['muscleUpFixedGrip']=max(contacts)<.002
    checks['muscleUpTargetsAccurate']=max(e for r in rows for e in r['errors'])<.002
    checks['muscleUpStraightHang']=max(rows[0]['elbowAngles'])<20
    checks['muscleUpPullsHigh']=max(n for r in rows for n in r['elbowAngles'])>100
    checks['muscleUpShouldersAboveBarAtTurnover']=min(p[2] for p in transition['shoulders'])>2.15
    checks['muscleUpTopSupport']=peak['hip'][2]>2.15 and max(peak['elbowAngles'])<18
    checks['muscleUpFeetSuspended']=min(soles)>.05
    checks['muscleUpBarClearsBody']=bar_clear
    checks['muscleUpContinuousWristTurnover']=max(normal_steps)<.18
    checks['muscleUpContinuousElbowMotion']=max((Vector(b['elbows'][s])-Vector(a['elbows'][s])).length for a,b in zip(rows,rows[1:]) for s in [0,1])<.08
