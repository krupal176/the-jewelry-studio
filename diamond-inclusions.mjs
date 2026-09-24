import * as THREE from './vendor/three/three.module.min.js';

// Enlarged teaching specimens, not microscope images, a grading plot, or a
// measured stone. Separate from the optical shader so each form stays legible.
export const inclusionTypes = ['feather','cloud','cavity','crystal','needle','pinpoint'];
export function inclusionExample(type = 'feather', crownHeight = .148) {
  const group = new THREE.Group();
  group.name = inclusionTypes.includes(type) ? type : 'feather';
  const surface = (color, opacity) => new THREE.MeshBasicMaterial({color, opacity, transparent:true, depthTest:false, depthWrite:false, side:THREE.DoubleSide});
  const lineMaterial = new THREE.LineBasicMaterial({color:0x727f88, transparent:true, opacity:.62, depthTest:false, depthWrite:false});
  function mesh(geometry, material, position = [0,0,0]) {
    const item = new THREE.Mesh(geometry, material);item.position.set(...position);item.renderOrder=5;group.add(item);return item;
  }
  function lines(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));
    const line = new THREE.LineSegments(geometry,lineMaterial);line.renderOrder=6;group.add(line);
  }
  if(group.name==='feather') {
    const spine=[[-.15,-.08,-.045],[-.09,-.035,-.04],[-.025,.015,-.05],[.05,.075,-.018],[.115,.12,-.035]];
    const branches=[],triangles=[];
    for(let i=0;i<spine.length-1;i++){
      const p=spine[i],q=spine[i+1],tip=[q[0]-.035,q[1]+.067,q[2]+.016];
      branches.push(p,q,q,tip);triangles.push(...p,...q,...tip);
      branches.push(q,[q[0]+.055,q[1]-.032,q[2]-.009]);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));
    mesh(geometry,surface(0xe4edf1,.62));lines(branches);
  } else if(group.name==='cloud') {
    const positions=[];
    for(let i=0;i<110;i++){
      const a=i*2.399963,r=.077*Math.sqrt((i+.5)/110);
      positions.push(-.07+Math.cos(a)*r,.035+Math.sin(a)*r*.7,-.055+Math.sin(i*1.71)*.028);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,
      vertexShader:'void main(){vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=clamp(18.0/-p.z,2.0,12.0);}',
      fragmentShader:'void main(){float a=1.0-smoothstep(0.05,0.5,length(gl_PointCoord-0.5));gl_FragColor=vec4(0.43,0.49,0.54,a*0.25);}' });
    const cloud=new THREE.Points(geometry,material);cloud.renderOrder=5;group.add(cloud);
  } else if(group.name==='cavity') {
    // Angular surface opening: a rim with differently shaded walls, not a dot.
    const rim=[[.075,-.08,crownHeight+.001],[.145,-.065,crownHeight+.001],[.166,.007,crownHeight+.001],[.101,.035,crownHeight+.001],[.056,-.016,crownHeight+.001]];
    const bottom=[.109,-.014,crownHeight-.05],segments=[];
    for(let i=0;i<rim.length;i++){
      const next=rim[(i+1)%rim.length],geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.Float32BufferAttribute([...rim[i],...next,...bottom],3));
      mesh(geometry,surface(i%2?0x87949e:0xc0cbd1,.78));segments.push(rim[i],next);
    }
    lines(segments);
  } else if(group.name==='crystal') {
    const crystal=mesh(new THREE.OctahedronGeometry(.046),surface(0x8b97a1,.7),[-.09,.035,-.065]);crystal.rotation.set(.3,.55,.2);
    const wire=new THREE.LineSegments(new THREE.EdgesGeometry(crystal.geometry),lineMaterial);wire.renderOrder=6;crystal.add(wire);
  } else if(group.name==='needle') {
    const needle=mesh(new THREE.CylinderGeometry(.0025,.004,.21,6),surface(0x84929c,.84),[-.025,.035,-.05]);needle.rotation.set(.1,.2,-.67);
  } else {
    mesh(new THREE.SphereGeometry(.009,8,6),surface(0x83909b,.85),[-.055,.018,-.05]);
  }
  // This material may be unused for a particular example, but still owned here.
  group.userData.extraMaterials=[lineMaterial];
  return group;
}

export function disposeInclusion(group) {
  const geometries=new Set(),materials=new Set(group.userData.extraMaterials||[]);
  group.traverse(item=>{if(item.geometry)geometries.add(item.geometry);if(item.material)materials.add(item.material);});
  geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());
}
