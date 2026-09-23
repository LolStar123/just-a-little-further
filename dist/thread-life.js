import {drawMeowl} from './little-creatures.js';
import {GuideMotion} from './guide-motion.js';
import {SceneSound} from './soundscape.js';

export function threadLife(svg,path){
    const ns='http://www.w3.org/2000/svg',hit=document.createElementNS(ns,'path');
    hit.style.cssText='stroke:transparent;stroke-width:26px;fill:none;pointer-events:stroke;cursor:grab;touch-action:none';svg.append(hit);
    const guide=document.createElement('div');guide.className='line-guide';guide.innerHTML='<p></p><canvas width="288" height="288" aria-label="The little guide meowl"></canvas>';document.body.append(guide);
    const c=guide.querySelector('canvas').getContext('2d');c.scale(2,2);
    c.canvas.style.pointerEvents='none';const pet=document.createElement('button');guide.append(pet);pet.style.cssText='position:absolute;left:34px;top:40px;width:76px;height:84px;border:0;background:transparent;padding:0;pointer-events:auto;touch-action:none;cursor:grab';pet.tabIndex=0;pet.setAttribute('aria-label','Throw the guide meowl. Space gives a little hop.');
    let speechAt=0;
    let actor=null,petDrag=null,petLast=0,targetAt=0,targetIndex=0,worldHeight=0,routeCache=null,sceneCache=null;
    pet.addEventListener('pointerdown',e=>{if(!actor)return;petDrag={id:e.pointerId,x:e.clientX-actor.x,y:e.clientY+scrollY-actor.y};actor.hold();pet.setPointerCapture(e.pointerId);petLast=performance.now();});
    pet.addEventListener('pointermove',e=>{if(!petDrag)return;const now=performance.now();actor.drag(e.clientX-petDrag.x,e.clientY+scrollY-petDrag.y,(now-petLast)/1000);petLast=now;});
    const dropPet=()=>{if(!petDrag)return;const drag=petDrag;petDrag=null;actor.release();if(pet.hasPointerCapture(drag.id))pet.releasePointerCapture(drag.id);};
    pet.addEventListener('pointerup',dropPet);pet.addEventListener('pointercancel',dropPet);pet.addEventListener('lostpointercapture',dropPet);
    pet.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();actor?.hop();}if(e.key==='Escape')dropPet();});
    const sound=new SceneSound('guide',guide),words=guide.querySelector('p');
    let base=[],lengths=[],total=0,travel=0,time=0,last=0,raf=0,drag=null,anchor=0,dx=0,dy=0,vx=0,vy=0,pullX=0,pullY=0,shape=[],handles=[],sceneRects=[];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
    function pointAt(distance){let lo=0,hi=lengths.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(lengths[mid]<distance)lo=mid+1;else hi=mid;}const i=Math.max(1,lo),a=shape[i-1]||base[0],b=shape[i]||a,f=(distance-lengths[i-1])/(lengths[i]-lengths[i-1]||1);return{x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,angle:Math.atan2(b[1]-a[1],b[0]-a[0]),i};}
    function render(){
        // Long C2 falloff follows arclength across nearby text and illustration floors.
        // It does not pin abruptly at an iframe rectangle or paragraph boundary.
        const leftSpan=Math.max(1,Math.min(900,lengths[anchor]-lengths[0])),rightSpan=Math.max(1,Math.min(900,total-lengths[anchor]));
        shape=base.map((p,i)=>{
            const distance=lengths[i]-lengths[anchor],u=Math.min(1,Math.abs(distance)/(distance<0?leftSpan:rightSpan));
            // Quintic falloff has zero first AND second derivative at both ends.
            const weight=1-u*u*u*(u*(u*6-15)+10);
            return[p[0]+dx*weight,p[1]+dy*weight];
        });
        window.__inkPhysicsPoints=shape;
        const d=shape.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');path.setAttribute('d',d);hit.setAttribute('d',d);
    }
    function nearest(x,y){let result=0,best=Infinity;for(let i=0;i<base.length;i++){const d=(base[i][0]-x)**2+(base[i][1]-y)**2;if(d<best){best=d;result=i;}}return result;}
    function start(e,index){
        const y=e.clientY+scrollY;

        anchor=index??nearest(e.clientX,y);if(base[anchor][1]<document.querySelector('#world').offsetHeight)return;
        e.preventDefault();getSelection()?.removeAllRanges();document.body.classList.add('tugging-thread');
        drag={id:e.pointerId,startX:e.clientX-dx,startY:y-dy,target:e.currentTarget};e.currentTarget.setPointerCapture(e.pointerId);wake();
    }
    function move(e){if(!drag)return;pullX=120*Math.tanh((e.clientX-drag.startX)/120);pullY=110*Math.tanh((e.clientY+scrollY-drag.startY)/110);wake();}
    function release(){document.body.classList.remove('tugging-thread');if(!drag)return;const d=drag;drag=null;pullX=pullY=0;if(d.target.hasPointerCapture(d.id))d.target.releasePointerCapture(d.id);sound.active(true);sound.play('spring',{level:.3});wake();}
    addEventListener('blur',release);
    for(const target of [hit]){target.addEventListener('pointerdown',e=>start(e));target.addEventListener('pointermove',move);target.addEventListener('pointerup',release);target.addEventListener('pointercancel',release);target.addEventListener('lostpointercapture',release);}
    document.addEventListener('pointerdown',e=>{
        if(drag||e.target.closest?.('button,a,input,canvas,.line-guide')||!base.length||e.clientY+scrollY<worldHeight)return;
        const j=nearest(e.clientX,e.clientY+scrollY),p=shape[j]||base[j];
        if(Math.hypot(e.clientX-p[0],e.clientY+scrollY-p[1])<14)start({...{clientX:e.clientX,clientY:e.clientY,pointerId:e.pointerId,currentTarget:hit},preventDefault:()=>e.preventDefault()},j);
    },true);
    function tick(now){
        raf=0;const dt=Math.min(.035,(now-(last||now))/1000);last=now;time+=dt;if(!base.length)return;
        if(drag||Math.abs(dx)+Math.abs(dy)+Math.abs(vx)+Math.abs(vy)>.05){let left=dt;while(left>0){const h=Math.min(left,1/120),stiffness=drag?240:95,damping=drag?30:17;vx+=((pullX-dx)*stiffness-vx*damping)*h;vy+=((pullY-dy)*stiffness-vy*damping)*h;dx+=vx*h;dy+=vy*h;left-=h;}render();}
        if(!actor){const index=nearest(innerWidth-100,innerHeight-55);actor=new GuideMotion({x:base[index][0],y:base[index][1]});}
        if(now>targetAt||!routeCache){
            const landing=scrollY<90,wantedY=landing?innerHeight-55:scrollY+innerHeight*.68;
            let best=Infinity;
            for(let i=0;i<base.length;i+=2){const score=Math.abs(base[i][1]-wantedY)+Math.abs(base[i][0]-(landing?innerWidth-100:innerWidth*.78))*(landing?.8:.14);if(score<best){targetIndex=i;best=score;}}
            const j=nearest(actor.x,actor.y);travel=lengths[j];
            const destination=lengths[targetIndex]+(landing?Math.sin(time*.8)*80:Math.sin(time*.45)*35),direction=destination>=travel?1:-1;
            const ahead=pointAt(Math.max(0,Math.min(total,travel+direction*48))),near=pointAt(travel),target=pointAt(Math.max(0,Math.min(total,destination)));
            // Loops offer real shortcuts: select a reachable future foothold, then leap through space.
            let shortcut=null;
            for(let distance=170;distance<=480;distance+=50){const candidate=pointAt(Math.max(0,Math.min(total,travel+direction*distance))),gap=Math.hypot(candidate.x-actor.x,candidate.y-actor.y);if(gap>65&&gap<230&&candidate.y>actor.y-80&&candidate.y<actor.y+155){shortcut=candidate;}}
            for(const p of[near,ahead,target,shortcut])if(p)p.x=Math.max(42,Math.min(innerWidth-42,p.x));
            routeCache={near,ahead,target,shortcut};
            sceneCache=sceneRects.find(r=>actor.y>=r.top-100&&actor.y<r.bottom+130)||null;
            targetAt=now+90;
        }
        const paused=document.body.classList.contains('panel-open')||!!document.querySelector('#little-boot:not(.finished)');
        if(!paused)actor.tick(dt,routeCache,{top:scrollY,bottom:scrollY+innerHeight,width:innerWidth},sceneCache,reduced.matches);
        const active=actor.y>scrollY-140&&actor.y<scrollY+innerHeight+140&&!paused;
        guide.hidden=!active;sound.active(active);
        if(active){
            guide.style.transform=`translate3d(${actor.x-72}px,${actor.y-112}px,0)`;
            c.clearRect(0,0,144,144);c.save();c.translate(72,86);c.rotate(reduced.matches?0:actor.rotation);c.translate(-72,-86);
            const airborne=['air','fly','flutter','thrown','held','hang'].includes(actor.mode),mode=actor.mode==='held'?'held':airborne?'air':actor.mode==='crouch'?'anticipate':actor.mode==='land'?'brace':'scurry';
            drawMeowl(c,72,112,55,{id:'guide',time,mode,air:airborne,parkour:actor.pose,emotion:actor.mode==='thrown'?'panic':'relieved',speed:Math.hypot(actor.vx,actor.vy),facing:actor.facing,voice:sound.mouth('guide'),landed:actor.mode==='land'?1:0});c.restore();
            if(actor.kind==='grind'){c.strokeStyle='#a08a57';c.lineWidth=.8;for(let i=0;i<4;i++){const u=(time*4+i*.23)%1;c.globalAlpha=1-u;c.beginPath();c.moveTo(72-actor.facing*u*24,112+u*3);c.lineTo(72-actor.facing*(u*24+5),112+u*6);c.stroke();}c.globalAlpha=1;sound.beat('grind',Math.floor(time*2),'friction',{level:.2});}
            words.textContent=actor.text;
            if(now>speechAt){
                speechAt=now+180;
                const w=words.offsetWidth,h=words.offsetHeight,guideLeft=actor.x-72,guideTop=actor.y-112;
                const blocks=[...document.querySelectorAll('.chapter-copy h2,.chapter-copy p,.chapter-copy a,.toys,#quote,#quote-author,.sketch-foot')].map(e=>e.getBoundingClientRect()).filter(r=>r.bottom>0&&r.top<innerHeight).map(r=>({x:r.left,y:r.top+scrollY,w:r.width,h:r.height,weight:5}));
                blocks.push({x:actor.x-42,y:actor.y-86,w:84,h:104,weight:12});
                for(const r of sceneRects)if(r.bottom>scrollY&&r.top<scrollY+innerHeight)blocks.push({x:r.left,y:r.top,w:r.right-r.left,h:r.bottom-r.top,weight:1});
                const left=Math.max(8,Math.min(innerWidth-w-8,actor.x-w/2));
                const candidates=[{x:left,y:actor.y-98-h},{x:left,y:actor.y+25},{x:Math.max(8,actor.x-w-48),y:actor.y-70},{x:Math.min(innerWidth-w-8,actor.x+48),y:actor.y-70}];
                if(sceneCache)candidates.push({x:left,y:sceneCache.top-h-12},{x:left,y:sceneCache.bottom+16});
                for(const p of candidates){p.y=Math.max(scrollY+8,Math.min(scrollY+innerHeight-h-8,p.y));p.cost=Math.abs(p.y-(actor.y-98-h))*.1;for(const r of blocks)p.cost+=Math.max(0,Math.min(p.x+w+5,r.x+r.w)-Math.max(p.x-5,r.x))*Math.max(0,Math.min(p.y+h+5,r.y+r.h)-Math.max(p.y-5,r.y))*r.weight;}
                const p=candidates.sort((a,b)=>a.cost-b.cost)[0];words.style.bottom='auto';words.style.left=p.x-guideLeft+'px';words.style.top=p.y-guideTop+'px';
            }
            if(!sound.nextMeows.has('guide'))sound.nextMeows.set('guide',time+1.5);sound.chirp('guide',time,[10,17],true,{level:.55});
            if(actor.mode==='run')sound.beat('feet',Math.floor(time*3.4),'step',{level:.35});
        }
        wake();
    }
    function update(points){
        worldHeight=document.querySelector('#world').offsetHeight;
        base=points.map(p=>p.slice());lengths=[0];for(let i=1;i<base.length;i++)lengths[i]=lengths[i-1]+Math.hypot(base[i][0]-base[i-1][0],base[i][1]-base[i-1][1]);total=lengths.at(-1);anchor=Math.min(anchor,base.length-1);render();
        sceneRects=[...document.querySelectorAll('.sketch-chapter')].map(el=>{const frame=el.querySelector('.sketch-demo'),r=(frame||el).getBoundingClientRect(),inside=frame?.dataset.scene==='botato'?frame.contentDocument?.querySelector('.toy')?.getBoundingClientRect():null;return{key:frame?.dataset.scene,left:r.left+(inside?.left||0),right:inside?r.left+inside.right:r.right,top:r.top+(inside?.top||0)+scrollY,bottom:r.top+(inside?.bottom||r.height)+scrollY};});
        if(!handles.length){for(let i=0;i<sceneRects.length;i++){const b=document.createElement('button');b.className='thread-grab';b.setAttribute('aria-label','Tug the thread after project '+(i+1));b.title='tug the thread';b.addEventListener('pointerdown',e=>start(e,Number(b.dataset.point)));b.addEventListener('pointermove',move);b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);b.addEventListener('keydown',e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();anchor=Number(b.dataset.point);dy=45;vy=-90;wake();}});document.body.append(b);handles.push(b);}}
        handles.forEach((b,i)=>{const r=sceneRects[i],j=nearest(innerWidth*.5,r.bottom+60),p=base[j];b.dataset.point=j;b.style.left=p[0]-19+'px';b.style.top=p[1]-19+'px';});wake();
    }
    addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;sound.active(false);}else wake();});
    window.__threadLife=()=>({points:base.length,total,travel,dragging:!!drag,offset:[dx,dy],guideVisible:!guide.hidden,handles:handles.length,actor:actor?{x:actor.x,y:actor.y,vx:actor.vx,vy:actor.vy,mode:actor.mode,kind:actor.kind,text:actor.text,history:actor.history}:null});
    return {update};
}
