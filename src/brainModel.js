import * as THREE from 'three';

const BANDS=6,SLICES=8;
// Sculptural reference interpretation: paired cerebral lobes, rounded gyri,
// a smaller posterior cerebellum, and a short stem. Not a medical reference.
function point(side,theta,phi,scale=1){
  const s=Math.sin(theta),z=1.38*s*Math.sin(phi);
  const frontal=1+.055*Math.sin(phi*2+.7)*s;
  return new THREE.Vector3(side*(.035+.96*s*Math.cos(phi)*frontal*scale),.96*Math.cos(theta)*(theta>Math.PI/2?.68:1)*scale,z*scale);
}
function shell(side,t0,t1,p0,p1){
  const rows=10,cols=12,positions=[],indices=[],grid=(rows+1)*(cols+1);
  for(const scale of [1,.82])for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++)positions.push(...point(side,t0+(t1-t0)*r/rows,p0+(p1-p0)*c/cols,scale).toArray());
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const a=r*(cols+1)+c,b=a+cols+1;
    indices.push(a,b,a+1,b,b+1,a+1,a+grid,a+1+grid,b+grid,b+grid,a+1+grid,b+1+grid);
  }
  const edge=[];
  for(let c=0;c<=cols;c++)edge.push(c);
  for(let r=1;r<=rows;r++)edge.push(r*(cols+1)+cols);
  for(let c=cols-1;c>=0;c--)edge.push(rows*(cols+1)+c);
  for(let r=rows-1;r>0;r--)edge.push(r*(cols+1));
  for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];indices.push(a,a+grid,b,b,a+grid,b+grid);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function createBrainModel(){
  const root=new THREE.Group(),pieces=[],geometries=[];
  const cortex=new THREE.MeshStandardMaterial({color:0xd87993,roughness:.48,metalness:0,side:THREE.DoubleSide});
  const gyrus=new THREE.MeshStandardMaterial({color:0xf09db1,roughness:.38,metalness:0,side:THREE.DoubleSide});
  const addPiece=(name,geometry,material,direction,order)=>{
    geometries.push(geometry);const group=new THREE.Group();group.name=name;group.add(new THREE.Mesh(geometry,material));root.add(group);
    const piece={group,direction:direction.clone().normalize(),order,spin:Math.sin(order*2.7)*.11};pieces.push(piece);return piece;
  };
  for(const side of [-1,1]){
    const hemisphere=[];
    for(let band=0;band<BANDS;band++)for(let slice=0;slice<SLICES;slice++){
      const t0=band*Math.PI/BANDS+.002,t1=(band+1)*Math.PI/BANDS-.002;
      const p0=-Math.PI/2+slice*Math.PI/SLICES+.002,p1=p0+Math.PI/SLICES-.004;
      const piece=addPiece(`cortex-${side}-${band}-${slice}`,shell(side,t0,t1,p0,p1),cortex,point(side,(t0+t1)/2,(p0+p1)/2),(band*3+slice*5+(side>0?2:0))%13);
      hemisphere.push(piece);
    }
    // Generate gyri across the whole hemisphere, then partition their closed sections
    // into the same small cells. Folds stay continuous when the puzzle closes.
    const buckets=hemisphere.map(()=>({position:[],normal:[]}));
    const append=(bucket,source)=>{
      const g=source.index?source.toNonIndexed():source;
      bucket.position.push(...g.attributes.position.array);bucket.normal.push(...g.attributes.normal.array);
      if(g!==source)g.dispose();source.dispose();
    };
    for(let row=0;row<10;row++){
      const radius=.105+Math.sin(row*2.3)*.009,runs=[];let run=null;
      for(let i=0;i<=200;i++){
        const phi=-Math.PI/2+.035+(Math.PI-.07)*i/200;
        const theta=.13+(row+.5)*(Math.PI-.34)/10+.105*Math.sin(phi*9+row*1.8)+.05*Math.sin(phi*17+row*.8);
        const band=THREE.MathUtils.clamp(Math.floor(theta/Math.PI*BANDS),0,BANDS-1),slice=THREE.MathUtils.clamp(Math.floor((phi+Math.PI/2)/Math.PI*SLICES),0,SLICES-1);
        const cell=band*SLICES+slice,p=point(side,theta,phi,1.012);
        if(!run||run.cell!==cell){const previous=run?.points.at(-1);run={cell,points:previous?[previous,p]:[p]};runs.push(run);}else run.points.push(p);
      }
      for(const run of runs){
        if(run.points.length<2)continue;
        const bucket=buckets[run.cell];
        append(bucket,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(run.points),Math.max(4,run.points.length),radius,10,false));
        for(const end of [run.points[0],run.points.at(-1)])append(bucket,new THREE.SphereGeometry(radius,8,6).translate(end.x,end.y,end.z));
      }
    }
    for(let i=0;i<buckets.length;i++){
      const bucket=buckets[i];if(!bucket.position.length)continue;
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(bucket.position,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(bucket.normal,3));
      geometries.push(geometry);hemisphere[i].group.add(new THREE.Mesh(geometry,gyrus));
    }
    const cerebellum=new THREE.SphereGeometry(.43,28,20).scale(.9,.7,1.05).translate(side*.3,-.68,-.87);
    addPiece('cerebellum-'+side,cerebellum,cortex,new THREE.Vector3(side*.5,-.65,-.9),side>0?4:7);
  }
  const stem=new THREE.CylinderGeometry(.12,.09,.46,20).rotateX(-.3).translate(0,-.96,-.66);
  addPiece('brain-stem',stem,cortex,new THREE.Vector3(0,-1,-.4),9);
  root.userData={description:'Reference-inspired brain sculpture',corticalPieces:96,totalPieces:pieces.length};
  return {root,pieces,dispose(){geometries.forEach(g=>g.dispose());cortex.dispose();gyrus.dispose();}};
}
