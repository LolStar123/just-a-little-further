import './button-feel.js';
import {attachToys,toyProp,toyBusy} from './toy-interactions.js';
import {SceneSound} from './soundscape.js';
import {miniScene} from './mini-scenes.js';
import {personalScene} from './personal-scenes.js';
import {drawMeowl} from './little-creatures.js';
import {rocks,rockPath,routeThroughRocks,WIDTH,HEIGHT} from './rocky-path.js';
import {hardware,line} from './creatures.js';

const $=s=>document.querySelector(s),requestedScene=new URLSearchParams(location.search).get('scene')||'halo',scene=requestedScene==='mtxtato'?'smoothtato':requestedScene==='pipeline'?'scraper':requestedScene;
document.body.dataset.scene=scene;
const sfx=new SceneSound(scene);let previousLotStage=-1;
document.documentElement.classList.toggle('embedded',parent!==window);
const woven=!!window.frameElement?.classList.contains('sketch-demo');
document.documentElement.classList.toggle('woven',woven);
let visible=parent===window,paused=false,frame=0,last=0,time=0,paintAt=0,draw=()=>{},advance=()=>{};
const stats={scene,frames:0,paintMs:0,ready:performance.now()};
function onScreen(){
    if(parent===window)return true;
    try{const r=window.frameElement?.getBoundingClientRect();if(r)return r.bottom>0&&r.top<parent.innerHeight;}catch{}
    return visible;
}
function wake(){visible=onScreen();if(!frame&&visible&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
function tick(now){
    frame=0;const dt=last?Math.min((now-last)/1000,.1):0;last=now;time+=dt;sfx.active(true);advance(dt);sceneAudio();
    // Small hand-drawn characters animate at 30 fps. UI timing remains display-rate.
    if(now-paintAt>=32){const start=performance.now();draw(dt);stats.paintMs=performance.now()-start;stats.frames++;paintAt=now;}
    wake();
}
function stop(){sfx.active(false);cancelAnimationFrame(frame);frame=0;last=0;}
addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='demo-visibility'){visible=!!e.data.visible;if(visible)wake();else stop();}});
document.addEventListener('visibilitychange',()=>document.hidden?stop():wake());
addEventListener('keydown',e=>{if(e.key==='Escape')parent.postMessage({type:'close-project'},location.origin);});
function canvas(id){
    const el=$('#'+id),c=el.getContext('2d');attachToys(el,wake,sfx);let w=0,h=0;
    new ResizeObserver(()=>{const r=el.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);const pw=Math.round(r.width*d),ph=Math.round(r.height*d);if(w===r.width&&h===r.height&&el.width===pw&&el.height===ph)return;w=r.width;h=r.height;el.width=pw;el.height=ph;c.setTransform(d,0,0,d,0,0);draw(0);}).observe(el);
    return {el,c,get w(){return w;},get h(){return h;},clear(){c.clearRect(0,0,w,h);}};
}
let halo=null,robot=null,lot=null,mini=null;
function sceneAudio(){
    if(halo){
        halo.drool=halo.done?Math.max(0,1-halo.hold/.26):Math.min(1,halo.elapsed/2.8);
        halo.voice=sfx.mouth('interview');halo.sound=sfx.mix.enabled;
        if(halo.done&&halo.hold>.32&&halo.hold<1.65)sfx.beat('yap',halo.round+':'+Math.floor((halo.hold-.32)/.20),'yap',{id:'interview'});
    }else if(robot){
        if(robot.route.length)sfx.beat('walk',Math.floor(time*4.2),'step',{level:.65});
        sfx.chirp('bot',time,12);
    }else if(lot){
        if(lot.elapsed>1.2&&lot.elapsed<4.2)sfx.beat('walk',Math.floor(time*3.7),'step',{level:.6});
        const stage=lot.elapsed<.8?0:lot.elapsed<4.8?1:2;
        if(stage!==previousLotStage){sfx.play(stage===2?'place':'paper',{level:.8});previousLotStage=stage;}
        sfx.chirp('hunt',time,11);
    }
}

if(scene==='halo'){
    $('.caption').textContent='a very fictional interview';
    $('#scene').innerHTML=`<div class="call"><p class="question">“Tell me about something you’ve built.”</p><div class="portrait"><canvas id="candidate-art" aria-hidden="true"></canvas><p id="thought">there was definitely a thought here.</p></div><div class="cue"><header><strong>HALO</strong><span class="timer" aria-label="Example response time">0.00s</span></header><p class="answer">finding a thread…</p><div class="progress" aria-hidden="true"><span></span></div></div></div>`;
    const scenarios=[
        {question:'Tell me about something you have built.',thought:'where do i even start?',answer:'Start with Botato. You built it to handle the repetitive bits in Path of Exile.',after:'oh. right. that thing i built.'},
        {question:'What draws you to working with AI?',thought:'a normal question. words, please.',answer:'Talk about HALO: audio, screen context and one useful sentence when your brain goes blank.',after:'something useful. that is the point.'},
        {question:'How do you decide whether a hardware lot is worth buying?',thought:'there is a spreadsheet in my head somewhere.',answer:'Start with the checks: condition, fees, resale evidence and the risk of faulty parts.',after:'the numbers. and what they leave out.'},
        {question:'What do you do when a project gets stuck?',thought:'ironic timing.',answer:'Pick one concrete bug. Explain what you observed, what you changed and how you checked it.',after:'one small thing at a time.'},
        {question:'What have you been tinkering with lately?',thought:'how much time have you got?',answer:'The little meowl website. A boulder you can help push, drawn creatures and actual pathfinding.',after:'okay. this one i could talk about.'}
    ];
    halo={elapsed:0,duration:0,done:false,sound:false,clicks:0,scenario:-1,scenarioCount:scenarios.length};
    const a=canvas('candidate-art'),timer=$('.timer'),bar=$('.progress span');
    function click(){if(sfx.play('click'))halo.clicks++;sfx.play('slurp');}
    addEventListener('sound-state',()=>{halo.sound=sfx.mix.enabled;});
    function nextScenario(){
        const choices=scenarios.map((_,i)=>i).filter(i=>i!==halo.scenario);
        halo.scenario=choices[Math.floor(Math.random()*choices.length)];halo.round=(halo.round||0)+1;
        halo.elapsed=0;halo.hold=0;halo.duration=Math.round((3.5+Math.random()*1.5)*100)/100;halo.done=false;
        $('.call').classList.remove('done');$('.question').textContent='\u201c'+scenarios[halo.scenario].question+'\u201d';
        $('.answer').textContent='finding a thread...' ;$('#thought').textContent=scenarios[halo.scenario].thought;
        timer.textContent='0.00s';bar.style.transform='scaleX(0)';wake();
    }
    nextScenario();
    advance=dt=>{
        if(halo.done){halo.hold=(halo.hold||0)+dt;if(halo.hold>2.6)nextScenario();return;}halo.elapsed=Math.min(halo.duration,halo.elapsed+dt);
        const label=halo.elapsed.toFixed(2)+'s';if(timer.textContent!==label)timer.textContent=label;
        bar.style.transform=`scaleX(${halo.elapsed/halo.duration})`;
        if(halo.elapsed>=halo.duration){halo.done=true;$('.call').classList.add('done');$('.answer').textContent=scenarios[halo.scenario].answer;$('#thought').textContent=scenarios[halo.scenario].after;click();}
    };
    draw=()=>{a.clear();drawMeowl(a.c,a.w*.5,a.h-4,89,{id:'interview',time,mode:halo.done&&halo.hold>.26?'happy':'nervous',look:halo.done?2:0,voice:sfx.mouth('interview'),drool:halo.done?Math.max(0,1-halo.hold/.26):Math.min(1,halo.elapsed/2.8)});const x=a.w*.76,y=a.h-15;toyProp(a.c,'cue-note',x,y,30,28,(c)=>{line(c,[[x-14,y-28],[x+14,y-27],[x+13,y],[x-15,y],[x-14,y-28]],'#a19986',1);line(c,[[x-8,y-19],[x+8,y-19],[x-7,y-13],[x+5,y-13]],'#a19986',.8);});};
}else if(scene==='botato'||scene==='liquidation'){
    const bot=scene==='botato';$('.caption').textContent=bot?'a tiny detour of its own':'the hunt, in miniature';
    $('#scene').innerHTML=`<canvas class="toy" id="${bot?'botato-art':'liquidation-art'}" tabindex="0" aria-label="${bot?'Meowl pathfinder. Tap the floor or move the divine orb.':'A meowl inspects hardware from a liquidation lot.'}"></canvas><p class="toy-note" id="toy-note"></p>`;
    const a=canvas(bot?'botato-art':'liquidation-art'),note=$('#toy-note');
    if(bot){
        robot={x:40,y:220,cameraX:240,cameraY:320,target:[885,560],route:[],blocked:[],rocks:rocks.map(r=>r.points),routeMs:0};
        const silhouettes=rocks.map(rockPath);let terrain=null,terrainWidth=0,terrainHeight=0,draggedLoot=null,lastLootRoute=-1;
        function map(){
            const scale=Math.max(a.w/WIDTH,a.h/HEIGHT),vw=a.w/scale,vh=a.h/scale;
            const cx=Math.max(vw/2,Math.min(WIDTH-vw/2,robot.cameraX)),cy=Math.max(vh/2,Math.min(HEIGHT-vh/2,robot.cameraY));
            return{scale,ox:a.w/2-cx*scale,oy:a.h/2-cy*scale};
        }
        function divineOrb(c,x,y){
            c.save();c.translate(x,y);c.rotate(-.13);
            c.beginPath();c.moveTo(-8,-17);c.bezierCurveTo(-2,-24,11,-21,14,-12);c.lineTo(15,-3);c.lineTo(11,10);c.lineTo(5,17);c.lineTo(-3,16);c.lineTo(-10,10);c.lineTo(-14,0);c.lineTo(-12,-12);c.closePath();c.fillStyle='#d4c08e';c.fill();c.strokeStyle='#786945';c.lineWidth=1.4;c.stroke();
            line(c,[[-11,-10],[-5,-12],[-1,-8],[-6,-6],[-10,-8]],'#625741',1.3);
            line(c,[[3,-8],[8,-10],[12,-6],[8,-3],[4,-5]],'#625741',1.3);
            line(c,[[1,-9],[0,-1],[-3,3],[3,4],[5,1]],'#786945',1.2);
            line(c,[[-5,9],[-1,6],[5,8],[7,12],[1,10],[-5,9]],'#625741',1.3);
            line(c,[[-9,1],[-7,5],[-10,8]],'#97814e',.85);line(c,[[9,1],[7,5],[10,8]],'#97814e',.85);
            line(c,[[-7,-17],[-2,-19],[5,-17],[10,-15]],'#97814e',.8);c.restore();
        }
        function outline(c,r,i){
            c.fillStyle='#eeeae0';c.fill(silhouettes[i]);c.strokeStyle='#55564e';c.lineWidth=1.2;c.stroke(silhouettes[i]);
            c.beginPath();const pts=r.points;
            for(let j=0;j<pts.length;j++){const [x,y]=pts[j];j?c.lineTo(x+Math.sin(j*2.1)*1.4,y+Math.cos(j)*1.3):c.moveTo(x,y);}
            c.strokeStyle='#7b7c70';c.lineWidth=.6;c.stroke();
            line(c,[[r.x-r.rx*.3,r.y-r.ry*.55],[r.x-r.rx*.15,r.y-r.ry*.2],[r.x+r.rx*.12,r.y-r.ry*.12],[r.x+r.rx*.3,r.y+r.ry*.4]],'#848579',.8);
        }
        function cacheTerrain(){
            terrain=document.createElement('canvas');terrain.width=WIDTH*1.5;terrain.height=HEIGHT*1.5;terrainWidth=a.w;terrainHeight=a.h;
            const c=terrain.getContext('2d');c.scale(1.5,1.5);
            // The page's continuous pen supplies the zone boundary. Cache only the terrain.
            const ordered=[...rocks].sort((a,b)=>Math.floor(a.y/155)-Math.floor(b.y/155)||(Math.floor(a.y/155)%2?b.x-a.x:a.x-b.x));
            c.beginPath();let px=0,py=0;c.moveTo(px,py);
            for(const r of ordered){const [x,y]=r.points[0];c.bezierCurveTo(px+(x-px)*.38,py+18,x-(x-px)*.22,y-12,x,y);for(const p of r.points.slice(1))c.lineTo(...p);c.lineTo(x,y);px=x;py=y;}
            c.bezierCurveTo(px+40,py+40,WIDTH-20,HEIGHT-40,WIDTH,HEIGHT);c.strokeStyle='#b0a795';c.lineWidth=.7;c.stroke();
            rocks.forEach((r,i)=>outline(c,r,i));
        }
        function route(x,y){
            const start=performance.now(),path=routeThroughRocks([robot.x,robot.y],[x,y]);robot.routeMs=performance.now()-start;
            if(!path.length){note.textContent='that gap is a little too tight.';return false;}
            robot.route=path;robot.target=path.at(-1).slice();note.textContent='tap a clearing, or move the divine orb.';robot.destinations=(robot.destinations||0)+1;draw();wake();return true;
        }
        route(885,560);let target=0;const goals=[[840,55],[60,555],[660,440],[400,35],[900,590]];
        function nextLoot(){let moved=false;for(let i=0;i<goals.length&&!moved;i++){const goal=goals[target++%goals.length];if(Math.hypot(goal[0]-robot.x,goal[1]-robot.y)>70)moved=route(...goal);}return moved;}
        let down;
        a.el.onpointerdown=e=>down=[e.clientX,e.clientY];a.el.onpointerup=e=>{
            const start=down;down=null;if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>12)return;
            const r=a.el.getBoundingClientRect(),m=map();route((e.clientX-r.left-m.ox)/m.scale,(e.clientY-r.top-m.oy)/m.scale);
        };
        a.el.onpointercancel=()=>down=null;
        a.el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nextLoot();}};
        advance=dt=>{
            if(draggedLoot?.held&&time-lastLootRoute>.25){lastLootRoute=time;route(draggedLoot.x,draggedLoot.y);}
            if(toyBusy(a.el))return;
            if(!robot.route.length){robot.idle=(robot.idle||0)+dt;if(robot.idle>.8){robot.idle=0;nextLoot();}}else robot.idle=0;
            let remaining=dt*125;
            while(robot.route.length&&remaining>0){const [x,y]=robot.route[0],dx=x-robot.x,dy=y-robot.y,d=Math.hypot(dx,dy);
                if(d<=remaining){robot.x=x;robot.y=y;robot.route.shift();remaining-=d;if(!robot.route.length)note.textContent='found it. choosing the next drop.';}
                else{robot.x+=dx/d*remaining;robot.y+=dy/d*remaining;remaining=0;}
            }
            const follow=1-Math.exp(-dt*3.8);
            robot.cameraX+=(robot.x-robot.cameraX)*follow;robot.cameraY+=(robot.y-robot.cameraY)*follow;
        };
        draw=()=>{
            if(!a.w||!a.h)return;if(!terrain||terrainWidth!==a.w||terrainHeight!==a.h)cacheTerrain();
            a.clear();const c=a.c,m=map();c.save();c.translate(m.ox,m.oy);c.scale(m.scale,m.scale);
            // The visible zone corner flows into a rock even while the camera pans.
            const entry=[-m.ox/m.scale,-m.oy/m.scale],visibleVertices=rocks.flatMap(r=>r.points).filter(([x,y])=>x*m.scale+m.ox>8&&x*m.scale+m.ox<a.w-8&&y*m.scale+m.oy>8&&y*m.scale+m.oy<a.h-8);
            const join=visibleVertices.sort((a,b)=>Math.hypot(a[0]-entry[0],a[1]-entry[1])-Math.hypot(b[0]-entry[0],b[1]-entry[1]))[0];
            if(join){c.beginPath();c.moveTo(...entry);c.bezierCurveTo(entry[0]+28,entry[1]+9,join[0]-22,join[1]-14,...join);c.strokeStyle='#b0a795';c.lineWidth=.7;c.stroke();}
            c.drawImage(terrain,0,0,WIDTH,HEIGHT);
            if(robot.route.length){c.setLineDash([2,6]);line(c,[[robot.x,robot.y],...robot.route],'#89846e',1);c.setLineDash([]);}
            const [tx,ty]=robot.target;draggedLoot=toyProp(c,'loot',tx,ty+20,36,44,(c)=>divineOrb(c,tx,ty));
            drawMeowl(c,robot.x,robot.y,74,{voice:sfx.mouth('bot'),id:'bot',chase:false,hat:'goldrim',time,speed:robot.route.length?60:0,facing:robot.route.length&&robot.route[0][0]<robot.x?-1:1});
            // Rock faces in front of his feet occlude him as he passes behind.
            rocks.forEach((r,i)=>{if(r.bottom>robot.y&&Math.abs(r.x-robot.x)<r.rx+40&&Math.abs(r.y-robot.y)<r.ry+65)outline(c,r,i);});
            c.restore();
            const screenX=tx*m.scale+m.ox,screenY=ty*m.scale+m.oy;
            if(screenX<15||screenX>a.w-15||screenY<15||screenY>a.h-15){
                const x=Math.max(25,Math.min(a.w-35,screenX)),y=Math.max(32,Math.min(a.h-35,screenY));
                divineOrb(c,x,y);
                c.fillStyle='#66573c';c.font='16px Reader,Georgia,serif';c.textAlign='center';c.fillText('divine orb',x,y+35);c.textAlign='left';
            }
        };
    }else{
        lot={index:30,elapsed:0,stage:1,x:75,y:280,vx:0,vy:0,carrying:true,camera:1,placed:30};
        // Successive supported shells contain 1, 3, 5 ... cards. There is no final lap/reset.
        const slot=index=>{const radius=Math.floor(Math.sqrt(index)),offset=index-radius*radius,row=Math.floor(offset/2);return{x:310+(radius-row)*(offset%2?1:-1)*24,y:280-row*22};};


        advance=dt=>{
            lot.elapsed+=dt;
            const cell=slot(lot.index),target=lot.carrying?{x:cell.x,y:cell.y+27}:{x:40,y:280};
            const dx=target.x-lot.x,dy=target.y-lot.y,d=Math.hypot(dx,dy),pace=time<(lot.hurryUntil||0)?210:130;
            lot.vx+=(dx/(d||1)*Math.min(pace,d*5)-lot.vx)*(1-Math.exp(-dt*10));lot.vy+=(dy/(d||1)*Math.min(pace,d*5)-lot.vy)*(1-Math.exp(-dt*10));
            lot.x+=lot.vx*dt;lot.y+=lot.vy*dt;
            if(d<2&&Math.hypot(lot.vx,lot.vy)<15){if(lot.carrying){lot.index++;lot.placed++;sfx.play('place',{level:.65});}lot.carrying=!lot.carrying;}
            const radius=Math.ceil(Math.sqrt(lot.index+1)),zoom=Math.min(1.12,470/(330+radius*24),250/(radius*22+80));lot.camera+=(zoom-lot.camera)*(1-Math.exp(-dt*1.2));
            lot.stage=lot.carrying?2:1;lot.carrierPosition=[lot.x,lot.y];
        };
        draw=()=>{
            if(!a.w||!a.h)return;a.clear();const c=a.c,scale=Math.min(a.w/480,a.h/340),floor=a.h*.84;
            const thread=JSON.stringify([[0,floor],[a.w,floor]]);if(a.el.dataset.threadPoints!==thread){a.el.dataset.threadPoints=thread;a.el.dataset.threadY=String(floor);if(woven)parent.dispatchEvent(new Event('ink-anchors'));}
            if(!woven)line(c,[[0,floor],[a.w,floor]],'#656054',1.15);
            c.save();c.translate(a.w*.5,floor);c.scale(scale*lot.camera,scale*lot.camera);c.translate(-240,-295);
            const radius=Math.floor(Math.sqrt(lot.index)),first=Math.max(0,lot.index-600);
            if(first)line(c,[[310-radius*24,295],[310,280-radius*22],[310+radius*24,295]],'#969f91',3);
            for(let i=first;i<lot.index;i++){const p=slot(i);hardware(c,p.x,p.y,'gpu',.44,0,'gpu-'+i);}
            line(c,[[17,283],[17,244],[67,246],[67,283],[17,283]],'#6f624d',1.2);
            const pose=drawMeowl(c,lot.x,lot.y,75,{voice:sfx.mouth('hunt'),id:'hunt',time,mode:lot.carrying?'carry':'scurry',speed:Math.hypot(lot.vx,lot.vy),facing:lot.vx<0?-1:1,emotion:'determined',effort:.82,chase:false,cargo:lot.carrying?(ctx,grip)=>hardware(ctx,grip.x,grip.y-8,'gpu',.8,0,'gpu-'+lot.index):null});
            lot.grips=pose.hands;c.restore();note.textContent=lot.placed+' gpus checked and stacked. just one more lot.';
        };
    }
}
else{mini=(['ocr','interests'].includes(scene)?personalScene:miniScene)(scene,canvas,wake,sfx);draw=mini.draw;advance=mini.advance;}
if(parent===window){const a=document.createElement('a');a.href='index.html';a.textContent='back to the little guy';a.style.cssText='display:block;margin:22px 0;font-size:13px;color:inherit';$('#demo').append(a);}
sfx.mix.notify();
window.__siteDiagnostics=()=>({...stats,audio:sfx.mix.diagnostics(),paused,time,phase:halo?(halo.done?3:1):0,halo,mini:mini?.state,game:robot?{...robot,position:[robot.x,robot.y]}:null,lot,activeCanvases:visible&&!paused?1:0,raf:!!frame});
let reportedHeight=0;
function reportLayout(){const height=Math.ceil(document.querySelector('#demo').getBoundingClientRect().height+4);if(height===reportedHeight)return;reportedHeight=height;parent.postMessage({type:'demo-layout',height},location.origin);}
new ResizeObserver(reportLayout).observe(document.querySelector('#demo'));
parent.postMessage({type:'demo-ready'},location.origin);document.fonts.ready.then(reportLayout);reportLayout();wake();

// Parent IntersectionObserver can miss a notification during a mobile frame load.
const visibilityPoll=setInterval(()=>{const next=onScreen();if(next&&!frame)wake();else if(!next&&frame)stop();},500);
addEventListener('pagehide',()=>clearInterval(visibilityPoll));
