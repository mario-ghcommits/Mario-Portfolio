// Web adaptation of Pegasus Brain3D.tsx's asset loading and normalization.
// Copyright (c) 2024 Pegasus Contributors. MIT: src/vendor/pegasus/LICENSE.txt.
import fs from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries,mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {Brush,Evaluator,INTERSECTION,computeMeshVolume} from 'three-bvh-csg';
class FileReaderNode{readAsArrayBuffer(b){b.arrayBuffer().then(r=>{this.result=r;this.onloadend?.();});}readAsDataURL(b){b.arrayBuffer().then(r=>{this.result='data:'+b.type+';base64,'+Buffer.from(r).toString('base64');this.onloadend?.();});}}
globalThis.FileReader??=FileReaderNode;
const data=await fs.readFile('public/models/pegasus-fsaverage5.glb');
const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
const brain=gltf.scene;brain.rotation.x=-Math.PI/2;brain.updateMatrixWorld(true);
const bounds0=new THREE.Box3().setFromObject(brain),center=bounds0.getCenter(new THREE.Vector3()),scale=2.8/bounds0.getSize(new THREE.Vector3()).z;
const brushes=[];
brain.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);g.translate(-center.x,-center.y,-center.z);g.scale(scale,scale,scale);g.deleteAttribute('color');g.computeVertexNormals();g.clearGroups();const b=new Brush(g);b.updateMatrixWorld(true);brushes.push(b);
});
const bounds=new THREE.Box3();for(const b of brushes)bounds.union(new THREE.Box3().setFromObject(b));
const evaluator=new Evaluator();evaluator.attributes=['position','normal'];evaluator.useGroups=false;
function compact(source){
 const index=source.index,p=source.attributes.position,n=source.attributes.normal,start=source.drawRange.start||0,count=Math.min(source.drawRange.count,index?index.count:p.count),positions=[],normals=[];
 for(let i=start;i<start+count;i++){const j=index?index.getX(i):i;positions.push(p.getX(j),p.getY(j),p.getZ(j));normals.push(n.getX(j),n.getY(j),n.getZ(j));}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.normalizeNormals();const merged=mergeVertices(g,1e-5);g.dispose();return merged;
}
function intersect(geometry,position){const cutter=new Brush(geometry);cutter.position.copy(position);cutter.updateMatrixWorld(true);const outputs=[];for(const brain of brushes){const result=evaluator.evaluate(brain,cutter,INTERSECTION);if(result.geometry.drawRange.count>0&&result.geometry.attributes.position?.count)outputs.push(compact(result.geometry));result.geometry.dispose();}geometry.dispose();if(!outputs.length)return null;const merged=mergeGeometries(outputs);outputs.forEach(g=>g.dispose());return merged;}
const root=new THREE.Group();root.name='Pegasus_solid_brain_puzzle';
const material=new THREE.MeshStandardMaterial({color:0xe79eb1,roughness:.43,metalness:.02,side:THREE.FrontSide});
// Jittered three-dimensional cells distribute missing pieces through the whole
// brain. Selection is deterministic, with no horizontal truncation plane.
const hash=(x,y,z,salt=0)=>{const v=Math.sin(x*127.1+y*311.7+z*74.7+salt*19.19)*43758.5453;return v-Math.floor(v);};
function divisions(min,max,count,seed){return Array.from({length:count+1},(_,i)=>i===0?min-.002:i===count?max+.002:THREE.MathUtils.lerp(min,max,(i+(hash(i,seed,0)-.5)*.22)/count));}
const xs=divisions(bounds.min.x,bounds.max.x,6,1),ys=divisions(bounds.min.y,bounds.max.y,4,2),zs=divisions(bounds.min.z,bounds.max.z,7,3),cells=[];
for(let ix=0;ix<6;ix++)for(let iy=0;iy<4;iy++)for(let iz=0;iz<7;iz++){
 const rest=new THREE.Vector3((xs[ix]+xs[ix+1])/2,(ys[iy]+ys[iy+1])/2,(zs[iz]+zs[iz+1])/2);
 const geometry=intersect(new RoundedBoxGeometry(xs[ix+1]-xs[ix]-.002,ys[iy+1]-ys[iy]-.002,zs[iz+1]-zs[iz]-.002,3,.018),rest);
 if(!geometry||geometry.attributes.position.count<12){geometry?.dispose();continue;}
 const volume=computeMeshVolume(geometry);if(volume<1e-6){geometry.dispose();continue;}
 cells.push({geometry,cell:[ix,iy,iz],volume,selection:hash(ix,iy,iz,5),order:hash(ix,iy,iz,11)});
}
const totalVolume=cells.reduce((v,c)=>v+c.volume,0);cells.sort((a,b)=>a.selection-b.selection);
// Keep tiny surface fragments attached; only substantial puzzle chunks travel.
const attached=cells.filter(c=>c.volume<.0025);
let fixedVolume=attached.reduce((v,c)=>v+c.volume,0);const fixedCells=attached.map(c=>c.geometry),animated=[];
for(const c of cells){if(c.volume<.0025)continue;if(fixedVolume<totalVolume*.65){fixedCells.push(c.geometry);fixedVolume+=c.volume;}else animated.push(c);}
const baseGeo=mergeGeometries(fixedCells),base=new THREE.Mesh(baseGeo,material);fixedCells.forEach(g=>g.dispose());base.name='fixed_cortex';base.userData={fixed:true,solid:true,distributed:true};root.add(base);
animated.sort((a,b)=>a.order-b.order);
for(let rank=0;rank<animated.length;rank++){
 const c=animated[rank];c.geometry.computeBoundingBox();const rest=c.geometry.boundingBox.getCenter(new THREE.Vector3());c.geometry.translate(-rest.x,-rest.y,-rest.z);
 const outward=rest.clone().normalize();outward.y+=.35;outward.normalize().multiplyScalar(.65+hash(...c.cell,17)*.35);
 const bend=new THREE.Vector3(Math.sin(rank*2.4)*.22,Math.cos(rank*1.7)*.13,Math.cos(rank*2.4)*.2);
 const piece=new THREE.Mesh(c.geometry,material);piece.name='puzzle_piece_'+rank;piece.position.copy(rest);piece.userData={fixed:false,solid:true,rank,rest:rest.toArray(),cell:c.cell,approach:outward.toArray(),bend:bend.toArray()};root.add(piece);
}
root.userData={source:'rishith-c/pegasus',sourceCommit:'52ba71e3b4bb53063eff035a6e2223388889ca1c',asset:'fsaverage5.glb',assembly:'distributed three-dimensional cells',baseVolumeFraction:fixedVolume/totalVolume,puzzlePieces:animated.length,fixedCells:cells.length-animated.length,totalCells:cells.length,edgeRadius:.018,solid:true,baseVolume:fixedVolume,animatedVolume:totalVolume-fixedVolume};
root.updateMatrixWorld(true);const output=await new GLTFExporter().parseAsync(root,{binary:true});await fs.writeFile('public/models/brain-puzzle.glb',Buffer.from(output));await fs.writeFile('public/models/brain-puzzle.json',JSON.stringify(root.userData,null,2)+'\n');console.log(JSON.stringify({...root.userData,bytes:output.byteLength}));
