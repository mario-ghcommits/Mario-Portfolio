import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';

const smooth=t=>{const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10);};
// A sculptural brain, rather than a medical model. Two hemispheres are divided
// into sixteen solid pieces; raised winding gyri continue across their seams.
function surface(side,theta,phi,lift=0){
  const fold=.018*Math.sin(theta*23+Math.sin(phi*7)*1.7)*Math.sin(theta);
  const radius=1+fold+lift;
  return new THREE.Vector3(side*(.075+.94*Math.sin(theta)*Math.cos(phi)*radius),.94*Math.cos(theta)*radius*(theta>Math.PI/2?.72:1),1.32*Math.sin(theta)*Math.sin(phi)*radius);
}
function cortex(side,t0,t1,p0,p1){
  const rows=20,columns=24,positions=[],indices=[];
  for(let r=0;r<=rows;r++)for(let c=0;c<=columns;c++)positions.push(...surface(side,t0+(t1-t0)*r/rows,p0+(p1-p0)*c/columns).toArray());
  for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
    const a=r*(columns+1)+c,b=a+columns+1;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  const centerIndex=positions.length/3;positions.push(side*.075,0,0);
  const edges=[];
  for(let c=0;c<=columns;c++)edges.push(c);
  for(let r=1;r<=rows;r++)edges.push(r*(columns+1)+columns);
  for(let c=columns-1;c>=0;c--)edges.push(rows*(columns+1)+c);
  for(let r=rows-1;r>0;r--)edges.push(r*(columns+1));
  for(let i=0;i<edges.length;i++)indices.push(edges[i],centerIndex,edges[(i+1)%edges.length]);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}
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
    const camera=new THREE.OrthographicCamera(-3,3,3,-3,.1,30);camera.position.set(1.5,3.6,5.5);camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xffffff,0x8e9cae,2.3));
    const key=new THREE.DirectionalLight(0xfffaf2,3.2);key.position.set(-3,5,4);scene.add(key);
    const rim=new THREE.DirectionalLight(0xc6deef,2);rim.position.set(3,1,-4);scene.add(rim);
    const porcelain=new THREE.MeshStandardMaterial({color:0xb9cbd5,roughness:.4,metalness:.12,side:THREE.DoubleSide});
    const folds=new THREE.MeshStandardMaterial({color:0xd8e2e6,roughness:.35,metalness:.08});
    const geometries=[],pieces=[];
    for(const side of [-1,1])for(let band=0;band<2;band++)for(let slice=0;slice<4;slice++){
      const t0=band*Math.PI/2+.018,t1=(band+1)*Math.PI/2-.018;
      const p0=-Math.PI/2+slice*Math.PI/4+.014,p1=p0+Math.PI/4-.028;
      const group=new THREE.Group();assembly.add(group);
      const geometry=cortex(side,t0,t1,p0,p1);geometries.push(geometry);group.add(new THREE.Mesh(geometry,porcelain));
      for(let row=0;row<4;row++){
        const theta=t0+(row+.5)*(t1-t0)/4,points=[];
        for(let sample=0;sample<=56;sample++){
          const phi=p0+(p1-p0)*sample/56;
          const winding=theta+(.115*Math.sin(phi*13+row*1.9+band*.8)+.035*Math.sin(phi*23+row*2.6))*Math.sin(Math.PI*sample/56);
          points.push(surface(side,winding,phi,.023));
        }
        const tube=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,.062,8,false);geometries.push(tube);group.add(new THREE.Mesh(tube,folds));
      }
      const direction=surface(side,(t0+t1)/2,(p0+p1)/2).normalize();
      pieces.push({group,direction,order:(slice+(side>0?1:0)+band*2)%5,spin:side*(slice-1.5)*.09});
    }
    // A quiet, fixed angle keeps the form recognizable as the pieces travel.
    assembly.rotation.y=-.06;assembly.rotation.z=-.12;
    let elapsed=enabledRef.current?0:6,frame=0,last=performance.now(),visible=true;
    const draw=()=>{
      const t=elapsed%12;
      for(const {group,direction,order,spin} of pieces){
        const offset=order*.12;
        let spread=t<5?1-smooth((t-offset)/3.7):t<8?0:t<11?smooth((t-8-offset)/2.3):1;
        if(!enabledRef.current&&elapsed===6)spread=0;
        group.position.copy(direction).multiplyScalar(spread*.78);
        group.rotation.set(spread*spin,spread*spin*.7,spread*spin*.4);
      }
      renderer.render(scene,camera);
    };
    const running=()=>enabledRef.current&&visible&&!document.hidden;
    const tick=now=>{frame=0;if(!running())return;const delta=now-last;if(delta>=1000/30){elapsed+=Math.min(delta/1000,.07);last=now;draw();}frame=requestAnimationFrame(tick);};
    const sync=()=>{if(running()){if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}else{cancelAnimationFrame(frame);frame=0;}};
    control.current={sync};
    const resize=()=>{const {width,height}=node.getBoundingClientRect();const aspect=width/Math.max(height,1),extent=Math.max(2.45,2.5/aspect);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();renderer.setSize(width,height);draw();sync();};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(node);
    const resizer=new ResizeObserver(resize);resizer.observe(node);document.addEventListener('visibilitychange',sync);resize();
    return()=>{cancelAnimationFrame(frame);control.current=null;observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',sync);geometries.forEach(g=>g.dispose());porcelain.dispose();folds.dispose();renderer.dispose();node.removeChild(renderer.domElement);};
  },[]);
  return <div ref={host} className="brain-sculpture">{failed&&<span className="brain-fallback">Ideas take shape.</span>}</div>;
}
