import bpy
from pathlib import Path
root=Path(r'C:\Users\Maikon Lacerda\Documents\forzon')
bpy.ops.wm.open_mainfile(filepath=str(root/'tools/exercise-renderer/output/anatomy-v3/ex-crucifixo-reto-halteres.blend'))
scene=bpy.context.scene;skin=bpy.data.objects['FORZON Human'].data.materials[0];nodes=skin.node_tree.nodes;bsdf=nodes.get('Principled BSDF')
for link in list(bsdf.inputs['Normal'].links):skin.node_tree.links.remove(link)
node=nodes.new('ShaderNodeVertexColor');node.layer_name='MuscleRegion';skin.node_tree.links.new(node.outputs['Color'],bsdf.inputs['Base Color'])
p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='OPTIX';p.get_devices()
for d in p.devices:d.use=d.type=='OPTIX'
scene.cycles.device='GPU';scene.frame_set(30);scene.render.filepath=str(root/'.tmp/video-style-review/no-fibers.png');bpy.ops.render.render(write_still=True)
