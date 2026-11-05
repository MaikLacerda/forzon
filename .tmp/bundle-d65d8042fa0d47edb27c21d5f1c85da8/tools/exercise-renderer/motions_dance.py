"""An original lateral step-touch and rhythmic squat fitness combination."""
import math
from mathutils import Vector
from motions_sports_strength import smooth

class DanceMotions:
    def setup_dance(self):
        self.camera_location=(2.6,-4.5,2);self.camera_target=(0,0,.95);self.camera_scale=2.5

    def pose_dance(self,t):
        # Four alternating lateral steps, then two grounded rhythmic squats.
        states=[(.15,-.15),(.40,-.15),(.40,.10),(.40,-.15),(.15,-.15)]
        positions=[.15,-.15];lift=[0,0];x=0;d=0
        if t<.5:
            phase=t*8;beat=min(3,int(phase));u=phase-beat
            start,end=states[beat],states[beat+1];f=smooth(u)
            positions=[a+(b-a)*f for a,b in zip(start,end)]
            active=0 if beat in [0,3] else 1;lift[active]=.055*math.sin(math.pi*u)**2
            shift=smooth((u-.35)/.65)
            x=(sum(start)*(1-shift)+sum(end)*shift)/2
            d=.055*math.sin(math.pi*u)**2
            rhythm=math.sin(2*math.pi*phase)
        else:
            u=(t-.5)*4;d=.24*math.sin(math.pi*u)**2;rhythm=math.sin(2*math.pi*u)
        self.set_root((x,0,self.hip.z-.008-d),pitch=6*d/.24,yaw=8*rhythm)
        for i,(side,sign) in enumerate([('L',1),('R',-1)]):
            rest=self.rig.data.bones[f'foot.{side}'].head_local
            self.foot(side,(positions[i],0,rest.z+lift[i]),pole=(sign*.15,-1,0),contact=lift[i]<.001)
            shoulder=self.bone_point(f'upperarm01.{side}')
            up=.5+.5*math.sin(2*math.pi*(t*4)+i*math.pi)
            target=shoulder+Vector((sign*.20,-.16,-.28+.50*up))
            self.arm_to(side,target,pole=(sign,.1,-.2),kind='ball',neutral=1)
