"""Shared rig and equipment utilities for individually specified exercise clips."""
import math
import bpy
from mathutils import Vector,Quaternion,Matrix
from motions_upper import UpperMotions
from motions_lower import LowerMotions
from motions_core_sports import CoreSportMotions

def v(value):return Vector(value)
def radians(value):return math.radians(value)
def smooth(value):
    value=max(0,min(1,value));return value*value*(3-2*value)
def cycle(t):return .5-.5*math.cos(2*math.pi*t)
def lerp(a,b,t):return a+(b-a)*t
def sample(keys,t):
    if t<=keys[0][0]:return keys[0][1]
    for (ta,a),(tb,b) in zip(keys,keys[1:]):
        if t<=tb:return lerp(a,b,smooth((t-ta)/(tb-ta)))
    return keys[-1][1]

class MotionEngine(UpperMotions,LowerMotions,CoreSportMotions):
    def __init__(self,context,spec):
        self.__dict__.update(context)
        self.spec=spec
        self.family=spec['family']
        if not callable(getattr(self,'pose_'+self.family,None)):
            raise NotImplementedError(f'No authored motion: {self.family} / {spec["exerciseId"]}')
        self.created=[];self.animated=set();self.constraints=[]
        self.follow=self.empty('Motion reference')
        self.follow.parent=None
        self.root=self.empty('Body posture')
        for obj in [self.rig,self.body,self.clothing]:obj.parent=self.root
        self.hip=(self.rig.data.bones['upperleg01.L'].head_local+self.rig.data.bones['upperleg01.R'].head_local)/2
        self.chest_z=self.rig.data.bones['breast.L'].tail_local.z+.025
        self.shoulder_z=self.rig.data.bones['upperarm01.L'].head_local.z
        self.load=spec.get('load','none')
        self.camera_location=(2.7,-4.5,2.15)
        self.camera_target=(0,-.05,.98)
        self.camera_scale=2.35
        self.hand_checks={};self.foot_checks={}
        self.hand_markers={};self.foot_markers={}
        for side in ['L','R']:
            for label,collection in [('Hand',self.hand_markers),('Foot',self.foot_markers)]:
                actual=self.empty(f'Check.{label}.{side}.actual')
                wanted=self.empty(f'Check.{label}.{side}.wanted')
                collection[side]=(actual,wanted)
        self.rig['motion_family']=self.family
        self.rig['equipment_kind']=self.load
        self.rig['isometric']=bool(spec.get('isometric'))
        self.setup_equipment()
        self.set_root()
        self.setup_highlight()
        if spec.get('isometric'):self.setup_breathing()
        setup=getattr(self,'setup_'+self.family,None)
        if setup:setup()

    def empty(self,name,parent=None):
        obj=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(obj)
        if hasattr(self,'follow'):obj.parent=parent or self.follow
        self.created.append(obj);return obj
    def box(self,name,loc,size,mat=None,parent=None):
        bpy.ops.mesh.primitive_cube_add(size=1)
        obj=bpy.context.object;obj.name=name;obj.parent=parent or self.follow
        obj.location=loc
        for vertex in obj.data.vertices:vertex.co=Vector((vertex.co.x*size[0],vertex.co.y*size[1],vertex.co.z*size[2]))
        obj.data.materials.append(mat or self.metal)
        bevel=obj.modifiers.new('Soft edges','BEVEL');bevel.width=.009;bevel.segments=3
        self.created.append(obj);return obj
    def cylinder(self,name,radius,length,loc=(0,0,0),axis=(1,0,0),mat=None,parent=None):
        bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=radius,depth=length)
        obj=bpy.context.object;obj.name=name;obj.parent=parent or self.follow;obj.location=loc
        obj.rotation_mode='QUATERNION';obj.rotation_quaternion=v((0,0,1)).rotation_difference(v(axis).normalized())
        obj.data.materials.append(mat or self.metal)
        bevel=obj.modifiers.new('Edge bevel','BEVEL');bevel.width=.004;bevel.segments=2
        for face in obj.data.polygons:face.use_smooth=True
        self.created.append(obj);return obj
    def sphere(self,name,radius,loc=(0,0,0),mat=None,parent=None):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,radius=radius)
        obj=bpy.context.object;obj.name=name;obj.parent=parent or self.follow;obj.location=loc
        obj.data.materials.append(mat or self.metal)
        for face in obj.data.polygons:face.use_smooth=True
        self.created.append(obj);return obj
    def line(self,name,a,b,radius=.012,mat=None,parent=None):
        obj=self.cylinder(name,radius,1,mat=mat,parent=parent)
        self.place_line(obj,a,b);return obj
    def place_line(self,obj,a,b):
        a,b=v(a),v(b);delta=b-a
        obj.location=(a+b)/2;obj.rotation_mode='QUATERNION'
        obj.rotation_quaternion=v((0,0,1)).rotation_difference(delta.normalized()) if delta.length>.00001 else Quaternion()
        obj.scale.z=max(.0001,delta.length)
        self.animated.add(obj)
    def move(self,obj,point,rotation=None):
        obj.location=point
        if rotation is not None:obj.rotation_mode='QUATERNION';obj.rotation_quaternion=rotation
        self.animated.add(obj)
    def make_dumbbell(self,name,light=False):
        handle=self.empty(name)
        self.cylinder('Grip',.011,.28,parent=handle)
        for x in [-.105,.105]:
            self.cylinder('Dumbbell head',.045 if light else .075,.055,(x,0,0),parent=handle)
        return handle
    def make_bar(self,kind='barbell',width=.48):
        handle=self.empty('Exercise implement')
        handle['equipment_kind']=kind
        if kind=='ez-bar':
            half=width/2
            points=[(-.60,0,0),(-half-.08,0,0),(-half+.08,.092,0),(-.07,0,0),(.07,0,0),(half-.08,.092,0),(half+.08,0,0),(.60,0,0)]
            for a,b in zip(points,points[1:]):self.line('EZ bar bend',a,b,.012,parent=handle)
            for child in handle.children:self.animated.discard(child)
            self.ez_offset=.046
            self.ez_half=half
        else:self.cylinder('Straight bar',.013,1.8,parent=handle)
        if kind in ['barbell','back-bar','front-bar','smith-bar','ez-bar']:
            for x in [-.73,.73] if kind!='ez-bar' else [-.51,.51]:
                self.cylinder('Weight plate',.17 if kind!='ez-bar' else .10,.045,(x,0,0),parent=handle)
        return handle
    def setup_equipment(self):
        self.weights={};self.bar=None;self.cable_segments=[]
        self.rope_material=self.material('Cable rubber',(.035,.04,.045),.9)
        if self.load in ['dumbbells','single-dumbbell','light-dumbbells']:
            sides=[self.spec.get('side','L')] if self.load=='single-dumbbell' else ['L','R']
            self.weights={side:self.make_dumbbell(f'Dumbbell.{side}',self.load=='light-dumbbells') for side in sides}
        if self.load in ['barbell','back-bar','front-bar','smith-bar','ez-bar']:
            self.bar=self.make_bar(self.load,self.spec.get('gripWidth',.48))
        if (self.load.startswith('cable') and self.load!='cables') or self.load in ['single-cable','ankle-cable']:
            for index in range(5):self.cable_segments.append(self.line(f'Cable.{index}',(0,0,0),(0,0,.01),.006,self.rope_material))
            if self.load in ['cable-bar','cable-v','cable-triangle']:
                self.bar=self.empty('Exercise implement')
                if self.load=='cable-bar':self.cylinder('Cable straight handle',.012,1.15 if self.family=='vertical_pull' else .65,parent=self.bar)
                elif self.load=='cable-triangle':
                    for x in [-.1,.1]:
                        self.cylinder('Neutral parallel grip',.012,.16,(x,0,0),axis=(0,1,0),parent=self.bar)
                        self.line('Triangle hanger',(x,0,0),(0,0,.15),.012,parent=self.bar)
                    for y in [-.08,.08]:self.cylinder('Triangle crosspiece',.012,.2,(0,y,0),parent=self.bar)
                    for child in self.bar.children:self.animated.discard(child)
                else:
                    self.line('V grip.L',(0,0,0),(.28,.161,0),.014,parent=self.bar)
                    self.line('V grip.R',(0,0,0),(-.28,.161,0),.014,parent=self.bar)
                    self.line('V cable stem',(0,0,0),(0,0,.08),.012,parent=self.bar)
                    for child in self.bar.children:self.animated.discard(child)
        if self.load in ['cable-rope','single-cable']:
            self.weights={side:self.empty(f'Handle.{side}') for side in (['L','R'] if self.load=='cable-rope' else [self.spec.get('side','L')])}
            for handle in self.weights.values():self.cylinder('Rubber handle',.017,.11,parent=handle,mat=self.rope_material)
        if self.bar and self.cable_segments:
            self.cable_connection_height=.15 if self.load=='cable-triangle' else .08 if self.load=='cable-v' else .06
            if self.load=='cable-bar':
                stem=self.line('Cable attachment stem',(0,0,0),(0,0,.06),.01,parent=self.bar)
                self.animated.discard(stem)
            self.sphere('Cable attachment',.013,(0,0,self.cable_connection_height),parent=self.bar)
            for segment in self.cable_segments[1:]:segment.hide_render=True

    def bench(self,incline=0,prone=False):
        group=self.empty('Bench')
        self.box('Bench seat',(0,0,.46),(.34,.35,.08),self.shorts,parent=group)
        back=self.box('Bench back',(0,.42,.46),(.34,.85,.08),self.shorts,parent=group)
        back.rotation_euler.x=radians(incline)
        back.location.y=.05+.425*math.cos(radians(incline));back.location.z=.46+.425*math.sin(radians(incline))
        for y in [-.10,.55]:
            self.box('Bench leg',(0,y,.23),(.08,.09,.43),parent=group)
            self.box('Bench base',(0,y,.025),(.55,.12,.05),parent=group)
        return group
    def cable_tower(self,point):
        point=v(point)
        self.box('Cable tower',(point.x,point.y,1.05),(.12,.16,2.1))
        self.box('Weight stack',(point.x,point.y,.45),(.30,.28,.7),self.shorts)
        self.cylinder('Pulley',.07,.035,point,axis=(1,0,0))
        self.cable_origin=point
    def cables(self,points,origin=None):
        origin=v(origin) if origin is not None else self.cable_origin
        if not self.cable_segments:return
        points=[v(point) for point in points]
        mean=sum(points,Vector())/len(points)
        if self.bar:
            self.equipment_from_hands();bpy.context.view_layer.update()
            connector=self.bar.matrix_local@v((0,0,self.cable_connection_height))
            self.place_line(self.cable_segments[0],origin,connector);return
        connector=mean+(origin-mean).normalized()*.13 if len(points)>1 else points[0]
        self.place_line(self.cable_segments[0],origin,connector)
        for index in range(1,len(self.cable_segments)):
            target=points[(index-1)%len(points)]
            self.place_line(self.cable_segments[index],connector,target)

    def set_root(self,pelvis=None,pitch=0,yaw=0,roll=0):
        pelvis=v(pelvis if pelvis is not None else (0,0,self.hip.z-.008))
        self.root.rotation_mode='QUATERNION'
        self.root.rotation_quaternion=Quaternion((0,0,1),radians(yaw))@Quaternion((1,0,0),radians(pitch))@Quaternion((0,1,0),radians(roll))
        self.root.location=pelvis-self.root.rotation_quaternion@self.hip
        bpy.context.view_layer.update();self.animated.add(self.root)
    def local_point(self,point):return self.root.matrix_local.inverted()@v(point)
    def local_direction(self,direction):return self.root.rotation_quaternion.inverted()@v(direction)
    def world_point(self,point):return self.root.matrix_local@v(point)
    def bone_point(self,name,tail=False):return self.world_point(self.rig.pose.bones[name].tail if tail else self.rig.pose.bones[name].head)
    def pose_axis(self,name,direction):self.aim(name,self.local_direction(direction))
    def foot(self,side,ankle,rotation=None,pole=(0,-1,0),contact=True):
        self.solve_limb('upperleg','lowerleg',side,self.local_point(ankle),self.local_direction(pole))
        desired=(rotation or Quaternion())@self.rig.data.bones[f'foot.{side}'].matrix_local.to_quaternion()
        self.orient(f'foot.{side}',self.root.rotation_quaternion.inverted()@desired)
        actual=self.bone_point(f'foot.{side}')
        self.constraint('Foot',side,actual,v(ankle),contact)
        return actual
    def plant_feet(self,stance=.28,y=0,step=0,toeout=0):
        for side,sign in [('L',1),('R',-1)]:
            rest=self.rig.data.bones[f'foot.{side}'].head_local
            self.foot(side,(sign*stance/2,y,rest.z+step),Quaternion((0,0,1),radians(sign*toeout)),(sign*math.sin(radians(toeout)),-math.cos(radians(toeout)),0))
    def hand(self,side,direction,neutral=0,pronated=False,kind='grip',axis=None):
        local_dir=self.local_direction(direction).normalized()
        local_axis=self.local_direction(axis) if axis is not None else None
        center,across=self.close_hand(side,local_dir,neutral,pronated,local_axis)
        if kind in ['palm','relaxed','ball','flat_palm']:
            for digit in range(2,6):
                for segment in [1,2,3]:
                    self.rig.pose.bones[f'finger{digit}-{segment}.{side}'].rotation_quaternion.identity()
            bpy.context.view_layer.update()
            if kind in ['palm','relaxed','flat_palm']:
                thumb_direction=(local_dir*.65-across*.75).normalized()
                for segment in [1,2,3]:self.aim_without_twist(f'finger1-{segment}.{side}',thumb_direction)
                bpy.context.view_layer.update()
            if kind=='flat_palm':
                for digit in range(2,6):
                    for segment in [1,2,3]:self.aim_without_twist(f'finger{digit}-{segment}.{side}',local_dir)
                bpy.context.view_layer.update()
            bases=[self.rig.pose.bones[f'finger{digit}-1.{side}'].head.copy() for digit in range(2,6)]
            palm=-(1 if side=='L' else -1)*across.cross(local_dir).normalized()
            center=(sum(bases,Vector())/4+self.rig.pose.bones[f'wrist.{side}'].tail)/2+palm*.012
            if kind=='ball':
                for digit in range(2,6):
                    for segment,angle in enumerate([15,35,60],1):
                        a=radians(angle)
                        self.aim_without_twist(f'finger{digit}-{segment}.{side}',local_dir*math.cos(a)+palm*math.sin(a))
        return self.world_point(center),self.root.rotation_quaternion@across
    def arm_to(self,side,target,pole=None,neutral=0,pronated=False,kind='grip',axis=None,hand_direction=None,initial_hand_direction=None):
        target=v(target)
        if pole is None:pole=(1 if side=='L' else -1,.4,-.3)
        # Start at the grip, then subtract the actual palm offset iteratively.
        # Starting beyond the hand can pin near-extended arms to the IK reach cap.
        guess=self.local_point(target)
        if hand_direction is not None:
            # A fixed palm orientation gives a fixed grip offset from the wrist.
            # Seed IK at the wrist rather than beyond its reach at the implement.
            initial_direction=initial_hand_direction if initial_hand_direction is not None else hand_direction(v((0,0,1))) if callable(hand_direction) else hand_direction
            initial_center,_=self.hand(side,initial_direction,neutral,pronated,kind,axis)
            wrist=self.rig.pose.bones[f'wrist.{side}'].head.copy()
            guess-=self.local_point(initial_center)-wrist
        for iteration in range(20):
            direction=self.solve_limb('upperarm','lowerarm',side,guess,self.local_direction(pole))
            world_dir=self.root.rotation_quaternion@direction
            desired_direction=hand_direction(world_dir) if callable(hand_direction) else hand_direction or world_dir
            center,across=self.hand(side,desired_direction,neutral,pronated,kind,axis)
            error=target-center
            if error.length<.0003:break
            guess+=self.local_direction(error)*.6
        self.hand_checks[side]=(center,across)
        self.constraint('Hand',side,center,target,False)
        return center,across
    def arm_fk(self,side,upper_direction,forearm_direction,neutral=0,pronated=False,kind='grip',axis=None,hand_direction=None):
        self.pose_axis(f'upperarm01.{side}',upper_direction)
        self.pose_axis(f'upperarm02.{side}',upper_direction)
        self.pose_axis(f'lowerarm01.{side}',forearm_direction)
        self.pose_axis(f'lowerarm02.{side}',forearm_direction)
        result=self.hand(side,hand_direction or forearm_direction,neutral,pronated,kind,axis)
        self.hand_checks[side]=result
        self.constraint('Hand',side,result[0],result[0],False)
        return result
    def rest_arms(self):
        for side in ['L','R']:self.arm_fk(side,(0,0,-1),(0,-.16,-.987),kind='relaxed')
    def bend_spine(self,degrees):
        # Distribute trunk flexion rather than rotating the pelvis as a sit-up.
        for name,share in [('spine05',.1),('spine04',.2),('spine03',.3),('spine02',.25),('spine01',.15)]:
            bone=self.rig.pose.bones[name]
            self.orient(name,Quaternion((1,0,0),radians(degrees*share))@bone.matrix.to_quaternion())
    def constraint(self,kind,side,actual,wanted,contact):
        pair=(self.hand_markers if kind=='Hand' else self.foot_markers)[side]
        self.move(pair[0],actual);self.move(pair[1],wanted)
        pair[0]['contact']=int(contact)
        self.constraints.append((kind,side,(actual-wanted).length))
    def equipment_from_hands(self):
        if self.family=='squat' and self.spec.get('style')=='sumo':
            self.position_sumo_weight();return
        if self.family=='pullover':
            self.position_pullover_weight();return
        for side,weight in self.weights.items():
            if side in self.hand_checks:
                center,axis=self.hand_checks[side]
                self.move(weight,center,v((1,0,0)).rotation_difference(axis.normalized()))
        if self.bar and len(self.hand_checks)==2:
            left,right=self.hand_checks['L'][0],self.hand_checks['R'][0]
            center=(left+right)/2
            rotation=v((1,0,0)).rotation_difference((left-right).normalized())
            if self.load=='cable-triangle':
                axis=self.hand_checks['L'][1]
                rotation=rotation@Quaternion((1,0,0),math.atan2(axis.z,axis.y))
            if self.load=='cable-v':
                axis=self.hand_checks['L'][1]
                rotation=Quaternion((1,0,0),math.atan2(-axis.z,-axis.y))
                center-=rotation@v((0,.575*abs(left.x-right.x)/2,0))
            if self.load=='ez-bar':
                axis=self.hand_checks['L'][1]
                if axis.x<0:axis=-axis
                angle=math.atan2(-axis.z,-axis.y)
                rotation=Quaternion((1,0,0),angle)
                slot_y=self.ez_offset+.575*(self.ez_half-abs(left.x-right.x)/2)
                center-=rotation@v((0,slot_y,0))
            self.move(self.bar,center,rotation)
    def setup_breathing(self):
        if not self.body.data.shape_keys:self.body.shape_key_add(name='Basis')
        self.breath=self.body.shape_key_add(name='Breathing')
        for point,vertex in zip(self.breath.data,self.body.data.vertices):
            x,y,z=vertex.co
            factor=math.exp(-((z-self.chest_z)/.16)**2-(x/.22)**2)
            point.co=vertex.co+vertex.normal*.004*factor
    def setup_highlight(self):
        mesh=self.body.data
        colors=mesh.color_attributes['MuscleRegion']
        mode=self.spec.get('highlight','full-body')
        memberships={}
        for group in self.body.vertex_groups:memberships[group.index]=group.name
        for vertex in mesh.vertices:
            x,y,z=vertex.co;front=max(0,min(1,-vertex.normal.y));back=max(0,min(1,vertex.normal.y))
            region={}
            for group in vertex.groups:
                name=memberships.get(group.group,'')
                for part in ['upperarm','lowerarm','upperleg','lowerleg','shoulder']:
                    if name.startswith(part):region[part]=region.get(part,0)+group.weight
            mask=0
            if mode=='chest':mask=front*math.exp(-((abs(x)-.095)/.105)**4-((z-self.chest_z)/.09)**4)
            elif mode=='back' and self.family=='rear_fly':
                posterior_deltoid=max(region.get('shoulder',0),region.get('upperarm',0)*max(0,min(1,(z-self.shoulder_z+.17)/.17)))
                middle_back=.7*math.exp(-(x/.20)**4-((z-(self.chest_z+.04))/.11)**4)
                mask=back*max(posterior_deltoid,middle_back)
            elif mode=='back' and self.family=='shrug':
                width=.07+.18*max(0,min(1,(self.shoulder_z+.10-z)/.23))
                mask=max(back,.8*max(0,vertex.normal.z))*math.exp(-(x/width)**4-((z-(self.shoulder_z-.04))/.12)**4)
            elif mode=='back':mask=back*math.exp(-(x/.23)**4-((z-(self.chest_z-.04))/.20)**4)
            elif mode=='shoulders':mask=max(region.get('shoulder',0),region.get('upperarm',0)*max(0,min(1,(z-1.25)/.12)))
            elif mode in ['biceps','triceps']:mask=region.get('upperarm',0)*(front if mode=='biceps' else back)
            elif mode in ['quads','hamstrings']:mask=region.get('upperleg',0)*(front if mode=='quads' else back)
            elif mode=='glutes':mask=back*math.exp(-(x/.21)**4-((z-.9)/.115)**4)
            elif mode=='calves':mask=region.get('lowerleg',0)*max(.3,back)
            elif mode=='core':mask=front*math.exp(-(x/.16)**4-((z-(self.chest_z-.17))/.13)**4)
            else:mask=.35 if .2<z<1.44 else 0
            mask=max(0,min(1,mask))
            colors.data[vertex.index].color=(.29*(1-mask)+.66*mask,.32*(1-mask)+.065*mask,.34*(1-mask)+.045*mask,1)
        if mode=='glutes':
            # Preserve the shorts while showing the target region through a
            # colored anatomical overlay on their posterior/lateral surface.
            cloth=self.clothing.data;cloth.update()
            attr=cloth.color_attributes.get('MuscleRegion') or cloth.color_attributes.new(name='MuscleRegion',type='FLOAT_COLOR',domain='POINT')
            for vertex in cloth.vertices:
                x,y,z=vertex.co
                mask=max(0,vertex.normal.y,.45*abs(vertex.normal.x))*math.exp(-(x/.21)**4-((z-.90)/.115)**4)
                mask=max(0,min(1,mask));attr.data[vertex.index].color=(.12*(1-mask)+.66*mask,.16*(1-mask)+.065*mask,.18*(1-mask)+.045*mask,1)
            mat=self.shorts.copy();mat.name='Glute muscle overlay on shorts';mat.use_nodes=True
            color=mat.node_tree.nodes.new('ShaderNodeVertexColor');color.layer_name='MuscleRegion'
            shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
            mat.node_tree.links.new(color.outputs['Color'],shader.inputs['Base Color'])
            cloth.materials.clear();cloth.materials.append(mat)
    def pose(self,t):
        self.hand_checks={};self.constraints=[]
        if self.spec.get('locomotion'):
            self.move(self.follow,(0,-self.spec.get('travelDistance',1.2)*t,0))
        getattr(self,'pose_'+self.family)(t)
        self.equipment_from_hands()
        self.rig['max_constraint_error']=max((item[2] for item in self.constraints),default=0)
        self.rig['cycle_t']=t
        if hasattr(self,'breath'):
            self.breath.value=0 if self.family=='vacuum' else .5-.5*math.cos(2*math.pi*t)
    def keyframe(self,frame):
        for obj in self.animated:
            obj.keyframe_insert('location',frame=frame)
            obj.keyframe_insert('scale',frame=frame)
            if obj.rotation_mode=='QUATERNION':obj.keyframe_insert('rotation_quaternion',frame=frame)
            else:obj.keyframe_insert('rotation_euler',frame=frame)
        for markers in [self.hand_markers,self.foot_markers]:
            for pair in markers.values():pair[0].keyframe_insert('["contact"]',frame=frame)
        self.rig.keyframe_insert('["max_constraint_error"]',frame=frame)
        self.rig.keyframe_insert('["cycle_t"]',frame=frame)
        if hasattr(self,'breath'):self.breath.keyframe_insert('value',frame=frame)
