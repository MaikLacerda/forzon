"""Original front crawl with separate catch, push, recovery and breathing phases."""
import math
from mathutils import Vector,Quaternion
from motions_sports_strength import smooth,keys

class SwimMotions:
    def setup_swim(self):
        self.camera_location=(3.2,-2.8,2.4);self.camera_target=(0,0,.8);self.camera_scale=3.2
        water=self.material('Pool water',(.20,.53,.68),.6)
        # Open central cutaway keeps the submerged arm path visible.
        for x in [-1,1]:
            surface=self.box('Water surface cutaway',(x,-8,.94),(.55,26,.012),water);surface.parent=None
        floor=self.box('Pool floor',(0,-8,.05),(2.6,26,.05),water);floor.parent=None
        for x in [-.68,.68]:
            for i in range(-65,18):
                marker=self.cylinder('Lane float',.025,.12,(x,i*.20,.95),axis=(0,1,0),mat=self.shorts);marker.parent=None

    def pose_swim(self,t):
        phase=4*t
        body_roll=math.radians(22*math.sin(2*math.pi*phase))
        self.set_root((0,0,.90),pitch=90)
        self.root.rotation_quaternion=Quaternion((0,1,0),body_roll)@Quaternion((1,0,0),math.pi/2)
        # Eight arm strokes. Breathe on strokes three and six, alternating sides.
        stroke=min(7,int(phase*2));part=phase*2-stroke
        breath=0
        if stroke in [2,5]:breath=(1 if stroke==2 else -1)*math.radians(68)*math.sin(math.pi*part)**2
        desired=Quaternion((0,1,0),breath)@Quaternion((1,0,0),math.pi/2)
        self.orient('head',self.root.rotation_quaternion.inverted()@desired@self.rig.data.bones['head'].matrix_local.to_quaternion())
        for side,sign,offset in [('L',1,0),('R',-1,.5)]:
            u=(phase+offset)%1 if t<1 else offset
            shoulder=self.bone_point(f'upperarm01.{side}')
            y=keys([(0,-.55),(.12,-.55),(.32,-.28),(.53,.38),(.62,.47),(.82,.18),(1,-.55)],u)
            z=keys([(0,.94),(.12,.83),(.32,.48),(.53,.65),(.62,.98),(.82,1.02),(1,.94)],u)
            recovery=keys([(0,0),(.62,0),(.78,1),(.90,1),(1,0)],u)
            target=Vector((shoulder.x+sign*(.02+.12*recovery),shoulder.y+y,z))
            downward=keys([(0,-.1),(.12,-.5),(.32,-1),(.53,0),(.62,-.1),(.82,-1),(1,-.1)],u)
            forward=keys([(0,-1),(.12,-1),(.32,-.3),(.53,1),(.62,1),(.82,-.5),(1,-1)],u)
            self.arm_to(side,target,pole=(sign*.08,0,1),kind='palm',axis=(sign,0,0),hand_direction=(0,forward,downward),pronated=False)
            kick=math.radians(9*math.sin(2*math.pi*(phase*3+offset)))
            upper=Vector((sign*.025,math.cos(kick),math.sin(kick)))
            lower=Vector((sign*.025,math.cos(kick*.7),math.sin(kick*.7)))
            self.leg_fk(side,upper,lower,math.radians(155)+kick)
