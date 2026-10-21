// Web adaptation of Pegasus Brain3D.tsx. Copyright (c) 2024 Pegasus Contributors.
// MIT license and original implementation: ./vendor/pegasus/.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
export async function loadBrainModel(){
  const gltf=await new GLTFLoader().loadAsync('/models/brain-puzzle.glb');
  const root=gltf.scene,pieces=[],materials=new Set(),geometries=new Set();
  root.traverse(mesh=>{
    if(!mesh.isMesh)return;
    geometries.add(mesh.geometry);
    const original=mesh.material;mesh.material=original.clone();materials.add(mesh.material);
    if(!mesh.userData.fixed){
      mesh.material.transparent=false;mesh.material.depthWrite=true;
      pieces.push({group:mesh,rest:mesh.position.clone(),rank:mesh.userData.rank,approach:new THREE.Vector3(...mesh.userData.approach),bend:new THREE.Vector3(...mesh.userData.bend)});
    }
  });
  pieces.sort((a,b)=>a.rank-b.rank);
  pieces.forEach((p,i)=>p.rank=i);
  return {root,pieces,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
const pieceStart=rank=>rank*.095+Math.sin(rank*2.4)*.025;
export function brainTimeline(count){
  const stagger=.095,arrival=1.4,fillEnd=pieceStart(count-1)+arrival,hold=1,reset=0;
  return {stagger,arrival,fillEnd,hold,reset,cycle:fillEnd+hold+reset};
}
export function topPieceState(time,rank,count){
  const timing=brainTimeline(count),t=((time%timing.cycle)+timing.cycle)%timing.cycle;
  const smooth=t=>{const x=THREE.MathUtils.clamp(t,0,1);return THREE.MathUtils.clamp(x*x*x*(x*(x*6-15)+10),0,1);};
  const local=t-pieceStart(rank);
  if(local<0)return {visible:false,travel:1,opacity:0};
  return {visible:true,travel:1-smooth(local/timing.arrival),opacity:1};
}
