import React, {useEffect, useRef} from 'react';
import {stepSpring} from './physics.js';

export default function SpringIndicator({second, motion}) {
  const node = useRef(null);
  const spring = useRef({value:second?100:0,velocity:0});
  useEffect(() => {
    let frame = 0, previous = performance.now();
    const target = second?100:0;
    const render = now => {
      const delta = Math.min((now-previous)/1000,.05);previous=now;
      spring.current = motion ? stepSpring(spring.current,target,delta,.3,1) : {value:target,velocity:0};
      node.current.style.transform = `translateX(${spring.current.value}%)`;
      if(Math.abs(target-spring.current.value)>.02 || Math.abs(spring.current.velocity)>.02)frame=requestAnimationFrame(render);
    };
    frame=requestAnimationFrame(render);
    return()=>cancelAnimationFrame(frame);
  },[second,motion]);
  return <span ref={node} className="segment-indicator" aria-hidden="true"/>;
}
