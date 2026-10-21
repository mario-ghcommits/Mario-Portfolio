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
const brushes=[],ranked=[];let totalArea=0;
brain.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);g.translate(-center.x,-center.y,-center.z);g.scale(scale,scale,scale);g.deleteAttribute('color');g.computeVertexNormals();g.clearGroups();const b=new Brush(g);b.updateMatrixWorld(true);brushes.push(b);
const p=g.attributes.position,index=g.index;for(let i=0;i<index.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,index.getX(i)),b=new THREE.Vector3().fromBufferAttribute(p,index.getX(i+1)),c=new THREE.Vector3().fromBufferAttribute(p,index.getX(i+2));const area=b.clone().sub(a).cross(c.clone().sub(a)).length()/2;ranked.push({y:(a.y+b.y+c.y)/3,area});totalArea+=area;}});
ranked.sort((a,b)=>a.y-b.y);let sum=0,cut=0;for(const t of ranked){sum+=t.area;if(sum/totalArea>=.65){cut=t.y;break;}}
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
const y0=bounds.min.y-.1,baseGeo=intersect(new THREE.BoxGeometry(6,cut-y0,6),new THREE.Vector3(0,(cut+y0)/2,0));
const base=new THREE.Mesh(baseGeo,material);base.name='fixed_cortex';base.userData={fixed:true,solid:true};root.add(base);
let count=0,puzzleVolume=0;
for(let ix=0;ix<6;ix++)for(let iz=0;iz<8;iz++){
 const x0=THREE.MathUtils.lerp(bounds.min.x-.001,bounds.max.x+.001,ix/6),x1=THREE.MathUtils.lerp(bounds.min.x-.001,bounds.max.x+.001,(ix+1)/6),z0=THREE.MathUtils.lerp(bounds.min.z-.001,bounds.max.z+.001,iz/8),z1=THREE.MathUtils.lerp(bounds.min.z-.001,bounds.max.z+.001,(iz+1)/8),y1=bounds.max.y+.04;
 const geometry=intersect(new RoundedBoxGeometry(x1-x0-.003,y1-cut,z1-z0-.003,3,.022),new THREE.Vector3((x0+x1)/2,(cut+y1)/2,(z0+z1)/2));
 if(!geometry||geometry.attributes.position.count<12){geometry?.dispose();continue;}
 geometry.computeBoundingBox();const rest=geometry.boundingBox.getCenter(new THREE.Vector3());puzzleVolume+=computeMeshVolume(geometry);geometry.translate(-rest.x,-rest.y,-rest.z);
 const piece=new THREE.Mesh(geometry,material);piece.name='top_piece_'+count;piece.position.copy(rest);piece.userData={fixed:false,solid:true,rank:count++,rest:rest.toArray(),cell:[ix,iz]};root.add(piece);
}
root.userData={source:'rishith-c/pegasus',sourceCommit:'52ba71e3b4bb53063eff035a6e2223388889ca1c',asset:'fsaverage5.glb',baseSurfaceFraction:sum/totalArea,cutHeight:cut,puzzlePieces:count,edgeRadius:.022,solid:true,baseVolume:computeMeshVolume(baseGeo),topVolume:puzzleVolume};
root.updateMatrixWorld(true);const output=await new GLTFExporter().parseAsync(root,{binary:true});await fs.writeFile('public/models/brain-puzzle.glb',Buffer.from(output));await fs.writeFile('public/models/brain-puzzle.json',JSON.stringify(root.userData,null,2)+'\n');console.log(JSON.stringify({...root.userData,bytes:output.byteLength}));
