import {drawMeowl} from './little-creatures.js';
import {SceneSound} from './soundscape.js';

export function threadLife(svg,path){
    const ns='http://www.w3.org/2000/svg',hit=document.createElementNS(ns,'path');
    hit.style.cssText='stroke:transparent;stroke-width:20px;fill:none;pointer-events:stroke;cursor:grab;touch-action:none';svg.append(hit);
    const guide=document.createElement('div');guide.className='line-guide';guide.innerHTML='<p></p><canvas width="176" height="176" aria-label="The little guide meowl"></canvas>';document.body.append(guide);
    const c=guide.querySelector('canvas').getContext('2d');c.scale(2,2);
    const pet=c.canvas;pet.style.cssText='pointer-events:auto;touch-action:none;cursor:grab';pet.tabIndex=0;pet.setAttribute('aria-label','Throw the guide meowl. Space gives a little hop.');
    let petDrag=null,petX=0,petY=0,petVX=0,petVY=0,petLast=0,targetAt=0,targetIndex=0,worldHeight=0;
    pet.addEventListener('pointerdown',e=>{petDrag={id:e.pointerId,x:e.clientX-petX,y:e.clientY-petY};pet.setPointerCapture(e.pointerId);petLast=performance.now();});
    pet.addEventListener('pointermove',e=>{if(!petDrag)return;const now=performance.now(),dt=Math.max(.01,(now-petLast)/1000),x=e.clientX-petDrag.x,y=e.clientY-petDrag.y;petVX=Math.max(-500,Math.min(500,(x-petX)/dt));petVY=Math.max(-500,Math.min(500,(y-petY)/dt));petX=x;petY=y;petLast=now;});
    const dropPet=()=>{const drag=petDrag;petDrag=null;if(drag&&pet.hasPointerCapture(drag.id))pet.releasePointerCapture(drag.id);};
    pet.addEventListener('pointerup',dropPet);pet.addEventListener('pointercancel',dropPet);pet.addEventListener('lostpointercapture',dropPet);pet.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();petVY=-250;petY=-2;}if(e.key==='Escape')dropPet();});
    const sound=new SceneSound('guide',guide),words=guide.querySelector('p');
    let base=[],lengths=[],total=0,travel=0,time=0,last=0,raf=0,drag=null,anchor=0,dx=0,dy=0,vx=0,vy=0,shape=[],handles=[],sceneRects=[];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(tick);}
    function pointAt(distance){let lo=0,hi=lengths.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(lengths[mid]<distance)lo=mid+1;else hi=mid;}const i=Math.max(1,lo),a=shape[i-1]||base[0],b=shape[i]||a,f=(distance-lengths[i-1])/(lengths[i]-lengths[i-1]||1);return{x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,angle:Math.atan2(b[1]-a[1],b[0]-a[0]),i};}
    function render(){
        shape=base.map((p,i)=>{const away=Math.abs(lengths[i]-lengths[anchor]),pinned=sceneRects.some(r=>p[0]>=r.left&&p[0]<=r.right&&p[1]>=r.top&&p[1]<=r.bottom),weight=pinned?0:Math.exp(-((away/125)**2));return[p[0]+dx*weight,p[1]+dy*weight];});
        const d=shape.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');path.setAttribute('d',d);hit.setAttribute('d',d);
    }
    function nearest(x,y){let result=0,best=Infinity;for(let i=0;i<base.length;i++){const d=(base[i][0]-x)**2+(base[i][1]-y)**2;if(d<best){best=d;result=i;}}return result;}
    function start(e,index){
        const y=e.clientY+scrollY;
        // Chart floors are data, not elastic rope. Tug only the linking whitespace.
        if(index===undefined&&sceneRects.some(r=>e.clientX>=r.left-12&&e.clientX<=r.right+12&&y>=r.top&&y<=r.bottom))return;
        anchor=index??nearest(e.clientX,y);if(base[anchor][1]<document.querySelector('#world').offsetHeight)return;
        drag={id:e.pointerId,startX:e.clientX-dx,startY:y-dy,target:e.currentTarget};e.currentTarget.setPointerCapture(e.pointerId);wake();
    }
    function move(e){if(!drag)return;dx=Math.max(-110,Math.min(110,e.clientX-drag.startX));dy=Math.max(-90,Math.min(90,e.clientY+scrollY-drag.startY));vx=vy=0;render();}
    function release(){if(!drag)return;const d=drag;drag=null;if(d.target.hasPointerCapture(d.id))d.target.releasePointerCapture(d.id);sound.active(true);sound.play('spring',{level:.3});wake();}
    for(const target of [hit]){target.addEventListener('pointerdown',e=>start(e));target.addEventListener('pointermove',move);target.addEventListener('pointerup',release);target.addEventListener('pointercancel',release);target.addEventListener('lostpointercapture',release);}
    function tick(now){
        raf=0;const dt=Math.min(.035,(now-(last||now))/1000);last=now;time+=dt;if(!base.length)return;
        if(!drag&&(Math.abs(dx)+Math.abs(dy)+Math.abs(vx)+Math.abs(vy)>.1)){vx+=(-90*dx-12*vx)*dt;vy+=(-90*dy-12*vy)*dt;dx+=vx*dt;dy+=vy*dt;render();}
        if(now>targetAt){const wantedY=scrollY+innerHeight*.72;let best=Infinity;for(let i=0;i<base.length;i+=2){const score=Math.abs(base[i][1]-wantedY)+Math.abs(base[i][0]-innerWidth*.75)*.06;if(score<best&&base[i][1]>worldHeight-100){targetIndex=i;best=score;}}targetAt=now+100;}
        const target=Math.min(targetIndex,base.length-1);
        const destination=lengths[target]||0,distance=destination-travel;
        if(Math.abs(distance)>2300)travel=destination-Math.sign(distance)*200;
        const speed=Math.max(-370,Math.min(370,distance*2));travel=Math.max(0,Math.min(total,travel+speed*dt));
        const p=pointAt(travel),active=p.y>scrollY-100&&p.y<scrollY+innerHeight+120&&scrollY>60;
        guide.hidden=!active;sound.active(active);if(active){
            const phase=time%19,flip=phase>8&&phase<8.8&&Math.abs(speed)>40,trip=phase>14&&phase<14.65,mode=trip?'trip':Math.abs(speed)<15?'happy':p.angle>.55?'slide':'scurry';
            if(!petDrag){petVX+=(-petX*12-petVX*4)*dt;petVY+=(-petY*16-petVY*4)*dt;petX+=petVX*dt;petY+=petVY*dt;}
            guide.style.left=Math.max(0,Math.min(innerWidth-88,p.x-44+petX))+'px';guide.style.top=(p.y-82+petY-(flip?Math.sin((phase-8)/.8*Math.PI)*25:0))+'px';
            c.clearRect(0,0,88,88);c.save();if(flip&&!reduced.matches){c.translate(44,47);c.rotate((phase-8)/.8*Math.PI*2);c.translate(-44,-47);}drawMeowl(c,44,82,48,{id:'guide',time,mode,emotion:trip?'worried':'relieved',speed:Math.abs(speed),facing:speed<0?-1:1,voice:sound.mouth('guide')});c.restore();
            const texts=['follow me!','hey, wait up!!','this way. probably.','nailed it.','tiny legs. big plans.'];words.textContent=trip?'meant to do that.':texts[Math.floor(time/5)%texts.length];sound.chirp('guide',time,[9,15],true,{level:.6});
        }
        wake();
    }
    function update(points){
        worldHeight=document.querySelector('#world').offsetHeight;
        const oldTotal=total,ratio=oldTotal?travel/oldTotal:0;base=points.map(p=>p.slice());lengths=[0];for(let i=1;i<base.length;i++)lengths[i]=lengths[i-1]+Math.hypot(base[i][0]-base[i-1][0],base[i][1]-base[i-1][1]);total=lengths.at(-1);if(!oldTotal)travel=lengths[nearest(innerWidth*.8,innerHeight*.8)];else travel=ratio*total;anchor=Math.min(anchor,base.length-1);render();
        sceneRects=[...document.querySelectorAll('.sketch-chapter')].map(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top+scrollY,bottom:r.bottom+scrollY};});
        if(!handles.length){for(let i=0;i<sceneRects.length;i++){const b=document.createElement('button');b.className='thread-grab';b.setAttribute('aria-label','Tug the thread after project '+(i+1));b.title='tug the thread';b.addEventListener('pointerdown',e=>start(e,Number(b.dataset.point)));b.addEventListener('pointermove',move);b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);b.addEventListener('keydown',e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();anchor=Number(b.dataset.point);dy=45;vy=-90;wake();}});document.body.append(b);handles.push(b);}}
        handles.forEach((b,i)=>{const r=sceneRects[i],j=nearest(innerWidth*.5,r.bottom+60),p=base[j];b.dataset.point=j;b.style.left=p[0]-19+'px';b.style.top=p[1]-19+'px';});wake();
    }
    addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;sound.active(false);}else wake();});
    window.__threadLife=()=>({points:base.length,total,travel,dragging:!!drag,offset:[dx,dy],guideVisible:!guide.hidden,handles:handles.length});
    return {update};
}
