import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {stepSpring, projectVelocity, rubberband, clamp} from './physics.js';

// Geometric study of connected systems, not a recreation of the competition model.
export default function CityScene({separated, motion, resetToken}){
  const host = useRef(null);
  const options = useRef({separated,motion});
  options.current={separated,motion};
  const requestFrame=useRef(()=>{});
  useEffect(()=>{requestFrame.current();},[separated,motion]);
  const resetView=useRef(()=>{});
  useEffect(()=>{resetView.current();},[resetToken]);
  useEffect(()=>{
    const root=host.current;
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-6,6,4.2,-4.2,.1,100);
    camera.position.set(9,9,12);camera.lookAt(0,.3,0);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
    renderer.setClearColor(0x000000,0);
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    renderer.domElement.setAttribute('aria-hidden','true');root.appendChild(renderer.domElement);
    const world=new THREE.Group();scene.add(world);
    scene.add(new THREE.HemisphereLight(0xffffff,0xc9d3e1,3.2));
    const sun=new THREE.DirectionalLight(0xffffff,4.5);sun.position.set(-4,10,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.04;scene.add(sun);
    const materials={base:new THREE.MeshStandardMaterial({color:0xe5e9e9,roughness:.65}),white:new THREE.MeshStandardMaterial({color:0xfafbf9,roughness:.35}),glass:new THREE.MeshStandardMaterial({color:0x9cafb9,metalness:.25,roughness:.23}),road:new THREE.MeshStandardMaterial({color:0xd1d7da,roughness:1}),green:new THREE.MeshStandardMaterial({color:0x8fa992,roughness:.8}),water:new THREE.MeshStandardMaterial({color:0x91b6c4,metalness:.15,roughness:.25}),accent:new THREE.MeshStandardMaterial({color:0x406b8b,metalness:.35,roughness:.3})};
    const geometries=[];
    function box(w,h,d,mat,x,y,z,parent=world){const geometry=new THREE.BoxGeometry(w,h,d);geometries.push(geometry);const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    const baseGroup=new THREE.Group(),greenGroup=new THREE.Group(),buildingGroup=new THREE.Group();world.add(baseGroup,greenGroup,buildingGroup);
    box(6.5,.2,5.3,materials.base,0,0,0,baseGroup);
    box(6.2,.025,.24,materials.road,0,.115,.15,baseGroup);box(.25,.025,4.9,materials.road,-.3,.12,0,baseGroup);
    box(.5,.03,4.95,materials.water,2.65,.125,0,baseGroup);
    box(2.1,.045,.9,materials.green,-1.55,.15,1.7,greenGroup);
    box(1.5,.045,1.2,materials.green,1.05,.15,-1.7,greenGroup);
    const specs=[[-2.15,-1.6,.85,1.35,.8],[-1.1,-1.6,.7,2.1,.8],[-2.15,-.5,.8,.7,.65],[-1.1,-.5,.65,1.1,.65],[.5,-.9,.8,2.6,.85],[1.5,-.8,.7,1.55,.7],[.5,.95,.85,.8,.8],[1.65,1.05,.8,1.35,.9]];
    specs.forEach(([x,z,w,h,d],index)=>{const material=index===4?materials.glass:materials.white;box(w,h,d,material,x,h/2+.15,z,buildingGroup);box(w+.03,.055,d+.03,materials.white,x,h+.18,z,buildingGroup);for(let level=.45;level<h;level+=.36){box(w+.012,.04,d+.012,index===4?materials.white:materials.glass,x,level+.12,z,buildingGroup);}if(index===1)box(.12,.45,.12,materials.accent,x,h+.4,z,buildingGroup);});
    const sphereGeo=new THREE.SphereGeometry(.17,16,12);geometries.push(sphereGeo);
    [[-2.3,1.5],[-1.8,1.9],[-1.1,1.5],[1,-1.8],[1.6,-1.7],[2.15,1.9]].forEach(([x,z])=>{box(.05,.25,.05,materials.glass,x,.3,z,greenGroup);const tree=new THREE.Mesh(sphereGeo,materials.green);tree.position.set(x,.52,z);tree.castShadow=true;greenGroup.add(tree);});
    const floorGeo=new THREE.PlaneGeometry(200,200);geometries.push(floorGeo);const floor=new THREE.Mesh(floorGeo,new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.18;floor.receiveShadow=true;scene.add(floor);
    let frame=0,visible=true,previous=performance.now();
    let layer={value:0,velocity:0}, yaw={value:0,velocity:0}, pitch={value:0,velocity:0};
    let yawTarget=0,pitchTarget=0,rotationDamping=1,gesture=null;
    const bounds={yaw:.9,pitch:.24};
    const constrain=(value,limit)=>{
      if(value>limit)return limit+rubberband(value-limit,.4);
      if(value<-limit)return -limit+rubberband(value+limit,.4);
      return value;
    };
    const draw=()=>{
      buildingGroup.position.y=layer.value*.85;buildingGroup.position.x=layer.value*.25;
      greenGroup.position.y=layer.value*.35;baseGroup.position.y=-layer.value*.35;
      world.rotation.y=yaw.value;world.rotation.x=pitch.value;renderer.render(scene,camera);
    };
    const resize=()=>{
      const {width,height}=root.getBoundingClientRect();const aspect=width/Math.max(height,1);const extent=width<500?5.05:4.4;
      camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();
      renderer.setSize(width,height);draw();
    };
    const moving=(spring,target)=>Math.abs(spring.value-target)>.0001||Math.abs(spring.velocity)>.0001;
    const render=now=>{
      frame=0;if(!visible||document.hidden)return;
      const dt=Math.min((now-previous)/1000,.05);previous=now;const target=options.current.separated?1:0;
      layer=options.current.motion?stepSpring(layer,target,dt,.4,1):{value:target,velocity:0};
      if(!gesture){
        yaw=options.current.motion?stepSpring(yaw,yawTarget,dt,.4,rotationDamping):{value:yawTarget,velocity:0};
        pitch=options.current.motion?stepSpring(pitch,pitchTarget,dt,.4,rotationDamping):{value:pitchTarget,velocity:0};
      }
      draw();
      if(moving(layer,target)||(!gesture&&(moving(yaw,yawTarget)||moving(pitch,pitchTarget))))frame=requestAnimationFrame(render);
    };
    const start=()=>{if(!frame&&visible&&!document.hidden){previous=performance.now();frame=requestAnimationFrame(render);}};
    const reset=()=>{yawTarget=0;pitchTarget=0;rotationDamping=1;start();};
    requestFrame.current=start;resetView.current=reset;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else if(frame){cancelAnimationFrame(frame);frame=0;}});observer.observe(root);
    const resizer=new ResizeObserver(()=>{resize();start();});resizer.observe(root);
    const down=event=>{
      if(event.button!==0 || gesture)return;
      root.setPointerCapture(event.pointerId);
      gesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,yaw:yaw.value,pitch:pitch.value,width:root.clientWidth,touch:event.pointerType==='touch',committed:false,history:[{t:event.timeStamp,yaw:yaw.value,pitch:pitch.value}]};
      root.dataset.dragging='true';
    };
    const move=event=>{
      if(!gesture||event.pointerId!==gesture.id)return;
      const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;
      if(!gesture.committed){
        if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
        if(gesture.touch&&Math.abs(dy)>Math.abs(dx)){cancel(event);return;}
        gesture.committed=true;
      }
      yaw.value=constrain(gesture.yaw+dx/Math.max(gesture.width,1)*Math.PI,bounds.yaw);
      pitch.value=gesture.touch?gesture.pitch:constrain(gesture.pitch+dy/Math.max(root.clientHeight,1)*.8,bounds.pitch);
      gesture.history.push({t:event.timeStamp,yaw:yaw.value,pitch:pitch.value});
      gesture.history=gesture.history.filter(sample=>event.timeStamp-sample.t<=90).slice(-8);
      draw();
    };
    const finish=(event,cancelled=false)=>{
      if(!gesture||event.pointerId!==gesture.id)return;
      const current=gesture;
      if(current.committed&&!cancelled&&current.history.length>1&&options.current.motion){
        const first=current.history[0],last=current.history.at(-1),dt=Math.max((last.t-first.t)/1000,.008);
        const fresh=event.timeStamp-last.t<100;
        yaw.velocity=fresh?(last.yaw-first.yaw)/dt:0;pitch.velocity=fresh?(last.pitch-first.pitch)/dt:0;
        yawTarget=clamp(yaw.value+projectVelocity(yaw.velocity),-bounds.yaw,bounds.yaw);
        pitchTarget=clamp(pitch.value+projectVelocity(pitch.velocity),-bounds.pitch,bounds.pitch);
        rotationDamping=Math.abs(yaw.velocity)+Math.abs(pitch.velocity)>.1?.8:1;
      }else{
        yawTarget=clamp(yaw.value,-bounds.yaw,bounds.yaw);pitchTarget=clamp(pitch.value,-bounds.pitch,bounds.pitch);
        yaw.velocity=0;pitch.velocity=0;rotationDamping=1;
      }
      gesture=null;delete root.dataset.dragging;
      if(root.hasPointerCapture(event.pointerId))root.releasePointerCapture(event.pointerId);
      start();
    };
    const cancel=event=>finish(event,true);
    const up=event=>finish(event);
    const key=event=>{
      const amount=.15;
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
      event.preventDefault();rotationDamping=1;
      if(event.key==='Home'){reset();return;}
      if(event.key==='ArrowLeft')yawTarget=clamp(yawTarget-amount,-bounds.yaw,bounds.yaw);
      if(event.key==='ArrowRight')yawTarget=clamp(yawTarget+amount,-bounds.yaw,bounds.yaw);
      if(event.key==='ArrowUp')pitchTarget=clamp(pitchTarget-amount,-bounds.pitch,bounds.pitch);
      if(event.key==='ArrowDown')pitchTarget=clamp(pitchTarget+amount,-bounds.pitch,bounds.pitch);
      start();
    };
    const visibility=()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else start();};
    root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move);root.addEventListener('pointerup',up);root.addEventListener('pointercancel',cancel);root.addEventListener('lostpointercapture',cancel);root.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
    resize();start();
    return()=>{
      cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();requestFrame.current=()=>{};resetView.current=()=>{};
      root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',up);root.removeEventListener('pointercancel',cancel);root.removeEventListener('lostpointercapture',cancel);root.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);
      geometries.forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());floor.material.dispose();renderer.dispose();root.removeChild(renderer.domElement);
    };
  },[]);
  return <div ref={host} className="city-scene" tabIndex={0} role="img" aria-label="Interactive conceptual city. Drag to rotate, use arrow keys to adjust, or press Home to reset."/>;
}
