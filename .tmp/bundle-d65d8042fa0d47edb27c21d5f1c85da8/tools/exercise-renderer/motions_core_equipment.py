"""Core exercises with their own supports and implements."""
import math
from mathutils import Vector,Quaternion
from motions_leg_machines import held_depth

class CoreEquipmentMotions:
    def setup_rollout(self):
        self.box('Rollout mat',(0,-.40,.008),(.90,2.25,.016),self.shorts)
        self.camera_location=(3,-3,1.65);self.camera_target=(0,-.35,.45);self.camera_scale=2.65
        self.abwheel=self.empty('Ab wheel axle')
        self.abwheel_disc=self.cylinder('Ab wheel tire',.12,.065,axis=(1,0,0),mat=self.rope_material,parent=self.abwheel)
        self.cylinder('Ab wheel hub',.045,.075,axis=(1,0,0),parent=self.abwheel)
        self.cylinder('Ab wheel shaft',.012,.44,axis=(1,0,0),parent=self.abwheel)
        for x in [-.15,.15]:self.cylinder('Ab wheel grip',.018,.13,(x,0,0),axis=(1,0,0),mat=self.shorts,parent=self.abwheel)

    def pose_rollout(self,t):
        d=.5-.5*math.cos(2*math.pi*t);a=math.radians(65*d)
        upper=Vector((0,math.sin(a),-math.cos(a)))
        length=(self.rig.data.bones['lowerleg01.L'].head_local-self.rig.data.bones['upperleg01.L'].head_local).length
        pelvis=Vector((0,-length*math.sin(a),.075+length*math.cos(a)))
        self.set_root(pelvis,pitch=60+25*d);self.bend_spine(5)
        for s in ['L','R']:self.leg_fk(s,upper,(0,1,0),math.radians(150))
        knee=(self.bone_point('lowerleg01.L')+self.bone_point('lowerleg01.R'))/2
        self.set_root(pelvis+Vector((0,-knee.y,.075-knee.z)),pitch=60+25*d)
        shoulders=[self.bone_point(f'upperarm01.{s}') for s in ['L','R']]
        z=.136;center_y=sum(p.y for p in shoulders)/2
        dz=sum(p.z for p in shoulders)/2-z
        wheel_y=center_y-math.sqrt(max(.001,.632**2-dz**2-.046**2))
        self.move(self.abwheel,(0,wheel_y,z))
        if not hasattr(self,'wheel_start_y'):self.wheel_start_y=wheel_y
        base=Vector((0,0,1)).rotation_difference(Vector((1,0,0)))
        self.move(self.abwheel_disc,(0,0,0),Quaternion((1,0,0),-(wheel_y-self.wheel_start_y)/.12)@base)
        for (s,sign),shoulder in zip([('L',1),('R',-1)],shoulders):
            target=Vector((sign*.14,wheel_y,z))
            self.arm_to(s,target,pole=(sign*.2,0,-1),pronated=True,hand_direction=(target-shoulder).normalized())

    def setup_twist(self):
        self.stabilize_seated_glute_skin()
        self.box('Russian twist mat',(0,-.15,.008),(.95,1.55,.016),self.shorts)
        self.camera_location=(3,-3,1.8);self.camera_target=(0,-.05,.47);self.camera_scale=2.2
        self.twist_plate=self.empty('Russian twist plate')
        self.cylinder('Russian twist weight disc',.16,.035,axis=(0,1,0),parent=self.twist_plate)
        self.cylinder('Russian twist hub',.035,.045,axis=(0,1,0),mat=self.shorts,parent=self.twist_plate)

    def pose_twist(self,t):
        angle=math.radians(40*math.sin(2*math.pi*t));self.set_root((0,0,.115),pitch=-45)
        for name,share in [('spine05',.1),('spine04',.2),('spine03',.3),('spine02',.25),('spine01',.15)]:
            bone=self.rig.pose.bones[name];self.orient(name,Quaternion((0,0,1),angle*share)@bone.matrix.to_quaternion())
        rotation=self.root.rotation_quaternion@Quaternion((0,0,1),angle)
        center=Vector((0,0,.115))+rotation@Vector((0,-.35,.18));self.move(self.twist_plate,center,rotation)
        self.plant_feet(.28,y=-.50,step=.016)
        for side,sign in [('L',1),('R',-1)]:
            self.arm_to(side,center+rotation@Vector((sign*.145,0,0)),pole=rotation@Vector((sign*.5,.2,-.8)),axis=rotation@Vector((0,-1,0)),hand_direction=rotation@Vector((0,0,-1)))

    def setup_cable_crunch(self):
        self.box('Cable crunch mat',(0,.12,.008),(.80,1.25,.016),self.shorts)
        self.cable_tower((0,-.90,1.80))
        self.camera_location=(3,-2.5,1.65);self.camera_target=(0,-.10,.70);self.camera_scale=2.6

    def pose_cable_crunch(self,t):
        d=held_depth(t);self.set_root((0,0,.50),pitch=15);self.bend_spine(40*d)
        head_rotation=self.root.rotation_quaternion@self.rig.pose.bones['head'].matrix.to_quaternion()@self.rig.data.bones['head'].matrix_local.to_quaternion().inverted()
        chin=self.bone_point('jaw',True)
        for side,sign in [('L',1),('R',-1)]:
            self.leg_fk(side,(0,0,-1),(0,1,0),math.radians(150))
            target=chin+head_rotation@Vector((sign*.13,.03,.12))
            self.arm_to(side,target,pole=head_rotation@Vector((sign*.2,-.4,-1)),axis=head_rotation@Vector((0,0,1)),hand_direction=head_rotation@Vector((0,-1,0)))
        self.cables([self.hand_checks[s][0] for s in ['L','R']])

    def setup_leg_raise(self):
        self.camera_location=(3,-3,1.8);self.camera_target=(0,-.10,1.0);self.camera_scale=2.8
        self.machine_base('Captain chair base',(0,.10,.03),(1.3,1.25,.06))
        self.box('Captain chair back pad',(0,.15,1.35),(.46,.08,.70),self.shorts)
        for side,sign in [('L',1),('R',-1)]:
            self.box('Captain chair upright',(sign*.35,.20,1.0),(.07,.09,2.0))
            self.box(f'Captain forearm pad.{side}',(sign*.20,-.18,1.245),(.18,.55,.08),self.shorts)
            self.line('Captain armrest frame',(sign*.35,.20,1.20),(sign*.20,-.42,1.20),.025)
            self.cylinder(f'Captain grip.{side}',.015,.20,(sign*.165,-.416,1.321),axis=(0,0,1))

    def pose_leg_raise(self,t):
        d=held_depth(t);self.set_root((0,-.025*d,1.12+.025*d),pitch=12*d);self.bend_spine(-12*d)
        angle=math.radians(5+90*d);direction=(0,-math.sin(angle),-math.cos(angle))
        for side,sign in [('L',1),('R',-1)]:
            self.leg_fk(side,direction,direction,-angle)
            self.arm_to(side,(sign*.165,-.416,1.321),pole=(0,0,-1),axis=(0,0,1),hand_direction=(0,-1,0))
