"""Reimport and visually validate the actual GLB using the editable source's preview stage."""
import bpy, json, math, hashlib, os
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parent
GLB=BASE.parents[2]/'public/beopity/cat3d/beopity-cat.glb'
bpy.ops.wm.open_mainfile(filepath=str(BASE/'beopity-cat.blend'))
for ob in list(bpy.data.objects):
 if ob.type=='ARMATURE' or ob.name in ['Beopity_Cat_Skin','HeadExpressions']:bpy.data.objects.remove(ob,do_unlink=True)
for action in list(bpy.data.actions):bpy.data.actions.remove(action)
bpy.ops.import_scene.gltf(filepath=str(GLB))
arms=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];assert len(arms)==1
arm=arms[0];meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and (o.data.shape_keys or any(m.type=='ARMATURE' for m in o.modifiers))]
scene=bpy.context.scene;cam=scene.camera
for tr in arm.animation_data.nla_tracks:tr.mute=True
# Opaque background color is composited after shadow catcher.
def color(h):
 def lin(v):return ((v+.055)/1.055)**2.4 if v>.04045 else v/12.92
 return tuple(lin(int(h[i:i+2],16)/255) for i in (0,2,4))
for node in scene.compositing_node_group.nodes:
 if node.bl_idname=='CompositorNodeAlphaOver':node.inputs['Background'].default_value=(*color('f6efdc'),1)
def V(p):return Vector((p[0],-p[2],p[1]))
def setcamera(pos,target=(0,.215,-.035),scale=.69):
 cam.location=V(pos);cam.rotation_euler=(V(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale

def activate(name,frame):
 action=next(a for a in bpy.data.actions if a.name==name or a.name.startswith(name+'.'))
 arm.animation_data.action=action
 if action.slots:arm.animation_data.action_slot=action.slots[0]
 scene.frame_set(frame);bpy.context.view_layer.update();return action

def evaluated_points():
 dg=bpy.context.evaluated_depsgraph_get();pts=[]
 for ob in meshes:
  ev=ob.evaluated_get(dg);me=ev.to_mesh();pts.extend([ev.matrix_world@v.co for v in me.vertices]);ev.to_mesh_clear()
 return pts
report={'file':str(GLB),'sha256':hashlib.sha256(GLB.read_bytes()).hexdigest(),'preview_source':'Actual GLB reimported in Blender; all supplied final PNG previews rendered from the exported asset.','blender':bpy.app.version_string,'armatures':len(arms),'bones':[b.name for b in arm.data.bones],'meshes':[o.name for o in meshes],'clips':{},'morphs':{}}
for name in ['walk','idle_stand','sit_down','idle_sit','stand_up','look_around']:
 action=activate(name,0);a,b=[int(v) for v in action.frame_range];mins=[];maxs=[];nonfinite=0
 # Evaluate every exported 30 fps frame, not just keys/endpoints.
 for frame in range(a,b+1):
  activate(name,frame);points=evaluated_points();nonfinite+=sum(not all(math.isfinite(x) for x in p) for p in points)
  mins.append([min(p[k] for p in points) for k in range(3)]);maxs.append([max(p[k] for p in points) for k in range(3)])
 report['clips'][name]={'frame_start':a,'frame_end':b,'samples':b-a+1,'seconds':(b-a)/30,'nonfinite_vertices':nonfinite,'lowest_y_m':min(p[2] for p in mins),'maximum_y_m':max(p[2] for p in maxs)}
activate('idle_stand',0)
for ob in meshes:
 if ob.data.shape_keys:
  for key in ob.data.shape_keys.key_blocks:
   if key.name=='Basis':continue
   basis=ob.data.shape_keys.key_blocks['Basis'];d=[(v.co-basis.data[i].co).length for i,v in enumerate(key.data)]
   report['morphs'][key.name]={'mesh':ob.name,'affected_vertices':sum(x>1e-8 for x in d),'max_local_displacement_m':max(d)}
# Final previews are rendered from the actual round-tripped GLB.
for name,clip,frame,pos in [('front','idle_stand',0,(0,.32,1)),('side','idle_stand',0,(1,.31,0)),('three-quarter','idle_stand',0,(.62,.43,.85)),('walk-midstride','walk',8,(.62,.39,.85)),('sit','idle_sit',0,(.58,.39,.85))]:
 if os.environ.get('BEOPITY_DILATE_ONLY'):break
 for tag,bg in [('cream','f6efdc'),('meadow','82b356')]:
  for node in scene.compositing_node_group.nodes:
   if node.bl_idname=='CompositorNodeAlphaOver':node.inputs['Background'].default_value=(*color(bg),1)
  bpy.data.objects['Preview ground (not exported)'].data.materials[0].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*color(bg),1)
  activate(clip,frame);setcamera(pos);scene.render.filepath=str(BASE/(name+'-'+tag+'.png'));bpy.ops.render.render(write_still=True)
for node in scene.compositing_node_group.nodes:
 if node.bl_idname=='CompositorNodeAlphaOver':node.inputs['Background'].default_value=(*color('f6efdc'),1)
for morph in ['blink','pupil_dilate']:
 if os.environ.get('BEOPITY_DILATE_ONLY') and morph!='pupil_dilate':continue
 activate('idle_stand',0)
 for ob in meshes:
  if ob.data.shape_keys and morph in ob.data.shape_keys.key_blocks:ob.data.shape_keys.key_blocks[morph].value=1
 setcamera((0,.31,1),scale=.58);scene.render.filepath=str(BASE/('expression-'+morph.replace('_','-')+'.png'));bpy.ops.render.render(write_still=True)
 for ob in meshes:
  if ob.data.shape_keys and morph in ob.data.shape_keys.key_blocks:ob.data.shape_keys.key_blocks[morph].value=0
(BASE/'reimport-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2),flush=True)
