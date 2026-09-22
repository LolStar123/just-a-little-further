import {findPath} from './pathfinding.js';

// Fixed world coordinates keep navigation independent of CSS size and pixel ratio.
export const WIDTH=960,HEIGHT=640,CELL=8,CLEARANCE=20;
const forms=[
    [155,85,55,38,.2],[295,143,35,78,.7],[460,70,64,27,1.2],
    [590,165,45,57,1.8],[130,295,52,38,2.4],[278,335,62,33,3],
    [468,310,59,61,3.6],[612,363,35,28,4.2],[411,205,29,24,4.8],
    [47,75,29,23,5.4],[690,290,22,48,6],[356,45,22,23,6.6],
    [790,96,53,40,7.2],[874,238,44,71,7.8],[778,380,56,33,8.4],
    [910,469,25,42,9],[155,490,55,42,9.6],[320,506,49,64,10.2],
    [482,476,32,35,10.8],[616,535,58,39,11.4],[804,568,53,29,12],
    [63,589,22,20,12.6],[435,601,43,17,13.2],[719,228,25,31,13.8],
    [906,68,22,23,14.4],[212,610,23,19,15]
];
export const rocks=forms.map(([x,y,rx,ry,seed])=>{
    const points=Array.from({length:11},(_,i)=>{const a=i/11*Math.PI*2,r=1+.13*Math.sin(i*2.1+seed);return[x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r];});
    return {x,y,rx,ry,seed,points,bottom:Math.max(...points.map(p=>p[1]))};
});
function distance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy);}
export function clearPoint(x,y){
    if(x<CLEARANCE||x>WIDTH-CLEARANCE||y<CLEARANCE||y>HEIGHT-CLEARANCE)return false;
    for(const rock of rocks){
        if(Math.abs(x-rock.x)>rock.rx*1.2+CLEARANCE||Math.abs(y-rock.y)>rock.ry*1.2+CLEARANCE)continue;
        let inside=false;const p=rock.points;
        for(let i=0,j=p.length-1;i<p.length;j=i++){
            if(distance(x,y,p[j],p[i])<CLEARANCE)return false;
            if((p[i][1]>y)!==(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])inside=!inside;
        }
        if(inside)return false;
    }
    return true;
}
export function clearSegment(a,b){const d=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(1,Math.ceil(d/3));for(let i=0;i<=steps;i++){const t=i/steps;if(!clearPoint(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))return false;}return true;}
const cols=WIDTH/CELL+1,rows=HEIGHT/CELL+1;
let blocked;
function occupancy(){if(blocked)return blocked;blocked=new Set();for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(!clearPoint(x*CELL,y*CELL))blocked.add(x+','+y);return blocked;}
export function routeThroughRocks(start,goal){
    const raw=findPath(cols,rows,occupancy(),start.map(v=>v/CELL),goal.map(v=>v/CELL),true).map(p=>p.map(v=>v*CELL));
    // Remove grid stair-steps only where the entire segment clears the drawn rocks.
    const route=[];let anchor=start,index=0;
    while(index<raw.length){let far=raw.length-1;while(far>=index&&!clearSegment(anchor,raw[far]))far--;if(far<index)return [];route.push(raw[far]);anchor=raw[far];index=far+1;}
    return route;
}
export function rockPath(rock){
    const path=new Path2D(),p=rock.points;
    p.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();return path;
}
