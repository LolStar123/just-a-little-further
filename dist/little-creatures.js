import {toyPose} from './toy-interactions.js';
// Original articulated continuous-pen character. No image assets or sprite frames.
export const art={ready:true,style:'scribble'};
export const ready=Promise.resolve(true);
const TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>a+(b-a)*t;
const hoverPointer={x:0,y:0,active:false},hoverRects=new WeakMap();
addEventListener('pointermove',e=>{hoverPointer.x=e.clientX;hoverPointer.y=e.clientY;hoverPointer.active=e.pointerType!=='touch';},{passive:true});
document.addEventListener('mouseleave',()=>{hoverPointer.active=false;});
addEventListener('blur',()=>{hoverPointer.active=false;});
function mouseOverMeowl(c,x,y,size){
    if(!hoverPointer.active||!c.canvas.isConnected)return false;
    let cached=hoverRects.get(c.canvas);const now=performance.now();
    if(!cached||now-cached.at>16){cached={at:now,r:c.canvas.getBoundingClientRect()};hoverRects.set(c.canvas,cached);}
    const r=cached.r;if(!r.width||!r.height)return false;
    const local=new DOMPoint((hoverPointer.x-r.left)*c.canvas.width/r.width,(hoverPointer.y-r.top)*c.canvas.height/r.height).matrixTransform(c.getTransform().inverse());
    return ((local.x-x)/(size*.48))**2+((local.y-(y-size*.53))/(size*.58))**2<1;
}
const rigs=new WeakMap(), ink='#353833', faint='#72756b', paper='#eeeae0';
function pancake(c,x,y,size,t,age,ground,voice=0,waving=false){
    const spread=Math.min(1,age/.12),w=size*(.55+spread*.22),h=size*.10;
    const earth=dx=>ground?ground(x+dx)-y:0;
    const warp=([dx,dy])=>[dx,dy+earth(dx)];
    const pen=(pts,width=1.2,color=ink)=>stroke(c,pts.map(warp),width,color);
    const curl=(a,b,d,width=.8)=>curve(c,warp(a),warp(b),warp(d),width,ink);
    c.save();c.translate(x,y);c.lineJoin='round';c.lineCap='round';
    const top=[[-w,0],[-w*.79,-h*.4],[-w*.48,-h*.37],[-w*.33,-h*.7],[-w*.29,-h*1.25],[-w*.1,-h*.84],[w*.13,-h*.85],[w*.32,-h*1.2],[w*.35,-h*.62],[w*.64,-h*.45],[w*.9,-h*.28],[w,0]];
    // Sample both edges against the actual terrain, including its live dents.
    const outline=[];
    for(let i=1;i<top.length;i++){const a=top[i-1],b=top[i],steps=Math.ceil((b[0]-a[0])/2);for(let j=0;j<steps;j++){const q=j/steps;outline.push(warp([mix(a[0],b[0],q),mix(a[1],b[1],q)]));}}
    for(let dx=w;dx>=-w;dx-=2)outline.push(warp([dx,0]));
    stroke(c,outline,1.25,ink,true,paper);
    for(const side of [-1,1])for(let i=0;i<3;i++)curl([side*w*.44,-h*.23+i*.3],[side*w*.67,-h*.17],[side*w*(.82-i*.07),-.3],.75);
    const blink=(age>.62&&age<.78)||(age>1.10&&age<1.28);
    for(const side of [-1,1]){const ex=side*size*.105,ey=-h*.48;if(blink)pen([[ex-4,ey],[ex+4,ey]]);else{c.save();c.translate(ex,ey+earth(ex));c.rotate(Math.atan((earth(ex+2)-earth(ex-2))/4));oval(c,0,0,4.2,3.2,paper,1,ink);oval(c,Math.sin(age*3)*1.4,0,1.6,1.8,ink,0);c.restore();}}
    pen([[-2,-h*.22],[0,-h*.10],[2,-h*.22]],.8);
    if(voice>.03)oval(c,0,earth(0)-h*.13,2+voice*2,Math.max(.5,voice*1.8),'#62544a',.6);
    for(const side of [-1,1]){pen([[side*w*.3,-h*.35],[side*w*.49,-h*.66]],.65);pen([[side*w*.32,-h*.18],[side*w*.54,-h*.21]],.65);}
    if(waving){const tip=w*.65+Math.sin(t*17)*5;curl([w*.4,-h*.2],[w*.65,-h-18],[tip,-h-24],1.1);curl([w*.4,-h*.2],[w*.75,-h-12],[tip+5,-h-20],.8);}
    c.restore();return{style:'scribble',mode:'flattened',squish:1,feet:[{x:x-w*.6,y:y+earth(-w*.6)},{x:x+w*.6,y:y+earth(w*.6)}],hands:[{x:x-w,y:y+earth(-w)},{x:x+w,y:y+earth(w)}],head:{x,y:y-h*.5},hip:{x,y},groundOutline:outline};
}

function stroke(c,points,width=1.55,color=ink,closed=false,fill=null){
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(closed)c.closePath();
    if(fill){c.fillStyle=fill;c.fill();}c.strokeStyle=color;c.lineWidth=width;c.stroke();

}
function curve(c,start,control,end,width=1.5,color=ink){
    c.beginPath();c.moveTo(...start);c.quadraticCurveTo(...control,...end);c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function oval(c,x,y,rx,ry,fill,width=1.2,color=ink,angle=0){
    c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(width){c.lineWidth=width;c.strokeStyle=color;c.stroke();}
}
// Bounded damped springs add yielding and follow-through to the authored poses.
// Substeps keep their behaviour consistent across 30/60/144 Hz render rates.
function spring(s,target,dt,stiffness=150,damping=16){
    let left=dt;while(left>0){const h=Math.min(left,1/180);s.v+=((target-s.p)*stiffness-s.v*damping)*h;s.p+=s.v*h;left-=h;}return s.p;
}
// Horizontal intersection with the actual rotating, chipped collision polygon.
function rockEdge(vertices,y,fallback){
    const hits=[];
    for(let i=0;i<vertices.length;i++){
        const a=vertices[i],b=vertices[(i+1)%vertices.length];
        if((a.y<=y&&b.y>y)||(b.y<=y&&a.y>y))hits.push(a.x+(y-a.y)/(b.y-a.y)*(b.x-a.x));
    }
    return hits.length?Math.min(...hits):fallback;
}
function poseFor(mode,t,effort,phase,speed,gait=0){
    const breathe=Math.sin(t*2.5)*.65,pulse=.5-.5*Math.cos(phase*TAU);
    let p={hip:[-2,-13],chest:[-2,-51+breathe],head:[-2,-76+breathe],left:[-25,-18],right:[24,-16],feet:[-11,11],turn:.15,tilt:.018*Math.sin(t*1.2)};
    const set=v=>Object.assign(p,v);
    if(['walk','scramble','scurry'].includes(mode)){
        const w=Math.sin(gait),bob=Math.abs(Math.cos(gait))*1.8;
        set({hip:[-2-w,-13-bob],chest:[-2+w*2.6,-50-bob],head:[-2+w*1.6,-75-bob],
            left:[-26+w*2,-19],right:[25-w*2,-17],turn:.4,tilt:w*.075});
        if(mode!=='walk')set({left:[-35,-33+w*3],right:[32,-32-w*3],tilt:w*.10});
    }
    if(['push','heave','brace','slide'].includes(mode)){
        const recoil=mode==='brace'?5:mode==='slide'?3:0;
        set({hip:[-20-recoil,-12],chest:[-8-recoil,-45-pulse*3],head:[-8-recoil,-71-pulse*3],
            left:[23,-52],right:[25,-39],feet:[-28,-3],turn:.65,tilt:.08+pulse*.06});
        if(mode==='heave')set({hip:[-23+pulse*5,-10-pulse*3],chest:[-12+pulse*5,-43-pulse*7],head:[-12+pulse*5,-70-pulse*6]});
        if(mode==='slide')set({hip:[-21,-10],chest:[-14,-43],head:[-16,-69],feet:[-30,0],tilt:-.09});
    }
    if(mode==='anticipate')set({hip:[-23,-9],chest:[-21,-40],head:[-16,-66],left:[11,-67],right:[29,-44],feet:[-35,0],turn:.65,tilt:.10});
    if(mode==='brace')set({hip:[-31,-8],chest:[-19,-38],head:[-23,-64],left:[24,-60],right:[29,-37],feet:[-39,-3],turn:.8,tilt:-.16});
    if(mode==='turn')set({hip:[-9,-12],chest:[-10,-48],head:[-10,-73],left:[-33,-32],right:[25,-29],feet:[-19,1],turn:-.25,tilt:-.08});
    if(mode==='backpush')set({hip:[-28,-10-pulse*4],chest:[6+5*pulse,-38-pulse*7],head:[-1+5*pulse,-66-pulse*7],left:[-43,-31-pulse*5],right:[-21,-27],feet:[-43,-17],turn:-1.5,tilt:-.20});
    if(mode==='carry'){
        const bob=Math.abs(Math.sin(gait))*1.7;
        set({hip:[-2,-13-bob],chest:[-2,-50-bob],head:[-2,-76-bob],left:[-19,-36-bob],right:[19,-36-bob],tilt:Math.sin(gait)*.035});
    }
    if(mode==='stagger')set({hip:[-10,-11],chest:[-14,-44],head:[-16,-70],left:[-40,-46],right:[30,-45],feet:[-20,2],turn:.4,tilt:-.14});
    if(mode==='recover')set({hip:[-7,-12],chest:[-10,-46+breathe*2],head:[-10,-71+breathe*2],left:[-30,-19],right:[3,-63],feet:[-18,3],tilt:.10});
    if(mode==='watch')set({head:[-2,-78+breathe],right:[25,-23],tilt:-.08,turn:.6});
    if(mode==='panic'){
        const flap=Math.sin(t*15);
        set({hip:[-2,-15],chest:[-2,-55],head:[-2,-81],left:[-43,-88+flap*9],right:[39,-91-flap*7],feet:[-14,13],tilt:Math.sin(t*9)*.08});
    }
    if(mode==='trip')set({hip:[-18,-8],chest:[-29,-31],head:[-34,-57],left:[-55,-40],right:[24,-64],feet:[-30,8],tilt:-.48,turn:-.3});
    if(mode==='held'||mode==='air'||mode==='spring'){
        const flap=Math.sin(t*12);
        set({hip:[-2,-15],chest:[-2,-51],head:[-2,-76],left:[-48,-49+flap*12],right:[45,-49-flap*12],feet:[-10,10],tilt:Math.sin(t*4)*.05});
    }
    if(mode==='happy'||mode==='celebrate'){
        const joy=Math.sin(t*7),hop=Math.max(0,joy)*2;
        set({hip:[-2,-13-hop],chest:[-2,-51-hop],head:[-2,-76-hop],left:[-36,-62-joy*4],right:[34,-63+joy*4],tilt:Math.sin(t*3)*.08,turn:.1});
    }
    if(mode==='nervous')set({left:[-8,-33],right:[8,-34],chest:[-3,-50],head:[-3,-76],tilt:Math.sin(t*1.7)*.04});
    if(mode==='rest'&&t%14>10&&t%14<12)set({right:[-2,-64],tilt:.1});
    const tremble=effort>.5?Math.sin(t*35)*.15*effort:0;p.chest[0]+=tremble;p.head[0]+=tremble*.5;return p;
}
// One asymmetric outline joins the tail, belly, cheeks and cat ears.
// These are the drawing's actual contours, with no texture or noise pass.
function silhouette(c,p,t,effort){
    const co=Math.cos(p.tilt),si=Math.sin(p.tilt);
    const H=(x,y)=>[p.head[0]+x*co-y*si,p.head[1]+x*si+y*co];
    const [hx,hy]=p.hip,[cx,cy]=p.chest,ear=Math.sin(t*3)*.7+effort*1.1;
    c.beginPath();c.moveTo(hx-4,hy+7);
    c.bezierCurveTo(hx-13,hy+18,hx-31,hy+3,hx-22,hy+4);
    c.bezierCurveTo(hx-38,hy-8,cx-32,cy+9,...H(-21,8));
    c.bezierCurveTo(...H(-31,1),...H(-20,-6),...H(-25,-25+ear));
    c.bezierCurveTo(...H(-25,-32+ear),...H(-14,-17),...H(-10,-16));
    c.bezierCurveTo(...H(-5,-20),...H(7,-17),...H(10,-16));
    c.bezierCurveTo(...H(26,-30-ear),...H(28,-22),...H(24,-6));
    c.bezierCurveTo(...H(35,5),...H(21,17),...H(15,17));
    c.bezierCurveTo(cx+33,cy+12,hx+30,hy+3,hx+8,hy+7);
    c.bezierCurveTo(hx-3,hy+12,hx-15,hy+6,hx-13,hy+3);
    c.closePath();c.fillStyle='#e7dfce';c.fill();c.strokeStyle=ink;c.lineWidth=1.45;c.stroke();
    // The white owl bib is an opaque shape, not a transparent wash.
    c.beginPath();c.moveTo(...H(-12,15));
    c.bezierCurveTo(cx-19,cy+10,hx-25,hy-3,hx-15,hy+5);
    c.quadraticCurveTo(hx+2,hy+14,hx+16,hy+4);
    c.bezierCurveTo(hx+28,hy-8,cx+15,cy+2,...H(12,15));
    c.quadraticCurveTo(...H(0,24),...H(-12,15));c.fillStyle='#f5f1e7';c.fill();
    for(let i=0;i<3;i++){const y=cy+13+i*10;c.beginPath();c.moveTo(cx-6+(i%2)*5,y);c.quadraticCurveTo(cx-2,y+5,cx+3+(i%2)*5,y+1);c.strokeStyle='#a79d87';c.lineWidth=.65;c.stroke();}
}
function drawFace(c,p,t,mode,effort,look,seed,emotion,emotionAge,voice=0,drool=0){
    c.save();c.translate(...p.head);c.rotate(p.tilt);c.translate(p.turn*2,0);
    const feeling=emotion||(['push','heave','brace','slide','backpush'].includes(mode)?'determined':mode==='happy'?'relieved':'calm');
    const panic=feeling==='panic',sad=['worried','upset','crying','desperate'].includes(feeling),determined=['angry','strain','determined'].includes(feeling);
    const blink=(t+seed*.63)%4.8>4.64,smile=feeling==='relieved'||['happy','celebrate'].includes(mode),gaze=panic?Math.sin(t*7)*1.3:mode==='backpush'?-2:clamp(look,-2,2)*.55;
    // Kitten cheeks, pointed ears and forehead stripes inside the loose contour.
    c.beginPath();c.moveTo(-22,-21);c.lineTo(-15,-15);c.lineTo(-21,-10);
    c.moveTo(22,-22);c.lineTo(15,-15);c.lineTo(21,-9);c.strokeStyle='#877964';c.lineWidth=1.1;c.stroke();
    c.beginPath();c.moveTo(-11,-14);c.lineTo(-7,-8);c.lineTo(-5,-14);c.lineTo(0,-8);c.lineTo(5,-14);c.lineTo(8,-8);c.lineTo(12,-14);c.strokeStyle='#7f725f';c.lineWidth=1.7;c.stroke();
    for(const side of [-1,1]){
        c.beginPath();c.moveTo(side*24,1);c.lineTo(side*20,4);c.lineTo(side*26,6);c.moveTo(side*24,10);c.lineTo(side*19,11);c.strokeStyle='#887a65';c.lineWidth=1.2;c.stroke();
        const ex=side*11;
        if(blink||(feeling==='strain'&&effort>.94&&Math.sin(t*3)>.25)){curve(c,[ex-7,3],[ex,feeling==='strain'?-2:7],[ex+7,3],1.6);}
        else{
            oval(c,ex,0,panic?9.1:8.9,panic?10.3:10,'#f5f1e7',.95,ink,side*.12);
            oval(c,ex+gaze,panic?-3:1,panic?6.0:6.8,panic?7.2:8.1,ink,0,ink,side*.08);
            oval(c,ex+gaze-2,panic?-5:-2,1.7,2,'#f8f4e9',0);
            if(drool>.18){c.beginPath();c.moveTo(ex-8,-5);c.quadraticCurveTo(ex,-13,ex+8,-5);c.lineTo(ex+8,-2);c.quadraticCurveTo(ex,-.5,ex-8,-2);c.closePath();c.fillStyle='#d4c7ae';c.fill();curve(c,[ex-8,-2],[ex,-.5],[ex+8,-2],1.1);}
            if(smile)curve(c,[ex-7,6],[ex,9],[ex+6,5],.8);
            if(determined){curve(c,[ex-side*7,-7],[ex,-10],[ex+side*8,-13],1.6);}
            if(sad)curve(c,[ex-side*7,-15],[ex,-12],[ex+side*7,-9],1.3);
            if(panic)curve(c,[ex-7,-14],[ex,-16.5],[ex+7,-15],1.2);
            if(['crying','upset','desperate'].includes(feeling)){curve(c,[ex-6,7],[ex,10],[ex+6,7],1.8,'#8caeae');oval(c,ex-3,6,1.2,1,'#fbf8ef',0);}
        }
    }
    c.beginPath();c.moveTo(-8,10);c.quadraticCurveTo(-9,18,0,19);c.quadraticCurveTo(10,19,8,10);c.fillStyle='#f5f1e7';c.fill();
    stroke(c,[[-3,10],[3,10],[0,13],[-3,10]],.65,'#6e6257',true,'#b29483');
    curve(c,[0,13],[-1,18],[-5,16],.9);curve(c,[0,13],[1,18],[5,16],.9);
    if(voice>.03){oval(c,0,19,2+voice*2.7,1.5+voice*5.5,'#62544a',.8);oval(c,.2,21+voice*2,1.6,voice*1.5,'#c5998a',0);}
    else if(drool>.01){oval(c,1,20,4.5,4.6,'#62544a',1);oval(c,1,22,2.3,1.6,'#c69d8d',0);}
    else if(panic)oval(c,0,19,2.1,2.5,'#62544a',.8);
    else if(sad)curve(c,[-4,21],[Math.sin(t*12)*.6,16],[4,21],1);
    else if(feeling==='angry')stroke(c,[[-5,18],[-2,17],[0,19],[3,17],[5,18]],1);
    else if(smile)curve(c,[-5,17],[0,24],[5,17],1);
    else if(determined)curve(c,[-4,19],[0,17],[4,19],1);
    if(drool>.01){
        // Start inside the open mouth, then hang over the bib in one wet pen stroke.
        const length=47*drool,end=22+length,sway=Math.sin(t*2.2)*drool*1.3;
        c.beginPath();c.moveTo(1,21);c.quadraticCurveTo(6,22+length*.25,3,22+length*.5);
        c.quadraticCurveTo(-1+sway,22+length*.8,4+sway,end);
        c.strokeStyle='#6d918b';c.lineWidth=4.6;c.stroke();
        c.strokeStyle='#bed5c9';c.lineWidth=3.1;c.stroke();
        oval(c,4+sway,end,2.2+drool*2,2.8+drool*3.2,'#bed5c9',.9,'#6d918b');
        oval(c,3+sway,end-1.5,1,1.8,'#f1f4e8',0);
    }
    if(determined)for(const side of [-1,1])oval(c,side*19,12,3.4,1.5,'#c7a497',0);
    if(feeling==='crying'||feeling==='desperate'&&emotionAge>1){
        for(const side of [-1,1]){const u=(t*.8+(side===1?.43:0))%1,ex=side*13,ey=8+u*25;c.save();c.globalAlpha=1-u;c.beginPath();c.moveTo(ex,ey-3);c.quadraticCurveTo(ex-3.8,ey+3,ex,ey+5);c.quadraticCurveTo(ex+3.8,ey+3,ex,ey-3);c.fillStyle='#8cbbbb';c.fill();c.restore();}
    }
    if(panic)for(const side of [-1,1]){const j=Math.sin(t*12)*1.3;stroke(c,[[side*30,-13+j],[side*35,-18+j]],1,'#88755f');stroke(c,[[side*32,-5],[side*38,-6]],1,'#88755f');}
    for(const side of [-1,1])for(let i=0;i<2;i++)curve(c,[side*12,13+i*3],[side*22,11+i*5],[side*31,10+i*7],.7,ink);
    c.restore();
}
function goldrim(c,p){
    c.save();c.translate(...p.head);c.rotate(p.tilt-.12);c.scale(-1,1);
    // Classic red leather Goldrim: close crown, hanging ear flap, brass scrollwork.
    c.beginPath();c.moveTo(-28,-15);c.bezierCurveTo(-31,-34,-8,-40,13,-34);
    c.bezierCurveTo(34,-33,35,-12,31,6);c.quadraticCurveTo(31,19,20,12);
    c.lineTo(18,-8);c.quadraticCurveTo(-3,-15,-28,-15);c.closePath();
    c.fillStyle='#813e37';c.fill();c.strokeStyle=ink;c.lineWidth=1.25;c.stroke();
    c.beginPath();c.moveTo(-29,-15);c.lineTo(-28,-21);c.quadraticCurveTo(-9,-25,18,-18);c.lineTo(18,-12);c.quadraticCurveTo(-6,-18,-29,-15);
    c.fillStyle='#b99c62';c.fill();c.stroke();
    for(const x of [-19,-5,9]){c.beginPath();c.ellipse(x,-24,5,6,-.4,0,TAU);c.strokeStyle='#b99c62';c.lineWidth=1;c.stroke();}
    curve(c,[11,-33],[22,-24],[20,-10],.9);curve(c,[25,-22],[29,-5],[24,10],.85);
    c.restore();
}
function wing(c,shoulder,tip,bend,near){
    const dx=tip[0]-shoulder[0],dy=tip[1]-shoulder[1],length=Math.max(12,Math.hypot(dx,dy));
    c.save();c.translate(...shoulder);c.rotate(Math.atan2(dy,dx));
    // Broad folded flight feathers, tapering to a long tip rather than a hand.
    const breadth=near?19:16;
    c.beginPath();c.moveTo(-5,-6);
    c.bezierCurveTo(length*.18,-breadth,length*.72,-breadth*.94,length+3,-2);
    c.quadraticCurveTo(length+7,3,length-4,5);
    c.quadraticCurveTo(length+1,11,length-10,10);
    c.quadraticCurveTo(length-7,17,length-18,14);
    c.bezierCurveTo(length*.25,breadth*.82,-10,10,-5,-6);
    c.fillStyle='#cfc3ac';c.fill();c.strokeStyle=ink;c.lineWidth=near?1.45:1.05;c.stroke();
    c.beginPath();c.moveTo(2,-7);c.bezierCurveTo(length*.32,-breadth*.75,length*.62,-5,length-4,5);c.stroke();
    for(let i=0;i<3;i++)curve(c,[length*.22+i*5,-breadth*.37],[length*.52+i*3,-2],[length-18+i*7,12-i*3],.7,'#8c7e66');
    c.restore();
}
function workCostume(c,p,role,t){
    c.save();c.translate(...p.head);c.rotate(p.tilt);
    const pen=(pts,w=1.25,col=ink)=>stroke(c,pts,w,col);
    if(role==='baxter'){
        c.beginPath();c.moveTo(-23,-18);c.bezierCurveTo(-29,-15,29,-13,25,-19);c.lineTo(15,-21);c.lineTo(13,-47);c.bezierCurveTo(4,-51,-11,-49,-15,-46);c.lineTo(-14,-21);c.closePath();c.fillStyle='#44433b';c.fill();c.strokeStyle=ink;c.lineWidth=1.3;c.stroke();
        pen([[-14,-25],[-5,-24],[5,-24],[15,-26]],3,'#b09b69');pen([[-10,-43],[-9,-31]],.8,'#928a75');
    }else if(role==='product-manager'){
        pen([[-20,-1],[-17,-8],[-6,-7],[-6,1],[-16,2],[-20,-1],[-6,-2],[4,-2],[5,-8],[17,-8],[20,-1],[17,2],[5,1],[4,-2]],1.15);
        pen([[20,-3],[29,-7]],1.1);
    }else if(role==='developer'){
        c.beginPath();c.moveTo(-25,-1);c.bezierCurveTo(-34,-37,32,-41,28,-1);c.strokeStyle=ink;c.lineWidth=2;c.stroke();
        for(const side of [-1,1]){c.beginPath();c.ellipse(side*26,-1,5,11,side*.1,0,Math.PI*2);c.fillStyle='#767e77';c.fill();c.strokeStyle=ink;c.lineWidth=1.2;c.stroke();}
        pen([[-13,1],[-6,1]],1.8);pen([[6,1],[13,1]],1.8);
    }else if(role==='verifier'){
        c.beginPath();c.moveTo(-23,-17);c.lineTo(-19,-31);c.quadraticCurveTo(0,-40,20,-30);c.lineTo(23,-17);c.closePath();c.fillStyle='#737d7c';c.fill();c.strokeStyle=ink;c.lineWidth=1.3;c.stroke();
        c.beginPath();c.moveTo(-24,-17);c.quadraticCurveTo(17,-12,31,-19);c.quadraticCurveTo(12,-23,-24,-17);c.fillStyle=ink;c.fill();
        pen([[-4,-29],[3,-31],[7,-27],[3,-22],[-3,-24],[-4,-29]],1,'#d0b973');
    }
    c.restore();c.save();c.translate(...p.chest);
    if(role==='product-manager'){
        stroke(c,[[-13,-2],[0,5],[12,-3]],1.2);stroke(c,[[0,5],[-3,10],[2,22],[6,10],[0,5]],1.25,'#a08a57');
        stroke(c,[[-11,1],[-9,18],[0,20]],.8);c.fillStyle=paper;c.fillRect(-15,17,11,13);stroke(c,[[-15,17],[-4,17],[-4,30],[-15,29],[-15,17]],.8);stroke(c,[[-12,22],[-7,22],[-12,25],[-8,25]],.7);
    }else if(role==='developer'){
        curve(c,[-17,-1],[-8,13],[0,6],1.2);curve(c,[0,6],[9,13],[16,-1],1.2);stroke(c,[[-5,9],[-7,21]],.8);stroke(c,[[6,9],[8,19]],.8);curve(c,[-12,26],[0,22],[12,26],1);
    }else if(role==='verifier'){
        stroke(c,[[-16,1],[0,8],[16,1]],1.1);stroke(c,[[6,10],[13,8],[18,12],[15,21],[10,23],[6,18],[6,10]],1.1,'#a08a57');stroke(c,[[-14,16],[-9,15],[-7,26],[-13,27],[-14,16]],1.2);stroke(c,[[-12,15],[-13,8]],1.1);
    }
    c.restore();
}
export function drawMeowl(c,x,y,size,o={}){
    const toy=toyPose(c,o.id||'meowl',x,y,size,o,drawMeowl);if(toy.hidden)return{hands:[{x,y},{x,y}],head:{x,y:y-size*.7},hip:{x,y},feet:[{x,y},{x,y}],hidden:true};x=toy.x;y=toy.y;o=toy.options;
    const interaction=o.mode==='held'?'squirm':(o.hovered||mouseOverMeowl(c,x,y,size))?'wave':null;
    if(c.canvas.isConnected){c.canvas.__meowlResponses??={};c.canvas.__meowlResponses[o.id||'meowl']=interaction;}
    if(o.mode==='flattened')return pancake(c,x,y,size,o.time||0,o.splatAge||0,o.ground,o.voice||0,interaction==='wave');
    const t=o.time||0,seed=o.seed||0,scale=size/100;
    const mode=o.mode||(o.air?'air':o.pet?'happy':o.nervous?'nervous':o.push?'push':Math.abs(o.speed||0)>5?'walk':'rest');
    const loaded=['push','anticipate','brace','slide','heave','backpush','turn'].includes(mode),effort=o.effort??(loaded?.76:0),phase=o.stroke??((t*.44)%1);
    let collection=rigs.get(c);if(!collection){collection=new Map();rigs.set(c,collection);}
    const key=o.id??seed;let state=collection.get(key);const target=poseFor(mode,t,effort,phase,o.speed||0,state?.gait||0);
    if(o.overhead){target.left=[-32,-94];target.right=[31,-95];}
    if(o.parkour){
        const {kind,phase:q=0}=o.parkour,flap=Math.sin(t*19);
        if(['flutter','fly'].includes(kind)){target.left=[-66,-53+flap*32];target.right=[62,-53+flap*32];target.tilt=Math.sin(t*5)*.06;}
        if(kind==='cheer'){target.left=[-55+Math.sin(t*24)*14,-95+Math.cos(t*24)*17];target.right=[55+Math.cos(t*24)*14,-95+Math.sin(t*24)*17];target.feet=[-24,24];target.turn=0;target.tilt=Math.sin(t*16)*.13;}
        if(kind==='fall'){target.left=[-48,-40];target.right=[48,-43];target.feet=[-12,13];target.tilt=Math.sin(t*5)*.1;}
        if(kind==='hang'){target.left=[-25,-115];target.right=[25,-115];target.feet=[-9,9];target.tilt=Math.sin(t*3)*.08;}
        if(kind==='pole'){const grip=Math.sin(t*9)*3;target.hip=[-13,-17];target.chest=[-10,-45];target.head=[-8,-74];target.left=[3,-69+grip];target.right=[11,-45-grip];target.feet=[-26,10];target.turn=.55;target.tilt=.1;}
        if(kind==='walljump'||kind==='wallkick'){const kick=Math.sin(Math.min(1,q)*Math.PI);target.hip=[-8,-14];target.chest=[4,-46];target.head=[9,-75];target.left=[-34,-71];target.right=[43,-61];target.feet=[-28-kick*8,13];target.tilt=-.18+kick*.32;target.turn=.35;}
        if(kind==='grind'){
target.hip=[-12,-9];target.chest=[-4,-40];target.head=[2,-66];target.feet=[-26,17];target.left=[-60,-56];target.right=[53,-48];target.tilt=-.17+Math.sin(t*9)*.045;}
        if(kind==='wave'||kind==='hello'||kind==='peek'){target.left=[-36,-65];target.right=[40+Math.sin(t*15)*17,-100+Math.cos(t*15)*10];target.turn=0;target.tilt=Math.sin(t*7)*.06;target.head=[0,-77];}
        if(kind==='hello'){target.left=[-48+Math.sin(t*19)*15,-103+Math.cos(t*19)*13];target.right=[48+Math.cos(t*21)*16,-100+Math.sin(t*21)*15];target.feet=[-22,22];target.turn=0;target.tilt=Math.sin(t*9)*.11;}
        if(kind==='starhop'){target.left=[-64,-94];target.right=[64,-94];target.feet=[-24,24];target.turn=0;target.tilt=Math.sin(t*10)*.07;}
        if(kind==='typing'){const tap=Math.sin(Math.floor(t*10)*1.7);target.hip=[-5,-8];target.chest=[-1,-38];target.head=[4,-66+Math.sin(t*3)*1.4];target.left=[23,-32+tap*4];target.right=[43,-32-tap*4];target.feet=[-20,12];target.turn=.45;target.tilt=.08;}
        if(kind==='point'){target.left=[-28,-35];target.right=[61,-65];target.turn=.5;target.tilt=-.08;}
        if(kind==='balance'){target.left=[-60,-48+Math.sin(t*8)*8];target.right=[57,-49-Math.sin(t*8)*8];target.tilt=Math.sin(t*6)*.13;}
        if(kind==='tiptoe'){target.left=[-31,-29];target.right=[34,-31];target.chest=[-9,-48];target.head=[-7,-74];target.tilt=.14;}
        if(kind==='scramble'){target.left=[-47,-41];target.right=[43,-43];target.tilt=-.24;}
        if(kind==='climb'){target.left=[-22,-79+Math.sin(t*11)*16];target.right=[30,-83-Math.sin(t*11)*16];target.tilt=-.12;}
        if(kind==='kong'){target.left=[-25,-17-Math.max(0,Math.sin(q*Math.PI*4))*32];target.right=[35,-18-Math.max(0,Math.sin(q*Math.PI*4))*32];target.chest=[8,-43];target.head=[15,-68];target.tilt=.3;target.feet=[-18,-6];}
        if(kind==='leap'||kind==='triple'){target.left=[-48,-73];target.right=[42,-66];target.feet=[-18,18];target.tilt=-.15;}
        if(kind==='crouch'||kind==='land'){target.hip=[-3,-7];target.chest=[-4,-35];target.head=[-2,-61];target.left=[-35,-18];target.right=[33,-17];}
    }
    // Hover and holding are universal, independent of the scene's job or costume.
    if(interaction==='wave'){
        target.right=[42+Math.sin(t*17)*13,-98+Math.cos(t*17)*8];target.head=[0,-77];target.turn=0;target.tilt=Math.sin(t*6)*.05;
        o={...o,rock:null};
    }else if(interaction==='squirm'){
        const wriggle=Math.sin(t*19),kick=Math.sin(t*23);
        target.hip=[wriggle*5,-15];target.chest=[-wriggle*4,-51];target.head=[wriggle*3,-77+Math.sin(t*13)*2];
        target.left=[-43,-53+kick*20];target.right=[45,-53-kick*20];target.feet=[-13-wriggle*7,13+wriggle*7];target.tilt=wriggle*.17;target.turn=0;
        o={...o,air:true,ground:undefined,rock:null};
    }
    if(['upset','crying'].includes(o.emotion)){target.head[1]+=4;target.tilt+=.09;target.chest[1]+=2;target.head[0]+=Math.sin(t*7)*.5;}
    const reset=!state||t<state.t||Math.hypot(x-state.x,y-state.y)>size*1.7||size!==state.size;
    if(reset){state={t,x,y,size,p:structuredClone(target),feet:[],nextFoot:0,gait:0,mode,soft:{p:0,v:0},sway:{p:0,v:0},headLag:{p:0,v:0},vy:0};collection.set(key,state);}
    const dt=clamp(t-state.t,0,.05),smoothing=1-Math.exp(-dt*(mode==='brace'?25:12));
    for(const name of ['hip','chest','head','left','right','feet'])state.p[name]=state.p[name].map((v,i)=>mix(v,target[name][i],smoothing));
    state.p.turn=mix(state.p.turn,target.turn,smoothing);state.p.tilt=mix(state.p.tilt,target.tilt,smoothing);
    const p={...state.p};for(const name of ['hip','chest','head','left','right','feet'])p[name]=state.p[name].slice();
    const air=o.air||['held','air','spring'].includes(mode),pulse=Math.sin(Math.PI*clamp((phase-.17)/.57,0,1));
    if(state.mode==='air'&&!air)state.soft.v+=.8;
    if(mode==='brace'&&state.mode!=='brace')state.soft.v+=.6;
    const squish=clamp(spring(state.soft,air?-.04:loaded?effort*(.025+pulse*.10):(o.landed||0)*.25,dt),-.065,.19);
    const sway=clamp(spring(state.sway,clamp(-(o.speed||0)/800,-.15,.15),dt,95,12),-.2,.2);
    const headLag=spring(state.headLag,squish*15,dt,85,9);
    p.hip[1]+=squish*6;p.chest[1]+=squish*28;p.head[1]+=headLag;p.head[0]+=sway*10;p.tilt+=sway;
    const face=o.facing===-1?-1:1,ground=o.ground||(()=>y);
    if(state.face!==undefined&&state.face!==face)state.feet=[];state.face=face;
    if(o.ground&&!air)p.hip[1]=clamp(Math.max(p.hip[1],(ground(x+p.hip[0]*scale*face)-y)/scale-12),-22,-6);
    const local=(wx,wy)=>[(wx-x)/scale*face,(wy-y)/scale],world=([lx,ly])=>({x:x+lx*scale*face,y:y+ly*scale});
    if(o.rock?.contact&&o.rock.vertices.every(v=>Number.isFinite(v.x))&&mode==='backpush'){
        const contactY=y+(p.chest[1]+7)*scale;
        const edge=rockEdge(o.rock.vertices,contactY,x+20*scale);
        const shift=clamp((edge-x)/scale-(p.chest[0]+21),-10,15);
        for(const name of ['hip','chest','head','left','right'])p[name][0]+=shift;
        p.feet=p.feet.map(v=>v+shift);
    }
    const travel=Math.abs(x-state.x);
    state.gait+=(travel>.01?travel:Math.abs(o.speed||0)*dt)/Math.max(1,size)*TAU*2.8;
    const feet=[];
    for(let i=0;i<2;i++){
        const desired=x+p.feet[i]*scale*face;let foot=state.feet[i];
        if(!foot||reset)foot=state.feet[i]={x:desired,from:desired,to:desired,age:1};
        const reach=loaded?size*.07:size*.055;
        if(!air&&foot.age>=1&&(state.feet[1-i]?.age??1)>=1&&Math.abs(desired-foot.x)>reach){foot.from=foot.x;foot.to=desired+(loaded?0:(o.speed||0)*.025);foot.age=0;}
        let fy=ground(foot.x);
        if(mode==='slide'){foot.x=mix(foot.x,desired,1-Math.exp(-dt*17));foot.age=1;fy=ground(foot.x);}
        else if(foot.age<1){
            const travelling=Math.abs(x-state.x)/Math.max(.001,dt);
            const duration=Math.min(mode==='stagger'?.14:loaded?.20:.13,size*.08/Math.max(1,travelling));
            foot.age=Math.min(1,foot.age+dt/Math.max(.07,duration));
            const u=foot.age,ease=u*u*(3-2*u);foot.x=mix(foot.from,foot.to,ease);fy=ground(foot.x)-Math.sin(u*Math.PI)*size*(loaded?.025:.045);
        }
        const guideScamper=o.id==='guide'&&mode==='scurry'&&Math.abs(o.speed||0)>35;
        const guideAir=o.id==='guide'&&air&&!['pole','hang'].includes(o.parkour?.kind);
        if(o.parkour?.kind==='grind')feet.push([p.feet[i],0]);
        else if(guideAir){
            const stride=t*15+i*Math.PI,kind=o.parkour?.kind;
            if(['walljump','wallkick'].includes(kind))feet.push([p.hip[0]+(i?-5:20),p.hip[1]+(i?12:23)]);
            else if(['leap','triple','kong'].includes(kind))feet.push([p.hip[0]+(i?20:-20),p.hip[1]+(i?23:10)]);
            else feet.push([p.hip[0]+(i?6:-6)+Math.sin(stride)*10,p.hip[1]+17-Math.max(0,Math.cos(stride))*7]);
        }
        else if(air)feet.push([p.feet[i]+Math.sin(t*7+i*2)*3,Math.sin(t*7+i*2)*3+1]);
        else if(guideScamper){
            const stride=state.gait*1.18+i*Math.PI;
            feet.push([p.hip[0]+(i?5:-5)+Math.sin(stride)*18,p.hip[1]+23-Math.max(0,Math.cos(stride))*12]);
        }
        else if(!o.ground&&!loaded&&Math.abs(o.speed||0)>5){const stride=state.gait+i*Math.PI;feet.push([p.feet[i]+Math.sin(stride)*4,-Math.max(0,Math.cos(stride))*4]);}
        else feet.push(local(foot.x,fy));
    }
    // A foot must replant before the drawing can stretch beyond its leg bones.
    // Project the overshoot back onto the terrain, rather than floating a toe.
    if(o.ground&&!air)for(let i=0;i<2;i++){
        const hip=[p.hip[0]+(i?6:-6),p.hip[1]],foot=feet[i];
        if(Math.hypot(foot[0]-hip[0],foot[1]-hip[1])>22){
            let far=world(foot).x,near=world(hip).x;
            for(let j=0;j<12;j++){
                const middle=(far+near)/2,q=local(middle,ground(middle));
                if(Math.hypot(q[0]-hip[0],q[1]-hip[1])>21.5)far=middle;else near=middle;
            }
            feet[i]=local(near,ground(near));state.feet[i].x=near;state.feet[i].age=1;
        }
    }
    // Never let a distant terrain sample pull the feet through the body.
    for(let i=0;i<2;i++){feet[i][0]=clamp(feet[i][0],p.hip[0]-23,p.hip[0]+23);feet[i][1]=clamp(feet[i][1],p.hip[1]+9,p.hip[1]+24);}
    p.chest[1]=clamp(p.chest[1],p.hip[1]-43,p.hip[1]-26);p.head[1]=clamp(p.head[1],p.chest[1]-31,p.chest[1]-21);
    // Bone limits apply in both axes, including a retreating rock and extreme poses.
    for(const [child,parent,max]of[['chest','hip',45],['head','chest',31]]){const dx=p[child][0]-p[parent][0],dy=p[child][1]-p[parent][1],d=Math.hypot(dx,dy);if(d>max){p[child][0]=p[parent][0]+dx/d*max;p[child][1]=p[parent][1]+dy/d*max;}}
    const hands=[p.left.slice(),p.right.slice()];
    if(o.cargoOffset)for(const hand of hands)hand[0]+=o.cargoOffset;
    if(o.rock?.contact&&face===1&&['push','brace','slide','heave'].includes(mode)){
        for(let i=0;i<2;i++){const desiredY=y+hands[i][1]*scale,contactX=rockEdge(o.rock.vertices,desiredY,x+hands[i][0]*scale);if(contactX>=x-size*.05&&contactX<x+size*.7)hands[i]=local(contactX-2*scale,desiredY);}
    }
    for(let i=0;i<2;i++){const shoulder=[p.chest[0]+(i?16:-17),p.chest[1]+(i?8:5)],dx=hands[i][0]-shoulder[0],dy=hands[i][1]-shoulder[1],d=Math.hypot(dx,dy),reach=o.overhead||air?79:loaded?39:48;if(d>reach){hands[i]=[shoulder[0]+dx/d*reach,shoulder[1]+dy/d*reach];}}
    c.save();c.translate(x,y);c.scale(scale*face,scale);c.lineCap='round';c.lineJoin='round';
    const guideScamper=o.id==='guide'&&mode==='scurry'&&Math.abs(o.speed||0)>35;
    const guideAir=o.id==='guide'&&air&&!['pole','hang'].includes(o.parkour?.kind);
    feet.forEach((foot,i)=>{
        // A crooked pen flourish gives each short bird foot three toes.
        const [fx,fy]=foot;
        if(guideScamper||guideAir){
            const hipX=p.hip[0]+(i?6:-6),hipY=p.hip[1]+4,kneeX=mix(hipX,fx,.55)+(i?3:-3),kneeY=mix(hipY,fy-8,.52)-2;
            curve(c,[hipX,hipY],[kneeX,kneeY],[fx-1,fy-8],1.7);
        }
        c.beginPath();c.moveTo(fx-1,fy-9);
        c.bezierCurveTo(fx-4,fy-1,fx-2,fy,fx+(guideScamper||guideAir?14:7),fy);
        c.lineTo(fx,fy);c.lineTo(fx+(guideScamper||guideAir?11:5),fy+3);c.lineTo(fx-1,fy+1);c.lineTo(fx-(guideScamper||guideAir?9:5),fy+2);
        c.strokeStyle=ink;c.lineWidth=guideScamper||guideAir?1.65:1.2;c.stroke();
    });
    if(guideScamper){
        const flutter=Math.sin(state.gait)*1.5;
        for(let i=0;i<3;i++)curve(c,[p.hip[0]-18-i*6,p.hip[1]+12+i*3+flutter],[p.hip[0]-24-i*7,p.hip[1]+10+i*3],[p.hip[0]-30-i*8,p.hip[1]+12+i*3],1.15-i*.08,faint);
    }else if(guideAir&&['walljump','wallkick','leap','triple','kong'].includes(o.parkour?.kind)){
        for(let i=0;i<2;i++)curve(c,[p.hip[0]-19-i*7,p.hip[1]+12+i*5],[p.hip[0]-27-i*8,p.hip[1]+8+i*5],[p.hip[0]-35-i*9,p.hip[1]+11+i*5],.85,faint);
    }
    const shoulders=[[p.chest[0]-17,p.chest[1]+5],[p.chest[0]+16,p.chest[1]+8]];
    wing(c,shoulders[0],hands[0],1,false);
    silhouette(c,p,t,effort);
    drawFace(c,p,t,mode,effort,o.look||0,seed,o.emotion,o.emotionAge||0,o.voice||0,o.drool||0);
    if(o.hat==='goldrim')goldrim(c,p);
    if(o.costume)workCostume(c,p,o.costume,t);
    wing(c,shoulders[1],hands[1],-1,true);
    if(o.parkour?.kind==='cheer'){
        for(const [j,hand]of hands.entries()){
            c.save();c.translate(...hand);c.rotate(Math.sin(t*20+j)*.4);
            for(let i=0;i<40;i++){const a=i*Math.PI/20,r=30+Math.sin(i*2.7+t*17)*6;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a+.25)*r*.7,Math.sin(a+.25)*r*.7,Math.cos(a)*r,Math.sin(a)*r);c.strokeStyle=j?'#326bc1':'#ec302b';c.lineWidth=i%3===0?2.4:1.7;c.stroke();}
            c.restore();
        }
    }
    if(o.cargo){
        o.cargo(c,{x:(hands[0][0]+hands[1][0])/2,y:(hands[0][1]+hands[1][1])/2});
        for(const [i,hand]of hands.entries()){const side=i?1:-1;curve(c,[hand[0]+side*4,hand[1]-6],[hand[0]-side*6,hand[1]-5],[hand[0]-side*4,hand[1]+1],1.2);}
    }
    if(effort>.72){for(let i=0;i<(o.sweat?3:1);i++){const drop=(t*1.8+i*.31)%1,side=i%2?1:-1;c.globalAlpha=(1-drop)*.8;stroke(c,[[p.head[0]+side*(25+drop*9),p.head[1]-9+i*4+drop*13],[p.head[0]+side*(27+drop*9),p.head[1]-4+i*4+drop*13]],1.35,faint);}c.globalAlpha=1;}
    c.restore();state.t=t;state.x=x;state.y=y;state.mode=mode;
    return{style:'scribble',mode,emotion:o.emotion||'calm',squish,feet:feet.map(world),hands:hands.map(world),head:world(p.head),hip:world(p.hip)};
}
