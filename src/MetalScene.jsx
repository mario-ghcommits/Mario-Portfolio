import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';

import {createBrainModel} from './brainModel.js';
import {stepSpring,projectVelocity,clamp,rubberband} from './physics.js';

const smooth=t=>{const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10);};
export default function BrainAssembly({enabled}){
  const host=useRef(null),enabledRef=useRef(enabled),control=useRef(null);
  const [failed,setFailed]=useState(false);enabledRef.current=enabled;
  useEffect(()=>{control.current?.sync();},[enabled]);
  useEffect(()=>{
    const node=host.current;
    let renderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});}catch{setFailed(true);return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0xffffff,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    renderer.domElement.setAttribute('aria-hidden','true');node.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),assembly=new THREE.Group();scene.add(assembly);
    const camera=new THREE.OrthographicCamera(-3,3,3,-3,.1,30);camera.position.set(4,2.5,5.5);camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xffffff,0xa98796,1.9));
    const key=new THREE.DirectionalLight(0xfffaf2,2.7);key.position.set(-3,5,4);scene.add(key);
    const rim=new THREE.DirectionalLight(0xffd9e2,1.5);rim.position.set(3,1,-4);scene.add(rim);
    const model=createBrainModel();assembly.add(model.root);
    const pieces=model.pieces;
    let yaw={value:0,velocity:0},pitch={value:0,velocity:0},yawTarget=0,pitchTarget=0,gesture=null;
    assembly.rotation.y=-.1;assembly.rotation.z=-.08;
    let elapsed=6,frame=0,last=performance.now(),visible=true;
    const draw=()=>{
      const t=elapsed%12;
      for(const {group,direction,order,spin} of pieces){
        const offset=order*.055;
        let spread=t<5?1-smooth((t-offset)/3.7):t<8?0:t<11?smooth((t-8-offset)/2.3):1;
        if(!enabledRef.current&&elapsed===6)spread=0;
        group.position.copy(direction).multiplyScalar(spread*.62);
        group.rotation.set(spread*spin,spread*spin*.7,spread*spin*.4);
      }
      assembly.rotation.y=-.1+yaw.value;assembly.rotation.x=pitch.value;
      renderer.render(scene,camera);
    };
    const running=()=>visible&&!document.hidden;
    const moving=()=>Math.abs(yaw.value-yawTarget)+Math.abs(pitch.value-pitchTarget)+Math.abs(yaw.velocity)+Math.abs(pitch.velocity)>.0001;
    const tick=now=>{
      frame=0;if(!running())return;
      const dt=Math.min((now-last)/1000,.05);last=now;
      if(enabledRef.current)elapsed+=dt;
      if(!gesture){yaw=stepSpring(yaw,yawTarget,dt,.4,1);pitch=stepSpring(pitch,pitchTarget,dt,.4,1);}
      draw();if(enabledRef.current||moving())frame=requestAnimationFrame(tick);
    };
    const sync=()=>{if(running()&&(enabledRef.current||moving())){if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}else{cancelAnimationFrame(frame);frame=0;}};
    const down=e=>{if(e.button!==0||gesture)return;node.setPointerCapture(e.pointerId);gesture={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:yaw.value,pitch:pitch.value,touch:e.pointerType==='touch',committed:false,history:[{t:e.timeStamp,yaw:yaw.value,pitch:pitch.value}]};node.dataset.dragging='true';};
    const move=e=>{
      if(!gesture||e.pointerId!==gesture.id)return;
      const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
      if(!gesture.committed){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;if(gesture.touch&&Math.abs(dy)>Math.abs(dx)){finish(e,true);return;}gesture.committed=true;}
      yaw.value=gesture.yaw+dx/node.clientWidth*Math.PI*1.4;
      const target=gesture.pitch+dy/node.clientHeight*1.3;
      pitch.value=gesture.touch?gesture.pitch:Math.abs(target)>.7?Math.sign(target)*(.7+rubberband(Math.abs(target)-.7,.25)):target;
      gesture.history.push({t:e.timeStamp,yaw:yaw.value,pitch:pitch.value});gesture.history=gesture.history.filter(p=>e.timeStamp-p.t<=90).slice(-8);draw();
    };
    const finish=(e,cancelled=false)=>{
      if(!gesture||e.pointerId!==gesture.id)return;
      const history=gesture.history,first=history[0],last=history.at(-1),dt=Math.max((last.t-first.t)/1000,.008);
      const fresh=gesture.committed&&!cancelled&&e.timeStamp-last.t<100&&enabledRef.current;
      yaw.velocity=fresh?(last.yaw-first.yaw)/dt:0;pitch.velocity=fresh?(last.pitch-first.pitch)/dt:0;
      yawTarget=yaw.value+projectVelocity(yaw.velocity);pitchTarget=clamp(pitch.value+projectVelocity(pitch.velocity),-.7,.7);
      gesture=null;delete node.dataset.dragging;if(node.hasPointerCapture(e.pointerId))node.releasePointerCapture(e.pointerId);sync();
    };
    const up=e=>finish(e),cancel=e=>finish(e,true);
    const onKey=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){yawTarget=0;pitchTarget=0;}else if(e.key==='ArrowLeft')yawTarget-=.2;else if(e.key==='ArrowRight')yawTarget+=.2;else pitchTarget=clamp(pitchTarget+(e.key==='ArrowUp'?-.15:.15),-.7,.7);sync();};
    node.addEventListener('pointerdown',down);node.addEventListener('pointermove',move);node.addEventListener('pointerup',up);node.addEventListener('pointercancel',cancel);node.addEventListener('lostpointercapture',cancel);node.addEventListener('keydown',onKey);
    control.current={sync};
    const resize=()=>{const {width,height}=node.getBoundingClientRect();const aspect=width/Math.max(height,1),extent=Math.max(2.1,2.15/aspect);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();renderer.setSize(width,height);draw();sync();};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(node);
    const resizer=new ResizeObserver(resize);resizer.observe(node);document.addEventListener('visibilitychange',sync);resize();
    return()=>{cancelAnimationFrame(frame);control.current=null;observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',sync);node.removeEventListener('pointerdown',down);node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',up);node.removeEventListener('pointercancel',cancel);node.removeEventListener('lostpointercapture',cancel);node.removeEventListener('keydown',onKey);model.dispose();renderer.dispose();node.removeChild(renderer.domElement);};
  },[]);
  return <div ref={host} className="brain-sculpture" tabIndex={0} role="img" aria-label="Interactive brain puzzle. Drag to rotate, use arrow keys to turn, or press Home to reset.">{failed&&<span className="brain-fallback">Ideas take shape.</span>}</div>;
}
