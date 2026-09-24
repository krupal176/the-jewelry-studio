import * as THREE from './vendor/three/three.module.min.js';
import { brilliantMesh } from './diamond-geometry.mjs';
import { inclusionExample, disposeInclusion } from './diamond-inclusions.mjs';
import { MAX_DIAMOND_PLANES, opticalPlanes, regionEdgePositions, opticalVertexShader, opticalFragmentShader } from './diamond-optics.mjs';

// A stylized educational renderer, not a stone scan or physical light-performance test.
// One instance per mounted lesson. Every GPU resource/listener is owned and disposed here.
export function createDiamondViewer(host, onMotionChange = () => {}, onFailure = () => {}) {
  const abort = new AbortController(), signal = abort.signal;
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000,0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  const canvas = renderer.domElement;
  canvas.tabIndex=0; canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','Interactive 3D diamond model. Drag to turn, or use arrow keys. Home resets the view.');
  host.append(canvas);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30,1,.1,50);
  camera.position.set(0,0,2.04);
  const pivot = new THREE.Group(), stone = new THREE.Group();
  stone.rotation.x=-Math.PI/2;stone.position.y=.13;
  pivot.add(stone); scene.add(pivot);

  // Page background and reflected environment are intentionally separate. A
  // uniformly white environment washes away optical contrast; a balanced studio
  // supplies angular white softboxes, neutral midtones and limited charcoal flags.
  // All lighting stays local, without an HDRI fetch.
  const room = new THREE.Scene(), roomGeometry = new THREE.BoxGeometry();
  const roomMaterials=[];
  function panel(color,intensity,position,scale,side=THREE.FrontSide) {
    const material=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side,toneMapped:false});
    roomMaterials.push(material);
    const mesh=new THREE.Mesh(roomGeometry,material);mesh.position.set(...position);mesh.scale.set(...scale);room.add(mesh);
  }
  panel('#ffffff',.19,[0,0,0],[20,20,20],THREE.BackSide);
  panel('#ffffff',6,[-5,1,0],[.1,10,8]);
  panel('#ffffff',4.5,[5,2,-1],[.1,7,5]);
  panel('#fffaf4',3.5,[0,6,0],[8,.1,7]);
  panel('#f1f6ff',3,[1,-1,-6],[5,3,.1]);
  panel('#ffffff',5,[-2,2,6],[4,5,.1]);
  // Small flags contrast with the large softboxes without making the whole room black.
  panel('#3c4551',.45,[-2,-1,-5],[1.05,4.5,.1]);
  panel('#485363',.48,[1.35,0,5],[1.1,5.8,.1]);
  panel('#566274',.5,[-1.2,0,5],[.45,4.5,.1]);
  panel('#ffffff',12,[0,2,4.8],[.2,4,.1]);
  panel('#ffffff',8,[-4,-2,3],[.15,1,2]);
  panel('#fffaf4',5,[3,-3,-2],[1,.1,.7]);
  const target=new THREE.WebGLCubeRenderTarget(256,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false});
  const studioCamera=new THREE.CubeCamera(.1,50,target);studioCamera.update(renderer,room);
  roomGeometry.dispose();roomMaterials.forEach(m=>m.dispose());
  const opticalMaterial=new THREE.ShaderMaterial({
    uniforms:{
      uEnvironment:{value:target.texture},
      uPlanes:{value:Array.from({length:MAX_DIAMOND_PLANES},()=>new THREE.Vector4())},
      uPlaneCount:{value:0},uCameraLocal:{value:new THREE.Vector3()},uInteriorPoint:{value:new THREE.Vector3()},
      uWorldRotation:{value:new THREE.Matrix3()},uTint:{value:new THREE.Color(0xffffff)},uColorMode:{value:0},uSoftLight:{value:1}
    },
    vertexShader:opticalVertexShader,fragmentShader:opticalFragmentShader,
    side:THREE.FrontSide,toneMapped:true
  });
  const inverseStone=new THREE.Matrix4();
  const edgeMaterial=new THREE.LineBasicMaterial({color:0x8c9cab,transparent:true,opacity:.04});
  const focusMaterial=new THREE.LineBasicMaterial({color:0x5a1b2a,transparent:true,opacity:.95});
  const focusLines=new THREE.LineSegments(new THREE.BufferGeometry(),focusMaterial);focusLines.renderOrder=3;focusLines.visible=false;stone.add(focusLines);
  const markers=new THREE.Group();
  markers.rotation.x=-Math.PI/2;markers.position.y=.13;pivot.add(markers);
  let geometry, edges, gem, lines, meshData, example=null, exampleKey='', disposed=false, raf=0, spin=false, visible=true;
  // All lessons open in side profile; rotation is around the stone's own axis.
  let rx=0, ry=0, scale=1, last=0, drag=null, angle=40.8, topic='', focusName='none', anatomy=false;
  let azimuth=0, zoom=1, targetZoom=1;
  let freeView={rx,ry};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');

  function rebuild(value) {
    if(gem){stone.remove(gem,lines);geometry.dispose();edges.dispose();}
    const data=brilliantMesh(value);
    meshData=data;
    geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(data.triangles,3));geometry.computeVertexNormals();
    const planes=opticalPlanes(data);
    opticalMaterial.uniforms.uInteriorPoint.value.set(0,0,(data.crownHeight-data.girdle-data.depth)/2);
    opticalMaterial.uniforms.uPlaneCount.value=planes.length;
    planes.forEach((plane,index)=>opticalMaterial.uniforms.uPlanes.value[index].set(...plane));
    gem=new THREE.Mesh(geometry,opticalMaterial);
    edges=new THREE.EdgesGeometry(geometry,1);lines=new THREE.LineSegments(edges,edgeMaterial);lines.renderOrder=2;
    stone.add(gem,lines);
    updateFocusEdges();
  }
  function updateFocusEdges() {
    focusLines.geometry.dispose();
    focusLines.geometry=new THREE.BufferGeometry();
    focusLines.geometry.setAttribute('position',new THREE.Float32BufferAttribute(regionEdgePositions(meshData,focusName),3));
    focusLines.visible=focusName!=='none';
    edgeMaterial.color.set(anatomy&&focusName==='none'?0x5a1b2a:0x8c9cab);
    edgeMaterial.opacity=anatomy&&focusName==='none'?.65:.04;
  }
  function focus(name) {
    const next=['table','crown','girdle','pavilion'].includes(name)?name:'none';
    if(next!=='none'&&focusName==='none')freeView={rx,ry};
    if(next==='none'&&focusName!=='none'){rx=freeView.rx;ry=freeView.ry;}
    focusName=next;
    if(next==='table'){rx=Math.PI/2;ry=.25;}
    if(next==='crown'){rx=.4;ry=.25;}
    if(next==='girdle'){rx=0;ry=0;}
    if(next==='pavilion'){rx=-.12;ry=.25;}
    targetZoom=({table:1.22,crown:1.18,girdle:1.2,pavilion:1.14})[next]||1;
    if(reduced.matches)zoom=targetZoom;
    updateFocusEdges();requestDraw();
  }
  function requestDraw() {
    if(!disposed&&!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);
  }
  function draw(time) {
    raf=0;if(disposed||!visible||document.hidden)return;
    const elapsed=Math.min(last?time-last:16,50);
    // Turn about the stone's own axis: the selected region keeps its useful tilt.
    if(spin)azimuth=(azimuth+elapsed*.0002)%(Math.PI*2);
    zoom+= (targetZoom-zoom)*(1-Math.exp(-elapsed/100));
    if(Math.abs(targetZoom-zoom)<.001)zoom=targetZoom;
    camera.zoom=zoom;camera.updateProjectionMatrix();
    stone.rotation.z=azimuth;markers.rotation.z=azimuth;
    last=time;pivot.rotation.set(rx,ry,0);pivot.scale.setScalar(scale);
    pivot.updateMatrixWorld(true);
    inverseStone.copy(stone.matrixWorld).invert();
    opticalMaterial.uniforms.uCameraLocal.value.copy(camera.position).applyMatrix4(inverseStone);
    opticalMaterial.uniforms.uWorldRotation.value.setFromMatrix4(stone.matrixWorld);
    renderer.render(scene,camera);
    if(spin||zoom!==targetZoom)requestDraw();
  }
  function setMotion(value) {spin=!!value;last=0;onMotionChange(spin);requestDraw();}
  function resize() {
    const {width,height}=host.getBoundingClientRect();
    if(!width||!height)return;
    renderer.setPixelRatio(Math.max(.7,Math.min(devicePixelRatio||1,1.25,Math.sqrt(340000/(width*height)))));
    renderer.setSize(width,height,false);camera.aspect=width/height;frameCamera();camera.updateProjectionMatrix();requestDraw();
  }
  function frameCamera() {
    // Keep the same camera through the standard carat presets. Beyond these,
    // fit safely and let the separately labelled mm comparison convey scale.
    const baseline=topic==='Carat'?Math.max(Math.cbrt(3)*.78,Math.min(scale,3)):.88;
    const fit=baseline*.61/(Math.tan(Math.PI/12)*Math.min(1,camera.aspect));
    camera.position.z=Math.max(topic==='Carat'?2.65:2.04,fit);
    camera.near=Math.max(.01,camera.position.z*.01);camera.far=Math.max(50,camera.position.z*4);
    camera.updateProjectionMatrix();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;last=0;
    if(!visible){cancelAnimationFrame(raf);raf=0;}else requestDraw();
  });intersection.observe(host);
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else requestDraw();},{signal});
  reduced.addEventListener('change',event=>{if(event.matches)setMotion(false);},{signal});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();setMotion(false);onFailure();},{signal});
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;setMotion(false);drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');
  },{signal});
  canvas.addEventListener('pointermove',event=>{
    if(!drag)return;ry+=(event.clientX-drag.x)*.008;
    if(event.pointerType!=='touch')rx=THREE.MathUtils.clamp(rx+(event.clientY-drag.y)*.008,-1.3,1.5);
    drag={x:event.clientX,y:event.clientY};requestDraw();
  },{signal});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null;canvas.classList.remove('dragging');},{signal});
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    event.preventDefault();setMotion(false);
    if(event.key==='ArrowLeft')ry-=.15;if(event.key==='ArrowRight')ry+=.15;
    if(event.key==='ArrowUp')rx=Math.min(1.5,rx+.15);if(event.key==='ArrowDown')rx=Math.max(-1.3,rx-.15);
    if(event.key==='Home'){focus('none');rx=0;ry=0;azimuth=0;}requestDraw();
  },{signal});
  rebuild(angle);resize();setMotion(!reduced.matches);
  return {
    set(options) {
      const next=options.pavilion??40.8;
      if(next!==angle){angle=next;rebuild(angle);}
      if(options.topic&&options.topic!==topic){
        topic=options.topic;focusName='none';zoom=targetZoom=1;
        opticalMaterial.uniforms.uColorMode.value=topic==='Color'?1:0;
        opticalMaterial.uniforms.uSoftLight.value=1;
        rx=0;ry=0;
      }
      opticalMaterial.uniforms.uTint.value.set(options.tint||'#ffffff');
      const proposed=Number(options.scale);
      // Bound only the rendered geometry, never the accepted weight/readout.
      // Very large models otherwise exceed GPU float precision and clipping.
      scale=Number.isFinite(proposed)&&proposed>0?Math.max(.02,Math.min(proposed,3)):1;anatomy=!!options.anatomy;
      frameCamera();
      edgeMaterial.color.set(anatomy&&focusName==='none'?0x5a1b2a:0x8c9cab);edgeMaterial.opacity=anatomy&&focusName==='none'?.65:.04;
      const key=topic==='Clarity'&&options.markers?options.inclusionType||'feather':'';
      if(key!==exampleKey){
        if(example){markers.remove(example);disposeInclusion(example);example=null;}
        exampleKey=key;if(key){example=inclusionExample(key,meshData.crownHeight);markers.add(example);}
      }
      requestDraw();
    },
    view(name) {focus('none');setMotion(false);rx=name==='top'?Math.PI/2:0;ry=name==='top'?.25:0;requestDraw();},
    focus,
    motion: setMotion,
    destroy() {
      if(disposed)return;disposed=true;abort.abort();cancelAnimationFrame(raf);
      resizeObserver.disconnect();intersection.disconnect();
      geometry.dispose();edges.dispose();opticalMaterial.dispose();edgeMaterial.dispose();
      focusLines.geometry.dispose();focusMaterial.dispose();
      if(example)disposeInclusion(example);target.dispose();renderer.dispose();
      canvas.remove();
    }
  };
}
