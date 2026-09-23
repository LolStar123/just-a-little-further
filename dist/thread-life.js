import {drawMeowl} from './little-creatures.js';
import {GuideMotion} from './guide-motion.js';
import {SceneSound} from './soundscape.js';

export function threadLife(svg,path){
    const ns='http://www.w3.org/2000/svg',hit=document.createElementNS(ns,'path');
    hit.style.cssText='stroke:transparent;stroke-width:26px;fill:none;pointer-events:stroke;cursor:grab;touch-action:none';svg.append(hit);
    // The opaque hill canvas sits above the page wire. Show the SAME deformed
    // exit points over that canvas, clipped exactly to its bounds.
    const hillWire=document.createElementNS(ns,'svg'),hillInk=document.createElementNS(ns,'path');
    hillWire.classList.add('hill-thread');hillWire.setAttribute('aria-hidden','true');hillWire.append(hillInk);
    hillWire.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:hidden;pointer-events:none';
    hillInk.style.cssText='fill:none;stroke:#656054;stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round;opacity:.7';
    document.querySelector('#interaction-surface').append(hillWire);
    const guide=document.createElement('div');guide.className='line-guide';guide.innerHTML='<p></p><canvas width="288" height="288" aria-label="The little guide meowl"></canvas>';const guideLayer=document.createElement('div');guideLayer.style.cssText='position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:4';guideLayer.append(guide);document.body.append(guideLayer);
    const c=guide.querySelector('canvas').getContext('2d');c.scale(2,2);
    c.canvas.style.pointerEvents='none';const pet=document.createElement('button');guide.append(pet);pet.style.cssText='position:absolute;left:34px;top:40px;width:76px;height:84px;border:0;background:transparent;padding:0;pointer-events:auto;touch-action:none;cursor:grab';pet.tabIndex=0;pet.setAttribute('aria-label','Throw the guide meowl. Space gives a little hop.');
    let actor=null,petDrag=null,petLast=0,targetAt=0,targetIndex=0,worldHeight=0,routeCache=null,sceneCache=null;
    pet.addEventListener('pointerdown',e=>{if(!actor)return;petDrag={id:e.pointerId,x:e.clientX-actor.x,y:e.clientY+scrollY-actor.y};actor.hold();pet.setPointerCapture(e.pointerId);petLast=performance.now();});
    pet.addEventListener('pointermove',e=>{if(!petDrag)return;const now=performance.now();actor.drag(e.clientX-petDrag.x,e.clientY+scrollY-petDrag.y,(now-petLast)/1000);petLast=now;});
    const dropPet=()=>{if(!petDrag)return;const drag=petDrag;petDrag=null;actor.release();if(pet.hasPointerCapture(drag.id))pet.releasePointerCapture(drag.id);};
    pet.addEventListener('pointerup',dropPet);pet.addEventListener('pointercancel',dropPet);pet.addEventListener('lostpointercapture',dropPet);
    addEventListener('meowl-cheer',()=>{actor?.cheer();sound.active(true);sound.play('meow',{id:'guide',level:.6});wake();});
    pet.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();actor?.hop();}if(e.key==='Escape')dropPet();});
    const sound=new SceneSound('guide',guide),words=guide.querySelector('p');
    const speechSizer=document.createElement('span'),speechInk=document.createElement('span');
    speechSizer.className='speech-size';speechInk.className='speech-ink';speechSizer.setAttribute('aria-hidden','true');speechInk.setAttribute('aria-hidden','true');words.setAttribute('role','note');words.append(speechSizer,speechInk);
    let speechText='',speechLetters=[],speechCount=0,typeAt=0;
    let guideEntries={},tubeEntryDone=false,tugStart=0,base=[],lengths=[],total=0,travel=0,time=0,last=0,raf=0,drag=null,anchor=0,dx=0,dy=0,vx=0,vy=0,pullX=0,pullY=0,shape=[],handles=[],sceneRects=[];
    const thinkingDots=document.querySelector('.thinking-dots');let dotCount=-1;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
    function pointAt(distance){let lo=0,hi=lengths.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(lengths[mid]<distance)lo=mid+1;else hi=mid;}const i=Math.max(1,lo),a=shape[i-1]||base[0],b=shape[i]||a,f=(distance-lengths[i-1])/(lengths[i]-lengths[i-1]||1);return{x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,angle:Math.atan2(b[1]-a[1],b[0]-a[0]),i};}
    function render(){
        // Long C2 falloff follows arclength across nearby text and illustration floors.
        // It does not pin abruptly at an iframe rectangle or paragraph boundary.
        const leftSpan=Math.max(1,Math.min(900,lengths[anchor]-lengths[tugStart])),rightSpan=Math.max(1,Math.min(900,total-lengths[anchor]));
        shape=base.map((p,i)=>{
            if(i<=tugStart)return p.slice();
            const distance=lengths[i]-lengths[anchor],u=Math.min(1,Math.abs(distance)/(distance<0?leftSpan:rightSpan));
            // Quintic falloff has zero first AND second derivative at both ends.
            const weight=1-u*u*u*(u*(u*6-15)+10);
            return[p[0]+dx*weight,p[1]+dy*weight];
        });
        window.__inkPhysicsPoints=shape;
        const exitEnd=shape.findIndex((p,i)=>i>tugStart&&p[1]>hillWire.clientHeight+64);const exit=shape.slice(tugStart,exitEnd<0?undefined:exitEnd+1);hillInk.setAttribute('d',exit.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' '));
        const d=shape.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');path.setAttribute('d',d);hit.setAttribute('d',d);
    }
    function nearest(x,y){let result=0,best=Infinity;for(let i=0;i<base.length;i++){const d=(base[i][0]-x)**2+(base[i][1]-y)**2;if(d<best){best=d;result=i;}}return result;}
    function start(e,index){
        const y=e.clientY+scrollY;

        anchor=index??nearest(e.clientX,y);if(anchor<=tugStart)return;
        e.preventDefault();getSelection()?.removeAllRanges();document.body.classList.add('tugging-thread');
        drag={id:e.pointerId,startX:e.clientX-dx,startY:y-dy,target:e.currentTarget};e.currentTarget.setPointerCapture(e.pointerId);wake();
    }
    function move(e){if(!drag)return;pullX=120*Math.tanh((e.clientX-drag.startX)/120);pullY=110*Math.tanh((e.clientY+scrollY-drag.startY)/110);wake();}
    function release(){document.body.classList.remove('tugging-thread');if(!drag)return;const d=drag;drag=null;pullX=pullY=0;if(d.target.hasPointerCapture(d.id))d.target.releasePointerCapture(d.id);sound.active(true);sound.play('spring',{level:.3});wake();}
    addEventListener('blur',release);
    for(const target of [hit]){target.addEventListener('pointerdown',e=>start(e));target.addEventListener('pointermove',move);target.addEventListener('pointerup',release);target.addEventListener('pointercancel',release);target.addEventListener('lostpointercapture',release);}
    document.addEventListener('pointerdown',e=>{
        if(drag||e.target.closest?.('button,a,input,.line-guide')||(e.target.tagName==='CANVAS'&&e.target.id!=='playground')||!base.length)return;
        const j=nearest(e.clientX,e.clientY+scrollY),p=shape[j]||base[j];
        if(j>tugStart&&Math.hypot(e.clientX-p[0],e.clientY+scrollY-p[1])<14){e.stopPropagation();start({...{clientX:e.clientX,clientY:e.clientY,pointerId:e.pointerId,currentTarget:hit},preventDefault:()=>e.preventDefault()},j);}
    },true);
    function tick(now){
        raf=0;const dt=Math.min(.035,(now-(last||now))/1000);last=now;time+=dt;if(!base.length)return;
        const nextDots=[0,1,2,3,2,1][Math.floor(time/.55)%6];if(thinkingDots&&nextDots!==dotCount){dotCount=nextDots;thinkingDots.textContent='.'.repeat(dotCount);thinkingDots.style.opacity=String(.45+dotCount*.18);}
        if(drag||Math.abs(dx)+Math.abs(dy)+Math.abs(vx)+Math.abs(vy)>.05){let left=dt;while(left>0){const h=Math.min(left,1/120),stiffness=drag?240:95,damping=drag?30:17;vx+=((pullX-dx)*stiffness-vx*damping)*h;vy+=((pullY-dy)*stiffness-vy*damping)*h;dx+=vx*h;dy+=vy*h;left-=h;}render();}
        if(!actor){const index=nearest(innerWidth-100,innerHeight-55);actor=new GuideMotion({x:base[index][0],y:base[index][1]});}
        const viewLeft=visualViewport?.offsetLeft||0,viewWidth=visualViewport?.width||innerWidth;const viewTop=scrollY+(visualViewport?.offsetTop||0),viewHeight=visualViewport?.height||innerHeight,viewBottom=viewTop+viewHeight;
        if(now>targetAt||!routeCache){
            const landing=scrollY<90;if(landing)tubeEntryDone=false;const wantedY=viewTop+viewHeight*.91;
            let best=Infinity;
            for(let i=0;i<base.length;i+=2){const p=shape[i],outside=p[0]<viewLeft+45||p[0]>viewLeft+viewWidth-45||p[1]<viewTop+90||p[1]>viewBottom-22;const score=Math.abs(p[1]-wantedY)+Math.abs(p[0]-(landing?viewLeft+viewWidth-100:viewLeft+viewWidth*.78))*(landing?.35:.14)+(outside?10000:0);if(score<best){targetIndex=i;best=score;}}
            // The large arrival loop is decoration, not a place to pace forever.
            // Once the reader scrolls, commit to the first scene's entrance below it.
            const tubeEntry=guideEntries.tfl;
            let crossingTubeLoop=false;
            if(!landing&&Number.isInteger(tubeEntry)){
                const entry=pointAt(lengths[tubeEntry]);
                if(Math.hypot(actor.x-entry.x,actor.y-entry.y)<38)tubeEntryDone=true;
                if(targetIndex<tubeEntry&&entry.y>viewTop+90&&entry.y<viewBottom-22&&entry.x>viewLeft+42&&entry.x<viewLeft+viewWidth-42){targetIndex=tubeEntry;crossingTubeLoop=!tubeEntryDone;}
            }
            const signatureStart=guideEntries.signatureStart,signatureEnd=guideEntries.signatureEnd;
            const goodbye=Number.isInteger(signatureEnd)&&shape.slice(signatureStart,signatureEnd+1).some(p=>p[1]>viewTop+45&&p[1]<viewBottom-25);
            if(goodbye){targetIndex=signatureEnd;crossingTubeLoop=false;}
            // Nearby branches of a loop are not interchangeable footholds.
            // Stay on the current stretch unless flight has deliberately crossed it.
            let j=nearest(actor.x,actor.y);
            if(routeCache&&!['fly','flutter','thrown','held','cheer'].includes(actor.mode)){
                let bestLocal=Infinity,local=j;
                for(let i=tugStart;i<base.length;i++){const arc=Math.abs(lengths[i]-travel);if(arc>130)continue;if(routeCache.direction&&routeCache.direction*(lengths[i]-travel)<-20)continue;const score=Math.hypot(shape[i][0]-actor.x,shape[i][1]-actor.y)+arc*.12;if(score<bestLocal){bestLocal=score;local=i;}}
                if(bestLocal<260)j=local;
            }
            travel=lengths[j];
            const destination=lengths[targetIndex],direction=destination>=travel?1:-1;
            const ahead=pointAt(Math.max(0,Math.min(total,travel+direction*Math.min(24,Math.abs(destination-travel))))),near=pointAt(travel),target=pointAt(Math.max(0,Math.min(total,destination)));
            // Loops offer real shortcuts: select a reachable future foothold, then leap through space.
            let shortcut=null;
            for(let distance=170;distance<=480;distance+=50){const candidate=pointAt(Math.max(0,Math.min(total,travel+direction*distance))),gap=Math.hypot(candidate.x-actor.x,candidate.y-actor.y);if(gap>65&&gap<230&&candidate.y>actor.y-80&&candidate.y<actor.y+155){shortcut=candidate;}}
            // The viewport chooses a real perch. Never move the perch off its wire.
            const perchAt=(x,y)=>{let best=Infinity,pick=target;for(const p of shape){if(p[0]<viewLeft+45||p[0]>viewLeft+viewWidth-45||p[1]<viewTop+70||p[1]>viewBottom-22)continue;const score=Math.hypot(p[0]-x,p[1]-y);if(score<best){best=score;pick={x:p[0],y:p[1]};}}return {...pick};};
            routeCache={near,ahead,target,shortcut,perchAt,goodbye,direction,remaining:Math.abs(destination-travel),committedExit:crossingTubeLoop?target:null};
            sceneCache=sceneRects.find(r=>actor.y>=r.top-100&&actor.y<r.bottom+130)||null;
            targetAt=now+90;
        }
        const paused=document.body.classList.contains('panel-open')||!!document.querySelector('#little-boot:not(.finished)');
        if(!paused)actor.tick(dt,routeCache,{top:viewTop,bottom:viewBottom,width:viewWidth,left:viewLeft},sceneCache,reduced.matches);
        const active=actor.y>scrollY-140&&actor.y<scrollY+innerHeight+140&&!paused;
        guide.hidden=!active;sound.active(active);
        if(active){
            guide.style.transform=`translate3d(${actor.x-72}px,${actor.y-scrollY-112}px,0)`;
            c.clearRect(0,0,144,144);c.save();c.translate(72,86);c.rotate(reduced.matches?0:actor.rotation);c.translate(-72,-86);
            const airborne=['air','fly','flutter','thrown','held','hang','cheer'].includes(actor.mode),mode=actor.mode==='held'?'held':airborne?'air':actor.mode==='crouch'?'anticipate':actor.mode==='land'?'brace':'scurry';
            drawMeowl(c,72,112,55,{id:'guide',time,mode,air:airborne,parkour:actor.pose,effort:airborne||Math.hypot(actor.vx,actor.vy)>180?.88:.25,sweat:airborne||Math.hypot(actor.vx,actor.vy)>180,emotion:actor.mode==='thrown'?'panic':'relieved',speed:Math.hypot(actor.vx,actor.vy),facing:actor.facing,voice:sound.mouth('guide'),landed:actor.mode==='land'?1:0});c.restore();
            if(actor.kind==='grind'){c.strokeStyle='#a08a57';c.lineWidth=.8;for(let i=0;i<4;i++){const u=(time*4+i*.23)%1;c.globalAlpha=1-u;c.beginPath();c.moveTo(72-actor.facing*u*24,112+u*3);c.lineTo(72-actor.facing*(u*24+5),112+u*6);c.stroke();}c.globalAlpha=1;sound.beat('grind',Math.floor(time*2),'friction',{level:.2});}
            if(speechText!==actor.text){speechText=actor.text;speechLetters=Array.from(speechText);speechCount=0;typeAt=now;speechSizer.textContent=speechText;speechInk.textContent='';words.setAttribute('aria-label',speechText);}
            if(now>=typeAt&&speechCount<speechLetters.length){const letter=speechLetters[speechCount++];speechInk.textContent=speechLetters.slice(0,speechCount).join('');if(speechCount%2===0&&letter.trim())sound.play('click',{id:'typing',level:.055});typeAt=now+(/[.!?]/.test(letter)?115:letter===','?100:48);}
            words.classList.toggle('typing',speechCount<speechLetters.length);
            // The caption shares the actor transform on every frame, including flips and jumps.
            const w=words.offsetWidth,h=words.offsetHeight,guideLeft=actor.x-72,guideTop=actor.y-112;
            const captionX=Math.max(8,Math.min(innerWidth-w-8,actor.x-w/2));
            const captionY=Math.max(scrollY+8,actor.y-152);
            words.style.bottom='auto';words.style.left=captionX-guideLeft+'px';words.style.top=captionY-guideTop+'px';
            if(!sound.nextMeows.has('guide'))sound.nextMeows.set('guide',time+1.5);sound.chirp('guide',time,[10,17],true,{level:.55});
            if(actor.mode==='run')sound.beat('feet',Math.floor(time*3.4),'step',{level:.35});
        }
        wake();
    }
    function update(points,startIndex=0,entries={}){
        guideEntries=entries;
        tugStart=startIndex;
        worldHeight=document.querySelector('#world').offsetHeight;
        base=points.map(p=>p.slice());lengths=[0];for(let i=1;i<base.length;i++)lengths[i]=lengths[i-1]+Math.hypot(base[i][0]-base[i-1][0],base[i][1]-base[i-1][1]);total=lengths.at(-1);anchor=Math.min(anchor,base.length-1);render();
        sceneRects=[...document.querySelectorAll('.sketch-chapter')].map(el=>{const frame=el.querySelector('.sketch-demo'),r=(frame||el).getBoundingClientRect(),inside=frame?.dataset.scene==='botato'?frame.contentDocument?.querySelector('.toy')?.getBoundingClientRect():null;return{key:frame?.dataset.scene,left:r.left+(inside?.left||0),right:inside?r.left+inside.right:r.right,top:r.top+(inside?.top||0)+scrollY,bottom:r.top+(inside?.bottom||r.height)+scrollY};});
        if(!handles.length){for(let i=0;i<sceneRects.length;i++){const b=document.createElement('button');b.className='thread-grab';b.setAttribute('aria-label','Tug the thread after project '+(i+1));b.title='tug the thread';b.addEventListener('pointerdown',e=>start(e,Number(b.dataset.point)));b.addEventListener('pointermove',move);b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);b.addEventListener('keydown',e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();anchor=Number(b.dataset.point);dy=45;vy=-90;wake();}});document.body.append(b);handles.push(b);}}
        handles.forEach((b,i)=>{const r=sceneRects[i],j=nearest(innerWidth*.5,r.bottom+60),p=base[j];b.dataset.point=j;b.style.left=p[0]-19+'px';b.style.top=p[1]-19+'px';});wake();
    }
    visualViewport?.addEventListener('resize',()=>{targetAt=0;wake();});visualViewport?.addEventListener('scroll',()=>{targetAt=0;wake();});
    addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;sound.active(false);}else wake();});
    window.__threadLife=()=>({points:base.length,tugStart,tubeEntryDone,goodbye:routeCache?.goodbye,guideEntries,committedExit:routeCache?.committedExit,total,travel,dragging:!!drag,offset:[dx,dy],guideVisible:!guide.hidden,handles:handles.length,actor:actor?{x:actor.x,y:actor.y,vx:actor.vx,vy:actor.vy,mode:actor.mode,kind:actor.kind,text:actor.text,history:actor.history}:null});
    return {update};
}
