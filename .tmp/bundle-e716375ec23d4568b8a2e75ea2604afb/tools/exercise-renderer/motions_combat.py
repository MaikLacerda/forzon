"""Individually authored shadow-boxing combinations and defensive locomotion."""
import math
from mathutils import Vector,Quaternion
from motions_sports_strength import smooth,keys

class CombatMotions:
    def setup_sprawl(self):
        self.camera_location=(3,-2.8,1.7);self.camera_target=(0,.1,.65);self.camera_scale=2.6
        self.box('Wrestling mat',(0,.3,.008),(2,2.6,.016),self.shorts)
        visible={i for p in self.body.data.polygons for i in p.vertices}
        self.sprawl_foot_offsets={}
        for side in ['L','R']:
            groups={g.index for g in self.body.vertex_groups if g.name.endswith('.'+side) and g.name.startswith(('foot.','toe'))}
            rest=self.rig.data.bones[f'foot.{side}'].head_local
            self.sprawl_foot_offsets[side]=[v.co-rest for v in self.body.data.vertices if v.index in visible and sum(g.weight for g in v.groups if g.group in groups)>.55]

    def pose_sprawl(self,t):
        back=keys([(0,0),(.28,0),(.45,1),(.58,1),(.75,0),(1,0)],t)
        z=keys([(0,.85),(.28,.35),(.45,.17),(.58,.17),(.75,.35),(1,.85)],t)
        pitch=keys([(0,10),(.28,65),(.45,55),(.58,55),(.75,65),(1,10)],t)
        self.set_root((0,.12*back,z),pitch=pitch)
        self.orient('head',Quaternion((1,0,0),math.radians(-35*back))@self.rig.data.bones['head'].matrix_local.to_quaternion())
        for side,sign in [('L',1),('R',-1)]:
            rest=self.rig.data.bones[f'foot.{side}'].head_local
            rotation=Quaternion((1,0,0),math.pi*back)
            support=.018-min((rotation@p).z for p in self.sprawl_foot_offsets[side])
            ankle=Vector((sign*.20,.962*back,support+.022*back+.10*math.sin(math.pi*back)**2))
            self.foot(side,ankle,rotation,pole=(0,0,1),contact=back in [0,1])
            floor=smooth(t/.28) if t<.28 else 1-smooth((t-.75)/.25) if t>.75 else 1
            shoulder=self.bone_point(f'upperarm01.{side}');guard=shoulder+Vector((0,-.13,.10))
            target=guard.lerp(Vector((sign*.24,-.50,.06)),floor)
            self.arm_to(side,target,pole=(sign,.1,.3),kind='flat_palm',axis=(sign,0,0),hand_direction=(0,-1,0),pronated=False)

    def setup_boxing(self):
        self.camera_location=(3,-3.8,1.9);self.camera_target=(0,0,.98);self.camera_scale=2.4

    def pose_boxing(self,t):
        # Four separate two-second demonstrations, each returning to guard.
        beat=min(3,int(t*4));u=t*4-beat
        if t>=1:u=1
        drive=smooth(u/.38) if u<.38 else 1-smooth((u-.42)/.45)
        drive=max(0,min(1,drive));yaw=[-8,25,-30,15][beat]*drive
        self.set_root((0,0,self.hip.z-.045-.025*drive if beat==3 else self.hip.z-.045),yaw=yaw)
        self.orient('head',Quaternion((1,0,0),math.radians(8))@self.rig.data.bones['head'].matrix_local.to_quaternion())
        for side,sign in [('L',1),('R',-1)]:
            rest=self.rig.data.bones[f'foot.{side}'].head_local
            toe=self.rig.data.bones[f'toe2-1.{side}'].head_local
            turn=math.radians(yaw*.55);heel=math.radians(20*drive if (beat in [1,3] and side=='R') or (beat==2 and side=='L') else 0)
            rotation=Quaternion((0,0,1),turn)@Quaternion((1,0,0),heel)
            anchor=Vector((sign*.15,(-.17 if side=='L' else .17)+toe.y,toe.z))
            self.foot(side,anchor+rotation@(rest-toe),rotation,pole=(0,-1,0))
            for digit in range(1,6):
                name=f'toe{digit}-1.{side}'
                self.orient(name,self.root.rotation_quaternion.inverted()@Quaternion((0,0,1),turn)@self.rig.data.bones[name].matrix_local.to_quaternion())
            shoulder=self.bone_point(f'upperarm01.{side}')
            guard=shoulder+Vector((0,-.15,.12))
            active=side==('L' if beat in [0,2] else 'R')
            target=guard;pole=Vector((sign*.35,.1,-1));direction=Vector((0,0,1));axis=Vector((0,1,0))
            if active:
                if beat<2:
                    end=shoulder+Vector((0,-.625,.10));target=guard.lerp(end,drive)
                    direction=Vector((0,-drive,1-drive)).normalized()
                    axis=Vector((0,1-drive,drive)).normalized()
                    pole=Vector((sign*.6,.1,-.4))
                elif beat==2:
                    # Bent-elbow arc rather than another straight punch.
                    end=shoulder+Vector((-sign*.20,-.34,.12))
                    target=guard.lerp(end,drive)+Vector((sign*.16*math.sin(math.pi*drive),0,0))
                    pole=Vector((sign,-.1,.05));direction=Vector((-sign*drive,-drive,1-drive)).normalized()
                    axis=Vector((0,0,1))
                else:
                    dip=math.sin(math.pi*min(1,u/.38))*.18 if u<.38 else 0
                    target=guard.lerp(shoulder+Vector((0,-.30,.22)),drive)-Vector((0,0,dip))
                    direction=Vector((0,0,1));pole=Vector((sign*.3,.1,-1))
            self.arm_to(side,target,pole=pole,hand_direction=direction,axis=axis)
