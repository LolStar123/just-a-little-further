// One unhurried pen pass. Data curves keep their sampled coordinates unchanged.
export function inkPath(c,points,color='#535248',width=1.3){
 if(!points.length)return;c.beginPath();c.moveTo(...points[0]);
 if(points.length>30||width>=3){for(const p of points.slice(1))c.lineTo(...p);}
 else for(let i=1;i<points.length;i++){
  const a=points[i-1],p=points[i],b=points[i+1];
  if(b){const f=.12;c.lineTo(p[0]+(a[0]-p[0])*f,p[1]+(a[1]-p[1])*f);c.quadraticCurveTo(...p,p[0]+(b[0]-p[0])*f,p[1]+(b[1]-p[1])*f);}
  else{const dx=p[0]-a[0],dy=p[1]-a[1],len=Math.hypot(dx,dy),bend=width<2&&len>20?Math.sin(a[0]*.17+a[1]*.11)*1.6:0;c.quadraticCurveTo((a[0]+p[0])/2-dy/Math.max(1,len)*bend,(a[1]+p[1])/2+dx/Math.max(1,len)*bend,...p);}
 }
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();
}
export function smoothTrail(points){
 const result=[points[0]];
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)],p=points[i],q=points[i+1],b=points[Math.min(points.length-1,i+2)];
  for(let j=1;j<=16;j++){const t=j/16,u=1-t;result.push([0,1].map(k=>u*u*u*p[k]+3*u*u*t*(p[k]+(q[k]-a[k])/6)+3*u*t*t*(q[k]-(b[k]-p[k])/6)+t*t*t*q[k]));}
 }
 return result;
}
