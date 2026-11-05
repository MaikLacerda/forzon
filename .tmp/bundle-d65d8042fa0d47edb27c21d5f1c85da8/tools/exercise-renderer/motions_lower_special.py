"""Individually supported lower-body movements with original equipment geometry."""
import math
from mathutils import Vector,Quaternion
from motions_leg_machines import held_depth

class LowerSpecialMotions:
    def setup_sissy_squat(self):
        self.camera_location=(3,-2.5,1.6);self.camera_target=(0,.10,.85);self.camera_scale=2.6
        self.cylinder('Sissy balance rail',.018,1.5,(.48,.05,.75),axis=(0,0,1))
        self.box('Sissy rail base',(.48,.05,.025),(.45,.55,.05))

    def pose_sissy_squat(self,t):
        d=.5-.5*math.cos(2*math.pi*t);angle=math.radians(55*d)
        rotation=Quaternion((1,0,0),math.radians(45*d));ankles=[]
        for side,sign in [('L',1),('R',-1)]:
            rest=self.rig.data.bones[f'foot.{side}'].head_local;toe=self.rig.data.bones[f'toe2-1.{side}'].head_local
            hip_x=self.rig.data.bones[f'upperleg01.{side}'].head_local.x
            ankles.append(Vector((hip_x-rest.x+toe.x,toe.y,toe.z))+rotation@(rest-toe))
        upper=sum(self.rig.data.bones[f'upperleg{part}.L'].length for part in ['01','02'])
        lower=sum(self.rig.data.bones[f'lowerleg{part}.L'].length for part in ['01','02'])
        pelvis=(ankles[0]+ankles[1])/2+Vector((0,(upper-lower)*math.sin(angle),(lower+upper)*math.cos(angle)-.001*(1-d)))
        self.set_root(pelvis,pitch=-55*d)
        for (side,sign),ankle in zip([('L',1),('R',-1)],ankles):
            self.foot(side,ankle,rotation,pole=(0,-1,0))
            for digit in range(1,6):
                name=f'toe{digit}-1.{side}';self.orient(name,self.root.rotation_quaternion.inverted()@self.rig.data.bones[name].matrix_local.to_quaternion())
        self.arm_to('L',(.48,.05,1.10),pole=(1,.1,-.5),axis=(0,0,1),hand_direction=(0,-1,0))
        self.arm_to('R',pelvis+self.root.rotation_quaternion@Vector((.10,-.14,.32)),pole=(-1,-.5,-1),kind='palm')

    def setup_hack_squat(self):
        self.camera_location=(3,-2.8,1.8);self.camera_target=(0,.10,.90);self.camera_scale=2.8
        self.machine_base('Hack base',(0,.15,.03),(1.5,1.8,.06))
        self.box('Hack foot platform',(0,-.30,.05),(1.0,.75,.10),self.shorts)
        for x in [-.60,.60]:
            self.line('Hack guide',(x,-.40,.41),(x,.90,1.71),.03)
            self.line('Hack rear upright',(x,.90,.06),(x,.90,1.71),.03)
        self.hack_carriage=self.empty('Hack moving carriage')
        back=self.box('Hack back pad',(0,.341,.139),(.48,.78,.08),self.shorts,parent=self.hack_carriage);back.rotation_euler.x=math.pi/4
        for side,sign in [('L',1),('R',-1)]:
            self.cylinder('Hack sliding collar',.055,.20,(sign*.60,.30,.30),axis=(0,1,1),parent=self.hack_carriage)
            self.line('Hack carriage crosshead',(0,.30,.30),(sign*.60,.30,.30),.03,parent=self.hack_carriage)
            self.box(f'Hack shoulder pad.{side}',(sign*.186,.30,.43),(.18,.26,.12),self.shorts,parent=self.hack_carriage)
            self.cylinder(f'Hack grip.{side}',.014,.16,(sign*.30,.18,.40),parent=self.hack_carriage)
            self.line('Hack grip bracket',(sign*.30,.18,.40),(sign*.30,.40,.40),.018,parent=self.hack_carriage)
            self.cylinder('Hack load pin',.018,.40,(sign*.75,.45,.40),parent=self.hack_carriage)
            for offset in [.76,.82]:self.cylinder('Hack plate',.18,.045,(sign*offset,.45,.40),parent=self.hack_carriage)

    def pose_hack_squat(self,t):
        d=.5-.5*math.cos(2*math.pi*t);pelvis=Vector((0,.10-.38*d,.91-.38*d))
        self.set_root(pelvis,pitch=-45);self.plant_feet(.34,y=-.25,step=.10,toeout=20)
        self.move(self.hack_carriage,pelvis)
        for side,sign in [('L',1),('R',-1)]:self.arm_to(side,pelvis+Vector((sign*.30,.18,.40)),pole=(sign,-.2,-1),pronated=True,hand_direction=(0,-1,0))

    def setup_leg_press(self):
        self.camera_location=(3,2.3,1.7);self.camera_target=(0,-.1,.80);self.camera_scale=2.8
        self.machine_base('Leg press base',(0,-.25,.03),(1.5,2.2,.06))
        self.box('Leg press seat',(0,.04,.28),(.48,.35,.08),self.shorts)
        back=self.box('Leg press back pad',(0,.341,.539),(.48,.78,.08),self.shorts)
        back.rotation_euler.x=math.pi/4
        self.box('Leg press seat pedestal',(0,.16,.14),(.18,.18,.28))
        plane_sum=.40+math.sqrt(2)*.07
        if self.family=='calf':
            foot=self.rig.data.bones['foot.L'].head_local;toe=self.rig.data.bones['toe2-1.L'].head_local
            offset=Quaternion((1,0,0),-3*math.pi/4)@(toe-foot)
            plane_sum=.40+offset.y+offset.z+math.sqrt(2)*.20
        for side,sign in [('L',1),('R',-1)]:
            self.line('Leg press guide',(sign*.57,.15,plane_sum-.15),(sign*.57,-1.15,plane_sum+1.15),.03)
            self.line('Leg press rail rear support',(sign*.57,-1.15,.06),(sign*.57,-1.15,plane_sum+1.15),.03)
            self.cylinder(f'Leg press grip.{side}',.014,.18,(sign*.29,.11,.47),axis=(0,1,0))
        self.leg_sled=self.empty('Leg press moving sled')
        platform=self.box('Leg press foot platform',(0,0,0),(.95,.58,.05),parent=self.leg_sled)
        platform.rotation_euler.x=math.pi/4
        self.line('Leg press sled crosshead',(-.64,0,0),(.64,0,0),.035,parent=self.leg_sled)
        for x in [-.57,.57]:
            self.cylinder('Leg press rail collar',.055,.18,(x,0,0),axis=(0,-1,1),parent=self.leg_sled)
            self.cylinder('Leg press load sleeve',.018,.43,(x+math.copysign(.15,x),0,.12),parent=self.leg_sled)
            for offset in [.15,.21]:self.cylinder('Leg press plate',.18,.045,(x+math.copysign(offset,x),0,.12),parent=self.leg_sled)

    def pose_leg_press(self,t):
        self.set_root((0,0,.40),pitch=-45)
        direction=Vector((0,-1,1)).normalized();along=Vector((0,1,1)).normalized()
        distance=.835-.285*(.5-.5*math.cos(2*math.pi*t))
        ankles=[]
        for side,sign in [('L',1),('R',-1)]:
            ankle=Vector((sign*.17,0,.40))+direction*distance
            self.foot(side,ankle,Quaternion((1,0,0),-3*math.pi/4),pole=(sign*.2,-.1,1),contact=False)
            ankles.append(ankle)
            self.arm_to(side,(sign*.29,.11,.47),pole=(sign,.3,-1),axis=(-sign,0,0),hand_direction=(0,-1,0))
        self.move(self.leg_sled,(ankles[0]+ankles[1])/2+direction*.095+along*.07)

    def pose_leg_press_calf(self,t):
        self.set_root((0,0,.40),pitch=-45)
        direction=Vector((0,-1,1)).normalized();along=Vector((0,1,1)).normalized()
        base=Quaternion((1,0,0),-3*math.pi/4);rotation=Quaternion((1,0,0),math.radians(-150+50*held_depth(t)))
        anchors=[]
        for side,sign in [('L',1),('R',-1)]:
            rest=self.rig.data.bones[f'foot.{side}'].head_local;toe=self.rig.data.bones[f'toe2-1.{side}'].head_local
            base_ankle=Vector((sign*.17,0,.40))+direction*.835
            original=base@(toe-rest);rotated=rotation@(toe-rest)
            anchor=base_ankle+original+direction*direction.dot(rotated-original)
            self.foot(side,anchor-rotated,rotation,pole=(sign*.2,-.1,1),contact=False)
            for digit in range(1,6):
                name=f'toe{digit}-1.{side}'
                self.orient(name,self.root.rotation_quaternion.inverted()@base@self.rig.data.bones[name].matrix_local.to_quaternion())
            anchors.append(anchor)
            self.arm_to(side,(sign*.29,.11,.47),pole=(sign,.3,-1),axis=(-sign,0,0),hand_direction=(0,-1,0))
        self.move(self.leg_sled,(anchors[0]+anchors[1])/2+direction*(.029538+.030)+along*.20)

    def setup_back_extension(self):
        self.camera_location=(3,-3,1.8);self.camera_target=(0,.05,.75);self.camera_scale=2.6
        self.machine_base('Roman chair base',(0,.30,.03),(1.1,1.5,.06))
        for sign in [-1,1]:
            pad=self.box(f'Roman chair thigh pad.{sign}',(sign*.14,.069,.629),(.25,.32,.10),self.shorts)
            pad.rotation_euler.x=-math.pi/4
        self.line('Roman chair central support',(0,.40,.08),(0,.105,.60),.045)
        self.line('Roman chair angled frame',(0,.105,.60),(0,.64,.15),.035)
        self.roman_platform=self.box('Roman chair foot platform',(0,.597,.148),(.64,.36,.05))
        self.roman_platform.rotation_euler.x=math.pi/4
        self.cylinder('Roman chair ankle restraint',.055,.66,(0,.66,.39),mat=self.shorts)
        for x in [-.35,.35]:self.line('Roman chair restraint support',(x,.65,.08),(x,.66,.39),.025)

    def pose_back_extension(self,t):
        self.set_root((0,0,.90),pitch=100-55*held_depth(t))
        for side,sign in [('L',1),('R',-1)]:
            self.leg_fk(side,(0,.70710678,-.70710678),(0,.70710678,-.70710678),math.pi/4)
            shoulder=self.bone_point(f'upperarm01.{side}')
            rotation=self.root.rotation_quaternion
            target=Vector((0,0,.90))+rotation@Vector((-sign*.10,-.14,.32))
            self.arm_to(side,target,pole=rotation@Vector((sign,-.5,-1)),kind='palm',axis=rotation@Vector((0,0,1)),hand_direction=rotation@Vector((-sign,0,0)))
