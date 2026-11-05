"""Explicit core and sport motions. Unauthored sports never reuse other clips."""
import math
import bpy
from mathutils import Vector,Quaternion
from motions_leg_machines import held_depth
from motions_core_equipment import CoreEquipmentMotions
from motions_sports_strength import SportsStrengthMotions
from motions_locomotion import LocomotionMotions
from motions_ball_sports import BallSportMotions
from motions_combat import CombatMotions
from motions_dance import DanceMotions
from motions_swim import SwimMotions

def depth(t):return .5-.5*math.cos(2*math.pi*t)

class CoreSportMotions(CoreEquipmentMotions,SportsStrengthMotions,LocomotionMotions,BallSportMotions,CombatMotions,DanceMotions,SwimMotions):
    def setup_vacuum(self):
        self.camera_location=(3,-2.5,1.7);self.camera_target=(0,0,.97);self.camera_scale=2.2
        self.vacuum=self.body.shape_key_add(name='Abdominal draw-in')
        for point,vertex in zip(self.vacuum.data,self.body.data.vertices):
            x,y,z=vertex.co
            front=max(0,min(1,-vertex.normal.y))
            amount=math.exp(-(x/.135)**4-((z-(self.chest_z-.20))/.125)**4)*front
            point.co=vertex.co+Vector((0,.035*amount,0))

    def pose_vacuum(self,t):
        # This is an isometric stance: reuse the solved skeletal pose while the
        # abdominal shape key moves. The renderer resets pose bones each frame.
        if not hasattr(self,'vacuum_stance'):
            self.set_root();self.plant_feet(.32)
            for side,sign in [('L',1),('R',-1)]:
                self.arm_to(side,(sign*.18,-.09,.95),pole=(sign,0,-.25),kind='palm')
            self.vacuum_stance={bone.name:(bone.rotation_quaternion.copy(),bone.location.copy()) for bone in self.rig.pose.bones}
            self.vacuum_hands=dict(self.hand_checks);self.vacuum_constraints=list(self.constraints)
        else:
            for name,(rotation,location) in self.vacuum_stance.items():
                self.rig.pose.bones[name].rotation_quaternion=rotation;self.rig.pose.bones[name].location=location
            self.hand_checks=dict(self.vacuum_hands);self.constraints=list(self.vacuum_constraints)
            bpy.context.view_layer.update()
        # Exhale/draw in, hold, then release. No unrelated crunch is substituted.
        a=max(0,min(1,t/.15));b=max(0,min(1,(1-t)/.15))
        self.vacuum.value=(a*a*(3-2*a))*(b*b*(3-2*b))
        self.vacuum.keyframe_insert('value',frame=1+round(t*(self.spec['frames']-1)))

    def setup_crunch(self):
        if self.spec.get('posture')=='kneeling':return self.setup_cable_crunch()
        self.stabilize_seated_glute_skin()
        if self.spec.get('posture')!='lying':raise NotImplementedError('Kneeling cable crunch supports not authored')
        self.box('Exercise mat',(0,0,.008),(.70,1.8,.016),self.shorts)
        self.camera_location=(2.3,-2.8,2);self.camera_target=(0,.05,.40);self.camera_scale=2.2

    def pose_crunch(self,t):
        if self.spec.get('posture')=='kneeling':return self.pose_cable_crunch(t)
        self.set_root((0,0,.103),pitch=-90)
        self.bend_spine(30*held_depth(t))
        for side,sign in [('L',1),('R',-1)]:
            self.foot(side,(sign*.14,-.52,self.rig.data.bones[f'foot.{side}'].head_local.z+.016),pole=(0,0,1))
            shoulder=self.bone_point(f'upperarm01.{side}')
            self.arm_to(side,(-sign*.10,shoulder.y-.07,shoulder.z+.12),pole=(sign,-.3,.15),kind='palm')

    def setup_plank(self):
        self.box('Exercise mat',(0,0,.008),(.70,2.1,.016),self.shorts)
        if self.spec.get('style')=='side':
            self.camera_location=(3,-2.7,1.8);self.camera_target=(0,0,.38);self.camera_scale=2.4
            return
        self.camera_location=(2.5,-3.2,1.8);self.camera_target=(0,0,.35);self.camera_scale=2.4

    def pose_plank(self,t):
        if self.spec.get('style')=='side':return self.pose_side_plank(t)
        self.set_root((0,0,.289),pitch=85)
        for side,sign in [('L',1),('R',-1)]:
            self.arm_fk(side,(0,0,-1),(0,-1,0),kind='palm',pronated=False)
            self.leg_fk(side,(sign*.05,.9961947,-.0871557),(0,.9961947,-.0871557),math.radians(49))

    def pose_side_plank(self,t):
        self.set_root((0,0,.32),yaw=90,roll=70)
        self.foot('L',(0,-.806,.08),self.root.rotation_quaternion,pole=(1,0,0),contact=False)
        self.foot('R',(0,-.848,.17),self.root.rotation_quaternion,pole=(1,0,0),contact=False)
        self.arm_fk('L',(0,0,-1),(1,0,0),kind='palm',pronated=False,axis=(0,1,0))
        self.arm_to('R',Vector((0,0,.32))+self.root.rotation_quaternion@Vector((-.18,-.05,0)),pole=(0,-1,.3),kind='palm')
