"""Explicit lower-body motion families."""
import math
from mathutils import Vector,Quaternion
from motions_leg_machines import LegMachineMotions
from motions_lower_functional import LowerFunctionalMotions
from motions_lower_special import LowerSpecialMotions
from motions_hip_machine import HipMachineMotions

def depth(t):return .5-.5*math.cos(2*math.pi*t)

class LowerMotions(LegMachineMotions,LowerFunctionalMotions,LowerSpecialMotions,HipMachineMotions):
    def setup_hinge(self):
        if self.spec.get('style')=='back-extension':
            return self.setup_back_extension()
        if self.spec.get('style')=='deadlift':
            self.arm_fk('L',(.12,0,-1),(.12,0,-1),pronated=True,hand_direction=(0,0,-1))
            self.deadlift_grip_y_offset=self.hand_checks['L'][0].y-self.bone_point('upperarm01.L').y

    def pose_hinge(self,t):
        if self.spec.get('style')=='back-extension':return self.pose_back_extension(t)
        d=depth(t);deadlift=self.spec.get('style')=='deadlift'
        pitch=(45 if deadlift else 65)*d
        y=.22*d
        if deadlift:
            shoulder=(self.rig.data.bones['upperarm01.L'].head_local+self.rig.data.bones['upperarm01.R'].head_local)/2-self.hip
            y=-.10-(Quaternion((1,0,0),math.radians(pitch))@shoulder).y-self.deadlift_grip_y_offset
        self.set_root((0,y,self.hip.z-.008-(.41 if deadlift else .04)*d),pitch=pitch)
        self.plant_feet(.34)
        if self.load=='back-bar':
            shoulder=self.bone_point('upperarm01.L')
            offset=self.root.rotation_quaternion@Vector((0,.06,.02))
            for side,sign in [('L',1),('R',-1)]:
                self.arm_to(side,(sign*.39,shoulder.y+offset.y,shoulder.z+offset.z),pole=self.root.rotation_quaternion@Vector((sign,.5,-1)),pronated=True,hand_direction=self.root.rotation_quaternion@Vector((0,-1,0)))
        else:
            for side,sign in [('L',1),('R',-1)]:
                self.arm_fk(side,(sign*.12 if deadlift else sign*.025,0,-1),(sign*.12 if deadlift else 0,0,-1),pronated=self.load=='barbell',neutral=1 if self.load=='dumbbells' else 0,hand_direction=(0,0,-1) if deadlift else None)

    def setup_squat(self):
        if self.load=='hack-sled':return self.setup_hack_squat()
        if self.load=='sissy-support':return self.setup_sissy_squat()
        if self.load in ['hack-sled','sissy-support']:
            raise NotImplementedError('Special squat equipment requires its individual motion')
        self.camera_location=(3,-3.4,1.9);self.camera_scale=2.65
        if self.load=='single-dumbbell':
            for child in self.weights['L'].children:child.hide_render=True
            self.cylinder('Sumo heavy grip',.014,.40,parent=self.weights['L'])
            for x in [-.18,.18]:self.cylinder('Sumo heavy head',.11,.055,(x,0,0),parent=self.weights['L'])
            for x in [-.325,.325]:self.box('Sumo step',(x,-.05,.075),(.30,.48,.15),self.shorts)
        if self.load=='smith-bar':
            self.smith_collars={}
            for x in [-.84,.84]:
                self.cylinder('Smith guide rail',.025,2.10,(x,.03734,1.07),axis=(0,0,1))
                self.box('Smith base',(x,0,.03),(.12,.9,.06))
                self.smith_collars[x]=self.cylinder('Smith sliding collar',.045,.10,(x,.03734,1),axis=(0,0,1))

    def pose_squat(self,t):
        if self.load=='hack-sled':return self.pose_hack_squat(t)
        if self.load=='sissy-support':return self.pose_sissy_squat(t)
        d=depth(t)
        front=self.load=='front-bar'
        sumo=self.spec.get('style')=='sumo';step=.15 if sumo else 0
        drop=.50 if sumo else .52 if front else .48 if self.load=='smith-bar' else .45
        pelvis=Vector((0,(.10 if front else .16)*d,self.hip.z-.008+step-drop*d));pitch=(12 if front else 20 if sumo else 25)*d
        if self.load=='smith-bar':pelvis.z-=.004*(1-d)
        if sumo:pelvis.z-=.018*(1-d)
        self.set_root(pelvis,pitch=pitch)
        offset=self.root.rotation_quaternion@Vector((0,-.10 if front else .06,.02))
        if self.load=='smith-bar':
            shoulder=self.bone_point('upperarm01.L');pelvis.y+=.03734-shoulder.y-offset.y;self.set_root(pelvis,pitch=pitch)
        self.plant_feet(self.spec.get('stance',.35),y=-self.spec.get('feetForward',0),step=step,toeout=45 if sumo else 12)
        shoulder=self.bone_point('upperarm01.L')
        for side,sign in [('L',1),('R',-1)]:
            if sumo:
                self.arm_to(side,(sign*.065,shoulder.y-.08,shoulder.z-.490),pole=(sign*.1,-.1,-1),kind='palm',hand_direction=(0,-1,0));continue
            self.arm_to(side,(-sign*.17 if front else sign*.39,shoulder.y+offset.y,shoulder.z+offset.z),
                        pole=self.root.rotation_quaternion@Vector((sign,-1,.1) if front else (sign,.5,-1)),pronated=not front,
                        hand_direction=self.root.rotation_quaternion@Vector((0,1 if front else -1,0)))
        if self.load=='smith-bar':
            for x,collar in self.smith_collars.items():self.move(collar,(x,.03734,shoulder.z+offset.z))

    def position_sumo_weight(self):
        center=(self.hand_checks['L'][0]+self.hand_checks['R'][0])/2-Vector((0,0,.1525))
        self.move(self.weights['L'],center,Vector((1,0,0)).rotation_difference(Vector((0,0,1))))
