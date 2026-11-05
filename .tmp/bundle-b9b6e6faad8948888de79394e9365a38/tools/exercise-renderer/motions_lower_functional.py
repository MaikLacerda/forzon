"""Split-stance locomotion, supported hip extension and ankle-cable work."""
import math
from mathutils import Vector,Quaternion
from motions_leg_machines import held_depth

def smooth(t):
    t=max(0,min(1,t));return t*t*(3-2*t)

class LowerFunctionalMotions:
    def setup_lunge(self):
        self.camera_location=(3,-3.5,1.8);self.camera_target=(0,-.05,.85);self.camera_scale=2.65
        if self.spec['style']=='bulgarian':
            self.box('Bulgarian rear-foot bench',(0,.54,.36),(.85,.45,.08),self.shorts)
            for x in [-.30,.30]:
                self.box('Bulgarian bench leg',(x,.54,.18),(.08,.09,.36))
                self.box('Bulgarian bench base',(x,.54,.025),(.28,.50,.05))
        elif self.spec['style']!='walking':raise NotImplementedError('Lunge style not authored')

    def pose_lunge(self,t):
        if self.spec['style']=='bulgarian':
            self.set_root((0,-.05,.81-.32*(.5-.5*math.cos(2*math.pi*t))),pitch=12)
            self.foot('L',(.14,-.45,self.rig.data.bones['foot.L'].head_local.z),pole=(.1,-1,0))
            self.foot('R',(-.14,.35,.51),Quaternion((1,0,0),math.radians(135)),pole=(0,-1,-1),contact=False)
        else:
            step=min(1,int(t*2));u=t*2-step
            if t>=1:step=1;u=1
            progression=.17*smooth(u/.5) if u<=.5 else .17+.83*smooth((u-.5)/.5)
            travel=-.85*(step+progression);self.move(self.follow,(0,travel,0))
            self.set_root((0,-.08,.80-.30*math.sin(math.pi*u)**2),pitch=7)
            front='L' if step==0 else 'R';rear='R' if step==0 else 'L'
            front_y=-.50-.85*step;rear_y=.35-.85*step
            for side,sign in [('L',1),('R',-1)]:
                rest=self.rig.data.bones[f'foot.{side}'].head_local;pivot=self.rig.data.bones[f'toe2-1.{side}'].head_local
                if side==front:
                    angle=math.radians(45*smooth((u-.55)/.45));anchor=Vector((sign*.14,front_y+pivot.y-rest.y,pivot.z))
                    ankle=anchor+Quaternion((1,0,0),angle)@(rest-pivot)
                elif u<=.55:
                    angle=math.radians(45);anchor=Vector((sign*.14,rear_y+pivot.y-rest.y,pivot.z))
                    ankle=anchor+Quaternion((1,0,0),angle)@(rest-pivot)
                else:
                    phase=(u-.55)/.45;mix=smooth(phase);angle=math.radians(45*(1-mix))
                    start=Vector((sign*.14,rear_y+pivot.y-rest.y,pivot.z))+Quaternion((1,0,0),math.radians(45))@(rest-pivot)
                    end=Vector((sign*.14+rest.x-pivot.x,front_y-.85,rest.z))
                    ankle=start.lerp(end,mix);ankle.z+=.12*math.sin(math.pi*phase)
                ankle.y-=travel
                self.foot(side,ankle,Quaternion((1,0,0),angle),pole=(0,-1,-.1),contact=side==front or u<=.55)
                if side==front or u<=.55:
                    for digit in range(1,6):
                        name=f'toe{digit}-1.{side}';self.orient(name,self.root.rotation_quaternion.inverted()@self.rig.data.bones[name].matrix_local.to_quaternion())
        for side,sign in [('L',1),('R',-1)]:self.arm_fk(side,(sign*.15,0,-1),(sign*.15,0,-1),neutral=1)

    def setup_hip_thrust(self):
        if self.load=='hip-thrust-machine':return self.setup_machine_hip_thrust()
        if self.load!='barbell':raise NotImplementedError('Hip thrust machine needs separate equipment')
        self.box('Hip thrust upper-back bench',(0,.65,.46),(.85,.50,.08),self.shorts)
        for x in [-.30,.30]:
            self.box('Hip thrust bench leg',(x,.65,.23),(.08,.08,.46))
            self.box('Hip thrust bench base',(x,.65,.03),(.24,.60,.06))
        self.cylinder('Hip bar foam pad',.06,.45,parent=self.bar,mat=self.shorts)
        self.camera_location=(3,-2.8,1.6);self.camera_target=(0,.10,.65);self.camera_scale=2.5

    def pose_hip_thrust(self,t):
        if self.load=='hip-thrust-machine':return self.pose_machine_hip_thrust(t)
        pitch=-52-36*held_depth(t);rotation=Quaternion((1,0,0),math.radians(pitch))
        local_shoulder=(self.rig.data.bones['upperarm01.L'].head_local+self.rig.data.bones['upperarm01.R'].head_local)/2-self.hip
        back=rotation@(local_shoulder+Vector((0,.117,0)))
        # The contact patch rolls across the upper back as the torso pivots.
        # Compensate its measured skin thickness at the lowered endpoint.
        pelvis=Vector((0,.44-back.y,.50-back.z+.028*(1-held_depth(t))));self.set_root(pelvis,pitch=pitch)
        self.plant_feet(.36,y=-.43)
        bar=pelvis+rotation@Vector((0,-.16,0))
        for side,sign in [('L',1),('R',-1)]:
            self.arm_to(side,(sign*.28,bar.y,bar.z),pole=(sign,-.3,-1),pronated=True,hand_direction=(0,-1,0))

    def setup_kickback(self):
        if self.load!='ankle-cable':raise NotImplementedError('Glute kickback equipment not authored')
        self.cable_tower((.15,-.90,.13));self.external_pulley((.15,-.68,.13),(.15,-.76,.13))
        for cable in self.cable_segments[1:]:cable.hide_render=True
        self.cylinder('Glute support handle',.017,.62,(0,-.65,1.22))
        for x in [-.27,.27]:self.line('Glute handle bracket',(x,-.90,1.22),(x,-.65,1.22),.018)
        self.glute_cuff=self.cylinder('Glute ankle cuff',.045,.065,(0,0,0),axis=(0,0,1),mat=self.shorts)
        self.glute_eye=self.sphere('Glute cuff eye',.015,(0,0,0))
        self.camera_location=(3,2.8,1.8);self.camera_target=(0,-.10,.95);self.camera_scale=2.65

    def pose_kickback(self,t):
        self.set_root((-.08,0,self.hip.z-.008),pitch=15)
        self.foot('R',(-.16,0,self.rig.data.bones['foot.R'].head_local.z),pole=(0,-1,0))
        a=math.radians(15+25*held_depth(t));lower=Vector((0,math.sin(a-math.radians(8)),-math.cos(a-math.radians(8))))
        self.leg_fk('L',(0,math.sin(a),-math.cos(a)),lower,math.radians(25*held_depth(t)))
        ankle=self.bone_point('foot.L');center=ankle-lower*.055;eye=center+(self.cable_origin-center).normalized()*.045
        self.move(self.glute_cuff,center,Vector((0,0,1)).rotation_difference(lower))
        self.move(self.glute_eye,eye);self.place_line(self.cable_segments[0],self.cable_origin,eye)
        for side,sign in [('L',1),('R',-1)]:self.arm_to(side,(sign*.24,-.65,1.22),pole=(sign,-.5,-.5),pronated=True,hand_direction=(0,-1,0))
