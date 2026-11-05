"""Original ball trajectories: a held object is released, never hand-attached in flight."""
import math
import bpy
from mathutils import Quaternion
from mathutils import Vector
from motions_sports_strength import smooth,keys

class BallSportMotions:
    def setup_header_jump(self):
        self.camera_location=(3.3,-3.5,2);self.camera_target=(0,-.1,1.15);self.camera_scale=2.9
        sand=self.material('Beach sand',(.68,.61,.45),1)
        self.box('Sand court',(0,0,.0075),(5,5,.015),sand)
        self.header_ball=self.sphere('Header football',.11,mat=self.shorts)
        # Calibrate contact against the visible forehead at the jump apex.
        self.header_contact=Vector((0,0,0));self.pose_header_jump(63/143)
        bpy.context.view_layer.update()
        body=self.body.evaluated_get(bpy.context.evaluated_depsgraph_get())
        visible={i for p in body.data.polygons for i in p.vertices}
        points=[body.matrix_world@body.data.vertices[i].co for i in visible]
        top=max(p.z for p in points)
        forehead=min((p for p in points if abs(p.x)<.025 and top-.085<p.z<top-.055),key=lambda p:p.y)
        self.header_contact=forehead+Vector((0,-.95,.31225)).normalized()*.116

    def pose_header_jump(self,t):
        duration=(self.spec['frames']-1)/24;apex=63/143
        half=math.sqrt(2*.35/9.81);takeoff=apex-half/duration;landing=apex+half/duration
        if takeoff<t<landing:
            seconds=(t-takeoff)*duration
            z=self.hip.z-.008+.015+9.81*half*seconds-.5*9.81*seconds*seconds
            pitch=keys([(takeoff,0),(apex-.02,-8),(apex,8),(apex+.02,10),(landing,0)],t)
            self.set_root((0,0,z),pitch=pitch)
            airborne=seconds/(2*half)
            point=15*smooth(airborne/.20)*(1-smooth((airborne-.80)/.20))
            for side,sign in [('L',1),('R',-1)]:self.leg_fk(side,(sign*.08,0,-.9968),(sign*.08,0,-.9968),math.radians(point))
        else:
            d=keys([(0,0),(.24,1),(takeoff,0),(landing,0),(.60,1),(.82,0),(1,0)],t)
            self.set_root((0,.045*d,self.hip.z-.008+.015-.27*d),pitch=8*d);self.plant_feet(.30,step=.015)
        # Countermovement arm swing, with arms apart for balance at contact.
        swing=keys([(0,0),(.24,-.35),(takeoff,.8),(apex,1),(landing,.7),(.82,0),(1,0)],t)
        for side,sign in [('L',1),('R',-1)]:
            shoulder=self.bone_point(f'upperarm01.{side}')
            self.arm_to(side,shoulder+Vector((sign*(.12+.10*swing),-.20-.08*swing,-.32+.36*swing)),pole=(sign,.2,-.5),kind='ball',axis=(0,0,1))
        seconds=(t-apex)*duration
        velocity=Vector((0,3.5,-3)) if seconds<=0 else Vector((0,-4,1.8))
        self.move(self.header_ball,self.header_contact+velocity*seconds+Vector((0,0,-.5*9.81*seconds*seconds)))
    def setup_wall_ball(self):
        self.camera_location=(3.6,1.5,2.2);self.camera_target=(0,-.35,1.55);self.camera_scale=3.8
        self.wall_ball=self.sphere('Wall ball',.16,mat=self.shorts)
        self.box('Wall ball target wall',(0,-1.01,1.65),(1.6,.12,3.3))
        self.cylinder('Wall ball target',.25,.012,(0,-.944,3),axis=(0,1,0),mat=self.shorts)
        self.ball_release=.50;self.ball_duration=(self.spec['frames']-1)/24
        self.ball_impact=.45
        self.ball_vz=(3-1.85+.5*9.81*self.ball_impact**2)/self.ball_impact
        vz=self.ball_vz-9.81*self.ball_impact
        self.ball_return=(vz+math.sqrt(vz*vz+2*9.81*(3-1.85)))/9.81
        self.ball_catch=self.ball_release+(self.ball_impact+self.ball_return)/self.ball_duration

    def pose_wall_ball(self,t):
        release=self.ball_release;catch=self.ball_catch
        # End in the receiving squat so the loop continues directly into the drive.
        d=keys([(0,1),(.10,1),(.41,0),(catch,0),(1,1)],t)
        self.set_root((0,.10*d,self.hip.z-.008-.59*d),pitch=12*d);self.plant_feet(.35,toeout=12)
        shoulder=self.bone_point('upperarm01.L');rack=shoulder+self.root.rotation_quaternion@Vector((0,-.25,.12))
        lift=smooth((t-.40)/.10) if t<release else 1-smooth((t-catch)/.16) if t>catch else 1
        held=rack.lerp(Vector((0,-.25,1.85)),lift)
        if release<t<catch:
            seconds=(t-release)*self.ball_duration
            if seconds<=self.ball_impact:
                center=Vector((0,-.25-1.2*seconds,1.85+self.ball_vz*seconds-.5*9.81*seconds**2))
            else:
                seconds-=self.ball_impact
                center=Vector((0,-.79+.54/self.ball_return*seconds,3+(self.ball_vz-9.81*self.ball_impact)*seconds-.5*9.81*seconds**2))
        else:center=held
        self.move(self.wall_ball,center)
        for side,sign in [('L',1),('R',-1)]:
            target=held+Vector((sign*.14,0,-.07746))
            self.arm_to(side,target,pole=(sign*.7,-.6,-.2),kind='ball',axis=(0,1,0),hand_direction=(0,0,1))
