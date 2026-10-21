import * as THREE from 'three';

// Photo-derived proportions. The 190 × 380 mm footprint is a nominal editable scale,
// not a measurement. +Y points toward the three satellite modules in IMG_1315.
export const AUQUARA_DESIGN = {
  name: 'Auquara — photo reconstruction',
  version: 2,
  units: 'millimeters',
  nominalBase: {width:190,length:380,thickness:4,supportHeight:20},
  provenance: 'Reconstructed by visual interpretation of IMG_1345, IMG_1316, IMG_1315, and IMG_1296. Hidden geometry and dimensions are estimated. Original photos are not distributed.',
  completion: 'Unfinished brown tower roofs, the quartered satellite roof, and outlined satellite volumes are inferred as a finished design. Intentional circular and courtyard openings are preserved.',
  palette: {base:'#7896a6',paving:'#82898d',road:'#3e474a',roadFill:'#b0b8b9',blue:'#5e9ebd',lightBlue:'#8bb8ca',white:'#e9e6da',gray:'#8b9290',brown:'#9b805e',darkBrown:'#685746',tan:'#c2a36d',green:'#6e8b5a'},
  parts: [],
};
const parts=AUQUARA_DESIGN.parts;
const radians=angle=>angle*Math.PI/180;
const polar=(radius,angle)=>[Math.cos(radians(angle))*radius,Math.sin(radians(angle))*radius];
const add=(id,name,layer,material,shape,height,x=0,y=0,z=24,rotation=0)=>parts.push({id,name,layer,material,shape,height,position:[x,y,z],rotation});
const rect=(width,depth,chamfer=0)=>({kind:'rectangle',width,depth,chamfer});
const disk=radius=>({kind:'circle',radius});
const ring=(inner,outer)=>({kind:'ring',inner,outer});
const sector=(inner,outer,start,end)=>({kind:'sector',inner,outer,start,end});

add('board','Painted blue rectangular display board','base','base',rect(190,380),4,0,0,20);
for(const [i,x,y] of [[1,-82,-177],[2,82,-177],[3,-82,177],[4,82,177]])add('support-'+i,'Blue platform support '+i,'base','blue',rect(9,11),20,x,y,0);
add('city-disc','Circular central city district','network','paving',disk(88),1.2,0,0,24);
for(const radius of [27,48,85])add('ring-route-'+radius,'Concentric route marking','network','road',ring(radius-.42,radius+.42),.18,0,0,25.22);
for(const angle of [0,45,90,135,180,225,270,315]){
  const [x,y]=polar(54,angle);
  add('radial-route-'+angle,'Radial route marking','network','road',rect(57,.7),.18,x,y,25.24,angle);
}
for(const [i,x,y] of [[1,-61,145],[2,0,148],[3,61,145],[4,-43,-147],[5,45,-147]]){
  const length=Math.hypot(x,y)-86;
  const angle=Math.atan2(y,x)*180/Math.PI;
  const [cx,cy]=polar(86+length/2,angle);
  add('satellite-link-edge-'+i,'Satellite connecting route outline '+i,'network','road',rect(length,3.1),.2,cx,cy,24.03,angle);
  add('satellite-link-'+i,'Satellite connecting route '+i,'network','roadFill',rect(length,1.9),.22,cx,cy,24.25,angle);
}
for(const [index,start,end] of [[1,43,132],[2,205,252]])add('inner-landscape-'+index,'Small inner green arc '+index,'network','green',sector(29,34,start,end),.28,0,0,25.3);

// Three blue curved tower volumes, grouped on one side of the circular district.
for(const [i,angle,height,span] of [[1,128,50,31],[2,77,53,33],[3,17,48,31]]){
  add('blue-tower-'+i,'Curved blue tower '+i,'buildings','blue',sector(62,84,angle-span/2,angle+span/2),height,0,0,25.3);
  add('blue-roof-'+i,'Pale blue roof '+i,'buildings','lightBlue',sector(62,84,angle-span/2,angle+span/2),.8,0,0,25.3+height);
}
// Brown shells from the photos, completed with inferred ceiling/roof slabs.
for(const [i,angle,height] of [[1,45,55],[2,207,45],[3,263,52],[4,320,49]]){
  const [x,y]=polar(70,angle);
  add('brown-floor-'+i,'Open tower floor '+i,'buildings','darkBrown',rect(23,26,2),1.3,x,y,25.3,angle-90);
  add('brown-tower-'+i,'Open brown tower '+i,'buildings','brown',{kind:'courtyard',width:23,depth:26,wall:1.7,chamfer:2},height,x,y,26.6,angle-90);
  add('brown-roof-'+i,'Inferred finished tower roof '+i,'buildings','brown',rect(23,26,2),1.5,x,y,26.6+height,angle-90);
  parts.at(-1).inferred=true;
}
// Long pale buildings form diagonal spokes toward the center.
for(const [i,angle,height] of [[1,133,36],[2,48,39],[3,228,31],[4,313,35]]){
  const [x,y]=polar(43,angle);
  add('white-spoke-'+i,'White radial building '+i,'buildings','white',rect(46,13,1.5),height,x,y,25.3,angle);
}
// Low gray buildings have the square roof openings visible in the top views.
for(const [i,angle] of [[1,181],[2,355],[3,279]]){
  const [x,y]=polar(65,angle);
  add('gray-court-floor-'+i,'Gray courtyard floor '+i,'buildings','road',rect(23,25,1),1,x,y,25.3,angle-90);
  add('gray-court-wall-'+i,'Gray courtyard walls '+i,'buildings','gray',{kind:'courtyard',width:23,depth:25,wall:1.5,chamfer:1},20,x,y,26.3,angle-90);
  add('gray-court-roof-'+i,'Gray roof with square opening '+i,'buildings','gray',{kind:'roofOpening',width:23,depth:25,holeWidth:9,holeDepth:10,chamfer:1},1.5,x,y,46.3,angle-90);
}
// Pale low perimeter strips follow the main circular footprint.
for(const [i,start,end] of [[1,157,182],[2,345,370],[3,248,268],[4,95,109]])add('perimeter-wall-'+i,'Curved white perimeter building '+i,'buildings','white',sector(87,91,start,end),9,0,0,25.3);

// Rounded central buildings and the small blue triangular infill.
for(const [i,angle,height] of [[1,24,24],[2,145,30],[3,267,21]]){
  const [x,y]=polar(5,angle);
  add('central-petal-'+i,'Rounded central building '+i,'buildings','white',sector(0,16,angle-42,angle+42),height,x,y,25.3);
}
add('central-tan-infill','Small tan central infill','buildings','tan',sector(0,7,272,338),13,0,0,25.3);
add('blue-triangle','Blue triangular infill','buildings','blue',{kind:'polygon',points:[[-9,-8],[10,-8],[0,11]]},20,-35,17,25.3,12);
add('inner-white-block','Offset white inner building','buildings','white',{kind:'polygon',points:[[-10,-10],[9,-10],[12,4],[3,13],[-10,9]]},31,12,34,25.3,-12);

// Three modules at one end of the display board.
add('satellite-d','D-shaped gray satellite with round opening','buildings','gray',{kind:'dShape',radius:24,back:12,holeRadius:7,holeX:7},28,-61,145,24,0);
add('satellite-d-rail-white','White rail beside D-shaped module','buildings','white',rect(6,47),29,-83,145,24);
add('satellite-d-rail-blue','Blue rail beside D-shaped module','buildings','lightBlue',rect(5,44),25,-91,145,24);
add('satellite-u','White slotted cylindrical satellite','buildings','white',{kind:'uShape',radius:18,slot:7,notchBottom:-4},25,0,148,24);
for(const [i,start,color] of [[1,0,'gray'],[2,90,'tan'],[3,180,'gray'],[4,270,'tan']])add('satellite-quarter-'+i,'Two-tone quartered circular satellite '+i,'buildings',color,sector(1.2,30,start+1.6,start+88.4),16,61,145,24);

// The opposite end has an open quartered module and a low segmented circular pad.
add('open-satellite-floor','Open quartered satellite floor','buildings','darkBrown',disk(33),1,-43,-147,24);
add('open-satellite-ring','Open quartered satellite outer wall','buildings','brown',ring(31,33),22,-43,-147,25);
add('open-satellite-divider-x','Quartered satellite partition','buildings','brown',rect(64,1.8),22,-43,-147,25);
add('open-satellite-divider-y','Quartered satellite partition','buildings','brown',rect(1.8,64),22,-43,-147,25);
add('open-satellite-blue-floor','Blue lower quadrant','buildings','blue',sector(1.6,30,185,265),.5,-43,-147,25.1);
add('open-satellite-white-roof','Pale roof over one quadrant','buildings','white',sector(1.4,33,94,176),1.4,-43,-147,47);
for(const [i,start] of [[1,4],[2,184],[3,274]]){
  add('completed-quarter-roof-'+i,'Inferred quartered satellite ceiling '+i,'buildings',i===2?'white':'brown',sector(1.4,33,start,start+82),1.4,-43,-147,47);
  parts.at(-1).inferred=true;
}
add('flat-satellite','Low segmented circular satellite','network','gray',disk(32),2.2,45,-147,24);
add('flat-satellite-edge','Circular satellite rim marking','network','road',ring(31,31.4),.15,45,-147,26.21);
add('flat-satellite-line-y','Circular pad longitudinal marking','network','road',rect(.6,63),.15,49,-147,26.23);
add('flat-satellite-line-x','Circular pad cross marking','network','road',rect(60,.6),.15,45,-145,26.24);
add('flat-satellite-line-y2','Circular pad parallel marking','network','road',rect(.6,56),.15,61,-147,26.25);


// Complete the drawn parcels on the flat circular satellite. Clip each footprint
// to the disk so the inferred masses retain the photographed circular outline.
function clippedParcel(minX,maxX,minY,maxY){
  let polygon=Array.from({length:96},(_,i)=>polar(30,i*360/96));
  for(const [axis,bound,above] of [[0,minX,true],[0,maxX,false],[1,minY,true],[1,maxY,false]]){
    const input=polygon;polygon=[];
    for(let i=0;i<input.length;i++){
      const a=input[i],b=input[(i+1)%input.length];
      const inside=p=>above?p[axis]>=bound:p[axis]<=bound;
      if(inside(a))polygon.push(a);
      if(inside(a)!==inside(b)){const t=(bound-a[axis])/(b[axis]-a[axis]);polygon.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
    }
  }
  return {kind:'polygon',points:polygon};
}
for(const [i,x0,x1,y0,y1,height] of [
  [1,-30,3.2,-30,1.2,11],[2,-30,3.2,2.8,30,14],
  [3,4.8,15.2,-30,1.2,18],[4,4.8,15.2,2.8,30,13],
  [5,16.8,30,-30,-10.8,12],[6,16.8,30,-9.2,10.2,16],[7,16.8,30,11.8,30,10],
]){
  add('inferred-parcel-'+i,'Inferred outlined satellite building '+i,'buildings',i%3===0?'white':'gray',clippedParcel(x0,x1,y0,y1),height,45,-147,26.4);
  parts.at(-1).inferred=true;
}

export function outline(shape,segments=64) {
  const arc=(radius,start=0,end=360)=>{const count=Math.max(2,Math.ceil((end-start)/360*segments));return Array.from({length:count+1},(_,i)=>polar(radius,start+(end-start)*i/count));};
  const rectangle=(w,d,c=0)=>c?[[w/2-c,d/2],[-w/2+c,d/2],[-w/2,d/2-c],[-w/2,-d/2+c],[-w/2+c,-d/2],[w/2-c,-d/2],[w/2,-d/2+c],[w/2,d/2-c]]:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
  switch(shape.kind){
    case 'rectangle':return {outer:rectangle(shape.width,shape.depth,shape.chamfer),holes:[]};
    case 'circle':return {outer:arc(shape.radius).slice(0,-1),holes:[]};
    case 'ring':return {outer:arc(shape.outer).slice(0,-1),holes:[arc(shape.inner).slice(0,-1)]};
    case 'sector':return {outer:[...arc(shape.outer,shape.start,shape.end),...(shape.inner?arc(shape.inner,shape.start,shape.end).reverse():[[0,0]])],holes:[]};
    case 'polygon':return {outer:shape.points,holes:[]};
    case 'courtyard':return {outer:rectangle(shape.width,shape.depth,shape.chamfer),holes:[rectangle(shape.width-shape.wall*2,shape.depth-shape.wall*2,Math.max(0,shape.chamfer-shape.wall))]};
    case 'roofOpening':return {outer:rectangle(shape.width,shape.depth,shape.chamfer),holes:[rectangle(shape.holeWidth,shape.holeDepth)]};
    case 'dShape':return {outer:[[-shape.back,-shape.radius],...arc(shape.radius,-90,90),[-shape.back,shape.radius]],holes:[arc(shape.holeRadius).slice(0,-1).map(([x,y])=>[x+shape.holeX,y])]};
    case 'uShape':{
      const half=shape.slot/2,angle=Math.acos(half/shape.radius)*180/Math.PI;
      return {outer:[...arc(shape.radius,180-angle,360+angle),[half,shape.notchBottom],[-half,shape.notchBottom]],holes:[]};
    }
    default:throw new Error('Unsupported Auquara shape: '+shape.kind);
  }
}

export const WORLD_UNITS_PER_MM=1/40;
export function createAuquaraModel({supports=true}={}){
  const root=new THREE.Group();root.name='Auquara_photo_reconstruction';
  root.userData={description:AUQUARA_DESIGN.provenance,nominalUnits:'190 × 380 mm; scale estimated',referencePhotoCount:4};
  const layers={base:new THREE.Group(),network:new THREE.Group(),buildings:new THREE.Group()};
  for(const [name,group] of Object.entries(layers)){group.name=name;root.add(group);}
  const materials=Object.fromEntries(Object.entries(AUQUARA_DESIGN.palette).map(([name,color])=>[name,new THREE.MeshStandardMaterial({name,color,roughness:.83,metalness:0})]));
  const geometries=[];
  for(const part of parts){
    if(!supports&&part.id.startsWith('support-'))continue;
    const {outer,holes}=outline(part.shape);
    const contour=new THREE.Shape(outer.map(([x,y])=>new THREE.Vector2(x*WORLD_UNITS_PER_MM,y*WORLD_UNITS_PER_MM)));
    for(const points of holes)contour.holes.push(new THREE.Path(points.map(([x,y])=>new THREE.Vector2(x*WORLD_UNITS_PER_MM,y*WORLD_UNITS_PER_MM))));
    const geometry=new THREE.ExtrudeGeometry(contour,{depth:part.height*WORLD_UNITS_PER_MM,bevelEnabled:false,curveSegments:24});
    geometry.rotateX(-Math.PI/2);geometries.push(geometry);
    const mesh=new THREE.Mesh(geometry,materials[part.material]);mesh.name=part.id;
    mesh.position.set(part.position[0]*WORLD_UNITS_PER_MM,part.position[2]*WORLD_UNITS_PER_MM,-part.position[1]*WORLD_UNITS_PER_MM);
    mesh.rotation.y=part.rotation*Math.PI/180;mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.userData={label:part.name,layer:part.layer};layers[part.layer].add(mesh);
  }
  return {root,layers,dispose(){geometries.forEach(geometry=>geometry.dispose());Object.values(materials).forEach(material=>material.dispose());}};
}
