import {threadLife} from './thread-life.js';
// One landscape-to-footer stroke, rebuilt only when layout changes.
export const mountainPoints=[[0,.73],[.035,.724],[.07,.70],[.093,.68],[.112,.699],[.151,.65],[.181,.673],[.213,.61],[.242,.655],[.267,.634],[.304,.681],[.341,.67],[.38,.703],[.43,.705],[.47,.72]];
export function sceneryCommands(w,h,offset,groundAt){
    const phone=w<760,commands=[],sx=u=>u*w;
    // A quiet strip below the copy. Mountain ranges retain distinct peaks on phones.
    const top=phone?h*.515:h*.49,span=phone?h*.15:h*.23;
    let x=w*.07,y=top+span*.34;commands.push(['M',x,y]);
    const curve=(bx,by,cx,cy,dx,dy)=>{commands.push(['C',bx,by,cx,cy,dx,dy]);x=dx;y=dy;};
    function cloud(u,v,size){
        const cx=sx(u),cy=top+span*v,k=Math.min(w/900,1)*size;
        curve(x+28*k,y+14*k,cx-27*k,cy+12*k,cx,cy);
        curve(cx+13*k,cy-2*k,cx+6*k,cy-19*k,cx+24*k,cy-17*k);
        curve(cx+23*k,cy-43*k,cx+58*k,cy-42*k,cx+58*k,cy-15*k);
        curve(cx+70*k,cy-34*k,cx+96*k,cy-22*k,cx+89*k,cy-4*k);
        curve(cx+118*k,cy-13*k,cx+119*k,cy+6*k,cx+141*k,cy+3*k);
        curve(cx+107*k,cy+14*k,cx+32*k,cy+8*k,cx+6*k,cy+3*k);
    }
    cloud(.09,.34,.8);
    curve(x-27,y+15,sx(.27),top+span*.77,sx(.33),top+span*.60);
    cloud(.36,.31,.95);
    const highCloudJoin=commands.length;
    curve(x-25,y+16,sx(.58),top+span*.82,sx(.67),top+span*.48);
    cloud(.69,.18,.70);
    // Rounded mountain shoulders, then a winding valley into a second range.
    function range(points){
        const pts=points.map(([u,v])=>[sx(u),top+span*v]);
        curve(x+28,y+14,pts[0][0]+20,pts[0][1]+10,...pts[0]);
        for(let i=0;i<pts.length-1;i++){
            const a=pts[Math.max(0,i-1)],p=pts[i],q=pts[i+1],b=pts[Math.min(pts.length-1,i+2)];
            curve(p[0]+(q[0]-a[0])*.12,p[1]+(q[1]-a[1])*.12,q[0]-(b[0]-p[0])*.12,q[1]-(b[1]-p[1])*.12,...q);
        }
    }
    range([[.83,.72],[.77,.51],[.725,.65],[.67,.20],[.615,.58],[.585,.43],[.55,.77],[.51,.64],[.47,.89]]);
    curve(sx(.42),top+span*1.01,sx(.39),top+span*.52,sx(.36),top+span*.53);
    range([[.36,.53],[.32,.71],[.265,.31],[.23,.62],[.195,.51],[.155,.82],[.105,.62],[.063,.88],[.026,1.03]]);
    const end=.73*h+offset;
    curve(sx(.012),top+span*1.08,sx(.015),end-9,0,end);
    // Give the distant drawing its own band above the physical ridge.
    // It can curl wildly within that band without becoming a second foreground hill.
    const origin=document.querySelector('#playground').getBoundingClientRect();
    const copy=[...document.querySelectorAll('.introduction,.pencil-note')].map(el=>{const r=el.getBoundingClientRect();return{left:r.left-origin.left,right:r.right-origin.left,bottom:r.bottom-origin.top};});
    const project=(px,py)=>{
        const nx=px*(phone?.68:.88),lower=(groundAt?groundAt(nx):h*.84-nx*.3)-(phone?44:72);
        let upper=lower-(phone?80:145);
        for(const r of copy)if(nx>=r.left-10&&nx<=r.right+10)upper=Math.max(upper,r.bottom+18);
        upper=Math.min(upper,lower-18);
        const v=Math.max(0,Math.min(1,(py-top+span*.08)/(span*1.20)));
        return[nx,upper+v*(lower-upper)];
    };
    for(const command of commands)for(let i=1;i<command.length;i+=2){const p=project(command[i],command[i+1]);command[i]=p[0];command[i+1]=p[1];}
    // The clipboard's higher cloud grows out of the existing middle-cloud tail.
    // It replaces one connecting curve; no new move, outline or second path.
    const previous=commands[highCloudJoin-1],next=commands[highCloudJoin];
    const a=[previous.at(-2),previous.at(-1)],b=[next.at(-2),next.at(-1)];
    const title=copy[0],quote=copy[1];
    const left=phone?w*.69:Math.max(w*.325,(title?.right||0)+22);
    const cw=phone?w*.16:Math.max(64,Math.min(w*.16,300,(quote?.left||w)-left-26));
    const ch=phone?Math.min(49,h*.058):Math.min(h*.13,w*.063,132);
    const base=h*.405,right=left+cw,added=[];
    const add=(...v)=>added.push(['C',...v]);
    const cloudPen=(...v)=>add(...v.map((n,i)=>i%2?base+n*ch:left+n*cw));
    const groundLimit=px=>(groundAt?groundAt(px):h*.84-px*.3)-(phone?34:65);
    // Sweep upward through the whitespace. The incoming tangent continues the
    // old cloud's small leftward curl instead of attaching at a sharp corner.
    const vx=a[0]-previous[3],vy=a[1]-previous[4],len=Math.hypot(vx,vy)||1;
    if(phone){
        const below=Math.max(a[1],(quote?.bottom||0)+30),side=left-9;
        add(a[0]+vx/len*20,a[1]+vy/len*20,side,below+15,side,below);
        add(side,below-40,left-cw*.12,base+ch*.28,left,base);
    }else add(a[0]+vx/len*25,a[1]+vy/len*25,left-cw*.18,base+ch*.52,left,base);
    // Unequal lobes, one higher shoulder and a long, slightly sagging underside.
    cloudPen(-.12,-.28,-.05,-.57,.12,-.52);
    cloudPen(.10,-.91,.32,-1.01,.42,-.73);
    cloudPen(.53,-1.08,.68,-.92,.70,-.57);
    cloudPen(.90,-.83,1.07,-.45,.99,-.16);
    cloudPen(.90,.04,.45,.02,.18,.06);
    cloudPen(-.09,.10,.10,.27,.37,.17);
    // The cloud's loose underline becomes a valley, then two distant summits.
    const x0=right-cw*.21,x1=right+cw*.04,x2=right+cw*.34,x3=right+cw*.53,x4=right+cw*.69;
    const valley=Math.min(base+ch*1.55,groundLimit(x0));
    const peak=Math.min(base+ch*.17,groundLimit(x1));
    const saddle=Math.min(base+ch*1.29,groundLimit(x2));
    const peak2=Math.min(base+ch*.62,groundLimit(x3));
    const foot=Math.min(base+ch*1.13,groundLimit(x4));
    add(left+cw*.64,base+ch*.07,x0-cw*.32,valley+ch*.12,x0,valley);
    add(x0+cw*.14,valley-ch*.08,x1-cw*.09,peak+ch*.08,x1,peak);
    add(x1+cw*.06,peak-ch*.03,x2-cw*.15,saddle-ch*.10,x2,saddle);
    add(x2+cw*.08,saddle+ch*.01,x3-cw*.06,peak2+ch*.02,x3,peak2);
    add(x3+cw*.04,peak2-ch*.02,x4-cw*.06,foot-ch*.02,x4,foot);
    // Follow the original connector's exit tangent into the next low cloud.
    add(x4+cw*.14,foot+ch*.04,next[3],next[4],...b);
    commands.splice(highCloudJoin,1,...added);
    // This is the sole intentional join from background into the climbing surface.
    const last=commands.at(-1);last[last.length-2]=0;last[last.length-1]=end;
    return commands;
}
const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
svg.classList.add('pen-thread');svg.setAttribute('aria-hidden','true');svg.append(path);document.body.prepend(svg);
const life=threadLife(svg,path);
let pending=0,hill=[],mountainOffset=0;
export function setHillContour(points,offset=0){hill=points;mountainOffset=offset;schedule();}
// Continue uphill out of the page, then let the pen wander down the sketchbook.
// Both renderers use these controls so the canvas/SVG seam has one tangent.
export function hillExit(w,start,slope,fullHeight,margin,stageHeight){
    const [x,y]=start,lane=w-8,reach=w*.023,stage=stageHeight??fullHeight-(w<760?285:190),guard=stage-(w<760?160:132),drop=Math.max(85,guard-y);
    const phone=w<760;
    const upper=[
        [x+reach,y+reach*slope,lane,y+drop*.09,lane,y+drop*.23],
        [lane,y+drop*.39,w*.87,y+drop*.42,w*.88,y+drop*.57],
        [w*.89,y+drop*.72,w*.97,y+drop*.72,w*.965,y+drop*.82],
        [w*.958,y+drop*.97,w*.81,guard-40,w*.79,guard-9],
        [w*.77,guard+22,lane,guard-3,lane,guard+28]
    ];
    // Stay outside the creation controls, then spend the empty lower margin
    // on one generous loop. The canvas and page stroke share every control.
    if(phone)return [...upper,
        [lane,stage-75,w-17,fullHeight-100,w-17,fullHeight-65],
        [w-17,fullHeight-25,w*.55,fullHeight-45,w*.58,fullHeight-10],
        [w*.61,fullHeight+25,w*.88,fullHeight+10,w*.87,fullHeight-17],
        [w*.86,fullHeight-44,w*.73,fullHeight-38,w*.76,fullHeight-14],
        [w*.79,fullHeight+10,w-margin,fullHeight+42,w-margin,fullHeight+112]
    ];
    return [...upper,
        [lane,stage-68,w*.957,fullHeight-143,w*.974,fullHeight-112],
        [w*.998,fullHeight-68,w*.80,fullHeight-65,w*.73,fullHeight-22],
        [w*.64,fullHeight+33,w*.76,fullHeight+105,w*.85,fullHeight+59],
        [w*.94,fullHeight+13,w*.84,fullHeight-30,w*.80,fullHeight+4],
        [w*.75,fullHeight+47,w-margin,fullHeight+69,w-margin,fullHeight+112]
    ];
}
function schedule(){if(!pending)pending=requestAnimationFrame(layout);}
function rect(el){const r=el.getBoundingClientRect();return{x:r.left,y:r.top+scrollY,w:r.width,h:r.height};}
function sceneRect(frame,selector){
    const r=rect(frame),el=frame.contentDocument?.querySelector(selector);
    if(!el)return{x:r.x+14,y:r.y+54,w:r.w-28,h:r.h-138};
    const q=el.getBoundingClientRect();return{x:r.x+q.left,y:r.y+q.top,w:q.width,h:q.height,threadY:Number(el.dataset.threadY)||null,threadPoints:el.dataset.threadPoints?JSON.parse(el.dataset.threadPoints):null};
}
function layout(){
    pending=0;if(!hill.length)return;
    const w=document.documentElement.clientWidth,world=rect(document.querySelector('#world')),stage=rect(document.querySelector('#playground'));
    const book=document.querySelector('.sketchbook'),h=Math.ceil(rect(book).y+book.offsetHeight),points=[];
    const margin=w<760?10:Math.max(24,(w-book.offsetWidth)/2+22);
    let x=mountainPoints.at(-1)[0]*w,y=mountainPoints.at(-1)[1]*stage.h+mountainOffset;
    points.push([x,y]);
    function to(nx,ny){x=nx;y=ny;points.push([x,y]);}
    function curve(bx,by,cx,cy,dx,dy){
        const ax=x,ay=y,steps=Math.max(12,Math.ceil((Math.hypot(bx-ax,by-ay)+Math.hypot(cx-bx,cy-by)+Math.hypot(dx-cx,dy-cy))/7));
        for(let i=1;i<=steps;i++){const t=i/steps,s=1-t;points.push([s*s*s*ax+3*s*s*t*bx+3*s*t*t*cx+t*t*t*dx,s*s*s*ay+3*s*s*t*by+3*s*t*t*cy+t*t*t*dy]);}x=dx;y=dy;
    }
    // Loose pen gestures occupy the whitespace between chapters. They are part
    // of this same path; scene floors and measured data keep their exact anchors.
    function flourish(kind,edge,nextLane,ceiling,floor,index){
        const phone=w<760,room=Math.max(36,floor-ceiling),mid=ceiling+room*.49;
        const span=phone?w*.60:Math.min(w*.34,460),cx=w*(index%2?.40:.60);
        const rx=Math.min(span/2,cx-22,w-cx-22),ry=Math.min(phone?57:82,room*.41);
        if(kind==='interests'){
            const destination=nextLane,centre=(edge+destination)/2;
            // Four broad bends carry the vertical tangent into a single open curl.
            curve(edge,ceiling+room*.24,centre+rx*.6,ceiling+room*.12,centre,mid-ry*.35);
            curve(centre-rx*.6,mid+ry*.2,centre-rx*.8,mid+ry*.82,centre-rx*.25,mid+ry*.82);
            curve(centre+rx*.3,mid+ry*.82,centre+rx*.4,mid-ry*.3,centre,mid-ry*.35);
            curve(centre-rx*.4,mid-ry*.4,destination,floor-45,destination,floor);
            return;
        }
        if(kind==='liquidation'){
            // Invented lettering, never a trace of a personal signature. One pen
            // moves through every letter and the final underlining flourish.
            const width=Math.min(w*.80,790),sx=width/670,sy=Math.min(sx*1.1,room/180);
            const ox=(w-width)/2,oy=mid-62*sy;
            const pen=(...v)=>curve(...v.map((n,i)=>i%2?oy+n*sy:ox+n*sx));
            curve(edge,ceiling+room*.32,ox-42*sx,oy+8*sy,ox-18*sx,oy+53*sy);
            curve(ox+6*sx,oy+98*sy,ox-18*sx,oy+80*sy,ox,oy+92*sy);
            // a t u l
            pen(18,106,57,49,42,48);pen(18,46,5,100,35,99);
            pen(51,98,54,57,56,60);pen(50,103,67,108,83,78);
            pen(101,43,111,-4,96,13);pen(82,36,72,108,104,99);
            pen(132,85,130,48,119,60);pen(91,77,60,70,73,64);
            pen(92,58,123,72,128,72);pen(117,117,145,111,156,76);
            pen(171,41,147,119,180,98);pen(207,79,231,-2,211,9);
            pen(184,20,183,112,223,96);
            // A long airborne-looking join turns into an extravagant k.
            pen(239,86,276,104,274,84);pen(264,38,314,-9,301,18);
            pen(289,49,271,106,276,103);pen(283,68,331,29,334,47);
            pen(336,60,302,81,290,75);pen(309,74,318,111,341,94);
            // a n o d i a, with looped ascenders and a small inline dot curl.
            pen(365,51,391,55,375,64);pen(339,69,341,115,367,94);
            pen(380,81,381,62,380,65);pen(373,102,391,103,402,78);
            pen(417,47,392,112,403,98);pen(423,60,440,61,433,82);
            pen(427,105,445,103,454,82);pen(470,58,489,60,477,82);
            pen(460,114,441,101,452,79);pen(461,61,482,58,493,73);
            pen(509,51,526,58,515,70);pen(491,65,483,110,505,99);
            pen(528,84,555,6,538,18);pen(519,31,511,110,540,95);
            pen(557,82,561,62,555,64);pen(541,96,553,106,568,87);
            pen(579,71,574,44,569,51);pen(564,58,583,65,582,83);
            pen(597,55,623,50,618,66);pen(591,60,578,111,604,98);
            pen(619,89,623,65,624,66);pen(616,110,636,99,653,87);
            // The name folds back into a loose underline, then flicks away.
            pen(720,46,637,157,475,140);pen(293,119,62,160,72,130);
            pen(87,95,419,148,649,119);
            return;
        }
        if(kind==='pipeline'||kind==='deadlock'){
            const pen=(...v)=>curve(...v.map((n,i)=>i%2?mid+n*ry:cx+n*rx));
            // A long integral-like S gathers the data into one moving thread.
            if(kind==='pipeline'){
                curve(edge,ceiling+room*.25,cx+rx*.95,mid-ry*.88,cx+rx*.65,mid-ry*.88);
                pen(.35,-.88,.28,-.33,.08,.05);
                pen(-.12,.43,-.23,.91,-.60,.91);
                pen(-.97,.91,-.99,.46,-.71,.40);
                pen(-.43,.34,-.09,.80,.31,.80);
                pen(.71,.80,.90,.48,1.13,.54);
            }else{
                // Probability's tail folds into a sheet being passed to Baxter.
                curve(edge,ceiling+room*.18,cx-rx*1.0,mid+ry*.64,cx-rx*.84,mid+ry*.06);
                pen(-.68,-.52,-.47,-.94,-.20,-.83);
                pen(.07,-.72,.02,.24,.43,.39);
                pen(.84,.54,1.17,-.02,.91,-.42);
                pen(.65,-.82,.30,-.66,.42,-.36);
                pen(.54,-.06,.87,.25,.84,.64);
                pen(.81,.99,.05,1.01,.06,.73);
                pen(.07,.45,.57,.58,.97,.69);
            }
            const previous=points.at(-2),vx=x-previous[0],vy=y-previous[1],speed=Math.hypot(vx,vy)||1;
            const reach=Math.min(100,Math.max(36,Math.abs(nextLane-x)*.26));
            curve(x+vx/speed*reach,y+vy/speed*reach,nextLane,floor-24,nextLane,floor);
            return;
        }
        const motifs={scraper:'paperclip',pipeline:'infinity',poe:'spiral',tfl:'switchback',commute:'infinity',smoothtato:'spiral',mtxtato:'orbit',deadlock:'infinity',baxter:'coil',botato:'orbit',halo:'coil',liquidation:'spiral'};
        const motif=motifs[kind],flip=index%2?-1:1,pts=[];
        if(motif==='paperclip'){
            // An open, imperfect paperclip becomes the research chapter's exit.
            const shape=[[-1,0],[-.86,-.74],[.56,-.80],[.94,-.3],[.9,.68],[-.64,.82],[-.81,.3],[-.64,-.3],[.49,-.32],[.64,.08],[.39,.39],[-.36,.36]];
            for(let i=0;i<shape.length-1;i++){
                const a=shape[Math.max(0,i-1)],p=shape[i],q=shape[i+1],b=shape[Math.min(shape.length-1,i+2)];
                for(let j=0;j<12;j++){const t=j/12,u=1-t;pts.push([cx+rx*(u*u*u*p[0]+3*u*u*t*(p[0]+(q[0]-a[0])/6)+3*u*t*t*(q[0]-(b[0]-p[0])/6)+t*t*t*q[0]),mid+ry*(u*u*u*p[1]+3*u*u*t*(p[1]+(q[1]-a[1])/6)+3*u*t*t*(q[1]-(b[1]-p[1])/6)+t*t*t*q[1])]);}
            }
        }else for(let i=0;i<=220;i++){
            const t=i/220,a=t*Math.PI*2;
            let px,py;
            if(motif==='spiral'){const angle=Math.PI+a*1.65,r=1-t*.77;px=cx+rx*r*Math.cos(angle);py=mid+ry*r*Math.sin(angle);}
            else if(motif==='coil'){const angle=a*1.65;px=cx+rx*(t*1.15-.62+.48*Math.sin(angle));py=mid+ry*.72*Math.cos(angle);}
            else if(motif==='orbit'){const angle=-Math.PI/2+a*1.72,r=1-t*.29;px=cx+rx*r*Math.sin(angle);py=mid+ry*(r*Math.sin(angle+.65)+.17*Math.sin(a*3));}
            else if(motif==='switchback'){px=cx+rx*(t*1.65-.84+.33*Math.sin(a*2));py=mid+ry*Math.sin(a*2);}
            else {const commute=kind==='commute',angle=commute?-Math.PI*.27+a*.77:-Math.PI/2+a*1.08;px=cx+rx*Math.sin(angle);py=mid+ry*Math.sin(angle*2)*(commute?.90+.06*Math.cos(angle):.84+.12*Math.cos(angle));}
            pts.push([px,mid+(py-mid)*flip]);
        }
        const first=pts[0],second=pts[1],dx=second[0]-first[0],dy=second[1]-first[1],length=Math.hypot(dx,dy)||1;
        curve(edge,ceiling+18,first[0]-dx/length*24,first[1]-dy/length*24,...first);
        for(const p of pts.slice(1))to(...p);
        const previous=pts.at(-2),vx=x-previous[0],vy=y-previous[1],speed=Math.hypot(vx,vy)||1;
        curve(x+vx/speed*34,y+vy/speed*34,nextLane,floor-24,nextLane,floor);
    }
    points.length=0;
    for(const [op,...v]of sceneryCommands(w,stage.h,mountainOffset,px=>{let i=0;while(i<hill.length-2&&hill[i+1][0]<px)i++;const a=hill[i],b=hill[i+1],t=(px-a[0])/(b[0]-a[0]||1);return a[1]+(b[1]-a[1])*t;})){
        if(op==='M'){x=v[0];y=v[1];points.push([x,y]);}
        else if(op==='L')to(...v);
        else if(op==='C')curve(...v);
        else curve(x+(v[0]-x)*2/3,y+(v[1]-y)*2/3,v[2]+(v[0]-v[2])*2/3,v[3]+(v[1]-v[3])*2/3,v[2],v[3]);
    }
    curve(8,y+12,4,hill[0][1]-15,hill[0][0],hill[0][1]);
    for(const p of hill.slice(1))to(...p);
    const before=hill.at(-2),end=hill.at(-1),slope=(end[1]-before[1])/(end[0]-before[0]||1);
    const tugStart=points.length-1;
    for(const controls of hillExit(w,end,slope,world.h,margin,stage.h))curve(...controls);
    let index=0;
    for(const frame of document.querySelectorAll('.sketch-demo')){
        const kind=frame.dataset.scene,boxed=kind==='halo'||kind==='botato';
        const r=sceneRect(frame,kind==='halo'?'.call':'.toy');
        const left=kind==='botato'?r.x:Math.max(8,r.x-18),right=kind==='botato'?r.x+r.w:Math.min(w-8,r.x+r.w+18),top=r.y-(kind==='botato'?0:5),bottom=r.y+r.h+(kind==='botato'?0:5);
        const lane=x<w/2?margin:w-margin;
        if(boxed){
            curve(lane,y+40,lane,top-52,right,top-8);
            curve(right-40,top-15,left+42,top+5,left,top);
            curve(left-5,top+40,left+4,bottom-45,left,bottom);
            curve(left+45,bottom-4,right-55,bottom+7,right,bottom);
            curve(right+3,bottom-55,right-4,top+40,right,top-8);
            curve(right+15,top+70,right+9,bottom-35,right,bottom+24);
        }else{
            // The line becomes the floor of each small drawing, rather than another box.
            const floor=r.y+(r.threadY||r.h*.86),fromLeft=index%2===1,entry=fromLeft?left:right,exit=fromLeft?right:left;
            if(w<760){curve(lane,y+35,lane,top-65,lane,top-42);curve(lane,top-24,entry,top-24,entry,top-12);}
            else curve(lane,y+35,entry,top-55,entry,top-12);
            const out=fromLeft?-1:1,space=fromLeft?entry-5:w-5-entry,sway=Math.max(2,Math.min(w<760?10:32,space*.75));
            curve(entry+out*sway,top+30,entry+out*sway,top+(floor-top)*.38,entry,top+(floor-top)*.48);
            curve(entry-out*sway*.5,top+(floor-top)*.64,entry,floor-42,entry,floor-14);
            if(r.threadPoints?.length){
                const samples=r.threadPoints.map(([px,py])=>[r.x+px,r.y+py]);if(!fromLeft)samples.reverse();
                const first=samples[0];curve(entry,floor+2,first[0]- (fromLeft?5:-5),first[1],...first);
                for(const p of samples.slice(1))to(...p);
                curve(x+(exit-x)*.4,y,exit-(fromLeft?5:-5),floor,exit,floor);
            }else{curve(entry,floor+1,entry+(exit-entry)*.17,floor,entry+(exit-entry)*.25,floor);curve(entry+(exit-entry)*.5,floor-3,entry+(exit-entry)*.8,floor+4,exit,floor);}
            curve(exit+(fromLeft?14:-14),floor+4,exit+(fromLeft?16:-16),bottom+7,exit,bottom+22);
        }
        const frames=[...document.querySelectorAll('.sketch-demo')],nextKind=frames[index+1]?.dataset.scene;
        const nextLane=['botato','halo'].includes(nextKind)?w-margin:index%2===0?margin:w-margin;
        const copy=rect(frame.closest('article').querySelector('.chapter-copy'));
        const article=rect(frame.closest('article'));
        const gap=Math.max(rect(frame).y+rect(frame).h,copy.y+copy.h,article.y+article.h)+12;
        // Pass the caption and controls along the outside edge first.
        // Only cross the page after the whole embedded document has ended.
        const edge=x,away=x>w/2?1:-1,sideRoom=away>0?w-x-6:x-6,bend=Math.min(w<760?8:24,Math.max(1,sideRoom*.65)),half=(y+gap)/2;
        curve(edge+away*bend,y+22,edge+away*bend,half-18,edge+away*bend*.25,half);
        curve(edge-away*bend*.5,half+18,edge,gap-20,edge,gap);
        const next=frames[index+1]?.closest('article'),limit=next?rect(next).y-18:rect(document.querySelector('.sketch-foot')).y-20;
        flourish(kind,x,nextLane,gap,Math.max(gap+36,limit),index);
        index++;
    }
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.height=h+'px';
    life.update(points,tugStart);
    svg.dataset.joins='mountains hill '+[...document.querySelectorAll('.sketch-demo')].map(f=>f.dataset.scene).join(' ');
}
const observer=new ResizeObserver(schedule);observer.observe(document.querySelector('.sketchbook'));
for(const f of document.querySelectorAll('.sketch-demo')){observer.observe(f);f.addEventListener('load',schedule);}
addEventListener('message',e=>{if(e.origin===location.origin&&['demo-ready','demo-layout','demo-anchors'].includes(e.data?.type))schedule();});
addEventListener('resize',schedule);document.fonts.ready.then(schedule);

addEventListener('ink-anchors',schedule);
