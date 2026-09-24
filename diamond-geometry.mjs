// Procedural round-brilliant teaching mesh. Geometry is separate from rendering for tests.
// Adapted from the structure in the user-supplied Claude gem.js; not a measured stone.
export function brilliantMesh(pavilion = 40.8) {
  const points = [], faces = [], rad = Math.PI / 180, radius = .5;
  const table = .285, crown = 34.5 * rad, girdle = .035;
  const crownHeight = (radius - table) * Math.tan(crown);
  const depth = radius * Math.tan(pavilion * rad), cos = Math.cos(22.5 * rad);
  const starRadius = table * cos + .52 * (radius - table * cos);
  const starHeight = (radius - starRadius * cos) * Math.tan(crown);
  const lowerRadius = radius * .23 / cos;
  const lowerHeight = -girdle - (radius - lowerRadius * cos) * Math.tan(pavilion * rad);
  const point = (x,y,z) => (points.push([x,y,z]), points.length-1);
  const ring = (n,r,z,offset=0) => Array.from({length:n},(_,i)=>point(r*Math.cos((i*360/n+offset)*rad),r*Math.sin((i*360/n+offset)*rad),z));
  const t=ring(8,table,crownHeight), s=ring(8,starRadius,starHeight,22.5);
  const gu=ring(16,radius,0), gl=ring(16,radius,-girdle), l=ring(8,lowerRadius,lowerHeight,22.5), c=point(0,0,-girdle-depth);
  faces.push(t);
  for(let k=0;k<8;k++) {
    const next=(k+1)%8, prev=(k+7)%8, a=2*k,b=2*k+1,d=(2*k+2)%16;
    faces.push([t[k],s[k],gu[a],s[prev]],[t[k],t[next],s[k]], [s[k],gu[a],gu[b]],[s[k],gu[b],gu[d]],
      [gu[a],gl[a],gl[b],gu[b]],[gu[b],gl[b],gl[d],gu[d]],
      [c,l[prev],gl[a],l[k]],[l[k],gl[d],gl[b]],[l[k],gl[b],gl[a]]);
  }
  // Orient each face outward. This avoids inverted normals and missing facets.
  const center=[0,0,(crownHeight-girdle-depth)/2], triangles=[];
  for (const face of faces) {
    const a=points[face[0]],b=points[face[1]],c=points[face[2]];
    const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
    const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(n.reduce((sum,x,i)=>sum+x*(a[i]-center[i]),0)<0)face.reverse();
    for(let i=1;i<face.length-1;i++)triangles.push(...points[face[0]],...points[face[i]],...points[face[i+1]]);
  }
  return {points,faces,triangles,crownHeight,depth,girdle};
}
