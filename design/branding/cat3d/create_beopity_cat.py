"""Original beopity kitten asset, generated with Blender 5.2.2.
Run: blender -b --factory-startup --python create_beopity_cat.py
All geometry, texture pixels and animation curves are authored here. No asset packs.
Author coordinates use the GLB contract (X right, Y up, +Z forward), converted to Blender.
"""
import bpy, math, random, json, os, struct
from pathlib import Path
from mathutils import Vector, Matrix
import numpy as np
BASE=Path(__file__).resolve().parent
WEB=BASE.parents[2]/'public/beopity/cat3d'
WEB.mkdir(parents=True,exist_ok=True)
random.seed(113)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for d in bpy.data.materials: bpy.data.materials.remove(d)
S=0.985 # nominal nose-to-rump 0.45 m

def V(p): return Vector((p[0]*S,-p[2]*S,p[1]*S))
def C(v): return (v.x/S,v.z/S,-v.y/S)
def srgb(v): return ((v+0.055)/1.055)**2.4 if v>0.04045 else v/12.92
def color(h): return tuple(srgb(int(h[i:i+2],16)/255) for i in (0,2,4))
def mat(name,h,rough=.7):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color(h),1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color(h),1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=0
 return m
fur=mat('Midnight fur · blue charcoal','252a32',.82)
ear=mat('Inner ears · dusty mauve','94676b',.84)
nosemat=mat('Nose · muted rose','8b5a61',.52)
lidmat=mat('Lid and mouth · soft ink','12171c',.8)
whiskermat=mat('Whiskers · warm silver','999d9f',.64)
pupilmat=mat('Pupil · near black','03080b',.24)
glintmat=mat('Eye glints · ivory','f5fff0',.16)
glintmat.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=(*color('efffdf'),1)
glintmat.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.3

# Directional painted hair strokes; compact RGB PNGs suitable for glTF.
N=512; yy,xx=np.mgrid[0:N,0:N].astype(np.float32); rng=np.random.default_rng(113)
h=np.zeros((N,N),dtype=np.float32)
for k in range(950):
 cx,cy=rng.uniform(0,N,2); length=rng.uniform(8,65); width=rng.uniform(.45,1.5); bend=rng.uniform(-3,3)
 dy=(yy-cy+N/2)%N-N/2; dx=(xx-cx-bend*np.sin(dy/length)+N/2)%N-N/2
 stroke=np.exp(-(dx/width)**2-(dy/length*2.8)**4)*rng.uniform(.12,.8)
 h+=stroke
h=np.clip(h,0,1.5)/1.5
broad=.5+.5*np.sin(xx*.043+np.sin(yy*.029)*1.4)
base=np.zeros((N,N,4),dtype=np.float32)
# Blender generated image pixel values are scene-linear, saved as sRGB.
for c,coeff in enumerate([.075,.086,.108]): base[:,:,c]=coeff+(.035+.004*c)*h+.006*broad
base[:,:,3]=1

def saveimg(name,a,noncolor=False):
 im=bpy.data.images.new(name,width=N,height=N,alpha=False)
 if noncolor: im.colorspace_settings.name='Non-Color'
 im.pixels.foreach_set(a.astype(np.float32).ravel()); im.filepath_raw=str(BASE/(name+'.png')); im.file_format='PNG'; im.save(); im.pack(); return im
baseim=saveimg('fur_basecolor',base)
gy,gx=np.gradient(h); norm=np.stack((-gx*.65,-gy*.65,np.ones_like(h)),axis=2); norm/=np.linalg.norm(norm,axis=2)[:,:,None]
na=np.ones((N,N,4)); na[:,:,:3]=norm*.5+.5
normalim=saveimg('fur_normal',na,True)
ra=np.ones((N,N,4)); ra[:,:,:3]=(.74+.17*(1-h))[:,:,None]
roughim=saveimg('fur_roughness',ra,True)
nt=fur.node_tree; p=nt.nodes.get('Principled BSDF')
for im,socket in [(baseim,'Base Color'),(roughim,'Roughness')]:
 n=nt.nodes.new('ShaderNodeTexImage'); n.image=im; nt.links.new(n.outputs['Color'],p.inputs[socket])
n=nt.nodes.new('ShaderNodeTexImage'); n.image=normalim; nm=nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value=.46; nt.links.new(n.outputs['Color'],nm.inputs['Color']); nt.links.new(nm.outputs['Normal'],p.inputs['Normal'])
p.inputs['Specular IOR Level'].default_value=.28; p.inputs['Sheen Tint'].default_value=(*color('778da7'),1)
p.inputs['Sheen Weight'].default_value=0; p.inputs['Sheen Roughness'].default_value=.72

# Form the kitten's connected body, with sculptural cheeks and tapering legs.
parts=[]
def ell(name,center,radii,material=fur,seg=24,rings=16,collect=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=V(center))
 o=bpy.context.object; o.name=name; o.scale=(radii[0]*S,radii[2]*S,radii[1]*S)
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(material)
 for f in o.data.polygons: f.use_smooth=True
 if collect is not None: collect.append(o)
 return o
ell('Ribcage',(0,.192,-.008),(.073,.088,.146),collect=parts)
ell('Round kitten rump',(0,.185,-.117),(.077,.082,.091),collect=parts)
ell('Chest',(0,.193,.093),(.071,.097,.079),collect=parts)
ell('Neck',(0,.251,.137),(.058,.078,.058),collect=parts)
ell('Round skull',(0,.297,.167),(.087,.081,.075),collect=parts)
for sign in [-1,1]:
 ell('Cheek',(sign*.055,.271,.186),(.044,.042,.048),collect=parts)
 ell('Muzzle pad',(sign*.021,.263,.224),(.027,.021,.025),collect=parts)
ell('Chin',(0,.246,.216),(.033,.018,.024),collect=parts)
for sign in [-1,1]:
 ell('Shoulder',(sign*.054,.175,.087),(.034,.067,.039),collect=parts)
 ell('Front upper',(sign*.056,.123,.087),(.026,.071,.028),collect=parts)
 ell('Front forearm',(sign*.056,.062,.096),(.021,.055,.023),collect=parts)
 ell('Front paw',(sign*.056,.020,.111),(.029,.020,.039),collect=parts)
 ell('Haunch',(sign*.055,.153,-.119),(.044,.068,.057),collect=parts)
 ell('Rear lower',(sign*.058,.073,-.127),(.024,.062,.027),collect=parts)
 ell('Rear paw',(sign*.058,.021,-.106),(.030,.021,.040),collect=parts)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0]; bpy.ops.object.join(); body=bpy.context.object; body.name='Beopity_Cat_Skin'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
r=body.modifiers.new('Continuous sculpt surface','REMESH'); r.mode='VOXEL'; r.voxel_size=.0038*S; r.use_smooth_shade=True; bpy.ops.object.modifier_apply(modifier=r.name)
r=body.modifiers.new('Smooth sculpt intersections','SMOOTH'); r.factor=.65; r.iterations=4; bpy.ops.object.modifier_apply(modifier=r.name)
r=body.modifiers.new('Web topology','DECIMATE'); r.ratio=min(1,7500/len(body.data.polygons)); bpy.ops.object.modifier_apply(modifier=r.name)
# Recess sockets so the entire round iris reads cleanly, without skull intersections.
for v in body.data.vertices:
 x,y,z=C(v.co)
 if y>.255 and z>.202:
  rr=min(((x-.041)/.036)**2+((y-.300)/.038)**2,((x+.041)/.036)**2+((y-.300)/.038)**2)
  if rr<1.4:v.co=V((x,y,z-.024*max(0,1-rr/1.4)**.55))
for f in body.data.polygons:f.use_smooth=True
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.008); bpy.ops.object.mode_set(mode='OBJECT')
for uv in body.data.uv_layers.active.data:uv.uv*=3.5

# Armature contract. Bone endpoints expressed in glTF coordinates.
bones={}
def bone(n,a,b,parent=None):bones[n]=(Vector(a),Vector(b),parent)
bone('root',(0,0,0),(0,.04,0))
bone('hips',(0,.184,-.119),(0,.192,-.065),'root')
bone('spine_01',(0,.192,-.065),(0,.201,-.005),'hips')
bone('spine_02',(0,.201,-.005),(0,.211,.055),'spine_01')
bone('spine_03',(0,.211,.055),(0,.246,.126),'spine_02')
bone('neck',(0,.246,.126),(0,.294,.161),'spine_03')
bone('head',(0,.294,.161),(0,.297,.222),'neck')
bone('jaw',(0,.261,.191),(0,.254,.232),'head')
for sign,label in [(1,'L'),(-1,'R')]:
 bone('ear_'+label,(sign*.058,.349,.150),(sign*.088,.424,.145),'head')
 bone('upperarm_'+label,(sign*.056,.187,.085),(sign*.056,.102,.084),'spine_03')
 bone('forearm_'+label,(sign*.056,.102,.084),(sign*.056,.025,.103),'upperarm_'+label)
 bone('hand_'+label,(sign*.056,.025,.103),(sign*.056,.019,.141),'forearm_'+label)
 bone('thigh_'+label,(sign*.058,.178,-.119),(sign*.058,.101,-.101),'hips')
 bone('shin_'+label,(sign*.058,.101,-.101),(sign*.058,.026,-.119),'thigh_'+label)
 bone('foot_'+label,(sign*.058,.026,-.119),(sign*.058,.019,-.075),'shin_'+label)
tailpts=[(0,.205,-.182),(.012,.214,-.229),(.034,.240,-.275),(.058,.277,-.309),(.078,.319,-.318),(.088,.357,-.298),(.082,.375,-.263),(.064,.369,-.235),(.051,.347,-.227)]
for i in range(8):bone('tail_%02d'%(i+1),tailpts[i],tailpts[i+1],'hips' if i==0 else 'tail_%02d'%i)
armdat=bpy.data.armatures.new('Beopity_Kitten_Rig'); arm=bpy.data.objects.new('Beopity_Rig',armdat); bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm; arm.select_set(True); body.select_set(False); bpy.ops.object.mode_set(mode='EDIT')
for name,(a,b,par) in bones.items():
 eb=armdat.edit_bones.new(name); eb.head=V(a); eb.tail=V(b)
 if par: eb.parent=armdat.edit_bones[par]
bpy.ops.object.mode_set(mode='OBJECT'); arm.show_in_front=True
# Heat weights on the continuous sculpt; exclude helper bones outside the body.
for n in bones:arm.data.bones[n].use_deform=not (n=='root' or n=='jaw' or n.startswith('ear_') or n.startswith('tail_'))
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);arm.select_set(True);bpy.context.view_layer.objects.active=arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
for n in bones:arm.data.bones[n].use_deform=True
for mod in list(body.modifiers):
 if mod.type=='ARMATURE':body.modifiers.remove(mod)
# Secondary shape geometry (all merged into the same skinned mesh).
extras=[]
def mesh(name,verts,faces,material,weights=None,uvs=None):
 me=bpy.data.meshes.new(name);me.from_pydata([V(v) for v in verts],[],faces);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);me.materials.append(material)
 for f in me.polygons:f.use_smooth=True
 if weights:
  for n in set(n for w in weights for n in w):ob.vertex_groups.new(name=n)
  for i,w in enumerate(weights):
   for n,amount in w.items():ob.vertex_groups[n].add([i],amount,'REPLACE')
 uv=me.uv_layers.new(name='UVMap')
 for p in me.polygons:
  for li in p.loop_indices:
   idx=me.loops[li].vertex_index;uv.data[li].uv=uvs[idx] if uvs else (verts[idx][0]*16,verts[idx][1]*16)
 return ob

def ribbon_tuft(center,direction,width,length,bone_name,shade=fur):
 c=Vector(center);d=Vector(direction).normalized();side=d.cross(Vector((0,0,1)))
 if side.length<.01:side=d.cross(Vector((1,0,0)))
 side.normalize();mid=c+d*length*.55+Vector((0,0,.0008));tip=c+d*length
 vv=[c-side*width*.36,c+side*width*.36,mid-side*width*.20,mid+side*width*.20,tip]
 return vv,[(0,1,3,2),(2,3,4)],[{bone_name:1}]*5
# Leaflike locks along silhouettes and chest, plus sparse fine guard hairs.
tv=[];tf=[];tw=[]
def tuft(c,d,w,l,b):
 vv,ff,ww=ribbon_tuft(c,d,w,l,b);off=len(tv);tv.extend(vv);tf.extend([tuple(i+off for i in f) for f in ff]);tw.extend(ww)
for sign in [-1,1]:
 # Curved, softly cupped ears with a dark rim and inset mauve surface.
 bn='ear_'+('L' if sign>0 else 'R')
 ev=[];ef=[];ew=[]
 rows,cols=12,8
 for back in [False,True]:
  for j in range(rows+1):
   t=j/rows
   for k in range(cols+1):
    u=2*k/cols-1;width=.037*max(.002,1-t)**.78
    x=sign*(.058+.035*t+u*width);y=.340+.084*t-.005*(1-t)*u
    z=.148+.012*(1-t)-.007*math.sin(math.pi*t)*(1-u*u)
    if back:z-=.012*(1-t)+.002
    ev.append((x,y,z));ew.append({bn:1})
 stride=(rows+1)*(cols+1)
 for back in [0,1]:
  for j in range(rows):
   for k in range(cols):
    i=back*stride+j*(cols+1)+k;face=(i,i+1,i+cols+2,i+cols+1)
    if bool(back)!=(sign<0):face=tuple(reversed(face))
    ef.append(face)
 for j in range(rows):
  for k in [0,cols]:
   a=j*(cols+1)+k;b=(j+1)*(cols+1)+k;ef.append((a,b,b+stride,a+stride))
 for j in [0,rows]:
  for k in range(cols):
   a=j*(cols+1)+k;ef.append((a,a+stride,a+stride+1,a+1))
 extras.append(mesh('Soft ear cup',ev,ef,fur,ew))
 iv=[];iff=[]
 for j in range(11):
  t=.12+.76*j/10
  for k in range(7):
   u=(2*k/6-1)*.70;width=.037*(1-t)**.78
   iv.append((sign*(.058+.035*t+u*width),.340+.084*t-.005*(1-t)*u,.149+.012*(1-t)-.007*math.sin(math.pi*t)*(1-u*u)))
 for j in range(10):
  for k in range(6):
   i=j*7+k;f=(i,i+1,i+8,i+7);iff.append(tuple(reversed(f)) if sign<0 else f)
 extras.append(mesh('Mauve ear inset',iv,iff,ear,[{bn:1}]*len(iv)))
 for j in range(48):
  t=j/47; a=-.9+1.9*t;c=(sign*(.067+.017*math.cos(a)),.286+.046*math.sin(a),.179+.022*math.cos(a))
  tuft(c,(sign*(.7+random.random()*.3),-.45-random.random()*.4,-.20),random.uniform(.0018,.0034),random.uniform(.009,.022),'head')
 for j in range(25):
  c=(sign*random.uniform(.028,.075),random.uniform(.347,.369),random.uniform(.161,.167));tuft(c,(sign*.25,1,.1),.001,random.uniform(.009,.021),'ear_'+('L' if sign>0 else 'R'))
# Forehead crown tuft, cheek/chest ruff and shoulder coat.
for j in range(65):
 a=random.uniform(0,2*math.pi);x=.075*math.cos(a);z=.167+.055*math.sin(a);y=.337+.025*random.random()
 tuft((x,y,z),(x*7,1,-.20),.0014,random.uniform(.006,.014),'head')
for j in range(150):
 a=random.uniform(-1.25,1.25);y=random.uniform(.145,.26);x=math.sin(a)*(.06 if y<.22 else .048);z=.128+math.cos(a)*(.031 if y<.22 else .027)
 tuft((x,y,z),(x*4,-1,.12),random.uniform(.0014,.0028),random.uniform(.009,.022),'neck' if y>.223 else 'spine_03')
for j in range(110):
 sign=random.choice([-1,1]);z=random.uniform(-.17,.08);y=random.uniform(.17,.24);x=sign*.069
 tuft((x,y,z),(sign*.2,-.35,-1),.0014,random.uniform(.006,.014),'hips' if z<-.09 else ('spine_01' if z<-.025 else 'spine_02'))
extras.append(mesh('Painted silhouette fur locks',tv,tf,fur,tw))
# Tail continuous 8-bone loft, slightly scalloped coat silhouette.
verts=[];faces=[];weights=[];uvs=[]
for j in range(65):
 t=j/64*8;k=min(7,int(t));f=t-k
 p0,p1,p2,p3=[Vector(tailpts[max(0,min(8,q))]) for q in [k-1,k,k+1,k+2]]
 c=.5*((2*p1)+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f)
 tangent=(.5*((-p0+p2)+2*(2*p0-5*p1+4*p2-p3)*f+3*(-p0+3*p1-3*p2+p3)*f*f)).normalized();side=tangent.cross(Vector((1,0,0))).normalized();up=tangent.cross(side).normalized()
 radius=max(.001,(.022+.009*math.sin(math.pi*j/64))*max(0,1-(j/64)**8)**.4)
 for a in range(12):
  angle=2*math.pi*a/12;r=radius*(1+.035*math.sin(j*1.8+a*2.1));verts.append(c+r*(math.cos(angle)*side+math.sin(angle)*up));uvs.append((a/12*2,j/64*4))
  bn='tail_%02d'%(k+1);other='tail_%02d'%(min(7,k+1)+1);weights.append({bn:1-f,other:f} if bn!=other else {bn:1})
for j in range(64):
 for a in range(12):faces.append((j*12+a,j*12+(a+1)%12,(j+1)*12+(a+1)%12,(j+1)*12+a))
faces.extend([tuple(reversed(range(12))),tuple(64*12+a for a in range(12))]);extras.append(mesh('Fluffy hooked tail',verts,faces,fur,weights,uvs))
# Nose, mouth, toes, whiskers.
ob=ell('Rose nose',(0,.270,.249),(.011,.007,.0055),nosemat,20,12);
for v in ob.data.vertices:v.co.x*=.65+.35*(v.co.z/(.007*S))
ob.vertex_groups.new(name='head').add(list(range(len(ob.data.vertices))),1,'REPLACE');extras.append(ob)
def tube(name,points,radius,material,bn,collection):
 vv=[];ff=[];ww=[]
 for j,c in enumerate(points):
  c=Vector(c);t=(Vector(points[min(j+1,len(points)-1)])-Vector(points[max(0,j-1)])).normalized();s=t.cross(Vector((0,0,1)))
  if s.length<.01:s=t.cross(Vector((1,0,0)))
  s.normalize();u=t.cross(s).normalized()
  for k in range(4):
   a=2*math.pi*k/4;r=radius*(1-.75*j/(len(points)-1));vv.append(c+r*(math.cos(a)*s+math.sin(a)*u));ww.append({bn:1})
 for j in range(len(points)-1):
  for k in range(4):ff.append((j*4+k,j*4+(k+1)%4,(j+1)*4+(k+1)%4,(j+1)*4+k))
 collection.append(mesh(name,vv,ff,material,ww))
tube('Mouth center',[(0,.266,.251),(0,.258,.250),(0,.253,.246)],.00085,lidmat,'head',extras)
for sign in [-1,1]:
 tube('Gentle smile',[(0,.253,.246),(sign*.009,.251,.245),(sign*.017,.255,.242)],.00065,lidmat,'head',extras)
 for j in range(4):
  points=[]
  for k in range(9):
   t=k/8;points.append((sign*(.024+.113*t),.264+(j-1.5)*.004+(j-1.5)*.013*t-.008*t*t,.245-.038*t*t))
  tube('Fine curved whisker',points,.00040,whiskermat,'head',extras)
 for leg,z in [('hand',.130),('foot',-.086)]:
  for offset in [-.010,.009]:tube('Toe crease',[(sign*.056+offset,.021,z+.008),(sign*.056+offset,.031,z),(sign*.056+offset,.033,z-.008)],.00050,lidmat,leg+'_'+('L' if sign>0 else 'R'),extras)
# Join to exactly one skinned body mesh; separate head expressions are bone-parented.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True)
for ob in extras:ob.select_set(True)
bpy.context.view_layer.objects.active=body;bpy.ops.object.join()
# glTF skinning uses four normalized influences per vertex.
for v in body.data.vertices:
 entries=sorted([(g.weight,g.group) for g in v.groups],reverse=True)
 keep=entries[:4];total=sum(w for w,g in keep)
 for w,g in entries:body.vertex_groups[g].remove([v.index])
 if total:
  for w,g in keep:body.vertex_groups[g].add([v.index],w/total,'REPLACE')
body.data.name='Beopity_Cat_Skin'
mod=body.modifiers.new('Beopity deformation','ARMATURE');mod.object=arm;body.parent=arm

# Eye domes with layered radial iris, pupil, fixed illustrated catchlights.
eye_parts=[];eye_centers={}
iris=mat('Iris · mint fibers and gold halo','b8d889',.34)
r=np.sqrt((xx-N/2)**2+(yy-N/2)**2)/(N/2);theta=np.arctan2(yy-N/2,xx-N/2)
fibers=(np.sin(theta*87+np.sin(theta*19)*2+r*9)+np.sin(theta*173-r*22))*.035
ia=np.ones((N,N,4),dtype=np.float32)
inner=np.array([.78,.76,.40]);middle=np.array([.68,.83,.55]);outer=np.array([.16,.28,.19])
t=np.clip((r-.16)/.40,0,1)
for c in range(3):
 ia[:,:,c]=inner[c]*(1-t)+middle[c]*t+fibers*np.clip(r*3,0,1)
 edge=np.clip((r-.87)/.11,0,1);ia[:,:,c]=ia[:,:,c]*(1-edge)+outer[c]*edge
iris_image=saveimg('iris_basecolor',np.clip(ia,0,1))
inode=iris.node_tree.nodes.new('ShaderNodeTexImage');inode.image=iris_image;iris.node_tree.links.new(inode.outputs['Color'],iris.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
iris_mats=[iris]*5
# Radial striations are real per-face color variations, robust at tiny display size.
for sign in [-1,1]:
 cx=sign*.041;cy=.300;cz=.229;rx=.0305;ry=.033;eye_centers[sign]=(cx,cy,cz)
 vv=[];ff=[];uv=[];rings=[1,.93,.76,.50,.16,0]
 for rr in rings:
  for j in range(48):
   a=2*math.pi*j/48;x=cx+rx*rr*math.cos(a);y=cy+ry*rr*math.sin(a)
   z=cz+.010*(1-rr*rr)-sign*.12*(x-cx);vv.append((x,y,z));uv.append((.5+rr*.5*math.cos(a),.5+rr*.5*math.sin(a)))
 for ri in range(len(rings)-1):
  for j in range(48):ff.append((ri*48+j,ri*48+(j+1)%48,(ri+1)*48+(j+1)%48,(ri+1)*48+j))
 ob=mesh('Iris',vv,ff,iris_mats[0],uvs=uv)
 
 eye_parts.append(ob)
 ob=ell('Slit pupil',(cx,cy,.241),(.0065,.026,.0025),pupilmat,24,12);eye_parts.append(ob)
 # Upper large glint and secondary small reflected spot.
 for dx,dy,sz in [(-.009,.015,.0043),(.009,-.011,.0015)]:
  ob=ell('Catchlight',(cx+dx,cy+dy,.243), (sz,sz*1.3,.0017),glintmat,12,8);eye_parts.append(ob)
 # Thick fur rim follows eye contour and remains part of expression mesh.
 points=[]
 for j in range(65):
  a=2*math.pi*j/64;points.append((cx+rx*1.025*math.cos(a),cy+ry*1.025*math.sin(a),cz-.12*sign*rx*math.cos(a)))
 tube('Eye contour',points,.0019,lidmat,'head',eye_parts)
bpy.ops.object.select_all(action='DESELECT')
for o in eye_parts:o.select_set(True)
bpy.context.view_layer.objects.active=eye_parts[0];bpy.ops.object.join();eyes=bpy.context.object;eyes.name='HeadExpressions';eyes.data.name='Beopity_HeadExpressions'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
# Material-selected morphs are directly usable with Three.js morphTargetInfluences.
basekey=eyes.shape_key_add(name='Basis');blink=eyes.shape_key_add(name='blink');dilate=eyes.shape_key_add(name='pupil_dilate')
vertmats={}
for poly in eyes.data.polygons:
 for i in poly.vertices:vertmats.setdefault(i,set()).add(eyes.data.materials[poly.material_index].name)
for i,v in enumerate(eyes.data.vertices):
 x,y,z=C(v.co);sgn=1 if x>=0 else -1;cx,cy,cz=eye_centers[sgn];mats=vertmats.get(i,set())
 # Collapse the visible iris/pupil/glints into a dark fur-covered seam.
 y2=cy+(y-cy)*.015;z2=.224 if any('Lid and mouth' in n for n in mats) else .195
 blink.data[i].co=V((x,y2,z2))
 if any('Pupil' in n for n in mats):dilate.data[i].co=V((cx+(x-cx)*4.0,y,z+.0003))
# Bone parenting preserving world transform.
eyes.parent=arm;eyes.parent_type='BONE';eyes.parent_bone='head';eyes.matrix_parent_inverse=(arm.matrix_world@arm.pose.bones['head'].matrix@Matrix.Translation((0,arm.data.bones['head'].length,0))).inverted()
eyes.matrix_basis=Matrix.Identity(4)

# Animation: deterministic absolute joint targets, baked at 30 Hz.
scene=bpy.context.scene;scene.render.fps=30;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1.0
rest={n:(a.copy(),b.copy()) for n,(a,b,par) in bones.items()}
def lerp(a,b,t):return Vector(a).lerp(Vector(b),t)
def smooth(t):return t*t*(3-2*t)
def targets(sit=0,phase=0,walking=False,time=0,look=0):
 out={n:(a.copy(),b.copy()) for n,(a,b) in rest.items()}
 s=sit
 # Pose endpoints for the seated spinal chain; front paws stay on the ground.
 seated={'hips':((0,.079,-.123),(0,.126,-.095)), 'spine_01':((0,.126,-.095),(0,.176,-.065)), 'spine_02':((0,.176,-.065),(0,.221,-.029)), 'spine_03':((0,.221,-.029),(0,.272,.020)), 'neck':((0,.272,.020),(0,.321,.071)), 'head':((0,.321,.071),(0,.324,.132)), 'jaw':((0,.288,.101),(0,.281,.142))}
 for n,(a,b) in seated.items():out[n]=(lerp(rest[n][0],a,s),lerp(rest[n][1],b,s))
 headshift=out['head'][0]-rest['head'][0]
 for side in ['L','R']:
  n='ear_'+side;out[n]=(rest[n][0]+headshift,rest[n][1]+headshift)
  sg=1 if side=='L' else -1
  for names,aa in [(['upperarm','forearm','hand'],[(sg*.056,.187,.059),(sg*.056,.102,.075),(sg*.056,.025,.103),(sg*.056,.019,.141)]),(['thigh','shin','foot'],[(sg*.066,.077,-.122),(sg*.075,.042,-.051),(sg*.065,.024,-.098),(sg*.065,.019,-.054)])]:
   for j,n in enumerate(names):out[n+'_'+side]=(lerp(rest[n+'_'+side][0],aa[j],s),lerp(rest[n+'_'+side][1],aa[j+1],s))
 # Gait with quarter-cycle contacts. Analytic 2-link IK maintains limb lengths.
 if walking:
  bob=.0025*math.sin(4*math.pi*phase)
  for n in ['hips','spine_01','spine_02','spine_03','neck','head','jaw','ear_L','ear_R']:
   out[n]=(out[n][0]+Vector((0,bob,0)),out[n][1]+Vector((0,bob,0)))
  for fore in [True,False]:
   for sg,label in [(1,'L'),(-1,'R')]:
    names=['upperarm','forearm','hand'] if fore else ['thigh','shin','foot'];offset=({'L':.25,'R':.75} if fore else {'L':0,'R':.5})[label];p=(phase+offset)%1
    # 60% stance moves backwards; swing returns with lifted paw.
    if p<.60: dz=.031-(p/.60)*.062;lift=0
    else:q=(p-.60)/.40;dz=-.031+.062*smooth(q);lift=.024*math.sin(math.pi*q)
    hip=rest[names[0]+'_'+label][0]+Vector((0,bob,0));ank=rest[names[1]+'_'+label][1]+Vector((0,lift,dz))
    l1=(rest[names[0]+'_'+label][1]-rest[names[0]+'_'+label][0]).length;l2=(rest[names[1]+'_'+label][1]-rest[names[1]+'_'+label][0]).length
    d=(ank-hip);dist=min(d.length,l1+l2-.0001);u=d.normalized();a=(l1*l1-l2*l2+dist*dist)/(2*dist);h=math.sqrt(max(0,l1*l1-a*a));perp=Vector((0,-u.z,u.y));knee=hip+u*a+perp*h*(1 if fore else -1)
    out[names[0]+'_'+label]=(hip,knee);out[names[1]+'_'+label]=(knee,ank);out[names[2]+'_'+label]=(ank,ank+(rest[names[2]+'_'+label][1]-rest[names[2]+'_'+label][0]))
 # Tail follows pelvis and swings slowly from the base, increasing toward the tip.
 shift=out['hips'][0]-rest['hips'][0]
 prev=None
 for j in range(8):
  n='tail_%02d'%(j+1);a,b=rest[n];a=a+shift;b=b+shift
  for pnt,frac in [(a,j/8),(b,(j+1)/8)]:
   pnt.x+=.014*math.sin(time*math.pi*.6+frac*1.2)*frac
   if s:pnt.y-=.027*s*frac;pnt.z-=.018*s*frac
  if prev is not None:a=prev
  out[n]=(a,b);prev=b
 # Gentle alert head tilt, around head pivot; preserve neck chain endpoint.
 angle=.035*math.sin(time*math.pi*.6)+look
 pivot=out['head'][0];rot=Matrix.Rotation(angle,3,'Z')
 for n in ['head','jaw','ear_L','ear_R']:
  a,b=out[n];out[n]=(pivot+rot@(a-pivot),pivot+rot@(b-pivot))
 # Seated haunch clearance: keep all paws planted while lifting pelvis and torso.
 for n in out:
  if n=='root':continue
  if n.startswith(('upperarm_','thigh_')):la,lb=.008*s,.004*s
  elif n.startswith(('forearm_','shin_')):la,lb=.004*s,0
  elif n.startswith(('hand_','foot_')):la,lb=0,0
  else:la,lb=.008*s,.008*s
  a,b=out[n];out[n]=(a+Vector((0,la,0)),b+Vector((0,lb,0)))
 return out

def apply_targets(out):
 desired={}
 for n in bones:
  a,b=out[n];ra,rb=rest[n]
  quat=(V(rb)-V(ra)).rotation_difference(V(b)-V(a))
  desired[n]=Matrix.Translation(V(a))@quat.to_matrix().to_4x4()@arm.data.bones[n].matrix_local.to_3x3().to_4x4()
 for n in bones:
  pb=arm.pose.bones[n];bn=arm.data.bones[n];par=bones[n][2]
  if par:pb.matrix_basis=bn.convert_local_to_pose(desired[n],bn.matrix_local,parent_matrix=desired[par],parent_matrix_local=arm.data.bones[par].matrix_local,invert=True)
  else:pb.matrix_basis=bn.convert_local_to_pose(desired[n],bn.matrix_local,invert=True)
 bpy.context.view_layer.update()

clips=[('walk',30),('idle_stand',120),('sit_down',36),('idle_sit',150),('stand_up',36),('look_around',120)]
arm.animation_data_create()
for name,length in clips:
 act=bpy.data.actions.new(name);arm.animation_data.action=act
 for frame in range(length+1):
  t=frame/30;p=frame/length
  sit=smooth(p) if name=='sit_down' else (1-smooth(p) if name=='stand_up' else (1 if name=='idle_sit' else 0))
  # All loops close identically (tail cycle fits each clip).
  loop=name in ['walk','idle_stand','idle_sit','look_around'];tm=p*(10/3) if loop else 0
  out=targets(sit,p,name=='walk',tm,.16*math.sin(2*math.pi*p) if name=='look_around' else 0)
  apply_targets(out)
  for pb in arm.pose.bones:
   pb.rotation_mode='QUATERNION';pb.keyframe_insert('location',frame=frame);pb.keyframe_insert('rotation_quaternion',frame=frame)
 # Keep clips in muted NLA tracks so the exporter sees one named action per track.
 tr=arm.animation_data.nla_tracks.new();tr.name=name;st=tr.strips.new(name,0,act);st.action_frame_start=0;st.action_frame_end=length;tr.mute=True
arm.animation_data.action=None
for pb in arm.pose.bones:pb.matrix_basis.identity()
# Morph demos remain available without forcing expression tracks into motion clips.
blink.value=0;dilate.value=0
scene.frame_start=0;scene.frame_end=150;scene.frame_set(0)
# glTF export includes only the character (no preview floor, cameras or lights).
bpy.ops.object.select_all(action='DESELECT')
for ob in [arm,body,eyes]:ob.select_set(True)
bpy.context.view_layer.objects.active=arm
bpy.ops.export_scene.gltf(filepath=str(WEB/'beopity-cat.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=True,export_animation_mode='ACTIONS',export_nla_strips=True,export_force_sampling=True,export_frame_range=False,export_frame_step=1,export_def_bones=False,export_leaf_bone=False,export_armature_object_remove=True,export_morph=True,export_morph_normal=False,export_try_sparse_sk=True,export_skins=True,export_materials='EXPORT',export_image_format='AUTO',export_draco_mesh_compression_enable=False,export_meshopt_compression_enable=False,export_extras=True,export_copyright='Original beopity character geometry, textures and animation created for the user with OpenAI GPT-6 Astra; references supplied by the user.')
print('EXPORTED',WEB/'beopity-cat.glb',flush=True)
# Photographic preview setup, deliberately excluded from GLB.
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=800;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.world.color=(.15,.15,.15);scene.view_settings.view_transform='Standard'
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
world=scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(*color('cbd4df'),1);world.node_tree.nodes['Background'].inputs[1].default_value=.22
floor_mat=mat('Preview ground · cream','f6efdc',.95)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.001));floor=bpy.context.object;floor.name='Preview ground (not exported)';floor.data.materials.append(floor_mat);floor.is_shadow_catcher=True
# Composite over an exact sRGB backdrop, keeping soft contact shadows.
comp=bpy.data.node_groups.new('Preview backdrop','CompositorNodeTree');scene.compositing_node_group=comp
comp.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
rl=comp.nodes.new('CompositorNodeRLayers');over=comp.nodes.new('CompositorNodeAlphaOver');over.inputs['Factor'].default_value=1
out=comp.nodes.new('NodeGroupOutput');comp.links.new(rl.outputs['Image'],over.inputs['Foreground']);comp.links.new(over.outputs[0],out.inputs[0])
def area(name,pos,power,size,h):
 bpy.ops.object.light_add(type='AREA',location=V(pos));o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color(h);o.rotation_euler=(V((0,.20,0))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large soft key',(-.65,.90,.75),7.5,.75,'e6edff')
area('Warm rim',(.50,.70,-.60),9.5,.60,'ffe0b9')
area('Front fill',(.60,.45,.55),3.0,.65,'e8f4ff')
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Preview camera';scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=.69;cam.data.lens=55

def setcamera(pos,target=(0,.215,-.035),scale=.69):
 cam.location=V(pos);cam.rotation_euler=(V(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale

def poseclip(name,frame):
 arm.animation_data.action=bpy.data.actions[name];scene.frame_set(frame);bpy.context.view_layer.update()

def render(name,pos,clip='idle_stand',frame=0,bg='f6efdc',scale=.69):
 poseclip(clip,frame);setcamera(pos,scale=scale);p=floor_mat.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color(bg),1)
 over.inputs['Background'].default_value=(*color(bg),1)
 scene.render.filepath=str(BASE/(name+'.png'));bpy.ops.render.render(write_still=True)
# Save editable source with all actions, maps packed, and clean standing pose.
poseclip('idle_stand',0);setcamera((.62,.43,.85));over.inputs['Background'].default_value=(*color('f6efdc'),1);bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'beopity-cat.blend'))
if os.environ.get('BEOPITY_QUICK'):
 render('proof-three-quarter',(.62,.43,.85));render('proof-sit',(.58,.39,.85),'idle_sit',0);raise SystemExit(0)
for name,pos,clip,frame in [('front',(0,.32,1),'idle_stand',0),('side',(1,.31,0),'idle_stand',0),('three-quarter',(.62,.43,.85),'idle_stand',0),('walk-midstride',(.62,.39,.85),'walk',8),('sit',(.58,.39,.85),'idle_sit',0)]:
 for tag,bg in [('cream','f6efdc'),('meadow','82b356')]:render(name+'-'+tag,pos,clip,frame,bg)
# Explicit morph proof frames, not extra required animation clips.
blink.value=1;render('expression-blink',(.0,.31,1),'idle_stand',0,'f6efdc',.58);blink.value=0;dilate.value=1;render('expression-pupil-dilate',(.0,.31,1),'idle_stand',0,'f6efdc',.58);dilate.value=0
print('DONE',flush=True)
