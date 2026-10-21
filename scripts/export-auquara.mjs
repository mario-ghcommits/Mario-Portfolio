import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {AUQUARA_DESIGN,createAuquaraModel,outline} from '../src/auquaraModel.js';

// GLTFExporter uses FileReader for in-memory buffers in both browser and Node.
class NodeFileReader {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.();}).catch(error=>this.onerror?.(error));}
  readAsDataURL(blob){blob.arrayBuffer().then(data=>{this.result=`data:${blob.type||'application/octet-stream'};base64,${Buffer.from(data).toString('base64')}`;this.onloadend?.();}).catch(error=>this.onerror?.(error));}
}
globalThis.FileReader??=NodeFileReader;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'public/models');await fs.mkdir(directory,{recursive:true});
const model=createAuquaraModel();
// One world unit is 40 mm. glTF uses meters.
model.root.scale.setScalar(.04);model.root.updateMatrixWorld(true);
const exporter=new GLTFExporter();
const binary=await exporter.parseAsync(model.root,{binary:true,onlyVisible:true});
await fs.writeFile(path.join(directory,'auquara.glb'),Buffer.from(binary));
await fs.writeFile(path.join(directory,'auquara-design.json'),JSON.stringify(AUQUARA_DESIGN,null,2)+'\n');
const number=value=>Math.round(value*10000)/10000;
const points=items=>'['+items.map(point=>'['+point.map(number).join(',')+']').join(',')+']';
let cad=`// Auquara: photo-derived, editable CAD reconstruction.\n// Nominal footprint 190 x 380 mm. No dimensions were supplied or measured.\n// Proportions and obscured surfaces are estimates, not survey or fabrication data.\n// Unfinished roofs and outlined satellite buildings are completed by inference.\n// Change scale_factor to resize everything uniformly.\nscale_factor = 1;\nshow_supports = true;\nexplode_mm = 0;\n$fn = 96;\n\nmodule solid_profile(points, holes=[], height=1) {\n  linear_extrude(height=height, convexity=10) difference() {\n    polygon(points);\n    for (hole=holes) polygon(hole);\n  }\n}\n\nscale([scale_factor,scale_factor,scale_factor]) union() {\n`;
for(const part of AUQUARA_DESIGN.parts){
  const {outer,holes}=outline(part.shape,96);
  const hex=AUQUARA_DESIGN.palette[part.material].slice(1),color=[0,2,4].map(offset=>number(parseInt(hex.slice(offset,offset+2),16)/255));
  const separation=part.layer==='buildings'?' + explode_mm':part.layer==='network'?' + explode_mm * 0.3':'';
  cad+=`  // ${part.id}: ${part.name}\n`;
  if(part.id.startsWith('support-'))cad+='  if (show_supports)\n';
  cad+=`  color([${color.join(',')}]) translate([${part.position[0]},${part.position[1]},${part.position[2]}${separation}]) rotate([0,0,${part.rotation}])\n    solid_profile(${points(outer)}, [${holes.map(points).join(',')}], ${part.height});\n`;
}
cad+='}\n';
await fs.writeFile(path.join(directory,'auquara.scad'),cad);
const note=`Auquara — photo reconstruction\n\nFiles\n- auquara.glb: colored 3D assembly; glTF coordinates use meters.\n- auquara.scad: self-contained editable OpenSCAD model in millimeters. Open in OpenSCAD, adjust scale_factor, preview, then render/export your desired CAD/mesh format.\n- auquara-design.json: named component dimensions, shapes, colors, and positions.\n\nScale\nThe assumed display board is 190 x 380 mm with 20 mm supports. These dimensions are placeholders chosen to preserve photo proportions, not measured dimensions. Hidden geometry is interpreted. Unfinished tower ceilings and outlined satellite buildings are completed by inference. Uniformly resize using scale_factor in the CAD file.\n\nReferences\nIMG_1345, IMG_1316, IMG_1315, IMG_1296, supplied by Mario Lin. Original photographs and the home background are not included. The CAD follows the model's circular plan, curved blue towers, open brown towers, white radial buildings, central rounded volumes, satellite modules, and elevated blue board.\n\nRegenerate\nEdit src/auquaraModel.js and run pnpm model:export. The website and exports share that geometry source.\n`;
await fs.writeFile(path.join(directory,'README.txt'),note);
model.dispose();
console.log(`Exported ${AUQUARA_DESIGN.parts.length} components; GLB ${binary.byteLength} bytes; editable CAD ${cad.length} characters.`);
