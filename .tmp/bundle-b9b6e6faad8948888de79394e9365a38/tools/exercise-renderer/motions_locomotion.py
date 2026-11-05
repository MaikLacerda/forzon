"""World-space stance contacts for running and loaded forward locomotion."""
import math
from mathutils import Vector,Quaternion
from motions_sports_strength import keys,smooth

class LocomotionMotions:
    def setup_sled_push(self):
        self.camera_location=(3,2.3,1.7);self.camera_target=(0,-.55,.75);self.camera_scale=3.05
        surface=self.box('Sled push lane',(0,-4,.005),(2.4,25,.01),self.shorts);surface.parent=None
        markings=self.material('Sled lane markings',(.60,.62,.63),.95)
        for i in range(-10,45):
            obj=self.box('Sled distance marker',(.9,-.45*i,.011),(.15,.02,.002),markings);obj.parent=None
        self.box('Sled main plate',(0,-1.35,.09),(1.1,1.0,.06))
        for x in [-.45,.45]:self.box('Sled runner',(x,-1.35,.05),(.10,1.15,.08))
        self.cylinder('Sled weight pin',.025,.65,(0,-1.40,.44),axis=(0,0,1))
        for z in [.17,.23,.29,.35]:self.cylinder('Sled load plate',.25,.05,(0,-1.40,z),axis=(0,0,1),mat=self.shorts)
        for side,sign in [('L',1),('R',-1)]:self.cylinder(f'Sled push post.{side}',.025,1.4,(sign*.27,-.94,.80),axis=(0,0,1))

    def pose_sled_push(self,t):
        stride=2*t;step=(4*t)%1 if t<1 else 0
        self.set_root((0,0,.80+.008*math.sin(2*math.pi*step)),pitch=45)
        for side,sign,offset in [('L',1,0),('R',-1,.5)]:
            u=(stride+offset)%1 if t<1 else offset
            rest=self.rig.data.bones[f'foot.{side}'].head_local;toe=self.rig.data.bones[f'toe2-1.{side}'].head_local
            if u<=.68:
                angle=math.radians(15+30*smooth(u/.68));rotation=Quaternion((1,0,0),angle)
                ankle=Vector((sign*.14,-.12+.90*u,toe.z+.01))+rotation@(rest-toe)
                self.foot(side,ankle,rotation,pole=(0,-1,0));self.flatten_stance_toes(side)
            else:
                v=(u-.68)/.32;angle=math.radians(45-30*smooth(v))
                start=Vector((sign*.14,-.12+.90*.68,toe.z+.01))+Quaternion((1,0,0),math.radians(45))@(rest-toe)
                end=Vector((sign*.14,-.12,toe.z+.01))+Quaternion((1,0,0),math.radians(15))@(rest-toe)
                ankle=start.lerp(end,smooth(v));ankle.z+=.14*math.sin(math.pi*v)**2
                self.foot(side,ankle,Quaternion((1,0,0),angle),pole=(0,-1,0),contact=False)
                flatten=smooth(v/.20)*(1-smooth((v-.75)/.25))
                self.flatten_stance_toes(side,Quaternion((1,0,0),angle*flatten))
            self.arm_to(side,(sign*.27,-.94,1.03),pole=(sign,.1,-.2),axis=(0,0,1),hand_direction=(0,-1,0))

    def setup_run(self):
        self.camera_location=(3,-3.5,1.8);self.camera_target=(0,0,.92);self.camera_scale=2.5
        track=self.box('Running lane',(0,-8,.006),(2.0,50,.012),self.shorts);track.parent=None
        line_material=self.material('Running lane markings',(.58,.60,.61),.95)
        for x in [-.85,.85]:
            obj=self.box('Running lane edge',(x,-8,.013),(.025,50,.002),line_material);obj.parent=None
        for i in range(-20,42):
            obj=self.box('Running center dash',(0,-.75*i,.013),(.02,.24,.002),line_material);obj.parent=None

    def flatten_stance_toes(self,side,rotation=None):
        rotation=rotation or Quaternion()
        for digit in range(1,6):
            name=f'toe{digit}-1.{side}'
            self.orient(name,self.root.rotation_quaternion.inverted()@rotation@self.rig.data.bones[name].matrix_local.to_quaternion())

    def pose_run(self,t):
        stride=7*t;step=(14*t)%1 if t<1 else 0
        self.set_root((0,0,.87-.015*math.sin(2*math.pi*step)),pitch=5)
        for side,sign,offset in [('L',1,0),('R',-1,.5)]:
            u=(stride+offset)%1 if t<1 else offset
            rest=self.rig.data.bones[f'foot.{side}'].head_local;toe=self.rig.data.bones[f'toe2-1.{side}'].head_local
            if u<=.40:
                angle=math.radians(40*smooth(u/.40));rotation=Quaternion((1,0,0),angle)
                anchor=Vector((sign*.13,-.22+1.50*u,toe.z+.012))
                ankle=anchor+rotation@(rest-toe)
                self.foot(side,ankle,rotation,pole=(0,-1,0),contact=True);self.flatten_stance_toes(side)
            else:
                v=(u-.40)/.60
                end=Vector((sign*.13,-.22,toe.z+.012))+(rest-toe)
                start=Vector((sign*.13,.38,toe.z+.012))+Quaternion((1,0,0),math.radians(40))@(rest-toe)
                y=keys([(0,start.y),(.15,.55),(.35,.32),(.70,-.20),(1,end.y)],v)
                z=keys([(0,start.z),(.35,.60),(.65,.43),(.90,.16),(1,end.z)],v)
                angle=math.radians(keys([(0,40),(.35,20),(.70,0),(1,0)],v))
                self.foot(side,(end.x,y,z),Quaternion((1,0,0),angle),pole=(0,-1,0),contact=False)
                if v<.20:self.flatten_stance_toes(side,Quaternion((1,0,0),angle*smooth(v/.20)))
            a=math.radians(12*math.cos(2*math.pi*(stride+offset)))
            # Neutral wrists and gently curled fingers rather than supinated,
            # flat palms during the reciprocal running arm swing.
            self.arm_fk(side,(0,math.sin(a),-math.cos(a)),(0,-math.cos(a),-math.sin(a)),kind='ball',axis=(0,0,1))
