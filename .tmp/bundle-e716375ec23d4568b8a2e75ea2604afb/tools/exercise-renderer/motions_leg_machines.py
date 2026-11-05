"""Individual leg-machine geometry, pivots and contact paths."""
import math
from mathutils import Vector,Quaternion

def held_depth(t,hold=.2):
    edge=(1-hold)/2
    return 1 if edge<=t<=1-edge else .5-.5*math.cos(math.pi*(t/edge if t<edge else (1-t)/edge))

class LegMachineMotions:
    def stabilize_seated_glute_skin(self):
        # The stock skin pulls the seated buttock up with the femur. Retain a
        # smooth pelvis influence on the contact region, on skin and shorts.
        def ease(value):
            value=max(0,min(1,value));return value*value*(3-2*value)
        bone_names=set(self.rig.data.bones.keys())
        for obj in [self.body,self.clothing]:
            left=obj.vertex_groups['pelvis.L'];right=obj.vertex_groups['pelvis.R']
            for vertex in obj.data.vertices:
                x,y,z=vertex.co
                amount=.95*ease((y-.005)/.07)*ease((z-.77)/.05)*ease((1.00-z)/.05)*ease((.25-abs(x))/.05)
                if amount<.0001:continue
                old={g.group:g.weight for g in vertex.groups if obj.vertex_groups[g.group].name in bone_names}
                for index,weight in old.items():obj.vertex_groups[index].add([vertex.index],weight*(1-amount),'REPLACE')
                side=ease((x+.02)/.04)
                left.add([vertex.index],old.get(left.index,0)*(1-amount)+amount*side,'REPLACE')
                right.add([vertex.index],old.get(right.index,0)*(1-amount)+amount*(1-side),'REPLACE')

    def setup_calf(self):
        if self.spec.get('posture')=='leg-press':return self.setup_leg_press()
        seated=self.spec.get('posture')=='seated';single=self.load=='single-dumbbell'
        self.camera_location=(3,2.5,1.8) if single else (3.4,1.1,1.9) if not seated else (3.5,-1.3,1.5)
        self.camera_target=(0,-.05,1.1 if not seated else .65);self.camera_scale=2.85 if not seated else 2.3
        self.box('Calf forefoot step',(0,-.70 if seated else -.26,.06 if seated else .075),(.65,.26 if seated else .28,.12 if seated else .15),self.shorts)
        if single:
            self.cylinder('Calf balance rail',.018,1.4,(-.32,-.05,.95),axis=(0,0,1))
            self.box('Calf rail base',(-.32,-.05,.03),(.45,.45,.06));return
        if seated:
            self.stabilize_seated_glute_skin()
            self.box('Seated calf seat',(0,.21,.481),(.44,.26,.08),self.shorts)
            self.box('Seated calf seat post',(0,.21,.2205),(.09,.09,.441))
            self.machine_base('Seated calf base',(0,-.30,.03),(1,1.4,.06))
            self.calf_levers={};self.calf_pads={}
            for side,sign in [('L',1),('R',-1)]:
                self.cylinder('Calf hip bearing',.055,.09,(sign*.35,.04,.60))
                self.calf_levers[side]=self.line(f'Calf seated lever.{side}',(sign*.35,.04,.60),(sign*.35,-.4,.7),.025)
                self.calf_pads[side]=self.cylinder(f'Calf thigh pad.{side}',.05,.20,(0,0,0),mat=self.shorts)
                self.cylinder(f'Calf seated grip.{side}',.014,.20,(sign*.28,-.14,.72),axis=(0,1,0))
            self.calf_seated_load=self.empty('Calf seated load')
            self.cylinder('Calf seated load pin',.015,.24,parent=self.calf_seated_load)
            for x in [.06,.12]:self.cylinder('Calf seated plate',.13,.045,(x,0,0),parent=self.calf_seated_load)
        else:
            self.machine_base('Standing calf base',(0,.20,.03),(1.5,1.3,.06))
            self.calf_carriage=self.empty('Calf moving shoulder carriage')
            for x in [-.50,.50]:
                self.cylinder('Calf guide',.025,2.3,(x,.40,1.18),axis=(0,0,1))
                self.cylinder('Calf sliding collar',.045,.14,(x,0,0),axis=(0,0,1),parent=self.calf_carriage)
                self.cylinder('Calf load pin',.015,.30,(x,0,.06),parent=self.calf_carriage)
                for offset in [.12,.18]:self.cylinder('Calf load plate',.13,.045,(x+math.copysign(offset,x),0,.06),parent=self.calf_carriage)
            self.box('Calf carriage crosshead',(0,0,0),(1.1,.10,.08),parent=self.calf_carriage)
            for sign in [-1,1]:
                self.box('Calf shoulder pad',(sign*.186,-.42,-.04),(.18,.24,.12),self.shorts,parent=self.calf_carriage)
                self.line('Calf pad support',(sign*.186,0,0),(sign*.186,-.42,-.04),.024,parent=self.calf_carriage)
                self.cylinder('Calf upright grip',.014,.18,(sign*.30,-.55,-.27),axis=(0,0,1),parent=self.calf_carriage)

    def calf_foot(self,side,angle,seated=False):
        rest=self.rig.data.bones[f'foot.{side}'].head_local
        pivot=self.rig.data.bones[f'toe2-1.{side}'].head_local
        step=.12 if seated else .15;rotation=Quaternion((1,0,0),angle)
        anchor=Vector((.16 if side=='L' else -.16,pivot.y-(.435 if seated else 0),pivot.z+step))
        ankle=anchor+rotation@(rest-pivot)
        self.foot(side,ankle,rotation,pole=(0,-1,0))
        for digit in range(1,6):
            name=f'toe{digit}-1.{side}'
            self.orient(name,self.root.rotation_quaternion.inverted()@self.rig.data.bones[name].matrix_local.to_quaternion())
        return ankle

    def pose_calf(self,t):
        if self.spec.get('posture')=='leg-press':return self.pose_leg_press_calf(t)
        seated=self.spec.get('posture')=='seated';single=self.load=='single-dumbbell'
        d=held_depth(t,.30 if seated else .40);angle=math.radians(-15+50*d)
        if seated:self.set_root((0,.04,.60))
        else:
            rest=self.rig.data.bones['foot.L'].head_local;pivot=self.rig.data.bones['toe2-1.L'].head_local
            rise=(Quaternion((1,0,0),angle)@(rest-pivot)).z-(rest.z-pivot.z)
            self.set_root((.10 if single else 0,0,self.hip.z-.013+.15+rise))
        for side,sign in [('L',1),('R',-1)]:
            if single and side=='R':
                self.foot(side,(-.05,.27,.48),Quaternion((1,0,0),math.radians(35)),pole=(-.2,-1,-1),contact=False)
                self.arm_to(side,(-.32,-.05,1.25),pole=(-1,.2,-.5),axis=(0,0,1),hand_direction=(0,-1,0));continue
            self.calf_foot(side,angle,seated)
            if single:self.arm_fk(side,(0,0,-1),(0,0,-1),neutral=1)
            elif seated:self.arm_to(side,(sign*.28,-.14,.72),pole=(sign,0,-1),axis=(0,-1,0),hand_direction=(0,0,-1))
            else:
                shoulder=self.bone_point('upperarm01.L')
                self.arm_to(side,(sign*.30,-.15,shoulder.z-.12),pole=(sign,-.4,-1),axis=(0,0,1),hand_direction=(0,-1,0))
        if not single and not seated:
            shoulder=self.bone_point('upperarm01.L');self.move(self.calf_carriage,(0,.40,shoulder.z+.15))
        elif seated:
            pads=[]
            for side,sign in [('L',1),('R',-1)]:
                hip=self.bone_point(f'upperleg01.{side}');knee=self.bone_point(f'lowerleg01.{side}');direction=(knee-hip).normalized()
                normal=Vector((0,direction.z,-direction.y)).normalized();pad=hip+direction*.38+normal*.11;pads.append(pad)
                self.move(self.calf_pads[side],pad)
                self.place_line(self.calf_levers[side],(sign*.35,hip.y,hip.z),(sign*.35,pad.y,pad.z))
            mean=(pads[0]+pads[1])/2;self.move(self.calf_seated_load,(.46,mean.y*.55,.60+(mean.z-.60)*.55))

    def leg_fk(self,side,upper,lower,foot_angle=0):
        for part,direction in [('upperleg',upper),('lowerleg',lower)]:
            for index in ['01','02']:self.pose_axis(f'{part}{index}.{side}',direction)
        desired=Quaternion((1,0,0),foot_angle)@self.rig.data.bones[f'foot.{side}'].matrix_local.to_quaternion()
        self.orient(f'foot.{side}',self.root.rotation_quaternion.inverted()@desired)
        p=self.bone_point(f'foot.{side}');self.constraint('Foot',side,p,p,False)

    def machine_base(self,name,center=(0,0,.03),size=(1.1,1.6,.06)):
        self.box(name,center,size)

    def setup_leg_isolation(self):
        style=self.spec['style']
        if style=='seated-curl':return self.setup_seated_curl()
        if style not in ['extension','prone-curl']:raise NotImplementedError('Leg isolation style not authored')
        self.camera_location=(3,-3,1.8) if style=='extension' else (3,2.6,1.7)
        self.camera_target=(0,0,.70);self.camera_scale=2.5
        self.machine_base('Leg machine base',(0,0,.03),(1.0,1.8,.06))
        if style=='extension':
            self.box('Leg extension seat',(0,-.10,.48),(.46,.60,.08),self.shorts)
            self.box('Leg extension back',(0,.20,.94),(.46,.08,.72),self.shorts)
            knee_y=-.385;knee_z=.64
        else:
            self.box('Leg curl chest pad',(0,-.25,.435),(.46,.80,.08),self.shorts)
            self.box('Leg curl thigh pad',(0,.20,.498),(.46,.40,.08),self.shorts)
            knee_y=.425;knee_z=.67
        for y,height in ([(-.35,.47),(.32,.47)] if style=='extension' else [(-.35,.395),(.32,.458)]):self.box('Leg machine upright',(0,y,height/2),(.09,.09,height))
        self.leg_machine_levers={}
        for side,sign in [('L',1),('R',-1)]:
            pivot=(sign*.35,knee_y,knee_z)
            self.box('Leg pivot upright',(sign*.35,knee_y,knee_z/2),(.06,.07,knee_z))
            self.cylinder('Knee axis bearing',.055,.09,pivot)
            self.leg_machine_levers[side]=self.line(f'Leg load lever.{side}',pivot,(sign*.35,knee_y,.2),.024)
            grip=(sign*.28,.02,.66) if style=='extension' else (sign*.28,-.57,.59)
            self.cylinder(f'Leg machine grip.{side}',.014,.18,grip)
        self.leg_roller=self.cylinder('Leg contact roller',.055,.70,(0,0,0),mat=self.shorts)
        self.leg_load=self.empty('Leg load pin')
        self.cylinder('Leg load sleeve',.014,.30,(.04,0,0),parent=self.leg_load)
        for x in [.06,.12]:self.cylinder('Leg load plate',.13,.045,(x,0,0),parent=self.leg_load)

    def pose_leg_isolation(self,t):
        if self.spec['style']=='seated-curl':return self.pose_seated_curl(t)
        extension=self.spec['style']=='extension';d=held_depth(t)
        self.set_root((0,.04 if extension else 0,.64 if extension else .67),pitch=0 if extension else 90)
        angle=math.radians(85*d if extension else 5+105*d)
        upper=Vector((0,-1,0)) if extension else Vector((0,1,0))
        lower=Vector((0,-math.sin(angle),-math.cos(angle))) if extension else Vector((0,math.cos(angle),math.sin(angle)))
        normal=Vector((0,-math.cos(angle),math.sin(angle))) if extension else Vector((0,-math.sin(angle),math.cos(angle)))
        knees=[]
        for side,sign in [('L',1),('R',-1)]:
            self.leg_fk(side,upper,lower,-angle if extension else math.pi/2+angle)
            knee=self.bone_point(f'lowerleg01.{side}');knees.append(knee)
            grip=(sign*.28,.02,.66) if extension else (sign*.28,-.57,.59)
            self.arm_to(side,grip,pole=(sign,.2,-1),axis=(-sign,0,0),hand_direction=(0,-1,0))
        knee=(knees[0]+knees[1])/2;roller=knee+lower*.34+normal*.09
        self.move(self.leg_roller,roller)
        for side,sign in [('L',1),('R',-1)]:self.place_line(self.leg_machine_levers[side],(sign*.35,knee.y,knee.z),(sign*.35,roller.y,roller.z))
        self.move(self.leg_load,(.42,knee.y+(roller.y-knee.y)*.55,knee.z+(roller.z-knee.z)*.55))

    def setup_seated_curl(self):
        self.camera_location=(3,-3,1.8);self.camera_target=(0,-.20,.77);self.camera_scale=2.5
        self.machine_base('Seated curl base',(0,-.1,.03),(1.2,1.8,.06))
        self.box('Seated curl seat',(0,-.10,.54),(.46,.60,.08),self.shorts)
        self.box('Seated curl back',(0,.20,1.0),(.46,.08,.72),self.shorts)
        self.box('Seated curl pedestal',(0,.04,.25),(.16,.16,.50))
        self.cylinder('Seated curl thigh restraint',.06,.62,(0,-.25,.86),mat=self.shorts)
        self.line('Seated curl restraint bracket',(.34,.12,.64),(.34,-.25,.86),.025)
        self.seated_curl_levers={}
        for side,sign in [('L',1),('R',-1)]:
            pivot=(sign*.35,-.385,.70)
            self.box('Seated curl pivot upright',(sign*.35,-.385,.35),(.07,.08,.70))
            self.cylinder('Seated curl knee bearing',.055,.09,pivot)
            self.seated_curl_levers[side]=self.line(f'Seated curl lever.{side}',pivot,(sign*.35,-.7,.5),.024)
            self.cylinder(f'Seated curl grip.{side}',.014,.18,(sign*.28,.02,.72))
        self.seated_curl_roller=self.cylinder('Seated curl ankle roller',.055,.70,mat=self.shorts)
        self.seated_curl_load=self.empty('Seated curl load')
        self.cylinder('Seated curl load sleeve',.015,.28,parent=self.seated_curl_load)
        for x in [.06,.12]:self.cylinder('Seated curl plate',.13,.045,(x,0,0),parent=self.seated_curl_load)

    def pose_seated_curl(self,t):
        self.set_root((0,.04,.70));a=math.radians(5+105*held_depth(t))
        lower=Vector((0,-math.cos(a),-math.sin(a)));normal=Vector((0,math.sin(a),-math.cos(a)))
        knees=[]
        for side,sign in [('L',1),('R',-1)]:
            self.leg_fk(side,(0,-1,0),lower,-math.pi/2+a)
            knees.append(self.bone_point(f'lowerleg01.{side}'))
            self.arm_to(side,(sign*.28,.02,.72),pole=(sign,.2,-1),axis=(-sign,0,0),hand_direction=(0,-1,0))
        knee=(knees[0]+knees[1])/2;roller=knee+lower*.34+normal*.09
        self.move(self.seated_curl_roller,roller)
        for side,sign in [('L',1),('R',-1)]:self.place_line(self.seated_curl_levers[side],(sign*.35,knee.y,knee.z),(sign*.35,roller.y,roller.z))
        self.move(self.seated_curl_load,(.42,knee.y+(roller.y-knee.y)*.55,knee.z+(roller.z-knee.z)*.55))

    def setup_abduction(self):
        self.camera_location=(3,-3,1.7);self.camera_target=(0,-.15,.75);self.camera_scale=2.3
        self.machine_base('Abduction base',(0,-.1,.03),(1.3,1.3,.06))
        self.box('Abduction covered weight stack',(-.50,.40,.55),(.24,.26,1.0),self.shorts)
        self.line('Abduction load transmission',(-.50,.40,.12),(0,.04,.12),.016)
        self.box('Abduction seat',(0,.15,.476),(.44,.40,.09),self.shorts)
        self.box('Abduction seat pedestal',(0,.15,.2155),(.12,.12,.431))
        self.abduction_pads={};self.abduction_levers={};self.abduction_feet={};self.abduction_stems={};self.abduction_pad_stems={}
        for side,sign in [('L',1),('R',-1)]:
            self.cylinder('Abduction hip bearing',.055,.08,(sign*.105,.04,.34),axis=(0,0,1))
            self.abduction_pads[side]=self.box(f'Abduction knee pad.{side}',(0,0,0),(.09,.22,.20),self.shorts)
            self.abduction_levers[side]=self.line(f'Abduction radial lever.{side}',(sign*.105,0,.34),(sign*.2,-.4,.34),.025)
            self.abduction_pad_stems[side]=self.line(f'Abduction pad stem.{side}',(0,0,0),(0,0,1),.02)
            self.abduction_stems[side]=self.line(f'Abduction foot stem.{side}',(0,0,0),(0,0,1),.02)
            self.abduction_feet[side]=self.box(f'Abduction footplate.{side}',(0,0,0),(.19,.28,.04))
            self.cylinder(f'Abduction handgrip.{side}',.014,.16,(sign*.31,-.02,.61),axis=(0,1,0))

    def pose_abduction(self,t):
        self.set_root((0,.04,.62),pitch=22);d=held_depth(t);angle=math.radians(8+32*d)
        for side,sign in [('L',1),('R',-1)]:
            direction=Vector((sign*math.sin(angle),-math.cos(angle),-.08)).normalized()
            self.leg_fk(side,direction,(0,0,-1));knee=self.bone_point(f'lowerleg01.{side}');ankle=self.bone_point(f'foot.{side}')
            yaw=Quaternion((0,0,1),sign*angle)
            self.orient(f'foot.{side}',self.root.rotation_quaternion.inverted()@yaw@self.rig.data.bones[f'foot.{side}'].matrix_local.to_quaternion())
            outward=Vector((sign*math.cos(angle),math.sin(angle),0))
            pad=knee+outward*.11
            self.move(self.abduction_pads[side],pad,Quaternion((0,0,1),sign*angle))
            hip=self.bone_point(f'upperleg01.{side}');self.place_line(self.abduction_levers[side],(hip.x,hip.y,.34),(pad.x,pad.y,.34))
            self.place_line(self.abduction_pad_stems[side],(pad.x,pad.y,.34),(pad.x,pad.y,pad.z-.10))
            footplate=ankle+yaw@Vector((0,-.08,-.091))
            self.move(self.abduction_feet[side],footplate,yaw)
            self.place_line(self.abduction_stems[side],(pad.x,pad.y,.34),footplate+outward*.095)
            self.arm_to(side,(sign*.31,-.02,.61),pole=(sign,.2,-1),axis=(0,-1,0),hand_direction=(0,0,-1))
