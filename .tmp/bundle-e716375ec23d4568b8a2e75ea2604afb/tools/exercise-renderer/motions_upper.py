"""Explicit upper-body motions; unfinished variants intentionally fail closed."""
import math
from mathutils import Vector, Quaternion

def depth(t):return .5-.5*math.cos(2*math.pi*t)

class UpperMotions:
    def setup_pushup(self):
        h=self.spec.get('deficit',.12)
        for side,sign in [('L',1),('R',-1)]:self.box(f'Pushup block.{side}',(sign*.30,-.28,h/2),(.23,.30,h),self.shorts)
        self.camera_location=(2.8,0,1.35);self.camera_target=(0,.10,.34);self.camera_scale=2.3

    def pose_pushup(self,t):
        d=depth(t);angle=math.radians(73.2+16.2*d)
        bones=self.rig.data.bones
        self.set_root((0,0,0),pitch=math.degrees(angle))
        for side,sign in [('L',1),('R',-1)]:
            direction=Vector((sign*.03,math.sin(angle),-math.cos(angle))).normalized()
            for part in ['upperleg','lowerleg']:
                for number in ['01','02']:self.pose_axis(f'{part}{number}.{side}',direction)
            desired=Quaternion((1,0,0),math.radians(60))@bones[f'foot.{side}'].matrix_local.to_quaternion()
            self.orient(f'foot.{side}',self.root.rotation_quaternion.inverted()@desired)
        ankle=(self.bone_point('foot.L')+self.bone_point('foot.R'))/2
        self.move(self.root,self.root.location+Vector((0,.82,.2155))-ankle)
        import bpy
        bpy.context.view_layer.update()
        for side,sign in [('L',1),('R',-1)]:
            foot=self.bone_point(f'foot.{side}')
            self.constraint('Foot',side,foot,Vector((foot.x,.82,.2155)),True)
            self.arm_to(side,(sign*.30,-.28,self.spec.get('deficit',.12)+.003),pole=(sign*.5,.8,.1),pronated=True,kind='palm',hand_direction=(0,-1,0))

    def setup_pullover(self):
        bench=self.bench()
        bench.rotation_euler.z=math.pi/2;bench.location=(.40,.43,0)
        self.camera_location=(2.7,-3.2,2.1);self.camera_target=(0,.32,.67);self.camera_scale=2.5

    def pose_pullover(self,t):
        self.set_root((0,-.04,.57),pitch=-90)
        for side,sign in [('L',1),('R',-1)]:
            self.foot(side,(sign*.17,-.55,self.rig.data.bones[f'foot.{side}'].head_local.z),pole=(sign*.1,-1,0))
            a=math.radians(10+75*depth(t));radial=math.sqrt(1-.21**2)
            upper=Vector((-sign*.21,radial*math.sin(a),radial*math.cos(a)))
            lower=Vector((-sign*.21,radial*math.sin(a+math.radians(15)),radial*math.cos(a+math.radians(15))))
            fingers=Vector((-sign*.45,.90,0)).normalized()
            across=-sign*fingers.cross(Vector((0,0,1)))
            self.arm_fk(side,upper,lower,kind='ball',axis=across,hand_direction=fingers)

    def position_pullover_weight(self):
        center=(self.hand_checks['L'][0]+self.hand_checks['R'][0])/2+Vector((0,0,.030-.105))
        self.move(self.weights['L'],center,Vector((1,0,0)).rotation_difference(Vector((0,0,1))))

    def setup_row(self):
        self.camera_location=(3.6,3.2,1.9);self.camera_target=(0,0,.95);self.camera_scale=2.6
        posture=self.spec.get('posture')
        if posture=='chest-supported' and self.load=='machine':
            self.setup_articulated_row();return
        if self.load=='landmine':
            self.setup_landmine_row();return
        if posture=='bench-supported':
            self.row_bench=self.bench()
            self.row_bench.location=(-.14,-.60,0)
            for part in self.row_bench.children:
                if part.name.startswith(('Bench seat','Bench back')):part.location.z-=.0955
                elif part.name.startswith('Bench leg'):
                    part.location.z-=.04775
                    for vertex in part.data.vertices:vertex.co.z*=.3345/.43
            self.camera_location=(3.2,2.7,2.0);self.camera_target=(0,-.05,.80);self.camera_scale=2.4
            return
        if posture not in ['bent','seated'] or self.load=='landmine':
            raise NotImplementedError('Supported/landmine row equipment still needs its individual setup')
        if posture=='seated':
            self.cable_tower((0,-1.05,.70))
            self.box('Row seat',(0,.05,.46),(.38,.55,.08),self.shorts)
            self.box('Row seat base',(0,.05,.23),(.1,.1,.46))
            for x in [-.18,.18]:
                plate=self.box('Row footplate',(x,-.785,.21),(.20,.05,.40))
                plate.rotation_euler.x=math.pi/4
                self.box('Footplate stand',(x,-.645,.045),(.08,.10,.09))
                self.box('Footplate base',(x,-.72,.02),(.25,.35,.04))

    def pose_row(self,t):
        if self.spec.get('posture')=='chest-supported' and self.load=='machine':return self.pose_articulated_row(t)
        if self.load=='landmine':return self.pose_landmine_row(t)
        if self.spec.get('posture')=='bench-supported':
            return self.pose_supported_row(t)
        d=depth(t);seated=self.spec.get('posture')=='seated'
        if seated:
            self.set_root((0,.10,.60))
            for side,sign in [('L',1),('R',-1)]:
                self.foot(side,(sign*.18,-.65,.21),Quaternion((1,0,0),-math.pi/4),pole=(0,-1,1))
        else:
            self.set_root((0,.15,self.hip.z-.09),pitch=60);self.plant_feet(.34)
        shoulder=self.bone_point('upperarm01.L')
        reference=Vector((0,-1,0)) if seated else Vector((0,0,-1))
        center,_=self.hand('L',reference,neutral=1 if seated else 0,pronated=not seated)
        offset=center-self.bone_point('wrist.L')
        reach=sum(self.rig.data.bones[f'{part}{number}.L'].length for part in ['upperarm','lowerarm'] for number in ['01','02'])-.014
        if seated:
            start_y=shoulder.y-math.sqrt(max(.01,reach**2-(.10-offset.x-shoulder.x)**2-(-.08-offset.z)**2))+offset.y
        else:
            start_z=shoulder.z-math.sqrt(max(.01,reach**2-(.29-offset.x-shoulder.x)**2-offset.y**2))+offset.z
        for side,sign in [('L',1),('R',-1)]:
            target=(sign*(.10 if seated else .29),start_y*(1-d)+(shoulder.y-.17)*d if seated else shoulder.y+.22*d,
                    shoulder.z-.08-.08*d if seated else start_z*(1-d)+(shoulder.z-.29)*d)
            direction=(lambda axis:axis) if seated else (lambda axis:Vector((0,axis.y,axis.z)).normalized())
            self.arm_to(side,target,pole=(sign*.25,.85,-.2),neutral=1 if seated else 0,pronated=not seated,hand_direction=direction,initial_hand_direction=reference)
        if self.cable_segments:self.cables([self.hand_checks[s][0] for s in ['L','R']])

    def pose_supported_row(self,t):
        d=depth(t)
        self.set_root((0,.08,.91),pitch=86)
        self.foot('L',(.24,.15,self.rig.data.bones['foot.L'].head_local.z),pole=(0,-1,0))
        self.foot('R',(-.14,.46,.54),Quaternion((1,0,0),math.pi/2),pole=(0,-1,-1),contact=False)
        shoulder=self.bone_point('upperarm01.R')
        self.arm_to('R',(-.14,shoulder.y-.10,.4075),pole=(-.1,.8,-.2),pronated=True,kind='palm',hand_direction=(0,-1,0))
        # The working arm hangs freely and rows toward the hip with a neutral wrist.
        a=math.radians(6+80*d)
        upper=Vector((.06,math.sin(a),-math.cos(a))).normalized()
        lower=Vector((.06,math.sin(a-math.radians(12+65*d)),-math.cos(a-math.radians(12+65*d)))).normalized()
        self.arm_fk('L',upper,lower,neutral=1)

    def setup_landmine_row(self):
        self.landmine_pivot=Vector((0,1.40,.10))
        self.landmine=self.empty('Landmine assembly')
        self.box('Landmine ground base',(0,1.40,.025),(.45,.40,.05))
        self.cylinder('Landmine hinge',.055,.15,self.landmine_pivot,axis=(1,0,0))
        self.line('Landmine shaft',(0,0,0),(0,-2.15,0),.014,parent=self.landmine)
        self.line('Landmine handle bridge',(-.10,-1.80,0),(.10,-1.80,0),.012,parent=self.landmine)
        self.landmine_grips={}
        for side,sign in [('L',1),('R',-1)]:
            self.landmine_grips[side]=self.cylinder(f'Landmine grip.{side}',.013,.18,(sign*.10,-1.80,0),axis=(0,1,0),mat=self.rope_material,parent=self.landmine)
            self.sphere(f'Landmine grip bearing.{side}',.022,(sign*.10,-1.80,0),parent=self.landmine)
        for y in [-1.98,-2.04]:
            self.cylinder('Landmine load plate',.16,.045,(0,y,0),axis=(0,1,0),parent=self.landmine)
        for child in self.landmine.children:self.animated.discard(child)
        self.camera_location=(3.4,2.6,2.0);self.camera_target=(0,.30,.85);self.camera_scale=2.75

    def pose_landmine_row(self,t):
        self.set_root((0,.15,self.hip.z-.09),pitch=60);self.plant_feet(.48)
        angle=math.asin((.32+.34*depth(t))/1.80)
        rotation=Quaternion((1,0,0),-angle)
        self.move(self.landmine,self.landmine_pivot,rotation)
        for side,sign in [('L',1),('R',-1)]:
            target=self.landmine_pivot+rotation@Vector((sign*.10,-1.80,0))
            direction=rotation@Vector((0,0,-1))
            self.arm_to(side,target,pole=(sign*.3,.85,-.2),neutral=1,hand_direction=lambda axis:axis,initial_hand_direction=direction)
            grip_axis=rotation.inverted()@self.hand_checks[side][1]
            self.move(self.landmine_grips[side],(sign*.10,-1.80,0),Vector((0,0,1)).rotation_difference(grip_axis.normalized()))

    def setup_straight_pull(self):
        self.cable_tower((0,-1.15,2.0))
        self.camera_location=(3.5,2.6,2.0);self.camera_target=(0,-.25,1.05);self.camera_scale=2.65

    def pose_straight_pull(self,t):
        self.set_root((0,.05,self.hip.z-.04),pitch=30);self.plant_feet(.34)
        angle=math.radians(110-107*depth(t))
        for side,sign in [('L',1),('R',-1)]:
            upper=(sign*.03,-math.sin(angle),-math.cos(angle))
            lower=(0,-math.sin(angle-math.radians(12)),-math.cos(angle-math.radians(12)))
            self.arm_fk(side,upper,lower,pronated=True)
        self.cables([self.hand_checks[s][0] for s in ['L','R']])

    def setup_chest_supported_seat(self):
        import bpy
        self.set_root((0,.10,.60))
        self.box('Supported machine seat',(0,.10,.46),(.38,.42,.08),self.shorts)
        self.box('Supported seat post',(0,.10,.23),(.09,.09,.46))
        evaluated=self.body.evaluated_get(bpy.context.evaluated_depsgraph_get())
        groups={g.index for g in evaluated.vertex_groups if g.name.startswith(('spine','breast'))}
        chest=[evaluated.matrix_world@vertex.co for vertex in evaluated.data.vertices if sum(g.weight for g in vertex.groups if g.group in groups)>.55]
        front=min(p.y for p in chest if abs(p.x)<.12 and .96<p.z<1.08)
        self.box('Chest support pad',(0,front-.04,1.02),(.27,.08,.26),self.shorts)
        self.box('Chest support post',(0,front-.16,.52),(.075,.075,1.04))
        self.line('Chest pad bracket',(0,front-.16,1.02),(0,front-.08,1.02),.025)
        for x in [-.54,0,.54]:self.box('Supported machine base rail',(x,-.30,.035),(.10,1.20,.07))
        for y in [-.85,.25]:self.box('Supported machine crossbase',(0,y,.035),(1.18,.10,.07))
        self.camera_location=(3.2,2.8,2.0);self.camera_target=(0,-.20,.95);self.camera_scale=2.65

    def supported_machine_posture(self):
        self.set_root((0,.10,.60))
        for side,sign in [('L',1),('R',-1)]:
            self.foot(side,(sign*.18,-.35,self.rig.data.bones[f'foot.{side}'].head_local.z),pole=(0,-1,0))

    def setup_articulated_row(self):
        self.setup_chest_supported_seat()
        self.row_pivots={};self.row_links={};self.row_upper_links={};self.row_plates={};self.weights={}
        for side,sign in [('L',1),('R',-1)]:
            pivot=Vector((sign*.26,-.62,.53));self.row_pivots[side]=pivot
            self.box('Row front upright',(sign*.54,-.62,.30),(.08,.08,.60))
            self.line('Row bearing bracket',(sign*.54,-.62,.53),pivot,.03)
            self.cylinder('Row lower bearing',.05,.08,pivot,axis=(1,0,0))
            self.row_links[side]=self.line(f'Row lower link.{side}',pivot,pivot+Vector((0,0,.65)),.026)
            upper_pivot=pivot+Vector((0,0,.20))
            self.line('Row upper bearing bracket',(sign*.54,-.62,.53),upper_pivot,.025)
            self.cylinder('Row upper bearing',.045,.07,upper_pivot,axis=(1,0,0))
            self.row_upper_links[side]=self.line(f'Row upper link.{side}',upper_pivot,upper_pivot+Vector((0,0,.65)),.018)
            grip=self.empty(f'Row machine grip.{side}');self.weights[side]=grip
            self.cylinder('Row neutral grip',.014,.20,parent=grip,mat=self.rope_material)
            self.cylinder('Row handle upper stem',.012,.20,(.20,0,0),parent=grip)
            self.row_plates[side]=self.empty(f'Row load hub.{side}')
            self.cylinder('Row loading pin',.014,.24,(sign*.08,0,0),parent=self.row_plates[side])
            for x in [sign*.08,sign*.14]:self.cylinder('Row load plate',.15,.045,(x,0,0),parent=self.row_plates[side])

    def pose_articulated_row(self,t):
        self.supported_machine_posture()
        theta=.12+.63*depth(t)
        offset=Vector((0,.65*math.sin(theta),.65*math.cos(theta)))
        for side,sign in [('L',1),('R',-1)]:
            pivot=self.row_pivots[side];center=pivot+offset+Vector((0,0,-.10))
            self.arm_to(side,center,pole=(sign*.3,.85,-.2),axis=(0,0,1),hand_direction=(0,-1,0))
            self.place_line(self.row_links[side],pivot,center+Vector((0,0,.10)))
            self.place_line(self.row_upper_links[side],pivot+Vector((0,0,.20)),center+Vector((0,0,.30)))
            self.move(self.row_plates[side],pivot+offset*.55,Quaternion((1,0,0),-theta))

    def setup_rear_fly(self):
        if self.load=='machine':return self.setup_reverse_deck()
        if self.load!='dumbbells':raise NotImplementedError('Reverse peck-deck levers still need authoring')
        self.camera_location=(3.2,2.8,1.95);self.camera_target=(0,0,.90);self.camera_scale=2.5

    def pose_rear_fly(self,t):
        if self.load=='machine':return self.pose_reverse_deck(t)
        self.set_root((0,.17,self.hip.z-.09),pitch=65);self.plant_feet(.34)
        a=math.radians(8+72*depth(t))
        for side,sign in [('L',1),('R',-1)]:
            self.arm_fk(side,(sign*math.sin(a),.10,-math.cos(a)),(sign*math.sin(a-math.radians(12)),.10,-math.cos(a-math.radians(12))),neutral=1)

    def setup_reverse_deck(self):
        self.setup_chest_supported_seat()
        self.reverse_pivots={};self.reverse_levers={};self.weights={}
        for side,sign in [('L',1),('R',-1)]:
            shoulder=self.bone_point(f'upperarm01.{side}')
            pivot=Vector((shoulder.x,shoulder.y,1.75));self.reverse_pivots[side]=pivot
            self.box('Reverse fly upright',(sign*.60,-.85,.90),(.07,.08,1.80))
            self.box('Reverse fly floor rail',(sign*.60,-.30,.035),(.12,1.20,.07))
            self.line('Reverse cam support',(sign*.60,-.85,1.75),pivot,.03)
            self.cylinder('Reverse fly cam',.08,.045,pivot,axis=(0,0,1))
            self.reverse_levers[side]=self.line(f'Reverse fly lever.{side}',pivot,pivot+Vector((0,-.55,-.6)),.025)
            grip=self.empty(f'Reverse fly grip.{side}');self.weights[side]=grip
            self.cylinder('Reverse fly neutral grip',.014,.20,parent=grip,mat=self.rope_material)
        self.box('Reverse stationary stack',(0,-.95,.29),(.32,.26,.48),self.shorts)
        for x in [-.18,.18]:self.cylinder('Reverse weight guide',.012,1.35,(x,-.95,.85),axis=(0,0,1))
        self.reverse_stack=self.box('Reverse selected stack',(0,-.95,.64),(.32,.26,.16))
        self.reverse_cable=self.line('Reverse stack cable',(0,-.95,.72),(0,-.95,1.75),.006,self.rope_material)
        for pivot in self.reverse_pivots.values():self.line('Reverse cam cable',(0,-.95,1.75),pivot,.006,self.rope_material)

    def pose_reverse_deck(self,t):
        self.supported_machine_posture()
        opening=math.radians(85*depth(t))
        for side,sign in [('L',1),('R',-1)]:
            upper=Vector((sign*math.sin(opening),-math.cos(opening),0))
            lower=Vector((sign*math.sin(opening-math.radians(15)),-math.cos(opening-math.radians(15)),0))
            center,axis=self.arm_fk(side,upper,lower,neutral=1)
            self.place_line(self.reverse_levers[side],self.reverse_pivots[side],center+axis*.10)
        z=.64+.25*depth(t)
        self.move(self.reverse_stack,(0,-.95,z))
        self.place_line(self.reverse_cable,(0,-.95,z+.08),(0,-.95,1.75))

    def setup_face_pull(self):
        self.cable_tower((0,-1.25,1.58))
        self.camera_location=(3.2,2.6,2.0);self.camera_target=(0,-.20,1.05);self.camera_scale=2.6
        for segment in self.cable_segments[3:]:segment.hide_render=True
        self.face_junction=self.sphere('Face pull rope junction',.018,(0,0,0))
        for handle in self.weights.values():self.sphere('Face pull terminal knob',.026,(-.075,0,0),mat=self.rope_material,parent=handle)

    def pose_face_pull(self,t):
        self.set_root();self.plant_feet(.34)
        d=depth(t)
        for side,sign in [('L',1),('R',-1)]:
            self.arm_to(side,(sign*(.11+.27*d),-.64+.48*d,1.44+.11*d),pole=(sign,.60,.35),neutral=1,hand_direction=lambda direction:direction,initial_hand_direction=(0,-1,0))
        hands=[self.hand_checks[s][0] for s in ['L','R']]
        mean=(hands[0]+hands[1])/2
        half=(hands[0]-hands[1]).length/2
        connector=mean+(self.cable_origin-mean).normalized()*math.sqrt(max(.001,.44**2-half**2))
        self.move(self.face_junction,connector)
        self.place_line(self.cable_segments[0],self.cable_origin,connector)
        for segment,hand in zip(self.cable_segments[1:3],hands):self.place_line(segment,connector,hand)

    def setup_shrug(self):
        self.camera_location=(3.2,3.1,1.9);self.camera_target=(0,0,.95);self.camera_scale=2.2

    def pose_shrug(self,t):
        self.set_root();self.plant_feet(.34)
        # Translate each shoulder girdle upward; elbows remain fully extended.
        contraction=.5-.5*math.cos(math.pi*t/.30) if t<.30 else .5+.5*math.cos(math.pi*(t-.70)/.30) if t>.70 else 1
        lift=.045*contraction
        for side in ['L','R']:
            bone=self.rig.pose.bones[f'shoulder01.{side}']
            bone.location=bone.bone.matrix_local.to_quaternion().inverted()@Vector((0,0,lift))
        import bpy
        bpy.context.view_layer.update()
        for side,sign in [('L',1),('R',-1)]:
            direction=(sign*.05,-.18 if self.load=='barbell' else 0,-1)
            self.arm_fk(side,direction,direction,neutral=1 if self.load=='dumbbells' else 0,pronated=self.load=='barbell')

    def setup_vertical_pull(self):
        self.camera_target=(0,0,1.05);self.camera_scale=2.7
        self.camera_location=(3.6,3.8,2.2)
        if self.load=='pullup-bar':
            head_groups={group.index for group in self.body.vertex_groups if group.name in ['head','jaw']}
            face_front=min(vertex.co.y for vertex in self.body.data.vertices if sum(g.weight for g in vertex.groups if g.group in head_groups)>.55)
            self.pullup_body_y=-.105-face_front
            self.cylinder('Fixed pullup bar',.016,1.35,(0,-.13,1.99))
            for x in [-.80,.80]:
                self.box('Pullup upright',(x,0,1.02),(.065,.065,2.04))
                self.line('Pullup top support',(x,0,2.02),(x*.75,-.13,1.99),.025)
        else:
            self.cable_tower((0,.52,2.05))
            self.line('Pulldown overhead boom',(0,.52,2.05),(0,-.22,2.05),.03)
            self.cylinder('Front pulldown pulley',.07,.04,(0,-.22,2.05),axis=(1,0,0))
            self.cable_origin=Vector((0,-.22,2.05))
            self.box('Pulldown seat',(0,0,.46),(.42,.40,.08),self.shorts)
            self.box('Seat support',(0,0,.23),(.09,.1,.46))
            self.cylinder('Thigh restraint',.06,.55,(0,-.23,.63),mat=self.shorts)
            self.box('Thigh restraint support',(0,-.23,.35),(.065,.065,.5))

    def pose_vertical_pull(self,t):
        d=depth(t);pullup=self.load=='pullup-bar'
        neutral=self.spec.get('grip')=='close-neutral'
        pronated=self.spec.get('grip')=='wide-pronated'
        half=.10 if neutral else .19 if self.spec.get('grip')=='supinated' else .34
        grip_y=-.18 if neutral else -.13
        if pullup:
            self.set_root((0,self.pullup_body_y,1))
        else:
            self.set_root((0,0,.60),pitch=-8)
        shoulder=self.bone_point('upperarm01.L')
        center,_=self.hand('L',(0,0,1),neutral=1 if neutral else 0,pronated=pronated)
        offset=center-self.bone_point('wrist.L')
        reach_margin=-.003 if self.spec.get('grip')=='supinated' else .001 if neutral else .008
        reach=sum(self.rig.data.bones[f'{part}{number}.L'].length for part in ['upperarm','lowerarm'] for number in ['01','02'])-reach_margin
        dz=math.sqrt(max(.01,reach**2-(half-offset.x-shoulder.x)**2-(grip_y-offset.y-shoulder.y)**2))
        if pullup:
            base=1.99-offset.z-dz-(shoulder.z-1)
            travel=1.43-base
            self.set_root((0,self.pullup_body_y,base+travel*d))
            for side,sign in [('L',1),('R',-1)]:
                self.foot(side,(sign*.10,self.pullup_body_y+.35,.32+travel*d),Quaternion((1,0,0),math.radians(15)),pole=(0,-.2,-1),contact=False)
            height=1.99
        else:
            for side,sign in [('L',1),('R',-1)]:
                self.foot(side,(sign*.17,-.40,self.rig.data.bones[f'foot.{side}'].head_local.z),pole=(0,-1,0))
            height=(shoulder.z+dz+offset.z)*(1-d)+(shoulder.z+.02)*d
        for side,sign in [('L',1),('R',-1)]:
            hand_direction=(lambda direction: direction) if neutral else (lambda direction: Vector((0,direction.y,direction.z)).normalized())
            self.arm_to(side,(sign*half,grip_y,height),pole=(sign*.8,.20,-.7),
                        neutral=1 if neutral else 0,pronated=pronated,hand_direction=hand_direction)
        if self.cable_segments:self.cables([self.hand_checks[s][0] for s in ['L','R']])

    def setup_dip(self):
        if self.spec.get('highlight')=='triceps':self.camera_location=(3,2.8,2.0)
        for x in [-.29,.29]:
            self.cylinder('Parallel bar',.021,.72,(x,0,1.10),axis=(0,1,0))
            self.box('Parallel support',(x,.20,.55),(.065,.065,1.1))
            self.box('Parallel base',(x,.1,.025),(.16,.90,.05))
        self.camera_target=(0,0,1);self.camera_scale=2.5

    def pose_dip(self,t):
        d=depth(t)
        lean=self.spec.get('lean',0)
        top=1.31+(self.shoulder_z-self.hip.z)*(math.cos(math.radians(30))-math.cos(math.radians(lean)))
        self.set_root((0,.12,top-.16*d),pitch=lean)
        for side,sign in [('L',1),('R',-1)]:
            self.arm_to(side,(sign*.29,0,1.10),pole=(sign*.3,.9,-.4),axis=(0,-1,0),hand_direction=(0,0,-1))
            self.foot(side,(-sign*.035,.50 if side=='L' else .60,.70-.16*d),Quaternion((1,0,0),math.radians(15)),pole=(sign*.2,-.3,-1),contact=False)

    def setup_press(self):
        if self.load=='machine':
            self.setup_machine_press();return
        incline=self.spec.get('incline',0)
        self.press_bench=self.bench(incline)
        self.camera_location=(2.5,-3.3,2.25)
        self.camera_target=(0,.13,.72)
        self.camera_scale=2.5
        if self.spec.get('ankleSupport'):
            self.camera_location=(2.6,2.8,2.3)
            self.camera_target=(0,.05,.65)
            self.cylinder('Decline ankle roller',.065,.52,(0,-.79,.568),mat=self.shorts)
            self.cylinder('Decline heel roller',.065,.52,(0,-.64,.375),mat=self.shorts)
            self.box('Decline foot support',(0,-.75,.27),(.08,.08,.54))

    def bench_posture(self,incline=0):
        # The hip stays above the seat while the back follows the inclined pad.
        # Rest-mesh posterior surface is approximately 10 cm behind its hip joint.
        pitch=incline-90
        self.set_root((0,.04,.60),pitch=pitch)
        if self.spec.get('ankleSupport'):
            for side,sign in [('L',1),('R',-1)]:
                self.foot(side,(sign*.14,-.68,.51),pole=(0,-1,0),contact=False)
        else:
            for side,sign in [('L',1),('R',-1)]:
                rest=self.rig.data.bones[f'foot.{side}'].head_local
                self.foot(side,(sign*.17,-.40,rest.z),pole=(sign*.2,-1,0))

    def pose_press(self,t):
        if self.load=='machine':self.pose_machine_press(t);return
        incline=self.spec.get('incline',0)
        self.bench_posture(incline)
        d=depth(t)
        shoulder=self.bone_point('upperarm01.L')
        half=self.spec.get('gripWidth',.72)/2
        if self.load=='dumbbells':half=.19+.16*d
        # Gravity-vertical press, distinct from a press perpendicular to the pad.
        y=shoulder.y-.04-.12*d
        top=.64
        if self.load=='barbell':
            bones=self.rig.data.bones
            wrist=bones['wrist.L'].head_local
            hand_axis=(bones['finger3-1.L'].head_local-wrist).normalized()
            knuckles=sum((bones[f'finger{digit}-1.L'].head_local for digit in range(2,6)),Vector())/4
            reach=sum(bones[f'{part}{number}.L'].length for part in ['upperarm','lowerarm'] for number in ['01','02'])+(knuckles-wrist).dot(hand_axis)-.025
            top=math.sqrt(max(.01,reach**2-(half-shoulder.x)**2-.02**2))-.005
        z=shoulder.z+top-(top-.23)*d
        if self.load=='barbell':
            chest_local=self.rig.data.bones['breast.L'].tail_local.copy()
            if self.spec.get('gripWidth',.72)<.5:chest_local.z-=.12
            elif incline<0:chest_local.z-=.08
            chest=self.world_point(chest_local)
            y=(shoulder.y-.04)*(1-d)+(chest.y-.005)*d
            z=(shoulder.z+top)*(1-d)+(chest.z+.025)*d
        for side,sign in [('L',1),('R',-1)]:
            pole=(sign*.10,-.8,-1) if self.spec.get('gripWidth',.72)<.5 else (sign*.65,-.10,-1)
            self.arm_to(side,(sign*half,y,z),pole=pole,pronated=True)

    def setup_machine_press(self):
        self.bench(80)
        self.box('Seat longitudinal frame',(0,.225,.34),(.08,.75,.09))
        self.line('Seat back brace',(0,.55,.43),(0,.211,1.142),.025)
        self.camera_location=(2.7,-4,2.0);self.camera_target=(0,0,.90);self.camera_scale=2.5
        self.press_pivots={};self.press_levers={};self.press_upper_levers={};self.press_plates={};self.press_pins={};self.press_axes={}
        self.weights={}
        for side,sign in [('L',1),('R',-1)]:
            pivot=Vector((sign*.39,.06,1.55));self.press_pivots[side]=pivot
            axis=Vector((sign*.989,-.15,0)).normalized();self.press_axes[side]=axis
            self.box('Press machine upright',(sign*.52,.30,.90),(.07,.09,1.80))
            self.box('Press machine base',(sign*.52,0,.035),(.12,1.0,.07))
            self.line('Pivot support',(sign*.52,.30,1.55),pivot,.035)
            self.cylinder('Lever bearing',.06,.08,pivot,axis=axis)
            self.press_levers[side]=self.line(f'Press lever.{side}',pivot,pivot+Vector((0,0,-.65)),.026)
            upper_pivot=pivot+Vector((0,0,.20))
            self.line('Upper pivot support',(sign*.52,.30,1.75),upper_pivot,.025)
            self.cylinder('Upper lever bearing',.045,.06,upper_pivot,axis=axis)
            self.press_upper_levers[side]=self.line(f'Press upper link.{side}',upper_pivot,upper_pivot+Vector((0,0,-.65)),.016)
            handle=self.empty(f'Machine grip.{side}');self.weights[side]=handle
            self.cylinder('Machine rubber grip',.014,.18,parent=handle,mat=self.rope_material)
            self.press_plates[side]=self.cylinder(f'Machine load plate.{side}',.16,.045,pivot,axis=axis)
            self.press_pins[side]=self.line(f'Plate loading pin.{side}',pivot,pivot+Vector((sign*.2,0,0)),.015)

    def pose_machine_press(self,t):
        self.bench_posture(80)
        angle=.91-.71*depth(t)
        for side,sign in [('L',1),('R',-1)]:
            pivot=self.press_pivots[side]
            horizontal=Vector((-sign*.15,-.989,0)).normalized()
            target=pivot+horizontal*(.65*math.sin(angle))+Vector((0,0,.10-.65*math.cos(angle)))
            self.arm_to(side,target,pole=(sign*.5,.1,-.8),axis=(0,0,1),hand_direction=(0,-1,0))
            end=target-Vector((0,0,.10))
            self.place_line(self.press_levers[side],pivot,end)
            self.place_line(self.press_upper_levers[side],pivot+Vector((0,0,.20)),end+Vector((0,0,.20)))
            attachment=pivot+(end-pivot)*.35
            plate=attachment+self.press_axes[side]*.20
            self.move(self.press_plates[side],plate)
            self.place_line(self.press_pins[side],attachment,plate)

    def setup_raise(self):
        if self.spec.get('posture')=='incline-supported':return self.setup_side_lying_raise()
        if self.load=='single-cable':return self.setup_cable_lateral_raise()
        if self.load=='cable-rope':return self.setup_rope_front_raise()
        if self.load!='dumbbells' or self.spec.get('posture')=='incline-supported':
            raise NotImplementedError('Cable and supported raise variants require individual equipment and paths')
        self.camera_location=(3.2,-3.0,1.95);self.camera_target=(0,-.10,.95);self.camera_scale=2.45

    def pose_raise(self,t):
        if self.spec.get('posture')=='incline-supported':return self.pose_side_lying_raise(t)
        if self.load=='single-cable':return self.pose_cable_lateral_raise(t)
        if self.load=='cable-rope':return self.pose_rope_front_raise(t)
        lateral=self.spec.get('plane')=='lateral'
        if lateral:self.set_root((0,0,self.hip.z-.025),pitch=7)
        else:self.set_root()
        self.plant_feet(.34)
        for side,sign in [('L',1),('R',-1)]:
            active=self.load!='single-cable' or side==self.spec.get('side','L')
            phase=t if not self.spec.get('alternating') else (t*2+(0 if side=='L' else 1))%2
            amount=depth(phase) if not self.spec.get('alternating') else (depth(phase) if phase<=1 else 0)
            angle=math.radians((12+78*amount) if lateral else (5+95*amount)) if active else math.radians(5)
            if lateral:
                upper=Vector((sign*math.cos(math.pi/6)*math.sin(angle),-.5*math.sin(angle),-math.cos(angle))).normalized()
                forward=Vector((0,-1,0));forward=(forward-upper*forward.dot(upper)).normalized()
                lower=upper*math.cos(math.radians(12))+forward*math.sin(math.radians(12))
            else:
                upper=Vector((sign*.04,-math.sin(angle),-math.cos(angle))).normalized()
                lower=Vector((sign*.04,-math.sin(angle+math.radians(12)),-math.cos(angle+math.radians(12)))).normalized()
            self.arm_fk(side,upper,lower,neutral=1+amount if lateral else 1)
        if self.cable_segments:self.cables([self.hand_checks[s][0] for s in self.weights])

    def setup_side_lying_raise(self):
        if self.load!='single-dumbbell' or self.spec.get('side')!='R':raise NotImplementedError('Supported raise requires its right-hand single dumbbell profile')
        bench=self.bench(30)
        back=next(obj for obj in bench.children if obj.name.startswith('Bench back'))
        back.location.y-=.036;back.location.z+=.0624
        self.line('Side raise back brace',(0,.55,.42),(0,.38,.70),.03)
        pad=self.box('Side raise hip cushion',(0,.164,.493),(.34,.30,.08),self.shorts);pad.rotation_euler.x=math.radians(30)
        self.camera_location=(3.2,-3.0,1.9);self.camera_target=(0,.05,.93);self.camera_scale=2.5

    def pose_side_lying_raise(self,t):
        self.set_root((0,.05,.772),yaw=90,roll=60)
        rotation=self.root.rotation_quaternion
        self.foot('L',(0,-.40,.08),rotation,pole=(1,-.2,0),contact=False)
        self.foot('R',(0,-.40,.23),rotation,pole=(1,-.2,0),contact=False)
        body=Vector((0,math.cos(math.radians(30)),math.sin(math.radians(30))))
        outward=Vector((0,-math.sin(math.radians(30)),math.cos(math.radians(30))))
        angle=math.radians(12+78*depth(t));upper=-body*math.cos(angle)+outward*math.sin(angle)
        lower=upper*math.cos(math.radians(10))+Vector((1,0,0))*math.sin(math.radians(10))
        self.arm_fk('R',upper,lower,axis=(1,0,0),hand_direction=upper)
        self.arm_to('L',(.14,.35,1.00),pole=(1,0,-1),kind='palm',axis=-outward,hand_direction=body)

    def setup_cable_lateral_raise(self):
        self.cable_tower((-.55,.05,.13))
        import bpy
        bpy.data.objects['Pulley'].hide_render=True
        self.cable_origin=Vector((-.36,-.26,.13))
        self.cylinder('Raise external pulley',.055,.035,self.cable_origin,axis=(0,1,0))
        self.line('Raise pulley bracket',(-.55,-.09,.13),self.cable_origin,.018)
        self.camera_location=(3.1,-3.2,2.0);self.camera_target=(-.05,0,1.0);self.camera_scale=2.55
        self.cylinder('Raise support grip',.015,.45,(-.55,-.08,1.25),axis=(0,0,1))
        for z in [1.05,1.45]:self.line('Raise support bracket',(-.55,.05,z),(-.55,-.08,z),.014)
        self.raise_d_lines=[self.line(f'Raise D handle.{n}',(0,0,0),(0,0,.1),.011) for n in [0,1]]
        self.raise_eye=self.sphere('Raise handle eye',.014,(0,0,0))
        for segment in self.cable_segments[1:]:segment.hide_render=True

    def pose_cable_lateral_raise(self,t):
        d=depth(t)
        self.set_root((0,0,self.hip.z-.025),roll=8);self.plant_feet(.30)
        self.arm_to('R',(-.55,-.08,1.25),pole=(-.6,-.3,-.4),axis=(0,0,1),hand_direction=(-1,0,0))
        angle=math.radians(-25+115*d)
        upper=Vector((math.sin(angle),-.18,-math.cos(angle))).normalized()
        forward=Vector((0,-1,0));forward=(forward-upper*forward.dot(upper)).normalized()
        lower=upper*math.cos(math.radians(12))+forward*math.sin(math.radians(12))
        center,axis=self.arm_fk('L',upper,lower,neutral=1+d)
        toward=self.cable_origin-center;toward=(toward-axis*toward.dot(axis)).normalized()
        eye=center+toward*.11
        for n,offset in enumerate([-.055,.055]):self.place_line(self.raise_d_lines[n],center+axis*offset,eye)
        self.move(self.raise_eye,eye)
        self.place_line(self.cable_segments[0],self.cable_origin,eye)

    def setup_rope_front_raise(self):
        self.cable_tower((0,.45,.12))
        import bpy
        bpy.data.objects['Pulley'].hide_render=True
        self.cable_origin=Vector((0,.24,.12))
        self.cylinder('Front raise external pulley',.055,.035,self.cable_origin,axis=(1,0,0))
        self.line('Front raise pulley bracket',(0,.31,.12),self.cable_origin,.018)
        self.camera_location=(3.2,-3.0,1.95);self.camera_target=(0,0,1.0);self.camera_scale=2.55
        for segment in self.cable_segments[3:]:segment.hide_render=True
        self.front_raise_junction=self.sphere('Front raise rope junction',.018,(0,0,0))
        for handle in self.weights.values():self.sphere('Front raise terminal knob',.026,(-.075,0,0),mat=self.rope_material,parent=handle)

    def pose_rope_front_raise(self,t):
        self.set_root();self.plant_feet(.42)
        a=math.radians(5+90*depth(t))
        for side,sign in [('L',1),('R',-1)]:
            upper=Vector((-sign*.08,-math.sin(a),-math.cos(a))).normalized()
            lower=Vector((-sign*.08,-math.sin(a+math.radians(12)),-math.cos(a+math.radians(12)))).normalized()
            self.arm_fk(side,upper,lower,neutral=1)
        hands=[self.hand_checks[s][0] for s in ['L','R']];mean=(hands[0]+hands[1])/2
        half=(hands[0]-hands[1]).length/2
        eye=mean+(self.cable_origin-mean).normalized()*math.sqrt(max(.001,.38**2-half**2))
        self.move(self.front_raise_junction,eye)
        self.place_line(self.cable_segments[0],self.cable_origin,eye)
        for segment,hand in zip(self.cable_segments[1:3],hands):self.place_line(segment,eye,hand)

    def setup_fly(self):
        if self.load=='cables':self.setup_cable_fly();return
        if self.load=='machine':self.setup_pec_deck();return
        if self.load!='dumbbells':raise NotImplementedError('Cable and peck-deck fly equipment not authored')
        self.bench(self.spec.get('incline',0))
        self.camera_location=(2.5,-3.3,2.25);self.camera_target=(0,.13,.75);self.camera_scale=2.6

    def pose_fly(self,t):
        if self.load=='cables':self.pose_cable_fly(t);return
        if self.load=='machine':self.pose_pec_deck(t);return
        self.bench_posture(self.spec.get('incline',0))
        opening=math.radians(85*depth(t))
        # Fixed 15-degree elbow bend; the shoulder supplies the arc.
        for side,sign in [('L',1),('R',-1)]:
            upper=Vector((sign*math.sin(opening),-.06,math.cos(opening)))
            lower=Vector((sign*math.sin(opening-math.radians(15)),-.06,math.cos(opening-math.radians(15))))
            self.arm_fk(side,upper,lower,neutral=1)

    def setup_pec_deck(self):
        self.bench(85);self.bench_posture(85)
        self.box('Seat longitudinal frame',(0,.225,.34),(.08,.75,.09))
        self.line('Seat back brace',(0,.55,.43),(0,.151,1.154),.025)
        self.camera_location=(2.7,-4,2.1);self.camera_target=(0,0,.90);self.camera_scale=2.6
        self.pec_pivots={};self.pec_levers={};self.weights={}
        for side,sign in [('L',1),('R',-1)]:
            shoulder=self.bone_point(f'upperarm01.{side}')
            pivot=Vector((shoulder.x,shoulder.y,1.75));self.pec_pivots[side]=pivot
            self.box('Fly machine upright',(sign*.60,.50,.90),(.07,.08,1.80))
            self.box('Fly machine base',(sign*.60,.20,.035),(.12,1.1,.07))
            self.line('Fly pivot support',(sign*.60,.50,1.75),pivot,.03)
            self.cylinder('Fly cam',.08,.045,pivot,axis=(0,0,1))
            self.pec_levers[side]=self.line(f'Pec lever.{side}',pivot,pivot+Vector((sign*.5,0,-.6)),.025)
            grip=self.empty(f'Pec grip.{side}');self.weights[side]=grip
            self.cylinder('Pec neutral grip',.014,.20,parent=grip,mat=self.rope_material)
        self.box('Fly stationary stack',(0,.68,.29),(.32,.26,.48),self.shorts)
        for x in [-.18,.18]:self.cylinder('Fly weight guide',.012,1.35,(x,.68,.85),axis=(0,0,1))
        self.pec_stack=self.box('Fly selected stack',(0,.68,.64),(.32,.26,.16))
        self.pec_stack_cable=self.line('Fly stack cable',(0,.68,.72),(0,.68,1.75),.006,self.rope_material)
        for pivot in self.pec_pivots.values():self.line('Fly cam cable',(0,.68,1.75),pivot,.006,self.rope_material)

    def pose_pec_deck(self,t):
        self.bench_posture(85)
        d=depth((t-.1)/.8) if .1<t<.9 else 0
        opening=math.radians(85*d)
        for side,sign in [('L',1),('R',-1)]:
            upper=Vector((sign*math.sin(opening),-math.cos(opening),0))
            lower_angle=opening-math.radians(15)
            lower=Vector((sign*math.sin(lower_angle),-math.cos(lower_angle),0))
            center,axis=self.arm_fk(side,upper,lower,neutral=1)
            self.place_line(self.pec_levers[side],self.pec_pivots[side],center+axis*.10)
        z=.64+.25*(1-d)
        self.move(self.pec_stack,(0,.68,z))
        self.place_line(self.pec_stack_cable,(0,.68,z+.08),(0,.68,1.75))

    def setup_cable_fly(self):
        self.fly_origins={};self.fly_cable_lines={};self.fly_handle_sides={};self.fly_stacks={};self.fly_rest_lengths={}
        height={'middle':1.38,'high':2.0,'low':.15}[self.spec['cableHeight']]
        self.camera_location=(2.7,-5,2.3);self.camera_target=(0,0,1.02);self.camera_scale=2.8
        self.weights={}
        for side,sign in [('L',1),('R',-1)]:
            x=sign*1.05;origin=Vector((x,.22,height));self.fly_origins[side]=origin
            self.box('Cable upright',(x,.38,1.05),(.08,.10,2.1))
            self.box('Cable base',(x,.35,.025),(.42,.55,.05))
            self.box('Stationary weight stack',(x,.38,.28),(.26,.24,.45),self.shorts)
            for offset in [-.14,.14]:self.cylinder('Weight guide',.012,1.5,(x+offset,.38,.83),axis=(0,0,1))
            self.fly_stacks[side]=self.box(f'Selected stack.{side}',(x,.38,.61),(.26,.24,.15))
            self.cylinder('Adjustable pulley',.065,.04,origin,axis=(1,0,0))
            self.line('Pulley bracket',(x,.38,height),origin,.023)
            grip=self.empty(f'Fly grip.{side}');self.weights[side]=grip
            self.cylinder('Cable handle grip',.012,.14,parent=grip,mat=self.rope_material)
            self.fly_cable_lines[side]=self.line(f'Fly cable.{side}',origin,origin+Vector((0,-.01,0)),.006,self.rope_material)
            self.fly_handle_sides[side]=[self.line(f'D handle.{side}.{index}',origin,origin+Vector((0,-.01,0)),.009) for index in [0,1]]
        # Establish the actual cable length in the open pose before keyframing.
        self.pose_cable_fly(.5)

    def pose_cable_fly(self,t):
        level=self.spec['cableHeight']
        d=depth((t-.1)/.8) if level=='high' and .1<t<.9 else 0 if level=='high' else depth(t)
        opening=math.radians(85*d)
        vertical={'middle':0,'high':-.835,'low':.40}[level]
        forward=Vector((0,-math.sqrt(1-vertical**2),vertical))
        self.set_root((0,0,self.hip.z-.04),pitch=10)
        for side,sign in [('L',1),('R',-1)]:
            self.foot(side,(sign*.16,-.17 if side=='L' else .17,self.rig.data.bones[f'foot.{side}'].head_local.z),pole=(sign*.1,-1,0))
            upper=Vector((sign*math.sin(opening),0,0))+forward*math.cos(opening)
            lower_angle=opening-math.radians(15)
            lower=Vector((sign*math.sin(lower_angle),0,0))+forward*math.cos(lower_angle)
            if level=='low':
                start=Vector((sign*.30,-.12,-.946)).normalized()
                upper=(start*d+forward*(1-d)).normalized()
                inward=Vector((-sign,0,0))
                lower=Quaternion(upper.cross(inward).normalized(),math.radians(15))@upper
            center,axis=self.arm_fk(side,upper,lower,neutral=0 if self.spec.get('supinated') else 1)
            toward=self.fly_origins[side]-center
            toward-=axis*toward.dot(axis)
            hook=center+toward.normalized()*.11
            for index,offset in enumerate([-.07,.07]):self.place_line(self.fly_handle_sides[side][index],center+axis*offset,hook)
            self.place_line(self.fly_cable_lines[side],self.fly_origins[side],hook)
            length=(self.fly_origins[side]-hook).length
            if side not in self.fly_rest_lengths:self.fly_rest_lengths[side]=length
            lift=max(0,min(.65,(length-self.fly_rest_lengths[side])/2))
            self.move(self.fly_stacks[side],(self.fly_origins[side].x,.38,.61+lift))

    def setup_overhead_press(self):
        if self.load=='barbell' and self.spec.get('posture')=='standing':
            self.camera_location=(3.4,-2.7,2.0);self.camera_target=(0,0,1.05);self.camera_scale=2.6
            import bpy
            body=self.body.evaluated_get(bpy.context.evaluated_depsgraph_get())
            groups={g.index for g in body.vertex_groups if g.name in ['head','jaw']}
            self.military_head_top=max((body.matrix_world@v.co).z for v in body.data.vertices if sum(g.weight for g in v.groups if g.group in groups)>.55)
            return
        if self.load=='machine':return self.setup_shoulder_machine()
        if self.load!='dumbbells' or self.spec.get('posture')!='seated':
            raise NotImplementedError('Other overhead press variants require their own authored path and equipment')
        self.bench(80)
        self.camera_location=(2.7,-3.5,2.0);self.camera_target=(0,0,.95);self.camera_scale=2.25

    def pose_overhead_press(self,t):
        if self.load=='barbell':return self.pose_military_press(t)
        if self.load=='machine':return self.pose_shoulder_machine(t)
        self.bench_posture(80)
        d=depth(t)
        shoulder=self.bone_point('upperarm01.L')
        center,_=self.hand('L',(0,0,1),pronated=True)
        offset=center-self.bone_point('wrist.L')
        reach=sum(self.rig.data.bones[f'{part}{number}.L'].length for part in ['upperarm','lowerarm'] for number in ['01','02'])-.008
        grip_y=shoulder.y-.10
        top=shoulder.z+math.sqrt(reach**2-(.19-offset.x-shoulder.x)**2-(grip_y-offset.y-shoulder.y)**2)+offset.z
        for side,sign in [('L',1),('R',-1)]:
            if self.spec.get('arnold'):
                q=max(0,min(1,(d-.20)/.80));turn=1-q*q*(3-2*q)
                half=.19-.04*d+.20*math.sin(math.pi*d)
                target=(sign*half,grip_y-.20*d,top*(1-d)+(shoulder.z+.18)*d)
                self.arm_to(side,target,pole=(sign*(.8-.6*d),-.3-.7*d,-.6+.3*d),neutral=2*turn,hand_direction=lambda direction:direction,initial_hand_direction=(0,0,1))
            else:
                self.arm_to(side,(sign*(.19+.21*d),grip_y,top*(1-d)+(shoulder.z+.25)*d),pole=(sign*.8,-.3,-.6),pronated=True,hand_direction=(0,0,1))

    def pose_military_press(self,t):
        self.set_root();self.plant_feet(.34)
        shoulder=self.bone_point('upperarm01.L')
        center,_=self.hand('L',(0,0,1),pronated=True)
        offset=center-self.bone_point('wrist.L')
        reach=sum(self.rig.data.bones[f'{part}{number}.L'].length for part in ['upperarm','lowerarm'] for number in ['01','02'])-.004
        top=shoulder.z+math.sqrt(reach**2-(.275-offset.x-shoulder.x)**2-(-offset.y-shoulder.y)**2)+offset.z
        d=depth(t)
        z=top*(1-d)+(shoulder.z+.07)*d
        def eased(value):
            value=max(0,min(1,value));return value*value*(3-2*value)
        clearance_height=self.military_head_top+.03
        y=-.21+.21*eased((z-clearance_height)/max(.04,top-clearance_height-.015))
        wrist_angle=math.radians(40*d)
        for side,sign in [('L',1),('R',-1)]:
            self.arm_to(side,(sign*.275,y,z),pole=(sign*.4,-.8,-1.2),pronated=True,hand_direction=(0,math.sin(wrist_angle),math.cos(wrist_angle)))

    def setup_shoulder_machine(self):
        self.bench(80);self.shoulder_pivots={};self.shoulder_links={};self.shoulder_upper_links={};self.shoulder_couplers={};self.shoulder_stems={};self.shoulder_plates={};self.weights={}
        self.camera_location=(2.7,-3.5,2.1);self.camera_target=(0,.25,1.0);self.camera_scale=2.65
        for side,sign in [('L',1),('R',-1)]:
            pivot=Vector((sign*.43,.65,1.60));self.shoulder_pivots[side]=pivot
            self.box('Shoulder machine upright',(sign*.65,.65,.90),(.08,.08,1.80))
            self.box('Shoulder machine floor rail',(sign*.65,.50,.035),(.12,1.40,.07))
            self.line('Shoulder lower pivot bracket',(sign*.65,.65,1.60),pivot,.03)
            self.line('Shoulder upper pivot bracket',(sign*.65,.65,1.80),pivot+Vector((0,0,.20)),.03)
            for z in [1.60,1.80]:self.cylinder('Shoulder lever bearing',.05,.08,(sign*.43,.65,z),axis=(math.sqrt(1-.30**2),0,sign*.30))
            self.shoulder_links[side]=self.line(f'Shoulder lower link.{side}',pivot,pivot+Vector((0,-.65,0)),.026)
            self.shoulder_upper_links[side]=self.line(f'Shoulder upper link.{side}',pivot+Vector((0,0,.20)),pivot+Vector((0,-.65,.20)),.018)
            self.shoulder_couplers[side]=self.line(f'Shoulder handle coupler.{side}',pivot,pivot+Vector((0,0,.20)),.018)
            self.shoulder_stems[side]=self.line(f'Shoulder grip stem.{side}',pivot,pivot+Vector((-sign*.11,0,0)),.012)
            grip=self.empty(f'Shoulder machine grip.{side}');self.weights[side]=grip
            self.cylinder('Shoulder rubber grip',.014,.18,parent=grip,mat=self.rope_material)
            hub=self.empty(f'Shoulder load hub.{side}');self.shoulder_plates[side]=hub
            self.cylinder('Shoulder load pin',.014,.25,(sign*.10,0,0),parent=hub)
            for x in [sign*.13,sign*.19]:self.cylinder('Shoulder load plate',.15,.045,(x,0,0),parent=hub)
        self.box('Shoulder rear crossbase',(0,1.1,.035),(1.40,.12,.07))

    def pose_shoulder_machine(self,t):
        self.bench_posture(80)
        angle=.12-.59*depth(t)
        for side,sign in [('L',1),('R',-1)]:
            offset=Vector((-sign*.30*math.sin(angle),-math.cos(angle),math.sqrt(1-.30**2)*math.sin(angle)))*.65
            pivot=self.shoulder_pivots[side];end=pivot+offset;grip=end+Vector((-sign*.11,0,0))
            self.arm_to(side,grip,pole=(sign*.8,-.3,-.6),pronated=True,hand_direction=(0,0,1))
            self.place_line(self.shoulder_links[side],pivot,end)
            self.place_line(self.shoulder_upper_links[side],pivot+Vector((0,0,.20)),end+Vector((0,0,.20)))
            self.place_line(self.shoulder_couplers[side],end,end+Vector((0,0,.20)))
            self.place_line(self.shoulder_stems[side],end,grip)
            self.move(self.shoulder_plates[side],pivot+offset*.35)

    def setup_upright_row(self):pass

    def pose_upright_row(self,t):
        self.set_root();self.plant_feet(.32)
        d=depth(t)
        for side,sign in [('L',1),('R',-1)]:
            self.arm_to(side,(sign*.21,-.22,.80+.34*d),pole=(sign,.05,.3),axis=(-sign,.575,0),hand_direction=(0,0,-1))

    def setup_curl(self):
        posture=self.spec.get('posture','standing')
        if posture=='incline':self.bench(45)
        elif posture=='preacher':
            self.box('Preacher seat',(0,.10,.46),(.36,.35,.08),self.shorts)
            self.box('Preacher seat leg',(0,.10,.23),(.09,.09,.46))
            pad=self.box('Preacher arm pad',(0,-.109,.816),(.66,.36,.06),self.shorts);pad.rotation_euler.x=math.radians(45)
            self.box('Preacher pad upright',(0,-.08,.43),(.08,.08,.86))
            self.box('Preacher base',(0,-.05,.03),(.70,.75,.06))
        elif posture=='spider':
            pad=self.box('Spider chest pad',(0,-.307,.781),(.32,.50,.07),self.shorts);pad.rotation_euler.x=math.radians(-45)
            for y,z in [(-.43,.85),(.02,.40)]:
                self.box('Spider bench leg',(0,y,z/2),(.08,.09,z))
                self.box('Spider bench foot',(0,y,.03),(.60,.12,.06))
            self.line('Spider underpad rail',(0,-.43,.85),(0,-.14,.56),.025)
            self.line('Spider rear brace',(0,.02,.40),(0,-.14,.56),.025)
        elif posture=='concentration':
            self.box('Concentration seat',(0,.08,.43),(.55,.36,.08),self.shorts)
            for x in [-.20,.20]:self.box('Concentration bench leg',(x,.08,.20),(.06,.10,.40))
        elif posture!='standing':raise NotImplementedError(f'Curl support/posture not authored: {posture}')
        if self.load=='cable-rope':
            self.cable_tower((0,-.78,.14));self.external_pulley((0,-.56,.14),(0,-.64,.14));self.setup_fixed_rope()
        self.camera_location=(3,-3,1.9);self.camera_target=(0,-.1,.85);self.camera_scale=2.35

    def setup_fixed_rope(self):
        for segment in self.cable_segments[3:]:segment.hide_render=True
        self.fixed_rope_junction=self.sphere('Fixed rope junction',.018,(0,0,0))
        for handle in self.weights.values():self.sphere('Rope terminal knob',.026,(-.075,0,0),mat=self.rope_material,parent=handle)

    def external_pulley(self,origin,mount):
        import bpy
        bpy.data.objects['Pulley'].hide_render=True;self.cable_origin=Vector(origin)
        self.cylinder('External cable pulley',.055,.035,origin,axis=(1,0,0))
        self.line('External pulley bracket',mount,origin,.018)

    def pose_fixed_rope(self,length=.38):
        hands=[self.hand_checks[s][0] for s in ['L','R']];mean=(hands[0]+hands[1])/2;half=(hands[0]-hands[1]).length/2
        eye=mean+(self.cable_origin-mean).normalized()*math.sqrt(max(.001,length**2-half**2))
        self.move(self.fixed_rope_junction,eye);self.place_line(self.cable_segments[0],self.cable_origin,eye)
        for segment,hand in zip(self.cable_segments[1:3],hands):self.place_line(segment,eye,hand)

    def pose_curl(self,t):
        posture=self.spec.get('posture','standing');d=depth(t);base=0
        if posture=='incline':self.bench_posture(45)
        elif posture=='preacher':
            self.set_root((0,.04,.60));self.plant_feet(.40,y=-.33);base=45
        elif posture=='spider':
            self.set_root((0,0,.80),pitch=45);self.plant_feet(.40,y=.45)
        elif posture=='concentration':
            self.set_root((0,0,.56),pitch=55)
            for side,sign in [('L',1),('R',-1)]:
                self.foot(side,(sign*.34,-.48,self.rig.data.bones[f'foot.{side}'].head_local.z),pole=(sign*.55,-1,0))
            base=-12
        else:
            self.set_root();self.plant_feet(.30)
            if self.load=='cable-rope':base=12
        angle=math.radians(base+12+(100 if posture=='concentration' else 112)*d)
        for side,sign in [('L',1),('R',-1)]:
            if self.load=='single-dumbbell' and side!=self.spec.get('side','L'):
                knee=self.bone_point('lowerleg01.R')
                self.arm_to(side,knee+Vector((0,-.02,.08)),pole=(-1,-.1,-1),kind='palm',hand_direction=(0,-1,0),pronated=True);continue
            fore=(0,-math.sin(angle),-math.cos(angle))
            axis=None
            if self.load=='ez-bar':axis=(sign,-.575*math.cos(angle),.575*math.sin(angle))
            upper=(sign*.025,-math.sin(math.radians(base)),-math.cos(math.radians(base)))
            self.arm_fk(side,upper,fore,neutral=1 if self.spec.get('grip')=='neutral' else 0,axis=axis)
        if self.load=='cable-rope':self.pose_fixed_rope()

    def setup_triceps(self):
        posture=self.spec.get('posture')
        if posture=='pushdown':return self.setup_pushdown()
        if posture=='overhead':
            self.bench(80);self.camera_location=(3,-3,2.1);self.camera_target=(0,.15,1.05);self.camera_scale=2.5;return
        if posture=='overhead-cable':
            self.cable_tower((0,.95,.70));self.external_pulley((0,.73,.70),(0,.81,.70));self.setup_fixed_rope()
            self.camera_location=(3,-3,2);self.camera_target=(0,.2,1.1);self.camera_scale=2.9;return
        if posture=='kickback':
            self.cable_tower((.40,-.85,.75))
            self.external_pulley((.40,-.63,.75),(.40,-.71,.75))
            for segment in self.cable_segments[1:]:segment.hide_render=True
            self.weights['L'].children[0].hide_render=True
            self.sphere('Kickback cable stop',.026,(0,0,0),mat=self.rope_material,parent=self.weights['L'])
            self.camera_location=(3,2.8,1.9);self.camera_target=(0,-.10,.9);self.camera_scale=2.65;return
        if posture=='lying' and self.load=='dumbbells':
            self.bench();self.camera_location=(2.6,2.5,2.0);self.camera_target=(0,.25,.80);self.camera_scale=2.4
            return
        if posture=='lying':
            self.bench();self.camera_location=(2.6,2.5,2.0)
            self.camera_target=(0,.15,.75);self.camera_scale=2.5
        elif posture=='pushdown':self.cable_tower((0,-.65,1.95))
        elif posture=='overhead-cable':self.cable_tower((0,.75,.25))
        elif posture=='kickback':self.cable_tower((-.55,-.75,.16))
        elif posture=='overhead':pass
        else:raise NotImplementedError(f'Unknown triceps posture: {posture}')

    def pose_triceps(self,t):
        posture=self.spec['posture'];d=depth(t)
        if posture=='pushdown':return self.pose_pushdown(t)
        if posture=='lying' and self.load=='ez-bar':
            self.bench_posture(0);a=math.radians(12);theta=a+math.radians(5+95*d)
            for side,sign in [('L',1),('R',-1)]:
                self.arm_fk(side,(0,math.sin(a),math.cos(a)),(0,math.sin(theta),math.cos(theta)),axis=(-sign,.575*math.cos(theta),-.575*math.sin(theta)))
            return
        if posture=='overhead':
            self.bench_posture(80);a=math.radians(5);theta=a+math.radians(5+100*d)
            upper=Vector((.32,math.sin(a),math.cos(a))).normalized();perp=Vector((0,math.cos(a),-math.sin(a)))
            flex=math.radians(5+100*d)
            self.arm_fk('L',upper,upper*math.cos(flex)+perp*math.sin(flex),neutral=1)
            elbow=self.bone_point('lowerarm01.L')
            self.arm_to('R',elbow+Vector((-.045,-.045,-.08)),pole=(-1,-.4,.1),kind='palm',hand_direction=(1,0,.3))
            return
        if posture=='overhead-cable':
            self.set_root(pitch=15);self.plant_feet(.38,y=-.10)
            base=math.radians(25);theta=base-math.radians(8+100*d)
            for side,sign in [('L',1),('R',-1)]:
                self.arm_fk(side,(sign*.04,-math.sin(base),math.cos(base)),(0,-math.sin(theta),math.cos(theta)),neutral=1)
            self.pose_fixed_rope(.42);return
        if posture=='kickback':
            self.set_root((0,.14,self.hip.z-.045),pitch=65);self.plant_feet(.36)
            d=1 if .4<=t<=.6 else .5-.5*math.cos(math.pi*(t/.4 if t<.4 else (1-t)/.4))
            a=math.radians(65);flex=math.radians(90*(1-d))
            upper=Vector((.22,math.sin(a),-math.cos(a))).normalized();perp=Vector((0,-math.cos(a),-math.sin(a)))
            self.arm_fk('L',upper,upper*math.cos(flex)+perp*math.sin(flex),neutral=1)
            self.arm_to('R',(-.17,-.12,.64),pole=(-1,-.3,-1),kind='palm',hand_direction=(0,-.2,-1))
            self.place_line(self.cable_segments[0],self.cable_origin,self.hand_checks['L'][0]);return
        if posture=='lying' and self.load=='dumbbells':
            self.bench_posture(0)
            a=math.radians(12);flex=math.radians(5+95*d)
            for side in ['L','R']:self.arm_fk(side,(0,math.sin(a),math.cos(a)),(0,math.sin(a+flex),math.cos(a+flex)),neutral=1)
            return
        if posture=='lying':self.bench_posture()
        else:
            self.set_root(pitch=55 if posture=='kickback' else 10 if posture=='overhead-cable' else 0)
            self.plant_feet(.34)
        for side,sign in [('L',1),('R',-1)]:
            active=self.load not in ['single-dumbbell','single-cable'] or side==self.spec.get('side','L')
            if not active:
                self.arm_fk(side,(0,0,-1),(0,-.2,-1),kind='relaxed');continue
            flex=math.radians(12+95*d)
            if posture=='lying':
                upper=(sign*.02,.08,1)
                lower=(0,math.sin(flex),math.cos(flex))
            elif posture in ['overhead','overhead-cable']:
                upper=(sign*.08,.05,1)
                lower=(0,math.sin(flex),math.cos(flex))
            elif posture=='kickback':
                upper=(sign*.04,.82,-.57)
                a=math.radians(55)-flex
                lower=(0,math.sin(a),-math.cos(a))
            else:
                upper=(sign*.02,0,-1)
                lower=(sign*.15*(1-d) if self.spec.get('splitRope') else 0,-math.sin(flex),-math.cos(flex))
            self.arm_fk(side,upper,lower,neutral=1 if self.load in ['dumbbells','single-dumbbell','single-cable','cable-rope'] else 0,
                        pronated=self.load in ['cable-bar','cable-v'])
        if self.cable_segments:
            sides=list(self.weights) if self.weights else ['L','R']
            self.cables([self.hand_checks[side][0] for side in sides])

    def setup_pushdown(self):
        if self.load not in ['cable-rope','cable-bar','cable-v']:raise NotImplementedError('Pushdown implement not authored')
        self.cable_tower((0,-.78,1.95))
        self.camera_location=(3.2,2.6,1.95);self.camera_target=(0,-.20,1.0);self.camera_scale=2.6
        if self.load=='cable-rope':
            for segment in self.cable_segments[3:]:segment.hide_render=True
            self.pushdown_junction=self.sphere('Pushdown rope junction',.018,(0,0,0))
            for handle in self.weights.values():self.sphere('Pushdown terminal knob',.026,(-.075,0,0),mat=self.rope_material,parent=handle)

    def pose_pushdown(self,t):
        self.set_root();self.plant_feet(.34)
        d=depth(t);base=math.radians(14);flex=base+math.radians(90*d)
        for side,sign in [('L',1),('R',-1)]:
            upper=(sign*.10 if self.load=='cable-rope' else 0,-math.sin(base),-math.cos(base))
            lower=(sign*(.10-.25*d) if self.load=='cable-rope' else 0,-math.sin(flex),-math.cos(flex))
            axis=(-sign,-.575*math.cos(flex),.575*math.sin(flex)) if self.load=='cable-v' else None
            self.arm_fk(side,upper,lower,neutral=1 if self.load=='cable-rope' else 0,pronated=self.load=='cable-bar',axis=axis)
        hands=[self.hand_checks[s][0] for s in ['L','R']]
        if self.load=='cable-rope':
            mean=(hands[0]+hands[1])/2;half=(hands[0]-hands[1]).length/2
            eye=mean+(self.cable_origin-mean).normalized()*math.sqrt(max(.001,.38**2-half**2))
            self.move(self.pushdown_junction,eye)
            self.place_line(self.cable_segments[0],self.cable_origin,eye)
            for segment,hand in zip(self.cable_segments[1:3],hands):self.place_line(segment,eye,hand)
        else:self.cables(hands)
