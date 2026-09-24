// The visible outline and its collider share these exact cubic segments.
export const bubbleCurves=[[46,242,10,240,8,197,22,172],[22,172,-1,137,9,59,35,42],[35,42,44,7,131,7,164,20],[164,20,225,-2,297,13,325,20],[325,20,395,-2,467,20,463,60],[463,60,485,118,469,171,464,181],[464,181,478,233,425,244,386,239],[386,239,292,261,124,247,46,242]];
export const bubblePoints=bubbleCurves.flatMap(a=>Array.from({length:30},(_,i)=>{const t=i/30,u=1-t;return {x:u*u*u*a[0]+3*u*u*t*a[2]+3*u*t*t*a[4]+t*t*t*a[6],y:u*u*u*a[1]+3*u*u*t*a[3]+3*u*t*t*a[5]+t*t*t*a[7]};}));
export function drawBubble(c){c.beginPath();c.moveTo(46,242);for(const a of bubbleCurves)c.bezierCurveTo(...a.slice(2));c.closePath();c.stroke();}
export function confineBubble(p,r){
 let hit=false,nx=0,ny=0;
 for(let pass=0;pass<8;pass++){
  let inside=false,near=null,best=Infinity;
  for(let i=0,j=bubblePoints.length-1;i<bubblePoints.length;j=i++){
   const a=bubblePoints[j],b=bubblePoints[i],dx=b.x-a.x,dy=b.y-a.y;
   if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
   const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy))),x=a.x+t*dx,y=a.y+t*dy,d=Math.hypot(p.x-x,p.y-y);
   if(d<best){best=d;near={x,y,dx,dy};}
  }
  if(inside&&best>=r)break;
  const len=Math.hypot(near.dx,near.dy);nx=-near.dy/len;ny=near.dx/len;
  // Outline winds clockwise on screen: interior is the right-hand normal.
  p.x=near.x+nx*(r+.2);p.y=near.y+ny*(r+.2);hit=true;
  const vn=(p.vx||0)*nx+(p.vy||0)*ny;if(vn<0){p.vx-=1.65*vn*nx;p.vy-=1.65*vn*ny;}
 }
 return {hit,nx,ny};
}
