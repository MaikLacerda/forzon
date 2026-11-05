"""Original selectorized hip-thrust station with padded belt and cable resistance."""
import math
from mathutils import Vector,Quaternion
from motions_leg_machines import held_depth

class HipMachineMotions:
    def setup_machine_hip_thrust(self):
        self.camera_location=(3,-3,1.8);self.camera_target=(0,.10,.72);self.camera_scale=2.9
        self.machine_base('Hip machine base',(0,.1,.03),(1.8,1.9,.06))
        self.box('Hip machine footplate',(0,-.45,.04),(.90,.60,.08),self.shorts)
        self.box('Hip machine back bench',(0,.65,.54),(.85,.50,.08),self.shorts)
        self.box('Hip machine bench pedestal',(0,.65,.27),(.18,.24,.54))
        self.hip_belt=self.empty('Hip machine moving belt')
        self.box('Hip belt padded center',(0,0,0),(.46,.12,.10),self.shorts,parent=self.hip_belt)
        for x in [-.27,.27]:self.box('Hip belt webbing',(x,0,0),(.12,.09,.025),self.rope_material,parent=self.hip_belt)
        self.hip_machine_cables={};self.hip_machine_blocks={}
        for side,sign in [('L',1),('R',-1)]:
            self.cylinder(f'Hip machine fixed grip.{side}',.015,.18,(sign*.32,.22,.58),axis=(0,1,0))
            self.line('Hip machine grip support',(sign*.32,.22,.58),(sign*.32,.6,.58),.024)
            self.box('Hip machine stack base',(sign*.70,.50,.08),(.35,.35,.16))
            for x in [sign*.70-.10,sign*.70+.10]:self.cylinder('Hip stack guide',.012,1.10,(x,.50,.65),axis=(0,0,1))
            for z in [.20,.25,.30]:self.box('Hip stationary stack plate',(sign*.70,.50,z),(.27,.22,.04),self.shorts)
            self.hip_machine_blocks[side]=self.box(f'Hip active stack.{side}',(sign*.70,.50,.40),(.27,.22,.12),self.shorts)
            points=[(sign*.40,-.10,.10),(sign*.70,-.10,.10),(sign*.70,.50,1.15)]
            for pt in points:self.cylinder('Hip cable pulley',.045,.035,pt,axis=(1,0,0))
            self.line('Hip stack upper support',(sign*.70,.50,.10),(sign*.70,.50,1.15),.025)
            self.hip_machine_cables[side]=[self.line(f'Hip load cable.{side}.{i}',(0,0,0),(0,0,.01),.005,self.rope_material) for i in range(4)]

    def pose_machine_hip_thrust(self,t):
        d=held_depth(t);rotation=Quaternion((1,0,0),math.radians(-52-36*d))
        local_shoulder=(self.rig.data.bones['upperarm01.L'].head_local+self.rig.data.bones['upperarm01.R'].head_local)/2-self.hip
        back=rotation@(local_shoulder+Vector((0,.117,0)))
        pelvis=Vector((0,.44-back.y,.58-back.z+.028*(1-d)))
        self.set_root(pelvis,pitch=-52-36*d);self.plant_feet(.36,y=-.43,step=.08)
        belt=pelvis+rotation@Vector((0,-.16,0));self.move(self.hip_belt,belt,rotation)
        for side,sign in [('L',1),('R',-1)]:
            self.arm_to(side,(sign*.32,.22,.58),pole=(sign,-.2,-1),axis=(-sign,0,0),hand_direction=(0,-1,0))
            eye=belt+Vector((sign*.32,0,0));base=Vector((sign*.40,-.10,.10))
            if not hasattr(self,'hip_cable_rest'):self.hip_cable_rest={}
            if side not in self.hip_cable_rest:self.hip_cable_rest[side]=(eye-base).length
            rise=(eye-base).length-self.hip_cable_rest[side]
            block=Vector((sign*.70,.50,.40+rise));self.move(self.hip_machine_blocks[side],block)
            points=[eye,base,Vector((sign*.70,-.10,.10)),Vector((sign*.70,.50,1.15)),block+Vector((0,0,.06))]
            for cable,a,b in zip(self.hip_machine_cables[side],points,points[1:]):self.place_line(cable,a,b)
