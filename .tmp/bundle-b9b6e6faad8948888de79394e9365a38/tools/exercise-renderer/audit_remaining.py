"""Frame-by-frame audits of authored motions, never a substitute for visual review."""
import argparse,json,math,sys,hashlib
from pathlib import Path
import bpy
from mathutils import Vector

root=Path(__file__).resolve().parent
sys.path.insert(0,str(root))
specs=json.loads((root/'remaining-motion-specs.json').read_text(encoding='utf8'))
parser=argparse.ArgumentParser()
parser.add_argument('exercise',choices=list(specs))
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
spec=specs[args.exercise]
out=root/'output'
bpy.ops.wm.open_mainfile(filepath=str(out/f'{args.exercise}.blend'))
rig=bpy.data.objects['Human Rig'];scene=bpy.context.scene
follow=bpy.data.objects['Motion reference']
rows=[]
for frame in range(scene.frame_start,scene.frame_end+1):
    scene.frame_set(frame);bpy.context.view_layer.update()
    row={'frame':frame,'hands':[],'feet':[],'elbows':[],'wrists':[],'elbowAngles':[],'shoulders':[],'errors':[], 'forearmTilt':[], 'gripGap':[], 'leverLengths':[], 'leverGripGaps':[], 'handleSides':[], 'cableGaps':[], 'pulleyHeights':[], 'palmZ':[], 'palmX':[], 'palmY':[]}
    for side in ['L','R']:
        shoulder=rig.matrix_world@rig.pose.bones[f'upperarm01.{side}'].head
        elbow=rig.matrix_world@rig.pose.bones[f'lowerarm01.{side}'].head
        wrist=rig.matrix_world@rig.pose.bones[f'wrist.{side}'].head
        row['elbows'].append(list(elbow));row['wrists'].append(list(wrist))
        row['elbowAngles'].append(math.degrees((elbow-shoulder).angle(wrist-elbow)))
        row['forearmTilt'].append(math.degrees((wrist-elbow).angle(Vector((0,0,1)))))
        row['shoulders'].append(list(follow.matrix_world.inverted()@shoulder))
        index=rig.pose.bones[f'finger2-1.{side}'].head
        pinky=rig.pose.bones[f'finger5-1.{side}'].head
        middle=rig.pose.bones[f'finger3-1.{side}'].head
        hand_long=(middle-rig.pose.bones[f'wrist.{side}'].head).normalized()
        across=pinky-index;across=(across-hand_long*across.dot(hand_long)).normalized()
        palm=-(1 if side=='L' else -1)*across.cross(hand_long).normalized()
        normal=rig.matrix_world.to_quaternion()@palm
        row['palmX'].append(normal.x);row['palmY'].append(normal.y);row['palmZ'].append(normal.z)
        for label,key in [('Hand','hands'),('Foot','feet')]:
            actual=bpy.data.objects[f'Check.{label}.{side}.actual']
            wanted=bpy.data.objects[f'Check.{label}.{side}.wanted']
            row[key].append(list(actual.location))
            row['errors'].append((actual.matrix_world.translation-wanted.matrix_world.translation).length)
        if spec['family']!='pullover' and (spec.get('load')=='dumbbells' or (spec.get('load')=='single-dumbbell' and spec.get('style')!='sumo' and side==spec.get('side','L'))):
            weight=bpy.data.objects[f'Dumbbell.{side}']
            actual=bpy.data.objects[f'Check.Hand.{side}.actual']
            row['gripGap'].append((weight.matrix_world.translation-actual.matrix_world.translation).length)
        elif spec.get('load') in ['ez-bar','cable-v']:
            bar=bpy.data.objects['Exercise implement']
            hand=bar.matrix_world.inverted()@bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            if spec['load']=='ez-bar':
                half=.24
                a,b=(Vector((half-.08,.092,0)),Vector((half+.08,0,0))) if side=='L' else (Vector((-half-.08,0,0)),Vector((-half+.08,.092,0)))
            else:a,b=Vector((0,0,0)),Vector((.28 if side=='L' else -.28,.161,0))
            delta=b-a;nearest=a+delta*max(0,min(1,(hand-a).dot(delta)/delta.length_squared))
            row['gripGap'].append((hand-nearest).length)
            if spec['load']=='cable-v':
                eye=bar.matrix_world@Vector((0,0,.08));cable=bpy.data.objects['Cable.0']
                row['cableGaps'].append(((cable.matrix_world@Vector((0,0,.5)))-eye).length)
        elif spec.get('load') in ['barbell','back-bar','front-bar','smith-bar']:
            bar=bpy.data.objects['Exercise implement']
            hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            axis=(bar.matrix_world.to_3x3()@Vector((1,0,0))).normalized()
            delta=hand-bar.matrix_world.translation
            row['gripGap'].append((delta-axis*delta.dot(axis)).length)
        elif spec.get('load')=='landmine':
            handle=bpy.data.objects[f'Landmine grip.{side}']
            hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            row['gripGap'].append((hand-handle.matrix_world.translation).length)
        elif spec['family']=='raise' and spec.get('load') in ['single-cable','cable-rope']:
            if spec['load']=='cable-rope' or side==spec.get('side','L'):
                handle=bpy.data.objects[f'Handle.{side}'];hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
                row['gripGap'].append((handle.matrix_world.translation-hand).length)
        elif spec['family']=='face_pull' or (spec['family'] in ['triceps','curl'] and spec.get('load') in ['cable-rope','single-cable'] and side in (['L','R'] if spec.get('load')=='cable-rope' else [spec.get('side','L')])):
            handle=bpy.data.objects[f'Handle.{side}']
            hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            row['gripGap'].append((handle.matrix_world.translation-hand).length)
        elif spec.get('load')=='machine' and spec['family']=='overhead_press':
            hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            handle=bpy.data.objects[f'Shoulder machine grip.{side}']
            row['gripGap'].append((hand-handle.matrix_world.translation).length)
            stem=bpy.data.objects[f'Shoulder grip stem.{side}'];coupler=bpy.data.objects[f'Shoulder handle coupler.{side}']
            row['handleSides'].extend([stem.scale.z,coupler.scale.z])
            row['leverGripGaps'].append(((stem.matrix_world@Vector((0,0,.5)))-hand).length)
            row['leverGripGaps'].append(((stem.matrix_world@Vector((0,0,-.5)))-(coupler.matrix_world@Vector((0,0,-.5)))).length)
            for label,z,end_z in [('lower',1.60,-.5),('upper',1.80,.5)]:
                link=bpy.data.objects[f'Shoulder {label} link.{side}']
                row['leverLengths'].append(link.scale.z)
                row['leverGripGaps'].append(((link.matrix_world@Vector((0,0,.5)))-(coupler.matrix_world@Vector((0,0,end_z)))).length)
                row.setdefault('pivotGaps',[]).append(((link.matrix_world@Vector((0,0,-.5)))-Vector((.43 if side=='L' else -.43,.65,z))).length)
        elif spec.get('load')=='machine' and spec['family']=='row':
            handle=bpy.data.objects[f'Row machine grip.{side}']
            hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            row['gripGap'].append((handle.matrix_world.translation-hand).length)
            for label,height in [('lower',.10),('upper',.30)]:
                link=bpy.data.objects[f'Row {label} link.{side}']
                row['leverLengths'].append(link.scale.z)
                row['leverGripGaps'].append(((link.matrix_world@Vector((0,0,.5)))-(hand+Vector((0,0,height)))).length)
        elif spec.get('load')=='machine' and spec['family']=='rear_fly':
            handle=bpy.data.objects[f'Reverse fly grip.{side}']
            hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            row['gripGap'].append((handle.matrix_world.translation-hand).length)
            lever=bpy.data.objects[f'Reverse fly lever.{side}']
            row['leverLengths'].append(lever.scale.z)
            row['leverGripGaps'].append(((lever.matrix_world@Vector((0,0,.5)))-(handle.matrix_world@Vector((.10,0,0)))).length)
        elif spec.get('load')=='machine' and spec['family']=='press':
            handle=bpy.data.objects[f'Machine grip.{side}']
            actual=bpy.data.objects[f'Check.Hand.{side}.actual']
            row['gripGap'].append((handle.matrix_world.translation-actual.matrix_world.translation).length)
            lever=bpy.data.objects[f'Press lever.{side}']
            row['leverLengths'].append(lever.scale.z)
            end=lever.matrix_world@Vector((0,0,.5))
            row['leverGripGaps'].append((end-(handle.matrix_world.translation-Vector((0,0,.10)))).length)
            upper=bpy.data.objects[f'Press upper link.{side}']
            row['leverLengths'].append(upper.scale.z)
            row['leverGripGaps'].append(((upper.matrix_world@Vector((0,0,.5)))-(handle.matrix_world.translation+Vector((0,0,.10)))).length)
        elif spec.get('load')=='cables' and spec['family']=='fly':
            handle=bpy.data.objects[f'Fly grip.{side}']
            actual=bpy.data.objects[f'Check.Hand.{side}.actual']
            row['gripGap'].append((handle.matrix_world.translation-actual.matrix_world.translation).length)
            cable=bpy.data.objects[f'Fly cable.{side}']
            row['pulleyHeights'].append((cable.matrix_world@Vector((0,0,-.5))).z)
            index=rig.pose.bones[f'finger2-1.{side}'].head
            pinky=rig.pose.bones[f'finger5-1.{side}'].head
            middle=rig.pose.bones[f'finger3-1.{side}'].head
            hand_long=(middle-rig.pose.bones[f'wrist.{side}'].head).normalized()
            across=pinky-index;across=(across-hand_long*across.dot(hand_long)).normalized()
            palm=-(1 if side=='L' else -1)*across.cross(hand_long).normalized()
            hook=cable.matrix_world@Vector((0,0,.5))
            for index,offset in enumerate([-.07,.07]):
                line=bpy.data.objects[f'D handle.{side}.{index}']
                row['handleSides'].append(line.scale.z)
                row['cableGaps'].append(((line.matrix_world@Vector((0,0,.5)))-hook).length)
                row['cableGaps'].append(((line.matrix_world@Vector((0,0,-.5)))-(handle.matrix_world@Vector((offset,0,0)))).length)
        elif spec.get('load')=='machine' and spec['family']=='fly':
            handle=bpy.data.objects[f'Pec grip.{side}']
            actual=bpy.data.objects[f'Check.Hand.{side}.actual']
            row['gripGap'].append((handle.matrix_world.translation-actual.matrix_world.translation).length)
            lever=bpy.data.objects[f'Pec lever.{side}']
            row['leverLengths'].append(lever.scale.z)
            row['leverGripGaps'].append(((lever.matrix_world@Vector((0,0,.5)))-(handle.matrix_world@Vector((.10,0,0)))).length)
        elif spec.get('load') in ['cable-bar','cable-triangle']:
            bar=bpy.data.objects['Exercise implement']
            hand=bpy.data.objects[f'Check.Hand.{side}.actual'].matrix_world.translation
            if spec['load']=='cable-triangle':
                grip=bar.matrix_world@Vector((.10 if side=='L' else -.10,0,0))
                row['gripGap'].append((hand-grip).length)
            else:
                axis=(bar.matrix_world.to_3x3()@Vector((1,0,0))).normalized()
                delta=hand-bar.matrix_world.translation
                row['gripGap'].append((delta-axis*delta.dot(axis)).length)
            cable=bpy.data.objects['Cable.0']
            eye=bar.matrix_world@Vector((0,0,.15 if spec['load']=='cable-triangle' else .06))
            row['cableGaps'].append(((cable.matrix_world@Vector((0,0,.5)))-eye).length)
    row['hip']=list(rig.matrix_world@((rig.pose.bones['upperleg01.L'].head+rig.pose.bones['upperleg01.R'].head)/2))
    row['chest']=list(rig.matrix_world@rig.pose.bones['breast.L'].tail)
    if spec.get('load') in ['ez-bar','cable-v']:
        row['implementRotation']=list(bpy.data.objects['Exercise implement'].matrix_world.to_quaternion())
    row['chin']=list(rig.matrix_world@rig.pose.bones['jaw'].tail)
    if spec['family']=='raise' and spec.get('load') in ['single-cable','cable-rope']:
        row['cableSegments']=[];row['attachmentLengths']=[]
        count=1 if spec['load']=='single-cable' else 3
        for index in range(count):
            line=bpy.data.objects[f'Cable.{index}'];start=line.matrix_world@Vector((0,0,-.5));end=line.matrix_world@Vector((0,0,.5))
            row['cableSegments'].append([list(start),list(end)])
        if spec['load']=='single-cable':
            eye=bpy.data.objects['Raise handle eye'].matrix_world.translation
            row['cableGaps'].append((Vector(row['cableSegments'][0][1])-eye).length)
            handle=bpy.data.objects['Handle.L'];axis=(handle.matrix_world.to_3x3()@Vector((1,0,0))).normalized()
            for index,offset in enumerate([-.055,.055]):
                link=bpy.data.objects[f'Raise D handle.{index}'];row['attachmentLengths'].append(link.scale.z)
                row['cableGaps'].append(((link.matrix_world@Vector((0,0,.5)))-eye).length)
                row['cableGaps'].append(((link.matrix_world@Vector((0,0,-.5)))-(handle.matrix_world.translation+axis*offset)).length)
        else:
            eye=bpy.data.objects['Front raise rope junction'].matrix_world.translation
            row['cableGaps'].append((Vector(row['cableSegments'][0][1])-eye).length)
            for index in [1,2]:
                start,end=map(Vector,row['cableSegments'][index]);row['attachmentLengths'].append((end-start).length)
                row['cableGaps'].extend([(start-eye).length,(end-Vector(row['hands'][index-1])).length])
    if spec['family']=='face_pull':
        junction=bpy.data.objects['Face pull rope junction'].matrix_world.translation
        row['ropeLengths']=[];row['ropeSamples']=[]
        for index in [0,1,2]:
            segment=bpy.data.objects[f'Cable.{index}']
            start=segment.matrix_world@Vector((0,0,-.5));end=segment.matrix_world@Vector((0,0,.5))
            row['cableGaps'].append(((end if index==0 else start)-junction).length)
            if index:
                row['ropeLengths'].append((end-start).length)
                row['cableGaps'].append((end-Vector(row['hands'][index-1])).length)
                row['ropeSamples'].extend([list(start.lerp(end,n/20)) for n in range(21)])
    if spec.get('load')=='landmine':
        assembly=bpy.data.objects['Landmine assembly']
        row['landminePivot']=list(assembly.matrix_world.translation)
        row['landmineRadius']=((assembly.matrix_world@Vector((0,-1.80,0)))-assembly.matrix_world.translation).length
    row['rootLean']=math.degrees((rig.matrix_world.to_quaternion()@Vector((0,0,1))).angle(Vector((0,0,1))))
    row['kneeFlexion']=[];row['knees']=[]
    for side in ['L','R']:
        hip=rig.matrix_world@rig.pose.bones[f'upperleg01.{side}'].head
        knee=rig.matrix_world@rig.pose.bones[f'lowerleg01.{side}'].head
        row['knees'].append(list(knee))
        ankle=rig.matrix_world@rig.pose.bones[f'foot.{side}'].head
        row['kneeFlexion'].append(math.degrees((knee-hip).angle(ankle-knee)))
    rows.append(row)

def distance(a,b):return (Vector(a)-Vector(b)).length
def travel(key):return max(distance(row[key][s],rows[0][key][s]) for row in rows for s in [0,1])

checks={
 'exerciseIdentity':rig.get('exercise_id')==spec['exerciseId'],
 'motionFamily':rig.get('motion_family')==spec['family'],
 'equipmentIdentity':rig.get('equipment_kind')==spec.get('load','none'),
 'frameCount':len(rows)==spec['frames'],
 'targetsReachable':max(error for row in rows for error in row['errors'])<.015,
 'loopClosure':max(distance(rows[0][key][s],rows[-1][key][s]) for key in ['hands','feet'] for s in [0,1])<.002,
 # Boxing punches have a separately reviewed speed limit; slower strength
 # demonstrations retain the original 1.2 m/s bound.
 'noHandJump':max(distance(rows[i]['hands'][s],rows[i-1]['hands'][s]) for i in range(1,len(rows)) for s in [0,1])<({'boxing':3,'header_jump':3.5,'swim':4.5}.get(spec['family'],1.2)/24),
}
if any(row['gripGap'] for row in rows):checks['handsOnImplement']=max(g for row in rows for g in row['gripGap'])<.002
if spec.get('load') in ['ez-bar','cable-v']:
    from mathutils import Quaternion
    checks['noImplementRotationJump']=max(Quaternion(rows[i]['implementRotation']).rotation_difference(Quaternion(rows[i-1]['implementRotation'])).angle for i in range(1,len(rows)))<.12
if spec['family']=='press':
    bottom=min(rows,key=lambda row:sum(hand[2] for hand in row['hands']))
    top=max(rows,key=lambda row:sum(hand[2] for hand in row['hands']))
    checks.update({
      'pressTravel':all(top['hands'][s][2]-bottom['hands'][s][2]>.35 for s in [0,1]),
      'shouldersStable':travel('shoulders')<.001,
      'feetStable':travel('feet')<.001,
      'extensionAtTop':max(top['elbowAngles'])<30,
      'flexionAtBottom':all(65<angle<145 for angle in bottom['elbowAngles']),
      'forearmsStackedAtBottom':max(bottom['forearmTilt'])<30,
    })
    if spec.get('load')=='machine':
        checks.pop('pressTravel');checks.pop('forearmsStackedAtBottom')
        checks['forwardPressTravel']=all(max(row['hands'][s][1] for row in rows)-min(row['hands'][s][1] for row in rows)>.35 for s in [0,1])
        lengths=[length for row in rows for length in row['leverLengths']]
        checks['rigidMachineLevers']=max(lengths)-min(lengths)<.002 and abs(sum(lengths)/len(lengths)-.65)<.002
        checks['handlesConnectedToLevers']=max(gap for row in rows for gap in row['leverGripGaps'])<.003
    pad=bpy.data.objects['Bench back']
    pad_direction=(pad.matrix_world.to_3x3()@Vector((0,1,0))).normalized()
    torso_direction=rig.matrix_world.to_quaternion()@Vector((0,0,1))
    checks['backrestFollowsTorso']=math.degrees(pad_direction.angle(torso_direction))<1
    if spec.get('ankleSupport'):
        evaluated=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        groups={g.index for g in evaluated.vertex_groups if g.name.startswith(('foot.','toe'))}
        feet=[evaluated.matrix_world@vertex.co for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
        roller_gaps=[]
        for name in ['Decline ankle roller','Decline heel roller']:
            roller=bpy.data.objects[name]
            axis=(roller.matrix_world.to_3x3()@Vector((0,0,1))).normalized()
            center=roller.matrix_world.translation
            gaps=[]
            for point in feet:
                delta=point-center
                if abs(delta.dot(axis))<.26:gaps.append((delta-axis*delta.dot(axis)).length-.065)
            roller_gaps.append(min(gaps))
        checks['feetSupportedByRollers']=all(-.004<gap<.012 for gap in roller_gaps)
    if spec.get('load')=='barbell':
        chest_local=rig.data.bones['breast.L'].tail_local.copy()
        if spec.get('gripWidth',.72)<.5:chest_local.z-=.12
        elif spec.get('incline',0)<0:chest_local.z-=.08
        chest=rig.matrix_world@chest_local
        center=sum((Vector(hand) for hand in bottom['hands']),Vector())/2
        checks['barReachesUpperChest']=abs(center.y-chest.y)<.035 and abs(center.z-chest.z)<.04
        if spec.get('gripWidth',.72)<.5:
            checks['closeGripElbowsStayTucked']=all(abs(bottom['elbows'][s][0]-bottom['shoulders'][s][0])<.10 for s in [0,1])
elif spec['family']=='fly':
    checks['fixedElbowBend']=all(max(row['elbowAngles'][s] for row in rows)-min(row['elbowAngles'][s] for row in rows)<2 for s in [0,1])
    checks['shouldersStable']=travel('shoulders')<.001
    checks['handsHaveArc']=travel('hands')>.35
    checks['feetStable']=travel('feet')<.001
    checks['slightElbowFlexion']=all(5<angle<30 for row in rows for angle in row['elbowAngles'])
    widths=[distance(row['hands'][0],row['hands'][1]) for row in rows]
    checks['handsConvergeAboveChest']=min(widths)<.25 and max(widths)>(.45 if spec.get('cableHeight')=='low' else 1.2)
    if spec.get('load')=='machine':
        lengths=[length for row in rows for length in row['leverLengths']]
        checks['rigidPecDeckLevers']=max(lengths)-min(lengths)<.002
        checks['handlesConnectedToLevers']=max(gap for row in rows for gap in row['leverGripGaps'])<.002
        checks['peakContractionHold']=all(distance(row['hands'][s],rows[0]['hands'][s])<.002 for row in rows[:12]+rows[-12:] for s in [0,1])
    if spec.get('load')=='cables':
        lengths=[length for row in rows for length in row['handleSides']]
        checks['rigidCableHandles']=max(lengths)-min(lengths)<.002
        checks['handlesConnectedToCables']=max(gap for row in rows for gap in row['cableGaps'])<.002
        closed=rows[0];opened=rows[len(rows)//2]
        delta=sum(closed['hands'][s][2]-opened['hands'][s][2] for s in [0,1])/2
        checks['specifiedCablePath']=(abs(delta)<.04 if spec['cableHeight']=='middle' else delta<-.3 if spec['cableHeight']=='high' else delta>.15)
        expected_height={'middle':1.38,'high':2.0,'low':.15}[spec['cableHeight']]
        checks['specifiedPulleyHeight']=all(abs(height-expected_height)<.001 for row in rows for height in row['pulleyHeights'])
        if spec['cableHeight']=='low':checks['supinatedGripAtPeak']=min(closed['palmZ'])>.6
        if spec['cableHeight']=='high':checks['peakContractionHold']=all(distance(row['hands'][s],closed['hands'][s])<.002 for row in rows[:12]+rows[-12:] for s in [0,1])
elif spec['family']=='curl':
    active=[0 if spec.get('side','L')=='L' else 1] if spec.get('load')=='single-dumbbell' else [0,1]
    checks['curlRange']=all(max(row['elbowAngles'][s] for row in rows)-min(row['elbowAngles'][s] for row in rows)>90 for s in active)
    if spec.get('load')=='ez-bar':
        checks['elbowsStable']=travel('elbows')<.001
        checks['shouldersStable']=travel('shoulders')<.001
        checks['feetStable']=travel('feet')<.001
        checks['noTrunkSwing']=max(row['rootLean'] for row in rows)-min(row['rootLean'] for row in rows)<.1
        checks['controlledExtension']=all(10<angle<15 for angle in rows[0]['elbowAngles'])
elif spec['family']=='triceps' and spec.get('posture') in ['pushdown','lying']:
    checks['elbowsStable']=travel('elbows')<.001
    checks['shouldersStable']=travel('shoulders')<.001
    checks['feetStable']=travel('feet')<.001
    checks['extensionRange']=all(min(row['elbowAngles'][s] for row in rows)<8 and 85<max(row['elbowAngles'][s] for row in rows)<105 for s in [0,1])
    checks['handStroke']=all(max(row['hands'][s][2] for row in rows)-min(row['hands'][s][2] for row in rows)>.25 for s in [0,1])
    if spec['posture']=='pushdown':
        checks['uprightTrunk']=all(row['rootLean']<.1 for row in rows)
        from mathutils.bvhtree import BVHTree
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        groups={g.index for g in body.vertex_groups if g.name.startswith(('spine','breast','pelvis','upperleg','lowerleg','foot','toe','head','jaw'))}
        indices={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
        tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in indices for i in p.vertices)])
        cable_clear=True
        for row in rows:
            scene.frame_set(row['frame']);bpy.context.view_layer.update()
            for i in range(3 if spec['load']=='cable-rope' else 1):
                cable=bpy.data.objects[f'Cable.{i}'];start=cable.matrix_world@Vector((0,0,-.5));end=cable.matrix_world@Vector((0,0,.5));delta=end-start
                hit=tree.ray_cast(start,delta.normalized(),max(0,delta.length-.015))[0]
                cable_clear=cable_clear and hit is None
        checks['cablesClearTorsoAndLegs']=cable_clear
        if spec['load']=='cable-bar':
            checks['pronatedGrip']=min(rows[0]['palmY'])>.9 and max(rows[len(rows)//2]['palmZ'])<-.9
        if spec['load']=='cable-rope':
            gaps=[];lengths=[]
            for row in rows:
                scene.frame_set(row['frame']);bpy.context.view_layer.update()
                main=bpy.data.objects['Cable.0'];junction=main.matrix_world@Vector((0,0,.5))
                for i,side in enumerate(['L','R'],1):
                    cable=bpy.data.objects[f'Cable.{i}'];start=cable.matrix_world@Vector((0,0,-.5));end=cable.matrix_world@Vector((0,0,.5))
                    lengths.append((end-start).length);gaps.extend([(start-junction).length,(end-Vector(row['hands'][i-1])).length])
            checks['fixedRopeBranches']=all(abs(n-.38)<.002 for n in lengths)
            checks['ropeConnections']=max(gaps)<.002
            checks['handsSpreadOnExtension']=abs(rows[0]['hands'][0][0]-rows[0]['hands'][1][0])>abs(rows[len(rows)//2]['hands'][0][0]-rows[len(rows)//2]['hands'][1][0])+.10
        else:checks['cableConnection']=max(g for row in rows for g in row['cableGaps'])<.002
    elif spec.get('load')=='dumbbells':
        from mathutils.bvhtree import BVHTree
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        groups={g.index for g in body.vertex_groups if g.name in ['head','jaw']}
        indices={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
        head_tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in indices for i in p.vertices)])
        head_clear=True;weights_clear=True
        for row in rows:
            scene.frame_set(row['frame']);bpy.context.view_layer.update();trees={}
            for side in ['L','R']:
                trees[side]=[]
                for plate in bpy.data.objects[f'Dumbbell.{side}'].children:
                    if not plate.name.startswith('Dumbbell head'):continue
                    evaluated=plate.evaluated_get(bpy.context.evaluated_depsgraph_get())
                    tree=BVHTree.FromPolygons([evaluated.matrix_world@v.co for v in evaluated.data.vertices],[list(p.vertices) for p in evaluated.data.polygons])
                    head_clear=head_clear and not bool(tree.overlap(head_tree));trees[side].append(tree)
            weights_clear=weights_clear and all(not a.overlap(b) for a in trees['L'] for b in trees['R'])
        checks['weightsClearHead']=head_clear
        checks['dumbbellsDoNotIntersect']=weights_clear
elif spec['family']=='vertical_pull':
    hanging=rows[0]
    checks['armsExtendBeforePull']=max(hanging['elbowAngles'])<25
    checks['controlledElbowFlexion']=all(80<max(row['elbowAngles'][s] for row in rows)<165 for s in [0,1])
    grip=spec.get('grip')
    checks['prescribedGrip']=(hanging['palmX'][0]<-.6 and hanging['palmX'][1]>.6 if grip=='close-neutral' else min(hanging['palmY'])>.6 if grip=='supinated' else max(hanging['palmY'])<-.6)
    if spec.get('load')=='pullup-bar':
        checks['fixedBarContact']=travel('hands')<.002 and all(abs(hand[1]+.13)<.002 and abs(hand[2]-1.99)<.002 for row in rows for hand in row['hands'])
        checks['bodyPullsUp']=max(row['hip'][2] for row in rows)-min(row['hip'][2] for row in rows)>.40
        checks['chinClearsBar']=max(row['chin'][2] for row in rows)>2.0
        checks['feetStaySuspended']=all(foot[2]>.25 for row in rows for foot in row['feet'])
        checks['noBodySwing']=max(row['hip'][1] for row in rows)-min(row['hip'][1] for row in rows)<.002
    else:
        checks['torsoStaysSeated']=travel('shoulders')<.001
        checks['feetStayPlanted']=travel('feet')<.001
        checks['cableJoinsHandle']=max(gap for row in rows for gap in row['cableGaps'])<.002
        checks['pulldownTravel']=all(max(row['hands'][s][2] for row in rows)-min(row['hands'][s][2] for row in rows)>.40 for s in [0,1])
    evaluated=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
    head_groups={g.index for g in evaluated.vertex_groups if g.name in ['head','jaw']}
    front=min((evaluated.matrix_world@vertex.co).y for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in head_groups)>.55)
    limit=-.083 if spec.get('load')=='cable-triangle' else -.114
    checks['barAndHandleClearHead']=front>limit
elif spec['family']=='row':
    checks['stableTorso']=travel('shoulders')<.001
    checks['feetStayAnchored']=travel('feet')<.001
    checks['armsExtendAtStart']=max(rows[0]['elbowAngles'])<30
    checks['elbowsFlexDuringPull']=all(70<max(row['elbowAngles'][s] for row in rows)<150 for s in [0,1])
    contracted=rows[len(rows)//2]
    checks['elbowsDriveBack']=all(contracted['elbows'][s][1]-contracted['shoulders'][s][1]>.10 for s in [0,1])
    if spec.get('load')=='landmine':
        checks['fixedGroundPivot']=all(distance(row['landminePivot'],(0,1.40,.10))<.001 for row in rows)
        checks['rigidLandmineArc']=all(abs(row['landmineRadius']-1.80)<.001 for row in rows)
        checks['verticalRowStroke']=all(max(row['hands'][s][2] for row in rows)-min(row['hands'][s][2] for row in rows)>.30 for s in [0,1])
        checks['stableHipHinge']=all(abs(row['rootLean']-60)<.1 for row in rows)
        checks['neutralGrip']=all(row['palmX'][0]<-.90 and row['palmX'][1]>.90 for row in rows)
        checks['straddlingStance']=all(abs(row['feet'][0][0]-.24)<.002 and abs(row['feet'][1][0]+.24)<.002 for row in rows)
    elif spec.get('posture')=='chest-supported' and spec.get('load')=='machine':
        lengths=[n for row in rows for n in row['leverLengths']]
        checks['rigidRowLinks']=max(abs(n-.65) for n in lengths)<.002
        checks['handlesAttachedToLinks']=max(n for row in rows for n in row['leverGripGaps'])<.002
        checks['forwardRowTravel']=all(max(row['hands'][s][1] for row in rows)-min(row['hands'][s][1] for row in rows)>.35 for s in [0,1])
        checks['neutralVerticalGrips']=all(abs(row['palmX'][0])>.99 and abs(row['palmX'][1])>.99 for row in rows)
    elif spec.get('posture')=='bench-supported':
        working=0 if spec.get('side','L')=='L' else 1;support=1-working
        checks['armsExtendAtStart']=rows[0]['elbowAngles'][working]<25
        checks['elbowsFlexDuringPull']=70<max(row['elbowAngles'][working] for row in rows)<120
        checks['elbowsDriveBack']=contracted['elbows'][working][1]-contracted['shoulders'][working][1]>.20
        checks['verticalRowStroke']=max(row['hands'][working][2] for row in rows)-min(row['hands'][working][2] for row in rows)>.20
        checks['supportHandAnchored']=max(distance(row['hands'][support],rows[0]['hands'][support]) for row in rows)<.001 and abs(rows[0]['hands'][support][2]-.4075)<.002
        checks['supportArmExtended']=max(row['elbowAngles'][support] for row in rows)<30
        checks['supportKneeStable']=max(distance(row['knees'][support],rows[0]['knees'][support]) for row in rows)<.001
        checks['flatStableTrunk']=all(abs(row['rootLean']-86)<.1 for row in rows)
        evaluated=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        support_knee=Vector(rows[-1]['knees'][support]);side='R' if support==1 else 'L'
        groups={g.index for g in evaluated.vertex_groups if g.name.endswith(f'.{side}') and g.name.startswith(('upperleg','lowerleg'))}
        points=[evaluated.matrix_world@vertex.co for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
        near=[p for p in points if (p-support_knee).length<.10]
        checks['kneeOnBench']=bool(near) and abs(min(p.z for p in near)-.4045)<.008
        side='L' if working==0 else 'R'
        groups={g.index for g in evaluated.vertex_groups if g.name.endswith(f'.{side}') and g.name.startswith(('foot.','toe'))}
        sole=min((evaluated.matrix_world@vertex.co).z for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55)
        checks['freeFootOnFloor']=-.003<sole<.006
    elif spec.get('posture')=='seated':
        checks['horizontalCablePull']=all(max(row['hands'][s][1] for row in rows)-min(row['hands'][s][1] for row in rows)>.35 for s in [0,1])
        checks['cableJoinsHandle']=max(gap for row in rows for gap in row['cableGaps'])<.002
        evaluated=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        gaps=[]
        for side,sign in [('L',1),('R',-1)]:
            groups={g.index for g in evaluated.vertex_groups if g.name.endswith(f'.{side}') and g.name.startswith(('foot.','toe'))}
            plate=next(obj for obj in bpy.data.objects if obj.name.startswith('Row footplate') and obj.location.x*sign>0)
            inverse=plate.matrix_world.inverted()
            gaps.append(min((inverse@(evaluated.matrix_world@vertex.co)).y-.025 for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55))
        checks['feetAgainstAngledPlates']=all(-.015<gap<.015 for gap in gaps)
    else:
        checks['verticalRowStroke']=all(max(row['hands'][s][2] for row in rows)-min(row['hands'][s][2] for row in rows)>.25 for s in [0,1])
        checks['hingedBackPosition']=all(abs(row['rootLean']-60)<.1 for row in rows)
        checks['overhandGrip']=min(rows[0]['palmY'])>.6
elif spec['family']=='dip':
    checks['fixedBarSupport']=travel('hands')<.002 and all(abs(hand[2]-1.10)<.002 and abs(abs(hand[0])-.29)<.002 for row in rows for hand in row['hands'])
    checks['controlledBodyTravel']=max(row['hip'][2] for row in rows)-min(row['hip'][2] for row in rows)>.12
    checks['elbowsReachRightAngle']=all(85<max(row['elbowAngles'][s] for row in rows)<100 for s in [0,1])
    checks['armsExtendAtTop']=all(min(row['elbowAngles'][s] for row in rows)<30 for s in [0,1])
    checks['prescribedTorsoLean']=all(abs(row['rootLean']-spec.get('lean',0))<.1 for row in rows)
    checks['feetRemainSuspended']=all(foot[2]>.35 for row in rows for foot in row['feet'])
elif spec['family']=='pushup':
    checks['palmsStayOnBlocks']=travel('hands')<.002 and all(abs(hand[2]-spec.get('deficit',.12)-.003)<.002 for row in rows for hand in row['hands'])
    checks['feetRemainPlanted']=travel('feet')<.002
    deviations=[]
    for row in rows:
        shoulder=sum((Vector(p) for p in row['shoulders']),Vector())/2
        ankle=sum((Vector(p) for p in row['feet']),Vector())/2
        line=(shoulder-ankle).normalized();delta=Vector(row['hip'])-ankle
        deviations.append((delta-line*delta.dot(line)).length)
    checks['hipsFollowBodyLine']=max(deviations)<.025
    top=max(rows,key=lambda row:sum(p[2] for p in row['shoulders']))
    bottom=min(rows,key=lambda row:sum(p[2] for p in row['shoulders']))
    checks['armsExtendAtTop']=max(top['elbowAngles'])<30
    checks['controlledElbowFlexion']=all(80<angle<145 for angle in bottom['elbowAngles'])
    checks['chestPassesPalmLine']=min(row['chest'][2] for row in rows)<spec.get('deficit',.12)-.01
    checks['kneesRemainStraight']=max(angle for row in rows for angle in row['kneeFlexion'])<5
    evaluated=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
    groups={g.index for g in evaluated.vertex_groups if g.name.startswith(('foot.','toe'))}
    heights=[(evaluated.matrix_world@vertex.co).z for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
    checks['toesContactFloor']=-.012<min(heights)<.02
elif spec['family']=='raise' and spec.get('load') in ['single-cable','cable-rope']:
    indices=[0] if spec['load']=='single-cable' else [0,1]
    peaks=[max(rows,key=lambda row:row['hands'][s][2]) for s in [0,1]]
    checks['fixedSlightElbowBend']=all(10<row['elbowAngles'][s]<14 for row in rows for s in indices)
    checks['stableShoulders']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['fullRaiseTravel']=all(peaks[s]['hands'][s][2]-rows[0]['hands'][s][2]>.50 for s in indices)
    checks['handleCableConnections']=max(n for row in rows for n in row['cableGaps'])<.002
    if spec['load']=='single-cable':
        checks['supportHandStable']=max(distance(row['hands'][1],(-.55,-.08,1.25)) for row in rows)<.002
        checks['crossBodyStart']=rows[0]['hands'][0][0]<.03
        checks['shoulderHeightFinish']=abs(peaks[0]['elbows'][0][2]-peaks[0]['shoulders'][0][2])<.02
        checks['fixedSideLean']=all(abs(row['rootLean']-8)<.1 for row in rows)
        checks['rigidDHandle']=all(abs(n-math.hypot(.055,.11))<.002 for row in rows for n in row['attachmentLengths'])
        expected=Vector((-.36,-.26,.13))
    else:
        checks['uprightTorso']=all(row['rootLean']<.1 for row in rows)
        checks['symmetricForwardRaise']=all(abs(row['hands'][0][2]-row['hands'][1][2])<.002 for row in rows)
        checks['neutralGrip']=all(row['palmX'][0]<-.90 and row['palmX'][1]>.90 for row in rows)
        checks['fixedRopeLengths']=all(abs(n-.38)<.002 for row in rows for n in row['attachmentLengths'])
        checks['shoulderHeightFinish']=all(.05<peaks[s]['hands'][s][2]-peaks[s]['shoulders'][s][2]<.20 for s in indices)
        expected=Vector((0,.24,.12))
    checks['lowExternalPulley']=all(distance(row['cableSegments'][0][0],expected)<.002 for row in rows)
    from mathutils.bvhtree import BVHTree
    body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
    groups={g.index for g in body.vertex_groups if g.name.startswith(('spine','breast','pelvis','upperleg','lowerleg','foot.','toe','head','jaw'))}
    selected={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
    tree=BVHTree.FromPolygons([body.matrix_world@v.co for v in body.data.vertices],[list(p.vertices) for p in body.data.polygons if all(i in selected for i in p.vertices)])
    clear=True
    for row in rows:
        for start,end in row['cableSegments']:
            start,end=Vector(start),Vector(end);delta=end-start
            hit=tree.ray_cast(start,delta.normalized(),max(0,delta.length-.015))[0]
            if hit is not None:
                clear=False
                row.setdefault('cableBodyHits',[]).append(list(hit))
    checks['cableClearsTorsoAndLegs']=clear
elif spec['family']=='raise' and spec.get('posture')=='incline-supported':
    from audit_supported_raise import audit_supported_raise
    audit_supported_raise(spec,rows,checks,rig,scene)
elif spec['family']=='raise':
    if spec.get('load')!='dumbbells' or spec.get('posture')=='incline-supported':raise NotImplementedError('Raise variant audit not authored')
    checks['fixedSlightElbowBend']=all(10<angle<14 for row in rows for angle in row['elbowAngles'])
    checks['stableShoulders']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    peaks=[max(rows,key=lambda row:row['hands'][s][2]) for s in [0,1]]
    checks['fullRaiseTravel']=all(peaks[s]['hands'][s][2]-rows[0]['hands'][s][2]>.50 for s in [0,1])
    if spec.get('plane')=='lateral':
        peak=peaks[0]
        checks['slightForwardLean']=all(abs(row['rootLean']-7)<.1 for row in rows)
        checks['shoulderHeightFinish']=all(abs(peak['elbows'][s][2]-peak['shoulders'][s][2])<.02 for s in [0,1])
        checks['scapularPlane']=all(abs(math.degrees(math.atan2(-(peak['elbows'][s][1]-peak['shoulders'][s][1]),abs(peak['elbows'][s][0]-peak['shoulders'][s][0])))-30)<1 for s in [0,1])
        checks['handsBelowElbows']=all(-.06<peak['hands'][s][2]-peak['elbows'][s][2]<.005 for s in [0,1])
        checks['palmsDownAtTop']=max(peak['palmZ'])<-.98
        checks['palmsInwardAtStart']=rows[0]['palmX'][0]<-.90 and rows[0]['palmX'][1]>.90
        checks['symmetricRaise']=all(abs(row['hands'][0][2]-row['hands'][1][2])<.002 for row in rows)
    elif spec.get('plane')=='front' and spec.get('alternating'):
        checks['uprightTorso']=all(row['rootLean']<.1 for row in rows)
        checks['alternatingArms']=all(abs(peaks[s]['hands'][1-s][2]-rows[0]['hands'][1-s][2])<.002 for s in [0,1]) and abs(peaks[0]['frame']-peaks[1]['frame'])>50
        checks['forwardPlane']=all(max(abs(row['hands'][s][0]-rows[0]['hands'][s][0]) for row in rows)<.02 for s in [0,1])
        checks['aboveShoulderFinish']=all(.10<peaks[s]['hands'][s][2]-peaks[s]['shoulders'][s][2]<.25 for s in [0,1])
        checks['neutralGrip']=all(row['palmX'][0]<-.90 and row['palmX'][1]>.90 for row in rows)
    else:checks['raiseVariantSpecified']=False
elif spec['family']=='overhead_press' and spec.get('load')=='barbell':
    top=max(rows,key=lambda row:sum(p[2] for p in row['hands']));bottom=min(rows,key=lambda row:sum(p[2] for p in row['hands']))
    checks['stableShoulders']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['noLegDrive']=all(max(row['kneeFlexion'][s] for row in rows)-min(row['kneeFlexion'][s] for row in rows)<.1 for s in [0,1])
    checks['uprightRigidTorso']=all(row['rootLean']<.1 for row in rows)
    checks['verticalPressTravel']=all(top['hands'][s][2]-bottom['hands'][s][2]>.45 for s in [0,1])
    checks['nearFullExtension']=max(top['elbowAngles'])<25
    checks['controlledRackPosition']=all(115<angle<150 for angle in bottom['elbowAngles'])
    checks['rackBelowChin']=all(.03<bottom['chin'][2]-p[2]<.09 for p in bottom['hands'])
    checks['rackForearmsUnderBar']=max(bottom['forearmTilt'])<35
    checks['overheadBarStacked']=all(abs(p[1])<.01 for p in top['hands'])
    checks['overhandGrip']=max(n for row in rows for n in row['palmY'])<-.70
    body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
    groups={g.index for g in body.vertex_groups if g.name in ['head','jaw']}
    head=[body.matrix_world@vertex.co for vertex in body.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
    clear=True
    for row in rows:
        bar=(Vector(row['hands'][0])+Vector(row['hands'][1]))/2
        section=[p for p in head if abs(p.z-bar.z)<.025]
        if section:
            row['barHeadGapM']=min(p.y for p in section)-(bar.y+.013)
            clear=clear and row['barHeadGapM']>.006
    checks['barClearsFaceAndSkull']=clear
elif spec['family']=='overhead_press' and spec.get('load')=='machine':
    top=max(rows,key=lambda row:sum(p[2] for p in row['hands']));bottom=min(rows,key=lambda row:sum(p[2] for p in row['hands']))
    checks['stableShoulders']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['overheadTravel']=all(top['hands'][s][2]-bottom['hands'][s][2]>.35 for s in [0,1])
    checks['nearFullExtension']=max(top['elbowAngles'])<25
    checks['controlledBottomFlexion']=all(90<angle<135 for angle in bottom['elbowAngles'])
    checks['stackedBottomForearms']=max(bottom['forearmTilt'])<20
    checks['palmsForward']=max(n for row in rows for n in row['palmY'])<-.99
    checks['rigidPressLinks']=all(abs(n-.65)<.002 for row in rows for n in row['leverLengths'])
    checks['rigidHandleStems']=all(min(abs(n-.11),abs(n-.20))<.002 for row in rows for n in row['handleSides'])
    checks['handlesConnected']=max(n for row in rows for n in row['leverGripGaps'])<.002
    checks['fixedMachinePivots']=max(n for row in rows for n in row['pivotGaps'])<.002
    checks['convergingHandles']=abs(bottom['hands'][0][0])-abs(top['hands'][0][0])>.10
    pad=bpy.data.objects['Bench back'];pad_axis=(pad.matrix_world.to_3x3()@Vector((0,1,0))).normalized()
    checks['backrestAligned']=math.degrees(pad_axis.angle(rig.matrix_world.to_quaternion()@Vector((0,0,1))))<1
elif spec['family']=='overhead_press':
    if spec.get('load')!='dumbbells' or spec.get('posture')!='seated':
        raise NotImplementedError('Specific overhead press audit not authored for this variant')
    top=max(rows,key=lambda row:sum(p[2] for p in row['hands']))
    bottom=min(rows,key=lambda row:sum(p[2] for p in row['hands']))
    checks['stableShoulders']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['overheadPressTravel']=all(top['hands'][s][2]-bottom['hands'][s][2]>.35 for s in [0,1])
    checks['nearFullExtension']=max(top['elbowAngles'])<25
    checks['controlledBottomFlexion']=all(90<angle<130 for angle in bottom['elbowAngles'])
    checks['stackedBottomForearms']=max(bottom['forearmTilt'])<(40 if spec.get('arnold') else 15)
    checks['overheadFinish']=all(p[2]>top['chin'][2]+.45 for p in top['hands'])
    if spec.get('arnold'):
        checks['palmsFaceBodyAtBottom']=min(bottom['palmY'])>.75
        checks['palmsFaceForwardAtTop']=max(top['palmY'])<-.90
        checks['palmsRotateThroughNeutral']=all(max(abs(row['palmX'][s]) for row in rows)>.70 for s in [0,1])
        checks['elbowsOpenDuringAscent']=all(max(abs(row['elbows'][s][0]) for row in rows)-abs(bottom['elbows'][s][0])>.08 for s in [0,1])
        checks['weightsStartInFront']=all(bottom['hands'][s][1]<bottom['shoulders'][s][1]-.25 for s in [0,1])
    else:
        checks['convergingDumbbells']=abs(bottom['hands'][0][0]-bottom['hands'][1][0])-abs(top['hands'][0][0]-top['hands'][1][0])>.35
        checks['palmsForward']=max(n for row in rows for n in row['palmY'])<-.99
    pad=bpy.data.objects['Bench back']
    pad_axis=(pad.matrix_world.to_3x3()@Vector((0,1,0))).normalized()
    torso=rig.matrix_world.to_quaternion()@Vector((0,0,1))
    checks['backrestAligned']=math.degrees(pad_axis.angle(torso))<1
    if spec.get('arnold'):
        from mathutils.bvhtree import BVHTree
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        groups={g.index for g in body.vertex_groups if g.name in ['head','jaw']}
        indices={v.index for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55}
        vertices=[body.matrix_world@v.co for v in body.data.vertices]
        faces=[list(p.vertices) for p in body.data.polygons if all(i in indices for i in p.vertices)]
        head_tree=BVHTree.FromPolygons(vertices,faces)
        head_clear=True;weights_clear=True
        for row in rows:
            scene.frame_set(row['frame']);bpy.context.view_layer.update()
            trees={}
            for side in ['L','R']:
                trees[side]=[]
                for plate in bpy.data.objects[f'Dumbbell.{side}'].children:
                    if not plate.name.startswith('Dumbbell head'):continue
                    evaluated=plate.evaluated_get(bpy.context.evaluated_depsgraph_get())
                    tree=BVHTree.FromPolygons([evaluated.matrix_world@v.co for v in evaluated.data.vertices],[list(p.vertices) for p in evaluated.data.polygons])
                    head_clear=head_clear and not bool(tree.overlap(head_tree))
                    trees[side].append(tree)
            weights_clear=weights_clear and all(not a.overlap(b) for a in trees['L'] for b in trees['R'])
        checks['weightsClearHead']=head_clear
        checks['dumbbellsDoNotIntersect']=weights_clear
elif spec['family']=='face_pull':
    peak=rows[len(rows)//2]
    checks['stableTorso']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['headStable']=max(distance(row['chin'],rows[0]['chin']) for row in rows)<.001
    checks['extendedStart']=max(rows[0]['elbowAngles'])<30
    checks['elbowsFlexDuringPull']=all(90<angle<150 for angle in peak['elbowAngles'])
    checks['handsSeparate']=abs(peak['hands'][0][0]-peak['hands'][1][0])>.70 and abs(rows[0]['hands'][0][0]-rows[0]['hands'][1][0])<.25
    checks['elbowsAtShoulderHeight']=all(abs(peak['elbows'][s][2]-peak['shoulders'][s][2])<.035 for s in [0,1])
    checks['handsFinishAboveElbows']=all(peak['hands'][s][2]-peak['elbows'][s][2]>.14 for s in [0,1])
    checks['elbowsDriveBack']=all(peak['elbows'][s][1]-peak['shoulders'][s][1]>.15 for s in [0,1])
    checks['pullTowardFace']=all(peak['hands'][s][1]-rows[0]['hands'][s][1]>.45 and 1.50<peak['hands'][s][2]<1.60 for s in [0,1])
    checks['fixedRopeLength']=all(abs(n-.44)<.002 for row in rows for n in row['ropeLengths'])
    checks['ropeConnections']=max(n for row in rows for n in row['cableGaps'])<.002
    body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
    groups={g.index for g in body.vertex_groups if g.name in ['head','jaw']}
    head=[body.matrix_world@vertex.co for vertex in body.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
    front=min(p.y for p in head);width=max(abs(p.x) for p in head);low=min(p.z for p in head);high=max(p.z for p in head)
    near=[p for row in rows for p in row['ropeSamples'] if abs(p[0])<width+.01 and low<p[2]<high]
    checks['ropeClearsFace']=bool(near) and all(p[1]<front-.008 for p in near)
elif spec['family']=='shrug':
    checks['straightElbows']=max(angle for row in rows for angle in row['elbowAngles'])<1
    checks['feetStable']=travel('feet')<.001
    checks['pelvisStable']=max(distance(row['hip'],rows[0]['hip']) for row in rows)<.001
    checks['headStable']=max(distance(row['chin'],rows[0]['chin']) for row in rows)<.001
    checks['verticalShoulderElevation']=all(.040<max(row['shoulders'][s][2] for row in rows)-min(row['shoulders'][s][2] for row in rows)<.055 for s in [0,1])
    checks['noShoulderRolling']=all(math.hypot(row['shoulders'][s][0]-rows[0]['shoulders'][s][0],row['shoulders'][s][1]-rows[0]['shoulders'][s][1])<.001 for row in rows for s in [0,1])
    checks['weightsFollowShoulders']=all(abs((row['hands'][s][2]-rows[0]['hands'][s][2])-(row['shoulders'][s][2]-rows[0]['shoulders'][s][2]))<.001 for row in rows for s in [0,1])
    peaks=[max(row['shoulders'][s][2] for row in rows) for s in [0,1]]
    checks['twoSecondPeakHold']=sum(all(abs(row['shoulders'][s][2]-peaks[s])<.00001 for s in [0,1]) for row in rows)>=48
    checks['controlledUprightPosture']=all(row['rootLean']<.1 for row in rows)
    if spec.get('load')=='barbell':
        checks['barInFrontOfThighs']=all(p[1]<-.11 for row in rows for p in row['hands'])
        checks['overhandGrip']=min(value for row in rows for value in row['palmY'])>.90
    else:checks['neutralGrip']=all(row['palmX'][0]<-.90 and row['palmX'][1]>.90 for row in rows)
elif spec['family']=='rear_fly' and spec.get('load')=='machine':
    checks['fixedSlightElbowBend']=all(12<angle<18 for row in rows for angle in row['elbowAngles'])
    checks['stableTorso']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['lateralOpening']=all(max(abs(row['hands'][s][0]) for row in rows)-min(abs(row['hands'][s][0]) for row in rows)>.50 for s in [0,1])
    checks['shoulderHeightHandles']=all(abs(row['hands'][s][2]-row['shoulders'][s][2])<.04 for row in rows for s in [0,1])
    lengths=[n for row in rows for n in row['leverLengths']]
    checks['rigidFlyLevers']=max(lengths)-min(lengths)<.002
    checks['handlesAttachedToLevers']=max(n for row in rows for n in row['leverGripGaps'])<.002
elif spec['family']=='rear_fly' and spec.get('load')=='dumbbells':
    checks['fixedSlightElbowBend']=all(8<angle<18 for row in rows for angle in row['elbowAngles']) and all(max(row['elbowAngles'][s] for row in rows)-min(row['elbowAngles'][s] for row in rows)<2 for s in [0,1])
    checks['stableTorso']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['stableHipHinge']=all(abs(row['rootLean']-65)<.1 for row in rows)
    checks['lateralOpening']=all(max(abs(row['hands'][s][0]) for row in rows)-min(abs(row['hands'][s][0]) for row in rows)>.35 for s in [0,1])
    opened=max(rows,key=lambda row:abs(row['hands'][0][0]))
    checks['elbowsNearShoulderPlane']=all(abs(opened['elbows'][s][2]-opened['shoulders'][s][2])<.07 for s in [0,1])
    checks['symmetricOpening']=all(abs(row['hands'][0][0]+row['hands'][1][0])<.002 for row in rows)
    checks['weightsClearFloor']=all(p[2]>.20 for row in rows for p in row['hands'])
elif spec['family']=='straight_pull':
    checks['fixedSlightElbowBend']=all(8<angle<18 for row in rows for angle in row['elbowAngles']) and all(max(row['elbowAngles'][s] for row in rows)-min(row['elbowAngles'][s] for row in rows)<2 for s in [0,1])
    checks['stableTorso']=travel('shoulders')<.001
    checks['stableFeet']=travel('feet')<.001
    checks['forwardTrunkLean']=all(abs(row['rootLean']-30)<.1 for row in rows)
    checks['shoulderArc']=all(max(row['hands'][s][2] for row in rows)-min(row['hands'][s][2] for row in rows)>.60 for s in [0,1])
    checks['cableJoinsHandle']=max(gap for row in rows for gap in row['cableGaps'])<.002
    bottom=rows[len(rows)//2]
    checks['barFinishesInFrontOfThighs']=all(-.20<p[1]<-.11 and .55<p[2]<.75 for p in bottom['hands'])
    checks['overhandGrip']=max(rows[0]['palmZ'])<-.90 and min(bottom['palmY'])>.90
elif spec['family']=='pullover':
    checks['fixedSlightElbowBend']=all(10<angle<25 for row in rows for angle in row['elbowAngles']) and all(max(row['elbowAngles'][s] for row in rows)-min(row['elbowAngles'][s] for row in rows)<2 for s in [0,1])
    checks['shouldersSupported']=travel('shoulders')<.001
    checks['feetStable']=travel('feet')<.001
    checks['overheadArc']=travel('hands')>.45
    plate_gaps=[];radii=[];axes=[]
    for row in rows:
        scene.frame_set(row['frame']);bpy.context.view_layer.update()
        weight=bpy.data.objects['Dumbbell.L'];center=weight.matrix_world.translation
        axes.append(abs((weight.matrix_world.to_3x3()@Vector((1,0,0))).normalized().z))
        for hand in row['hands']:
            plate_gaps.append(abs(hand[2]-(center.z+.105-.0275)))
            radii.append(math.hypot(hand[0]-center.x,hand[1]-center.y))
    checks['twoPalmsUnderUpperPlate']=max(plate_gaps)<.006 and max(radii)<.085
    checks['verticalDumbbell']=min(axes)>.999
    # This grip supports the underside of the upper plate; neither palm is
    # expected to coincide with the handle axis used by ordinary dumbbell lifts.
    checks['handsOnImplement']=checks['twoPalmsUnderUpperPlate'] and checks['verticalDumbbell']
elif spec['family'] not in ['raise','overhead_press','upright_row','hinge','vacuum','triceps','squat','lunge','hip_thrust','kickback','abduction','calf','leg_isolation','leg_press','plank','crunch','leg_raise','rollout','twist','skierg','thruster','muscle_up','run','sled_push','wall_ball','header_jump','boxing','dance','sprawl','swim']:
    checks['familySpecificAuditAuthored']=False
elif spec['family'] in ['raise','overhead_press','upright_row']:checks['handsMove']=travel('hands')>.2

if spec.get('load')=='machine' and spec.get('posture') in ['chest-supported','seated-supported']:
    pad=bpy.data.objects['Chest support pad'];face=pad.location.y+.04
    gaps=[];soles=[]
    for frame in [scene.frame_start,(scene.frame_start+scene.frame_end)//2,scene.frame_end]:
        scene.frame_set(frame);bpy.context.view_layer.update()
        body=bpy.data.objects['FORZON Human'].evaluated_get(bpy.context.evaluated_depsgraph_get())
        groups={g.index for g in body.vertex_groups if g.name.startswith(('spine','breast'))}
        chest=[body.matrix_world@vertex.co for vertex in body.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
        gaps.append(min(p.y for p in chest if abs(p.x)<.12 and .96<p.z<1.08)-face)
        groups={g.index for g in body.vertex_groups if g.name.startswith(('foot.','toe'))}
        soles.append(min((body.matrix_world@vertex.co).z for vertex in body.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55))
    checks['chestAgainstPad']=all(abs(gap)<.012 for gap in gaps)
    checks['feetOnFloor']=all(-.003<z<.006 for z in soles)

sys.path.insert(0,str(root))
from audit_extended import audit_extended
audit_extended(spec,rows,checks,rig,scene)
from audit_lower import audit_lower
audit_lower(spec,rows,checks,rig,scene)
from audit_lower_special import audit_lower_special
audit_lower_special(spec,rows,checks,rig,scene)
from audit_core import audit_core
audit_core(spec,rows,checks,rig,scene)
from audit_core_equipment import audit_core_equipment
audit_core_equipment(spec,rows,checks,rig,scene)
from audit_roll_twist import audit_roll_twist
audit_roll_twist(spec,rows,checks,rig,scene)
from audit_sports_strength import audit_sports_strength
audit_sports_strength(spec,rows,checks,rig,scene)
from audit_locomotion import audit_locomotion
audit_locomotion(spec,rows,checks,rig,scene)
from audit_ball_sports import audit_ball_sports
audit_ball_sports(spec,rows,checks,rig,scene)
from audit_combat import audit_combat
audit_combat(spec,rows,checks,rig,scene)
from audit_dance import audit_dance
audit_dance(spec,rows,checks,rig,scene)
from audit_aquatic_defense import audit_aquatic_defense
audit_aquatic_defense(spec,rows,checks,rig,scene)
result={'exerciseId':spec['exerciseId'],'mechanicalChecksPassed':all(checks.values()),'checks':checks,
        'sceneSha256':hashlib.sha256((out/f'{args.exercise}.blend').read_bytes()).hexdigest(),
        'maximumTargetErrorM':max(error for row in rows for error in row['errors']),
        'rows':rows}
(out/f'{args.exercise}.qa.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps({key:value for key,value in result.items() if key!='rows'},indent=2))
if not result['mechanicalChecksPassed']:raise RuntimeError('Mechanical review failed')




