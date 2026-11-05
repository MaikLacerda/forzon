"""Original double-pole ergometer and squat-to-press strength sequences."""
import math
from mathutils import Vector,Quaternion

def smooth(value):
    value=max(0,min(1,value));return value*value*(3-2*value)

def keys(points,t):
    if t<=points[0][0]:return points[0][1]
    for (a,x),(b,y) in zip(points,points[1:]):
        if t<=b:return x+(y-x)*smooth((t-a)/(b-a))
    return points[-1][1]

class SportsStrengthMotions:
    def setup_muscle_up(self):
        self.camera_location=(3,-3.5,2.6);self.camera_target=(0,0,1.50);self.camera_scale=3.5
        self.cylinder('Muscle-up fixed bar',.016,1.65,(0,-.13,2.05))
        for x in [-.90,.90]:
            self.box('Muscle-up upright',(x,.05,1.05),(.07,.08,2.10))
            self.box('Muscle-up base',(x,.05,.03),(.15,.90,.06))
            self.line('Muscle-up top brace',(x,.05,2.05),(x*.85,-.13,2.05),.025)
        self.set_root((0,.10,1));shoulder=self.bone_point('upperarm01.L')
        reach=sum(self.rig.data.bones[f'{part}{number}.L'].length for part in ['upperarm','lowerarm'] for number in ['01','02'])-.002
        center,_=self.hand('L',(0,0,1),pronated=True);offset=center-self.bone_point('wrist.L')
        dz=math.sqrt(reach**2-(.30-offset.x-shoulder.x)**2-(-.13-offset.y-shoulder.y)**2)
        self.muscle_hang=2.05-offset.z-dz-(shoulder.z-1)
        self.set_root((0,.06,2));shoulder=self.bone_point('upperarm01.L')
        center,_=self.hand('L',(0,0,-1),pronated=True);offset=center-self.bone_point('wrist.L')
        dz=math.sqrt(reach**2-(.30-offset.x-shoulder.x)**2-(-.13-offset.y-shoulder.y)**2)
        self.muscle_top=2.05-offset.z+dz-(shoulder.z-2)

    def pose_muscle_up(self,t):
        z=keys([(0,self.muscle_hang),(.10,self.muscle_hang),(.28,1.65),(.40,1.97),(.56,self.muscle_top),(.64,self.muscle_top),(.78,1.97),(.87,1.65),(1,self.muscle_hang)],t)
        pitch=keys([(0,0),(.28,0),(.40,45),(.56,0),(.64,0),(.78,45),(.87,0),(1,0)],t)
        y=keys([(0,.10),(.28,.03),(.315,.15),(.34,.19),(.40,.20),(.56,.06),(.64,.06),(.78,.20),(.825,.19),(.845,.15),(.87,.03),(1,.10)],t)
        turn=keys([(0,0),(.28,0),(.40,1),(.74,1),(.88,0),(1,0)],t)
        self.set_root((0,y,z),pitch=pitch)
        for s in ['L','R']:
            self.leg_fk(s,self.root.rotation_quaternion@Vector((0,0,-1)),self.root.rotation_quaternion@Vector((0,.5,-.8660254)),math.radians(15+pitch))
        direction=(0,-math.sin(math.pi*turn),math.cos(math.pi*turn))
        for side,sign in [('L',1),('R',-1)]:
            pole=Vector((sign*.8,.2,-.7)).lerp(Vector((sign*.8,.5,.5)),turn)
            self.arm_to(side,(sign*.30,-.13,2.05),pole=pole,pronated=True,hand_direction=direction)

    def setup_skierg(self):
        self.camera_location=(3,1.4,1.9);self.camera_target=(0,-.25,1.08);self.camera_scale=2.9
        self.box('Ski standing platform',(0,-.25,.015),(.95,1.30,.03),self.shorts)
        self.box('Ski central column',(0,-.85,1.15),(.13,.17,2.15))
        self.cylinder('Ski flywheel housing',.23,.24,(0,-.83,.28),axis=(1,0,0))
        self.cylinder('Ski flywheel inset',.19,.25,(0,-.83,.28),axis=(1,0,0),mat=self.shorts)
        self.line('Ski top crosshead',(-.46,-.85,2.17),(.46,-.85,2.17),.03)
        self.weights={};self.ski_ropes={}
        for side,sign in [('L',1),('R',-1)]:
            pulley=(sign*.40,-.85,2.17)
            self.cylinder(f'Ski top pulley.{side}',.05,.04,pulley,axis=(1,0,0))
            handle=self.empty(f'Ski handle.{side}');self.weights[side]=handle
            self.cylinder('Ski ergonomic grip',.018,.13,parent=handle,mat=self.rope_material)
            self.sphere('Ski handle rope eye',.014,(.075,0,0),parent=handle)
            self.ski_ropes[side]=self.line(f'Ski cord.{side}',pulley,(0,0,0),.004,self.rope_material)

    def pose_skierg(self,t):
        u=t if t<1 else 0
        d=smooth(u/(1/3)) if u<1/3 else 1-smooth((u-1/3)/(2/3))
        self.set_root((0,.10*d,self.hip.z-.008+.03-.09*d),pitch=45*d);self.plant_feet(.35,step=.03)
        shoulder=self.bone_point('upperarm01.L')
        z=1.70*(1-d)+(shoulder.z-.625)*d
        direction=(0,-math.sin(math.pi*d),math.cos(math.pi*d))
        for side,sign in [('L',1),('R',-1)]:
            center,axis=self.arm_to(side,(sign*.25,-.34*(1-d)-.20*d-.02*math.sin(math.pi*d),z),pole=(sign*.8,-.5,-.2),hand_direction=direction)
            self.place_line(self.ski_ropes[side],(sign*.40,-.85,2.17),center+axis.normalized()*.075)

    def setup_thruster(self):
        self.camera_location=(3.5,-2.9,2.0);self.camera_target=(0,0,1.04);self.camera_scale=2.85
        self.set_root();shoulder=self.bone_point('upperarm01.L')
        center,_=self.hand('L',(0,0,1),pronated=False)
        offset=center-self.bone_point('wrist.L')
        reach=sum(self.rig.data.bones[f'{part}{number}.L'].length for part in ['upperarm','lowerarm'] for number in ['01','02'])-.0015
        self.thruster_top=shoulder.z+math.sqrt(reach**2-(.30-offset.x-shoulder.x)**2-(-offset.y-shoulder.y)**2)+offset.z
        self.thruster_head_top=max((self.body.matrix_world@v.co).z for v in self.body.data.vertices)

    def pose_thruster(self,t):
        d=smooth(t/.28) if t<.28 else 1-smooth((t-.28)/.22) if t<.50 else 0
        press=smooth((t-.49)/.22) if t<.76 else 1-smooth((t-.76)/.22)
        self.set_root((0,.10*d,self.hip.z-.008-.59*d),pitch=12*d);self.plant_feet(.35,toeout=12)
        shoulder=self.bone_point('upperarm01.L');rack=shoulder+self.root.rotation_quaternion@Vector((0,-.10,.02))
        z=rack.z*(1-press)+self.thruster_top*press
        clearance=self.thruster_head_top+.03
        y=rack.y*(1-smooth(press/.12))-.21*smooth(press/.12)+.21*smooth((z-clearance)/max(.04,self.thruster_top-clearance-.015))
        direction=self.root.rotation_quaternion@Vector((0,-math.cos(math.pi*press/2),math.sin(math.pi*press/2)))
        for side,sign in [('L',1),('R',-1)]:
            rack_pole=self.root.rotation_quaternion@Vector((sign*.4,-1,.05));overhead_pole=Vector((sign*.4,-.8,-1.2))
            self.arm_to(side,(sign*.30,y,z),pole=rack_pole.lerp(overhead_pole,press),hand_direction=direction,pronated=False)
