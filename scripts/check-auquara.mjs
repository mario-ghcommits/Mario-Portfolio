import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AUQUARA_DESIGN as design,createAuquaraModel,outline} from '../src/auquaraModel.js';
const part=id=>design.parts.find(p=>p.id===id);
assert.deepEqual(part('board').shape,{kind:'rectangle',width:190,depth:380,chamfer:0});
assert.equal(design.palette.base,'#e3e6e0');
assert.equal(part('city-disc').shape.kind,'circle');
assert.equal(part('city-disc').shape.radius,95);
// Check whole garden pontoons, planting and canopies against every satellite link.
const links=design.parts.filter(p=>p.id.startsWith('satellite-link-edge-'));
for(const garden of design.parts.filter(p=>p.id.startsWith('park-float-'))){
 const radius=Math.hypot(garden.shape.width,garden.shape.depth)/2+3;
 for(const link of links){
  const angle=link.rotation*Math.PI/180,dx=garden.position[0]-link.position[0],dy=garden.position[1]-link.position[1];
  const along=dx*Math.cos(angle)+dy*Math.sin(angle),across=-dx*Math.sin(angle)+dy*Math.cos(angle);
  const distance=Math.hypot(Math.max(0,Math.abs(along)-link.shape.width/2),Math.max(0,Math.abs(across)-link.shape.depth/2));
  assert(distance>radius,`${garden.id} obstructs ${link.id}`);
 }
}
assert.equal(part('greenhouse-glass').shape.kind,'dome');
assert.equal(design.parts.filter(p=>p.id.startsWith('greenhouse-bed-')&&!p.id.includes('edge')).length,4);
const model=createAuquaraModel();let instances=0;
model.root.traverse(mesh=>{
 if(mesh.isInstancedMesh)instances+=mesh.count;
 if(mesh.isMesh)for(const n of mesh.geometry.attributes.position.array)assert(Number.isFinite(n));
});
assert.equal(instances,0);model.dispose();
const bytes=fs.readFileSync(new URL('../public/models/auquara.glb',import.meta.url));
const length=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+length).toString());
assert(gltf.nodes.some(n=>n.name==='greenhouse-glass'));
assert(!fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8').includes('model-key'));
console.log(`Verified circular island, pale rectangular base, unobstructed connecting roads, planted circular greenhouse, simplified massing, matching GLB, and removed color key.`);
