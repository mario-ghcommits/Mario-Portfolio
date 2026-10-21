import React, {Component, Suspense, lazy, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
const BrainAssembly = lazy(() => import('./MetalScene.jsx')); 
import './style.css';
import SpringIndicator from './SpringIndicator.jsx';

const CityScene = lazy(() => import('./CityScene.jsx'));
const LINKEDIN = 'https://www.linkedin.com/in/mario-lin-0773aa409/';
const SOURCE = 'https://github.com/mario-lindev/Mario-Portfolio';

function Icon({name='arrow', size=20, ...props}) {
  const paths = {
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></>,
    moon: <path d="M20.4 14.2A8.8 8.8 0 0 1 9.8 3.6a8.8 8.8 0 1 0 10.6 10.6Z"/>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
    external: <path d="M7 17 17 7M7 7h10v10"/>,
    reset: <><path d="M4 10a8 8 0 1 1 1.5 7M4 4v6h6"/></>,
    down: <path d="M12 4v16M6 14l6 6 6-6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    pause: <path d="M9 5v14M15 5v14"/>,
    play: <path d="m9 5 10 7-10 7Z"/>,
    award: <><circle cx="12" cy="9" r="5"/><path d="m8 13-1 8 5-3 5 3-1-8M10 9l1.5 1.5L14 8"/></>,
    layers: <path d="m3 8 9-5 9 5-9 5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>,
    math: <path d="M19 4H5l7 8-7 8h14M19 4v3M19 17v3"/>,
    code: <path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>,
    robot: <><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 12v2M16 12v2M9 17h6M1 12v4M23 12v4"/></>,
    ball: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c7 2 7 10.8 0 12.8M18.4 5.6c-7 2-7 10.8 0 12.8"/></>,
    book: <path d="M12 6C9 3 4 4 3 5v15c3-2 6-2 9 0 3-2 6-2 9 0V5c-3-2-6-2-9 1ZM12 6v14"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
class SceneBoundary extends Component {
  state = {failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? this.props.fallback : this.props.children;}
}
function useMotion(){
  const [enabled,setEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = e => setEnabled(!e.matches);
    preference.addEventListener('change',update);
    return () => preference.removeEventListener('change',update);
  },[]);
  useEffect(() => {document.documentElement.dataset.motion = enabled ? 'on' : 'off';},[enabled]);
  return [enabled,setEnabled];
}
function BrainObject({motion}){
  return <div className="brain-object"><SceneBoundary fallback={<span className="brain-fallback">Ideas take shape.</span>}><Suspense fallback={<span className="brain-fallback">Ideas take shape.</span>}><BrainAssembly enabled={motion}/></Suspense></SceneBoundary></div>;
}
function Project({motion}){
  const [separated,setSeparated] = useState(false);
  const [details,setDetails] = useState(false);
  const [resetToken,setResetToken] = useState(0);
  const [topDown,setTopDown] = useState(false);
  const [loadScene,setLoadScene] = useState(false);
  const stage = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {if(entry.isIntersecting){setLoadScene(true);observer.disconnect();}}, {rootMargin:'250px'});
    observer.observe(stage.current);
    return () => observer.disconnect();
  },[]);
  const fallback = <div className="city-fallback"><Icon name="layers" size={64}/><span>Connected systems. One city.</span></div>;
  return <section id="work" className="work-section section-shell">
    <div className="section-intro"><h2>Ideas, made tangible.</h2><p>A prototype city. An engineering challenge.<br className="desktop-break"/> A chance to make the pieces work together.</p></div>
    <article className="project">
      <div className="project-visual" ref={stage}>
        <div className="stage-header"><span>Auquara</span><span>Future City Competition</span></div>
        <div className="city-canvas">
          {loadScene && <SceneBoundary fallback={fallback}><Suspense fallback={fallback}><CityScene separated={separated} motion={motion} resetToken={resetToken} topDown={topDown} onViewChange={setTopDown}/></Suspense></SceneBoundary>}
        </div>
        <div className="stage-footer"><div className="segmented" role="group" aria-label="City visualization"><button aria-pressed={!separated} onClick={() => setSeparated(false)}>Together</button><button aria-pressed={separated} onClick={() => setSeparated(true)}>Exploded view</button><SpringIndicator second={separated} motion={motion}/></div><div className="view-tools"><span className="stage-hint">Drag to rotate. Arrow keys work, too.</span><button className="top-view" onClick={()=>setTopDown(v=>!v)} aria-pressed={topDown} aria-label={topDown?"Show landscape city view":"Show top-down city view"}>{topDown?"Landscape view":"Top view"}</button><button className="reset-view" onClick={()=>{setTopDown(false);setResetToken(v=>v+1);}} aria-label="Reset city view"><Icon name="reset" size={16}/></button></div></div>
      </div>
      <div className="project-summary"><div><h3>Auquara</h3><p>A floating city. A connected future.</p></div><p className="project-description">A floating-city concept imagining a future in which global warming puts Gold Coast, Australia underwater. Created for the Future City Competition, with efficiency and connected systems at its core.</p><button className="round-button" aria-label={details?'Hide Auquara project details':'Explore Auquara project details'} aria-expanded={details} aria-controls="project-details" onClick={() => setDetails(v=>!v)}><Icon name="plus" size={22} className={details?'rotated':''}/></button></div>
      <div className="project-details" id="project-details" hidden={!details}><div><h4>Thinking in systems.</h4><p>The project brought together construction, project management, and systems thinking to imagine a floating city for a future in which global warming puts Gold Coast underwater. Linked districts and floating gardens connect homes, offices, and industry.</p></div><a className="inline-link" href={LINKEDIN} target="_blank" rel="noreferrer">View project on LinkedIn <Icon name="external" size={17}/></a></div>
    </article>
    <div className="recognition"><div className="award-medallion"><Icon name="award" size={30}/></div><div><h3>Excellence in Systems Integration</h3></div><span>Future City Competition</span></div>
    <div className="model-downloads"><a href="/models/auquara.glb" download>Download 3D model (.glb)</a><a href="/models/auquara.scad" download>Download editable CAD (.scad)</a></div>
  </section>;
}
function Interests(){
  const [active,setActive] = useState('robotics');
  const items = {
    robotics:{name:'Robotics',title:'Learning, one build at a time.',description:'Exploring engineering and hardware with FRC Robotics 604 at Leland High School. A place to connect ideas, work with a team, and keep learning.',detail:'FRC Robotics 604 · Hardware',icon:'robot'},
    math:{name:'Mathematics',title:'Enjoying the challenge.',description:'Through Stratford’s Math Club, I scored 22/25 on the AMC 8 in sixth grade (March 2024) and 70/125 on the AMC 10B in seventh grade (November 2024).',detail:'Math Club · AMC 8 · AMC 10B',icon:'math'},
    code:{name:'Code',title:'Another way to solve a problem.',description:'A foundation in Python and Java, early exploration with Arduino, and new ideas through Leland Hackathon Club.',detail:'Python · Java · Arduino basics',icon:'code'},
  };
  const current = items[active];
  return <section className="interests section-shell" aria-labelledby="interests-title"><div className="section-intro"><h2 id="interests-title">Still learning.<br/>Always building.</h2><p>Following my curiosity, from a line<br className="desktop-break"/> of code to something I can hold.</p></div><div className="interest-layout"><div className="interest-menu" role="group" aria-label="Explore interests">{Object.entries(items).map(([key,item])=><button key={key} onClick={()=>setActive(key)} aria-pressed={active===key} aria-controls="interest-panel"><Icon name={item.icon} size={22}/><span>{item.name}</span><Icon name="arrow" size={18}/></button>)}</div><div className="interest-content" id="interest-panel" aria-live="polite"><div className={'interest-symbol '+active} aria-hidden="true">{active==='robotics'?<div className="team-study"><span>604</span><p>FRC Robotics</p></div>:active==='math'?<div className="team-study"><span>22/25</span><p>AMC 8 · Sixth grade</p></div>:<div className="code-object"><span>def <b>build</b>(idea):</span><span>  learn()</span><span>  try_again()</span><span>  <i>return</i> possibility</span></div>}</div><div className="interest-text" key={active}><h3>{current.title}</h3><p>{current.description}</p><span>{current.detail}</span></div></div></div></section>;
}
function useAppearance(){
  const [theme,setTheme]=useState(()=>document.documentElement.dataset.theme||'light');
  useEffect(()=>{document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#111216':'#ffffff');try{localStorage.setItem('mario-appearance',theme);}catch{}},[theme]);
  return [theme,()=>setTheme(v=>v==='dark'?'light':'dark')];
}
function App(){
  const [motion,setMotion] = useMotion();
  const [theme,toggleTheme]=useAppearance();
  return <><a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner"><a href="#" className="wordmark" aria-label="Mario Lin home">Mario Lin<span className="wordmark-dot"/></a><nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#journey">Journey</a></nav><div className="header-actions"><button className="appearance-toggle" onClick={toggleTheme} aria-label={theme==='dark'?'Switch to light appearance':'Switch to dark appearance'} aria-pressed={theme==='dark'} title="Appearance"><Icon name={theme==='dark'?'moon':'sun'} size={17}/><span>{theme==='dark'?'Dark':'Light'}</span></button><a className="nav-connect" href={LINKEDIN} target="_blank" rel="noreferrer">Let’s connect <Icon name="external" size={15}/></a></div></div></header>
    <main id="main">
      <section className="hero section-shell"><div className="hero-main"><div className="hero-copy"><h1>Curiosity.<br/><span>Made tangible.</span></h1><p>I’m Mario. A student exploring engineering,<br className="desktop-break"/> robotics, and the possibilities in between.</p><div className="hero-actions"><a href="#work" className="button-primary">Explore my work <Icon name="arrow" size={18}/></a><a href="#about" className="text-button">A little about me <Icon name="down" size={16}/></a></div></div><div className="hero-art"><BrainObject motion={motion}/><div className="art-caption"><span>Ideas, coming together. Drag to rotate.</span><button className="motion-control" onClick={()=>setMotion(v=>!v)} aria-label={motion?'Pause animations':'Play animations'} aria-pressed={motion}><Icon name={motion?'pause':'play'} size={14}/></button></div></div></div><div className="hero-foot"><span>Leland High School <span className="foot-dot"/> Class of 2030</span><span>San Jose, California</span></div></section>
      <Project motion={motion}/>
      <Interests/>
      <section className="about-section" id="about"><div className="section-shell"><div className="about-heading"><h2>A few things<br/>beyond the build.</h2><p>Different settings. The same instinct<br className="desktop-break"/> to learn, contribute, and connect.</p></div><div className="about-stories"><article><Icon name="ball" size={28}/><h3>Make the assist.</h3><p>Starting point guard and co-captain on Stratford School’s basketball team. Our team placed second among more than 10 teams at the ACDS Cougar Shootout in January 2026.</p><span>Basketball · Teamwork</span></article><article><Icon name="book" size={28}/><h3>Pass it on.</h3><p>Tutoring with Breakthrough Silicon Valley. Making space for someone else to learn, during my October–December 2026 volunteer term.</p><span>Education · Community</span></article></div></div></section>
      <section id="journey" className="journey-section section-shell"><div className="journey-heading"><h2>The story so far.</h2><p>A foundation to keep building on.</p></div><ol className="timeline"><li><div className="timeline-date">2026—2030<span>Expected graduation</span></div><div className="timeline-content"><h3>Leland High School <span className="current-label">Now</span></h3><p>FRC Robotics 604 · Leland Hackathon Club · Key Club</p><span>Engineering, hardware, and new possibilities.</span></div></li><li><div className="timeline-date">2023—2026<span>Middle School Diploma</span></div><div className="timeline-content"><h3>Stratford School</h3><p>Math Club · AMC 8 & AMC 10 · Basketball co-captain</p><span>Python, Java, and an introduction to Arduino.</span></div></li></ol></section>
      <section className="contact-section"><div className="section-shell contact-inner"><div className="contact-monogram" aria-hidden="true">m<span>l.</span></div><h2>What could<br/>we build next?</h2><p>An interesting idea, a new perspective,<br/>or a simple hello. I’d love to hear it.</p><a className="button-primary" href={LINKEDIN} target="_blank" rel="noreferrer">Connect on LinkedIn <Icon name="external" size={18}/></a></div></section>
    </main><footer className="site-footer section-shell"><div className="footer-top"><a href="#" className="wordmark">Mario Lin<span className="wordmark-dot"/></a><span>Always a work in progress.</span><a href="#" className="back-top">Back to top <Icon name="down" size={14}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Mario Lin</span><div><a href={SOURCE} target="_blank" rel="noreferrer">GitHub <Icon name="external" size={12}/></a><a href="https://threeui.com/" target="_blank" rel="noreferrer">ThreeUI inspiration <Icon name="external" size={12}/></a><button onClick={()=>setMotion(v=>!v)} aria-pressed={motion}>Animations {motion?'on':'off'}</button></div></div></footer>
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
