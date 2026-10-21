import React, {useEffect, useRef, useState} from 'react';
import {VELOX_VERTEX_SHADER, VELOX_FRAGMENT_SHADER} from './vendor/liquidFormShaders.js';

// ThreeUI's MIT-licensed LiquidForm renderer adapted for a continuous, pausable clock.
// Copyright (c) 2026 Meng To. Original notice: ./vendor/THREEUI-LICENSE.txt.
export default function ThreeUILiquidForm({enabled}) {
  const host = useRef(null);
  const canvas = useRef(null);
  const enabledRef = useRef(enabled);
  const controller = useRef(null);
  const [failed,setFailed] = useState(false);
  enabledRef.current = enabled;

  useEffect(() => {
    controller.current?.sync();
  },[enabled]);

  useEffect(() => {
    const node=canvas.current, container=host.current;
    const gl=node.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
    if(!gl){setFailed(true);return;}
    const shaders=[];
    let program=null,buffer=null;
    function compile(kind,source){
      const shader=gl.createShader(kind);shaders.push(shader);
      gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error('Unable to compile ThreeUI material study');
      return shader;
    }
    try {
      const vertex=compile(gl.VERTEX_SHADER,VELOX_VERTEX_SHADER);
      const fragment=compile(gl.FRAGMENT_SHADER,VELOX_FRAGMENT_SHADER);
      program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Unable to initialize ThreeUI material study');
      gl.useProgram(program);
      buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'a_pos');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    } catch {
      shaders.forEach(shader=>gl.deleteShader(shader));if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);setFailed(true);return;
    }
    const uniform = Object.fromEntries(['res','time','mouse','morph','noise_scale','mouse_amount','metal','camera'].map(name=>[name,gl.getUniformLocation(program,'u_'+name)]));
    let frame=0,visible=true,lastTime=performance.now(),elapsed=0;
    let targetX=0,targetY=0,mouseX=0,mouseY=0;
    const draw=()=>{
      gl.uniform2f(uniform.res,node.width,node.height);gl.uniform1f(uniform.time,elapsed*.23);
      gl.uniform2f(uniform.mouse,mouseX,mouseY);gl.uniform1f(uniform.morph,.65);gl.uniform1f(uniform.noise_scale,.8);
      gl.uniform1f(uniform.mouse_amount,.12);gl.uniform1f(uniform.metal,1.15);gl.uniform1f(uniform.camera,5.5);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    };
    const shouldRun=()=>enabledRef.current && visible && !document.hidden;
    const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;};
    const tick=now=>{
      frame=0;
      if(!shouldRun())return;
      const delta=now-lastTime;
      if(delta>=1000/30){
        elapsed+=Math.min(delta/1000,.06);lastTime=now;
        mouseX+=(targetX-mouseX)*.12;mouseY+=(targetY-mouseY)*.12;draw();
      }
      frame=requestAnimationFrame(tick);
    };
    const sync=()=>{
      if(shouldRun()){if(!frame){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
      else stop();
    };
    controller.current={sync};
    const resize=()=>{
      const rect=container.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.5);
      node.width=Math.max(1,Math.round(rect.width*ratio));node.height=Math.max(1,Math.round(rect.height*ratio));
      gl.viewport(0,0,node.width,node.height);draw();sync();
    };
    const pointer=event=>{if(!enabledRef.current)return;const rect=node.getBoundingClientRect();targetX=(event.clientX-rect.left)/Math.max(rect.width,1)*2-1;targetY=-((event.clientY-rect.top)/Math.max(rect.height,1)*2-1);};
    const leave=()=>{targetX=0;targetY=0;};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(container);
    const resizer=new ResizeObserver(resize);resizer.observe(container);
    document.addEventListener('visibilitychange',sync);
    node.addEventListener('pointermove',pointer,{passive:true});node.addEventListener('pointerleave',leave);
    resize();
    return ()=>{
      stop();controller.current=null;observer.disconnect();resizer.disconnect();document.removeEventListener('visibilitychange',sync);
      node.removeEventListener('pointermove',pointer);node.removeEventListener('pointerleave',leave);
      gl.deleteBuffer(buffer);shaders.forEach(shader=>gl.deleteShader(shader));gl.deleteProgram(program);
    };
  },[]);
  return <div className="liquid-sculpture" ref={host}>{failed?<div className="metal-fallback"/>:<canvas ref={canvas}/>}</div>;
}
