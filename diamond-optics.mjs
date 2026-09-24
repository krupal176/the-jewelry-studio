// Bounded optics for the convex teaching mesh, not a scanned stone or grading tool.
// Keep the math separate from mounting, controls and resource ownership.
export const MAX_DIAMOND_PLANES = 80;
export const INTERNAL_RAY_STEPS = 8;

export function regionEdgePositions(mesh, region) {
  if(!['table','crown','girdle','pavilion'].includes(region))return [];
  const center=[0,0,(mesh.crownHeight-mesh.girdle-mesh.depth)/2],seen=new Set(),positions=[];
  for(const face of mesh.faces) {
    const heights=face.map(index=>mesh.points[index][2]);
    const name=heights.every(z=>Math.abs(z-mesh.crownHeight)<1e-6)?'table'
      :heights.every(z=>z>=-1e-6)?'crown'
      :heights.every(z=>z>=-mesh.girdle-1e-6)?'girdle':'pavilion';
    if(name!==region)continue;
    for(let index=0;index<face.length;index++) {
      const a=face[index],b=face[(index+1)%face.length],key=[a,b].sort((x,y)=>x-y).join(':');
      if(seen.has(key))continue;seen.add(key);
      for(const point of [mesh.points[a],mesh.points[b]])positions.push(...point.map((value,i)=>center[i]+(value-center[i])*1.002));
    }
  }
  return positions;
}

export function opticalPlanes(mesh) {
  if(mesh.faces.length>MAX_DIAMOND_PLANES)throw new Error('Diamond exceeds the optical plane budget.');
  return mesh.faces.map(face=>{
    const [a,b,c]=face.slice(0,3).map(index=>mesh.points[index]);
    const u=b.map((value,index)=>value-a[index]),v=c.map((value,index)=>value-a[index]);
    const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const length=Math.hypot(...normal);
    if(length<1e-8)throw new Error('Degenerate optical face.');
    const n=normal.map(value=>value/length),d=n.reduce((sum,value,index)=>sum+value*a[index],0);
    // The ray marcher assumes an outward-facing convex half-space intersection.
    if(mesh.points.some(point=>n.reduce((sum,value,index)=>sum+value*point[index],0)>d+1e-6))throw new Error('Diamond is not convex.');
    return [...n,d];
  });
}

export const opticalVertexShader = /* glsl */`
  varying vec3 vLocalPosition;
  varying vec3 vLocalNormal;
  void main() {
    vLocalPosition = position;
    vLocalNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const opticalFragmentShader = /* glsl */`
  precision highp float;
  uniform samplerCube uEnvironment;
  uniform vec4 uPlanes[${MAX_DIAMOND_PLANES}];
  uniform int uPlaneCount;
  uniform vec3 uCameraLocal;
  uniform vec3 uInteriorPoint;
  uniform mat3 uWorldRotation;
  uniform vec3 uTint;
  uniform float uColorMode;
  uniform float uSoftLight;
  varying vec3 vLocalPosition;
  varying vec3 vLocalNormal;

  const float IOR = 2.417;

  vec3 studio(vec3 localDirection) {
    vec3 light = textureCube(uEnvironment, normalize(uWorldRotation * localDirection)).rgb;
    // All four lessons share the approved softer neutral studio finish.
    // It remains a screen illustration, not a calibrated grading environment.
    return mix(light, min(light * 0.78 + vec3(0.28), vec3(4.0)), uSoftLight);
  }

  float fresnel(float cosIncident, float etaIncident, float etaTransmitted) {
    float c = clamp(cosIncident, 0.0, 1.0);
    float eta = etaIncident / etaTransmitted;
    float sinTransmitted2 = eta * eta * (1.0 - c * c);
    if(sinTransmitted2 >= 1.0) return 1.0;
    float ct = sqrt(1.0 - sinTransmitted2);
    float rs = (etaIncident * c - etaTransmitted * ct) / (etaIncident * c + etaTransmitted * ct);
    float rp = (etaTransmitted * c - etaIncident * ct) / (etaTransmitted * c + etaIncident * ct);
    return 0.5 * (rs * rs + rp * rp);
  }

  bool nextFace(vec3 origin, vec3 direction, out float distance, out vec3 normal) {
    distance = 10000.0;
    normal = vec3(0.0, 0.0, 1.0);
    bool found = false;
    for(int i=0; i<${MAX_DIAMOND_PLANES}; i++) {
      if(i >= uPlaneCount) break;
      vec4 plane = uPlanes[i];
      float denominator = dot(plane.xyz, direction);
      // Only outward crossings are exits from the convex solid.
      if(denominator > 0.000001) {
        float candidate = (plane.w - dot(plane.xyz, origin)) / denominator;
        if(candidate > 0.0000001 && candidate < distance) {
          distance = candidate;
          normal = plane.xyz;
          found = true;
        }
      }
    }
    return found;
  }

  vec3 dispersedExit(vec3 insideRay, vec3 outwardNormal, vec3 centerExit) {
    // A modest RGB exit-dispersion approximation, not full spectral transport.
    // All channels share the geometric path to keep the lesson responsive.
    vec3 redExit = refract(insideRay, -outwardNormal, IOR - 0.024);
    vec3 blueExit = refract(insideRay, -outwardNormal, IOR + 0.024);
    if(dot(redExit, redExit) < 0.01) redExit = centerExit;
    if(dot(blueExit, blueExit) < 0.01) blueExit = centerExit;
    return vec3(studio(redExit).r, studio(centerExit).g, studio(blueExit).b);
  }

  void main() {
    vec3 entryNormal = normalize(vLocalNormal);
    vec3 incident = normalize(vLocalPosition - uCameraLocal);
    float entryFresnel = fresnel(dot(-incident, entryNormal), 1.0, IOR);
    vec3 radiance = entryFresnel * studio(reflect(incident, entryNormal));
    vec3 direction = refract(incident, entryNormal, 1.0 / IOR);
    // A tiny inward contraction is stable even at shared edges or the culet.
    vec3 origin = mix(vLocalPosition, uInteriorPoint, 0.0002);
    vec3 throughput = vec3(1.0 - entryFresnel);
    // Absorption carries the color lesson through the interior while leaving the
    // surface reflection white. Screen colors are intentionally not grade data.
    vec3 absorption = -log(max(uTint, vec3(0.20))) * mix(0.65, 1.15, uColorMode);

    for(int bounce=0; bounce<${INTERNAL_RAY_STEPS}; bounce++) {
      float distance;
      vec3 outwardNormal;
      if(!nextFace(origin, direction, distance, outwardNormal)) break;
      throughput *= exp(-absorption * distance);
      vec3 hit = origin + direction * distance;
      float reflection = fresnel(dot(direction, outwardNormal), IOR, 1.0);
      vec3 exitRay = refract(direction, -outwardNormal, IOR);
      if(dot(exitRay, exitRay) > 0.01) {
        radiance += throughput * (1.0 - reflection) * dispersedExit(direction, outwardNormal, exitRay);
      }
      // Reflection is 1 at total internal reflection; otherwise both optical
      // branches contribute with Fresnel energy weights, rather than painted faces.
      throughput *= reflection;
      direction = reflect(direction, outwardNormal);
      origin = mix(hit, uInteriorPoint, 0.0002);
      if(max(throughput.r, max(throughput.g, throughput.b)) < 0.012) break;
    }
    // A bright studio estimate conserves the residual instead of turning rays
    // black when the small bounce budget runs out. It is an explicit approximation.
    radiance += throughput * mix(studio(direction), vec3(0.75), 0.05);
    gl_FragColor = vec4(radiance, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
