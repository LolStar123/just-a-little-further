import {SceneSound} from './soundscape.js';
import {musicPlayer} from './music-player.js';
import {drawReferenceRock,rockReady} from './rock-reference.js';
await rockReady;
import {mountainPoints,setHillContour,hillExit,sceneryCommands} from './pen-thread.js';
import {projects,trail} from './creations.js';
import {HillPhysics,clamp} from './hill-physics.js';
import {drawMeowl,ready,art} from './little-creatures.js';
import {AuraField} from './aura-field.js';

const $=s=>document.querySelector(s),canvas=$('#playground'),c=canvas.getContext('2d');
const surface=$('#interaction-surface');let worldVisible=true;
const TAU=Math.PI*2,reduce=matchMedia('(prefers-reduced-motion: reduce)');
let toyMotionRequested=false;
const quietToy=()=>reduce.matches&&!toyMotionRequested;
let W=0,H=0,dpr=1,physics,time=0,last=0,frame=0,paused=false,dirty=true;
let terrainSeen=-1,terrainInkAt=0,extraDepth=0,paintTop=0,paintHeight=0;
let landscape,lastRelease=null,grab=null,pointer={x:-1000,y:-1000,active:false};
let petCount=0,catchSeen=0,shake=0,stoneKick=0;
const particles=[],ripples=[],scuffs=[];
const auraField=new AuraField();
const hillSound=new SceneSound('hill',canvas),mix=hillSound.mix;musicPlayer(mix);
let heardChips=0,heardMode='';
const hero={x:0,y:0,vx:0,vy:0,size:110,pet:0,cheer:0,held:false,mode:'rest',phase:0,effort:0};
let panelOpen=false,project=null,returnFocus=null;
let pendingThought='',thoughtShown='',thoughtAt=-10,thoughtX=null,thoughtY=null;
function status(text){pendingThought=text;}
function positionThought(dt){
    const el=$('#small-life'),copy=el.querySelector('span');
    if(pendingThought&&pendingThought!==thoughtShown&&time-thoughtAt>.9){
        thoughtShown=pendingThought;thoughtAt=time;copy.textContent=thoughtShown;
        copy.getAnimations().forEach(a=>a.cancel());copy.animate([{opacity:.2,transform:'translateY(4px) scale(.96)'},{opacity:1,transform:'translateY(-3px) scale(1.025)'},{transform:'translateY(1px) scale(.995)'},{transform:'none'}],{duration:420,easing:'ease-out'});
    }
    const width=el.offsetWidth,height=el.offsetHeight,origin=surface.getBoundingClientRect();
    const obstacles=[$('.introduction'),$('.bottom-edge'),...document.querySelectorAll('.knot')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left-origin.left-9,right:r.right-origin.left+9,top:r.top-origin.top-9,bottom:r.bottom-origin.top+9};});
    const rock=physics.rock.bounds;obstacles.push({left:rock.min.x-10,right:rock.max.x+10,top:rock.min.y-10,bottom:rock.max.y+10},{left:hero.x-hero.size*.6,right:hero.x+hero.size*.6,top:hero.y-hero.size*1.1,bottom:hero.y+15});
    const candidates=[...(W<760?[[W*.07,340]]:[]),[hero.x-hero.size*.7-width-14,hero.y-hero.size*.9],[hero.x+hero.size*.7+14,hero.y-hero.size*.9],[hero.x-width*.5,hero.y+50]];
    for(const lift of [1.3,1.7,2.1])for(const side of [-1,0,1])candidates.push([hero.x-width*.5+side*(width+20),hero.y-hero.size*lift-height]);
    const choices=candidates.map(([x,y])=>{x=clamp(x,12,W-width-12);y=clamp(y,95,H+extraDepth-height-8);const area=obstacles.reduce((sum,r)=>sum+Math.max(0,Math.min(x+width,r.right)-Math.max(x,r.left))*Math.max(0,Math.min(y+height,r.bottom)-Math.max(y,r.top)),0);return{x,y,area};});
    const chosen=choices.find(p=>p.area===0)||choices.sort((a,b)=>a.area-b.area)[0],{x,y}=chosen,ease=1-Math.exp(-Math.max(dt,.016)*9);
    thoughtX=thoughtX===null?x:thoughtX+(x-thoughtX)*ease;thoughtY=thoughtY===null?y:thoughtY+(y-thoughtY)*ease;
    // The interpolated path must avoid the cards too, not only its destination.
    for(let pass=0;pass<obstacles.length;pass++){
        const hit=obstacles.find(r=>thoughtX<r.right&&thoughtX+width>r.left&&thoughtY<r.bottom&&thoughtY+height+3>r.top);
        if(!hit)break;thoughtY=hit.top-height-4;
    }
    el.style.transform=`translate(${thoughtX}px,${thoughtY+Math.sin(time*2)*1.2}px)`;
}

function wake(){dirty=true;if(!frame&&!document.hidden&&worldVisible&&!panelOpen)frame=requestAnimationFrame(tick);}
function used(){ $('#play-hint').classList.add('used'); }
function noise(seed){let n=seed|0;return()=>{n=(Math.imul(n,1664525)+1013904223)|0;return(n>>>0)/4294967296;};}
function prepareLinework(){
    landscape=new Path2D();
    const offset=Math.min(0,physics.base(W*.47)-H*.72-22);
    for(const [op,...v]of sceneryCommands(W,H,offset,x=>physics.base(x))){
        if(op==='M')landscape.moveTo(...v);else if(op==='L')landscape.lineTo(...v);
        else if(op==='Q')landscape.quadraticCurveTo(...v);else landscape.bezierCurveTo(...v);
    }
}
function resize(){
    const sr=surface.getBoundingClientRect(),r={width:sr.width,height:sr.height-extraDepth},nextDpr=Math.min(devicePixelRatio||1,2);
    if(physics&&Math.abs(r.width-W)<.5&&Math.abs(r.height-H)<.5&&nextDpr===dpr)return;
    const oldW=W,oldH=H,old=physics?.diagnostics(),terrain=physics?.terrainState();W=r.width;H=r.height;dpr=nextDpr;
    surface.dataset.baseHeight=H;paintHeight=0;canvas.width=Math.round(W*dpr);canvas.height=Math.round(Math.min(H,innerHeight+256)*dpr);c.setTransform(dpr,0,0,dpr,0,0);
    cancelGrab();auraField.clear();physics?.dispose();physics=new HillPhysics(W,H,impact);physics.restoreTerrain(terrain);terrainSeen=-1;catchSeen=0;
    if(old&&oldW){const b=physics.rock;Matter.Body.setPosition(b,{x:clamp(old.position.x/oldW*W,physics.radius,W-physics.radius),y:Math.min(old.position.y/oldH*H,physics.ground(old.position.x/oldW*W)-physics.radius)});Matter.Body.setAngle(b,old.angle);}
    hero.size=W<760?84:128;physics.addMeowl(hero.size);hero.held=false;updateCharacters(0);
    prepareLinework();setHillContour(physics.contour(),Math.min(0,physics.base(W*.47)-H*.72-22));layoutProjects();last=0;wake();
}
function layoutProjects(){
    const deepest=Math.max(...physics.nodes.map(n=>physics.ground(n.x))),needed=Math.max(0,Math.ceil((deepest+100-H)/80)*80);
    if(needed!==extraDepth){extraDepth=needed;$('#world').style.setProperty('--dig-depth',extraDepth+'px');dispatchEvent(new Event('ink-anchors'));}
    physics.extendDepth(H+extraDepth);
    for(const [i,el]of[...document.querySelectorAll('.knot')].entries()){
        const x=(.06+i*.88/(trail.length-1))*W;
        el.style.left=x+'px';el.style.top=(physics.ground(x)+62)+'px';
        el.style.setProperty('--label-offset',(W<760?i%2*19:0)+'px');
    }
}
function impact({x,y,speed,rock,terrain,depth,width}){
    const count=terrain?Math.round(clamp(depth*1.3,12,30)):Math.round(clamp(speed*(rock?4.5:1.8),5,48));
    for(let i=0;i<count;i++){const a=Math.PI+Math.random()*Math.PI,v=40+Math.random()*speed*32;particles.push({x:x+(Math.random()-.5)*(terrain?width:30),y:y-3,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:.6+Math.random()*.9,size:terrain?2+Math.random()*3.4:.6+Math.random()*2.5,shard:!!terrain});}
    if(particles.length>260)particles.splice(0,particles.length-260);
    ripples.push({x,y,age:0,power:speed});shake=Math.min(3.5,speed*.20);stoneKick=Math.min(1,speed/12);
    if(terrain)hillSound.play('chip',{level:.6});else playTone(rock?'thud':'tap',clamp(speed/12,.12,.8));
    if(rock&&speed>4){status('the hill remembers the landing.');used();}
}
function playTone(kind='tap',level=.35){
    if(kind==='pet')hillSound.play('meow',{id:'hero',mood:'relieved'});
    else hillSound.play(kind==='thud'?'stone':'step',{level:Math.max(.3,level)});
}
function hillAudio(){
    hillSound.active(worldVisible&&!paused&&!panelOpen);
    hillSound.chirp('hero',time,[5,10],true,{mood:hero.emotion});
    if(physics.splat){
        const age=physics.splat.age,blink=[[.62,.78],[1.10,1.28]].findIndex(([start,end])=>age>=start&&age<end);
        if(blink>=0)hillSound.beat('pancake-blink',blink,'blink');
    }else hillSound.marks.delete('pancake-blink');
    const movingRock=Math.hypot(physics.rock.velocity.x,physics.rock.velocity.y)>.3;
    const groundedRock=movingRock&&physics.engine.pairs.list.some(p=>p.isActive&&(p.bodyA===physics.rock&&p.bodyB.label==='soil'||p.bodyB===physics.rock&&p.bodyA.label==='soil'));
    if(groundedRock)hillSound.beat('rolling',Math.floor(time/0.85),'roll',{level:Math.min(1,.35+Math.abs(physics.rock.angularVelocity)*4)});
    if(physics.contact&&Math.abs(physics.rock.angularVelocity)>.003)hillSound.beat('friction',Math.floor(time*3),'friction',{level:Math.min(1,.3+Math.abs(physics.rock.angularVelocity)*5)});
    const feetDown=physics.ground(hero.x)-(physics.actor.position.y+physics.actorHeight/2)<hero.size*.12;
    if(Math.abs(hero.vx)>6&&feetDown&&!hero.held&&!physics.splat)hillSound.beat('feet',Math.floor(hero.phase/3),'step',{level:.6});
    if(physics.chipCount>heardChips)hillSound.play('chip');heardChips=physics.chipCount;
    if(hero.mode!==heardMode){if(hero.mode==='spring')hillSound.play('spring');if(hero.mode==='trip')hillSound.play('trip');if(hero.mode==='flattened')hillSound.play('squish');heardMode=hero.mode;}
}

function updateCharacters(dt){
    const a=physics.actor,b=physics.rock;if(!a)return;
    const prev=hero.x;hero.pet=Math.max(0,hero.pet-dt);hero.cheer=Math.max(0,hero.cheer-dt);
    hero.x=a.position.x;hero.y=physics.splat?physics.ground(hero.x):a.position.y+physics.actorHeight/2+physics.lane*hero.size*.24;hero.vx=a.velocity.x*60;hero.vy=a.velocity.y*60;
    hero.held=physics.drag?.bodyB===a;hero.mode=physics.mode;hero.effort=physics.effort;hero.emotion=physics.emotion;hero.emotionAge=physics.time-physics.emotionSince;
    hero.phase+=Math.abs(hero.x-prev)*.14;
    if(physics.catchCount>catchSeen){catchSeen=physics.catchCount;shake=2;status('okay. okay. i have it.');playTone('thud',.35);}
    if(hero.mode==='anticipate')status('feet down. wings up.');
    if(hero.mode==='heave'&&physics.catchAge>1.8)status('one foothold. then another.');
    if(hero.mode==='backpush')status('back into it. all i have.');
    if(hero.mode==='scramble'||hero.mode==='scurry')status('hang on. wrong side.');
    if(hero.mode==='flattened')status('...blink. blink.');
    if(hero.mode==='spring')status('right. where were we?');
    if(hero.mode==='panic')status('wait. wait. come back.');
    else if(hero.emotion==='crying')status('tiny cry. still trying.');
    else if(hero.emotion==='angry')status('right. again.');
    if(physics.assist)status('okay. just this once.');
    if(hero.mode==='celebrate')status('a little further than before. that counts.');
    if((hero.mode==='slide'||hero.mode==='heave'||hero.mode==='push')&&Math.abs(hero.vx)>7&&dt&&Math.random()<dt*20){
        scuffs.push({x:hero.x,y:hero.y,age:0,length:clamp(Math.abs(hero.vx)*.15,4,18)});
        particles.push({x:hero.x-hero.size*.2,y:hero.y-2,vx:-25-Math.random()*50,vy:-10-Math.random()*35,life:0,max:.45+Math.random()*.4,size:.7+Math.random()});
    }
    if(scuffs.length>65)scuffs.shift();if(particles.length>240)particles.splice(0,particles.length-240);
    if(['slide','heave'].includes(hero.mode)&&dt&&Math.random()<dt*4)particles.push({x:hero.x-hero.size*.17,y:hero.y-hero.size*.92,vx:-20-Math.random()*20,vy:-35,life:0,max:.6,size:1.3,color:'#a5bfcb'});
    shake*=Math.exp(-dt*12);stoneKick*=Math.exp(-dt*16);
}
function drawGround(){
    if((terrainSeen!==physics.terrainVersion||physics.slabs.length)&&(time-terrainInkAt>.04||!physics.terrainChanging)){
        setHillContour(physics.contour(),Math.min(0,physics.base(W*.47)-H*.72-22));
        layoutProjects();terrainSeen=physics.terrainVersion;terrainInkAt=time;
    }
    // Restore the quieter distant sketch and the original hard, uneven ridge.
    // Their shared endpoint retains the repaired connection into the hill.
    const background=new Path2D(landscape),offset=Math.min(0,physics.base(W*.47)-H*.72-22),lastY=.73*H+offset;
    background.bezierCurveTo(8,lastY+12,4,physics.ground(0)-15,0,physics.ground(0));
    c.strokeStyle='#777970';c.globalAlpha=.57;c.lineWidth=.65;c.stroke(background);c.globalAlpha=1;
    const ridge=new Path2D();ridge.moveTo(0,physics.ground(0));
    for(const [x,y]of physics.contour().slice(1))ridge.lineTo(x,y);
    c.strokeStyle='#393a36';c.lineWidth=1.3;c.stroke(ridge);
    // The shared SVG owns the loose cliff exit, including its tug deformation.
    // Only structural fractures are drawn. Erosion clips away exposed material.
    c.save();c.beginPath();c.moveTo(0,physics.ground(0));
    for(let i=1;i<=50;i++)c.lineTo(i*W/52,physics.ground(i*W/52));
    c.lineTo(W*.963,physics.ground(W*.963));
    c.lineTo(W*.963,H+extraDepth);c.lineTo(0,H+extraDepth);c.closePath();c.clip();
    for(const fault of physics.faults){
        const damage=Math.min(1,fault.damage||0),growth=Math.min(1,(physics.time-fault.born)/(.14/3))*(.4+damage*.6);
        c.globalAlpha=fault.broken?.55:.32+damage*.6;c.strokeStyle='#665b45';c.lineWidth=fault.broken?.75:.55+damage*1.55;
        for(const pts of fault.paths){
            c.beginPath();c.moveTo(...pts[0]);const end=growth*(pts.length-1);
            for(let i=1;i<=Math.ceil(end);i++){
                const f=Math.min(1,end-i+1),a=pts[i-1],b=pts[i];
                c.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f);
            }
            c.stroke();
        }
    }
    c.restore();
    for(const fault of physics.faults){
        const age=physics.time-fault.breakAt;if(!fault.broken||age<0||age>.75)continue;
        c.save();c.globalAlpha=.72*(1-age/.75);c.strokeStyle='#60513d';c.lineWidth=2.4;
        c.beginPath();for(let i=0;i<=24;i++){const x=clamp(fault.x-fault.width+2*fault.width*i/24,0,W);i?c.lineTo(x,physics.ground(x)):c.moveTo(x,physics.ground(x));}c.stroke();c.restore();
    }

}
function drawStone(){
    const b=physics.rock,R=physics.radius,d=Math.max(0,physics.ground(b.position.x)-b.position.y-R);
    // A small contact scribble replaces the soft filled drop shadow.
    c.save();c.globalAlpha=.55*Math.exp(-d/70);c.strokeStyle='#42413b';c.lineWidth=.7;c.beginPath();
    for(let i=0;i<24;i++){const x=b.position.x-R*.68+i/23*R*1.36,y=physics.ground(x)+3+(i%3)*1.1;i?c.lineTo(x,y):c.moveTo(x,y);}
    c.stroke();c.restore();
    drawReferenceRock(c,physics);
    c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);
    for(const f of physics.fractures){c.beginPath();c.moveTo(f.a.x,f.a.y);c.lineTo(f.b.x,f.b.y);c.strokeStyle='#eeeae0';c.lineWidth=2.4;c.stroke();c.lineWidth=.9;c.strokeStyle='#34352f';c.stroke();}
    c.restore();
    for(const slab of physics.slabs){
        const age=physics.time-slab.born;c.save();c.translate(slab.body.position.x,slab.body.position.y);c.rotate(slab.body.angle);c.globalAlpha=Math.max(0,Math.min(1,(slab.shattered?2:4)-age));c.beginPath();slab.inkOutline.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle='#eeeae0';c.fill();c.strokeStyle='#666054';c.lineWidth=.8;c.stroke();c.restore();
    }
    for(const fragment of physics.chips){const age=physics.time-fragment.born;c.save();c.globalAlpha=Math.min(1,(12-age)/2);c.beginPath();fragment.body.vertices.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle='#eeeae0';c.fill();c.strokeStyle='#42413b';c.lineWidth=.65;c.stroke();c.restore();}
    if(physics.drag?.bodyB===b){const p=physics.drag.pointA;c.beginPath();c.moveTo(b.position.x,b.position.y);c.lineTo(p.x,p.y);c.setLineDash([2,5]);c.strokeStyle='rgba(103,97,82,.55)';c.lineWidth=1;c.stroke();c.setLineDash([]);}
}
function drawParticles(dt){
    for(let i=scuffs.length-1;i>=0;i--){const q=scuffs[i];q.age+=dt;if(q.age>4){scuffs.splice(i,1);continue;}c.strokeStyle='rgba(110,97,74,'+(.22*(1-q.age/4))+')';c.lineWidth=1;c.beginPath();c.moveTo(q.x,physics.ground(q.x)+2);c.lineTo(q.x+q.length,physics.ground(q.x+q.length)+2);c.stroke();}

    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life+=dt;p.vy+=dt*440;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*.8);const gy=physics.ground(p.x);if(p.y>gy){p.y=gy;p.vy*=-.2;p.vx*=.75;}if(p.life>p.max){particles.splice(i,1);continue;}c.globalAlpha=(1-p.life/p.max)*.8;c.fillStyle=p.color||'#8b8069';if(p.shard){c.save();c.translate(p.x,p.y);c.rotate(p.life*9);c.beginPath();c.moveTo(-p.size,-p.size*.35);c.lineTo(p.size*.65,-p.size*.7);c.lineTo(p.size,p.size*.4);c.lineTo(-p.size*.4,p.size*.65);c.closePath();c.fill();c.strokeStyle='#66543c';c.lineWidth=.6;c.stroke();c.restore();}else{c.beginPath();c.ellipse(p.x,p.y,p.size,p.size*.6,0,0,TAU);c.fill();}}c.globalAlpha=1;
    for(let i=ripples.length-1;i>=0;i--){const p=ripples[i];p.age+=dt;if(p.age>.55){ripples.splice(i,1);continue;}c.strokeStyle=`rgba(112,100,78,${.2*(1-p.age/.55)})`;c.lineWidth=.6;c.beginPath();c.ellipse(p.x,physics.ground(p.x)+3,8+p.age*90,1+p.age*10,Math.atan(physics.slope(p.x)),0,TAU);c.stroke();}
}
function drawPower(front=false){auraField.draw(c,front,hero,physics,quietToy());}
function render(dt){
    positionThought(dt);
    for(const [id,x,y,w,h] of [['rock-hit',physics.rock.position.x,physics.rock.position.y,physics.rock.bounds.max.x-physics.rock.bounds.min.x+28,physics.rock.bounds.max.y-physics.rock.bounds.min.y+28],['meowl-hit',hero.x,hero.y-hero.size*.52,hero.size*1.5,hero.size*1.4]]){
        const el=$('#'+id);el.style.width=w+'px';el.style.height=h+'px';el.style.transform='translate('+(x-w/2)+'px,'+(y-h/2)+'px)';
    }

    // Paint only the visible slice; excavation can deepen without a giant bitmap.
    const top=clamp(-surface.getBoundingClientRect().top-128,0,Math.max(0,H+extraDepth-innerHeight-256));
    const ph=Math.min(H+extraDepth,innerHeight+256);
    if(paintHeight!==ph){paintHeight=ph;canvas.height=Math.ceil(ph*dpr);canvas.style.height=ph+'px';}
    paintTop=top;canvas.style.top=top+'px';c.setTransform(dpr,0,0,dpr,0,-paintTop*dpr);
    c.clearRect(0,paintTop,W,paintHeight);c.fillStyle='#eeeae0';c.fillRect(0,paintTop,W,paintHeight);

    drawGround();
    c.save();if(!quietToy()){c.translate(shake>.02?Math.sin(time*70)*shake*.35:0,0);}
    drawPower();
    c.save();drawStone();
    hero.pose=drawMeowl(c,hero.x,hero.y,hero.size,{voice:hillSound.mouth('hero'),parkour:hero.mode==='flutter'?{kind:'flutter'}:hero.mode==='tossed'?{kind:'fall'}:null,ground:x=>physics.ground(x)+physics.lane*hero.size*.24,rock:{contact:!physics.actorFlight&&!hero.held&&(physics.contact||physics.gripGrace),vertices:physics.rock.vertices},splatAge:physics.splat?.age||0,stroke:physics.stroke,time,air:hero.held||!!physics.actorFlight||!physics.splat&&physics.ground(hero.x)-(physics.actor.position.y+physics.actorHeight/2)>hero.size*.22,mode:hero.mode,emotion:hero.emotion,emotionAge:hero.emotionAge,speed:hero.vx,phase:hero.phase,effort:hero.effort,pet:hero.pet>0,landed:physics.landed,facing:physics.facing,look:clamp((physics.rock.position.x-hero.x)/20,-4,4)});
    c.restore();drawPower(true);drawParticles(dt);c.restore();
    if(!art.ready){c.fillStyle='#b4c5cb';c.font='14px Plex, sans-serif';c.textAlign='center';c.fillText('the meowl is on his way…',W*.59,H*.56);c.textAlign='left';}
}
const intervals=[];
function tick(now){
    if(!physics){frame=requestAnimationFrame(tick);return;}
    frame=0;const dt=paused?0:Math.min(.04,(now-(last||now))/1000);if(last&&dt) {intervals.push(now-last);if(intervals.length>120)intervals.shift();}last=now;
    if(dt){const worldDt=dt;time+=worldDt;physics.step(worldDt,{pet:hero.pet,cheer:hero.cheer});updateCharacters(worldDt);auraField.step(worldDt,hero,physics,quietToy());hillAudio();}
    if(dirty||!paused)render(dt);dirty=false;if(!paused&&!document.hidden&&worldVisible&&!panelOpen)frame=requestAnimationFrame(tick);
}
function pos(e){const r=surface.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
surface.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(grab&&!physics.drag)cancelGrab(false,'stale constraint');if(grab)return;const p=pos(e);pointer={...p,active:true};
    const b=physics.bodyAt(p.x,p.y);
    if(b){toyMotionRequested=true;if(paused){status('resume to move the boulder.');return;}physics.grab(b,p.x,p.y);grab={type:'body',id:e.pointerId,start:p};used();status('a little help changes the weight.');}
    else if(Math.hypot(p.x-hero.x,p.y-(hero.y-hero.size*.55))<hero.size*.65){
        hero.pet=1.4;petCount++;playTone('pet');status('yes. he is doing his best.');
        if(!paused){physics.grab(physics.actor,p.x,p.y);grab={type:'meowl',id:e.pointerId,start:p};hero.held=true;}
    }
    if(grab){toyMotionRequested=true;e.preventDefault();grab.capture=surface;surface.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';}wake();
});
surface.addEventListener('pointermove',e=>{
    const p=pos(e);pointer={...p,active:true};
    if(grab&&grab.id===e.pointerId){physics.move(p.x,p.y);wake();}
    else{canvas.style.cursor=physics.bodyAt(p.x,p.y)?'grab':'default';}
});
// End UI capture and physics together, including interrupted gestures.
function cancelGrab(flick=false,reason='interruption'){
    const previous=grab;if(previous)lastRelease={reason,time,type:previous.type};grab=null;hero.held=false;pointer.active=false;
    physics?.release(flick);
    if(previous?.capture?.hasPointerCapture(previous.id))previous.capture.releasePointerCapture(previous.id);
    canvas.style.cursor='default';
}
function release(e){
    if(!grab||e.pointerId!==grab.id)return;
    if(e.type==='lostpointercapture'&&(e.target!==grab.capture||grab.capture.hasPointerCapture(e.pointerId)))return;
    if(grab.type==='meowl'){hero.pet=1.5;status('tiny creature. unreasonable amount of resolve.');}
    cancelGrab(e.type==='pointerup',e.type);if(e.type==='pointerup'&&Math.hypot(physics.rock.velocity.x,physics.rock.velocity.y)>4)hillSound.play('swish',{level:.45});wake();
}
window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
surface.addEventListener('lostpointercapture',release);
canvas.addEventListener('keydown',e=>{
    if(['ArrowUp','ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();toyMotionRequested=true;if(paused)return;if(e.key==='ArrowUp'||e.key===' '){cancelGrab();physics.liftRock();used();}else Matter.Body.applyForce(physics.rock,physics.rock.position,{x:physics.rock.mass*(e.key==='ArrowLeft'?-.014:.014),y:-.01});wake();}
});
$('#ruin').addEventListener('click',()=>{toyMotionRequested=true;if(paused)setPause(false);cancelGrab();physics.ruinDay();hillSound.play('swish',{level:.8});used();status('wait. what are you doing.');wake();});
$('#help').addEventListener('click',()=>{toyMotionRequested=true;if(paused)setPause(false);cancelGrab();physics.helpRock();hero.cheer=3;hillSound.play('aura',{style:1,level:.8});used();status('okay. just this once.');wake();});
$('#reset').addEventListener('click',()=>{cancelGrab();auraField.clear();physics.reset();hero.pet=0;hero.cheer=0;particles.length=0;ripples.length=0;scuffs.length=0;status('another morning. another go.');updateCharacters(0);wake();});
$('#encourage').addEventListener('click',()=>{dispatchEvent(new Event('meowl-cheer'));if(paused)setPause(false);hero.cheer=3;hero.pet=0;used();status('go on, little guy.');playTone('pet');wake();});
function setPause(value){paused=value;hillSound.active(!paused&&worldVisible&&!panelOpen);cancelGrab();if(paused){cancelAnimationFrame(frame);frame=0;}last=0;wake();}


function openPanel(key=null,trigger){
    
    if(!panelOpen)returnFocus=trigger||document.activeElement;
    cancelGrab();cancelAnimationFrame(frame);frame=0;last=0;project=key;panelOpen=true;hillSound.active(false);
    const panel=$('#project-panel');panel.inert=false;document.body.classList.add('panel-open');mix.refresh();$('#open-index')?.setAttribute('aria-expanded','true');if(W<760)$('#world').inert=true;
    for(const el of document.querySelectorAll('.knot'))el.setAttribute('aria-expanded',String(el.dataset.project===key));
    const oldScene=$('.scene-frame');if(oldScene)demoObserver.unobserve(oldScene);
    if(!key){
        $('#panel-content').innerHTML='<h2 id="panel-title">Following the<br>interesting bits.</h2><p>Research, games, little helpers. Roughly in the order they happened.</p><div class="project-list">'+trail.map(id=>{const p=projects[id];return `<button data-project="${id}">${p.title}<small>${p.caption}</small></button>`;}).join('')+'</div><p>Still figuring out where all of this leads.</p>';
    }else{
        const p=projects[key];$('#panel-content').innerHTML=`<button class="back-projects" id="back-projects">all the detours</button><h2 id="panel-title">${p.title}</h2><p>${p.description}</p>${p.detail?`<p>${p.detail}</p>`:""}${p.scene?`<iframe class="scene-frame" src="demo.html?scene=${p.scene}" title="${p.title} interactive illustration" loading="eager"></iframe>${p.note?`<p class="scene-note">${p.note}</p>`:""}`:""}<nav class="panel-project-links" aria-label="Project links">${(p.links||[]).map(link=>`<a class="more-scene" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`).join('')}</nav>`;
        if(['botato','smoothtato'].includes(key))$('#panel-content').insertAdjacentHTML('beforeend',document.querySelector('#project-'+key+' .poetato-sticker').outerHTML);
        $('#back-projects').addEventListener('click',()=>openPanel(null));
        const scene=$('.scene-frame');if(scene)demoObserver.observe(scene);
    }
    panel.scrollTop=0;panel.scrollTop=0;$('#close-panel').focus({preventScroll:true});wake();
}
function closePanel(){last=0;panelOpen=false;project=null;$('#world').inert=false;$('#project-panel').inert=true;document.body.classList.remove('panel-open');$('#open-index')?.setAttribute('aria-expanded','false');for(const el of document.querySelectorAll('.knot'))el.setAttribute('aria-expanded','false');if($('.scene-frame'))demoObserver.unobserve($('.scene-frame'));$('#panel-content').replaceChildren();mix.refresh();returnFocus?.focus({preventScroll:true});wake();}
document.addEventListener('click',e=>{const el=e.target.closest('[data-project]');if(el)openPanel(el.dataset.project,el);});
$('#open-index')?.addEventListener('click',e=>panelOpen?closePanel():openPanel(null,e.currentTarget));$('#close-panel').addEventListener('click',closePanel);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panelOpen){e.preventDefault();closePanel();}});
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===$('.scene-frame')?.contentWindow&&e.data?.type==='close-project')closePanel();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;cancelGrab();hillSound.active(false);}else{wake();}});
window.addEventListener('blur',()=>{cancelGrab(false,'window blur');});
new ResizeObserver(resize).observe(surface);
ready.then(wake).catch(()=>{status('the creature artwork could not load. reload to try again.');});
window.__hill=()=>({depth:{extra:extraDepth,paintTop,paintHeight},time,paused,aura:{count:auraField.particles.length,deflections:auraField.deflections,bounces:auraField.bounces},sound:mix.enabled,audio:mix.diagnostics(),pointerGrab:grab?.type||null,lastRelease,reducedMotion:reduce.matches,toyMotionRequested,assets:art.ready,hero:{...hero},physics:physics?.diagnostics(),particles:particles.length,scuffs:scuffs.length,panel:project,panelOpen,petCount,meanFrameMs:intervals.length?intervals.reduce((a,b)=>a+b,0)/intervals.length:0});

const chapterObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('seen');for(const demo of entry.target.querySelectorAll('iframe[data-scene]')){if(!demo.hasAttribute('src')){demo.loading='eager';demo.src='demo.html?scene='+demo.dataset.scene;}}}}},{rootMargin:'550px 0px',threshold:0});
document.querySelectorAll('.sketch-chapter').forEach(el=>chapterObserver.observe(el));

new IntersectionObserver(entries=>{worldVisible=entries[0].isIntersecting;hillSound.active(worldVisible&&!paused&&!panelOpen);if(!worldVisible){cancelAnimationFrame(frame);frame=0;last=0;cancelGrab();}else wake();},{threshold:0}).observe($('#world'));

const demoObserver=new IntersectionObserver(entries=>{for(const e of entries)e.target.contentWindow?.postMessage({type:'demo-visibility',visible:e.isIntersecting},location.origin);},{threshold:0});
document.querySelectorAll('.sketch-demo').forEach(el=>demoObserver.observe(el));
window.addEventListener('message',e=>{
    if(e.origin!==location.origin||!['demo-ready','demo-layout'].includes(e.data?.type))return;
    const f=[...document.querySelectorAll('iframe')].find(f=>f.contentWindow===e.source);if(!f)return;
    if(e.data.type==='demo-layout'&&Number.isFinite(e.data.height)&&e.data.height>=180&&e.data.height<=1800){const height=e.data.height+'px';if(f.style.height!==height)f.style.height=height;}
    const r=f.getBoundingClientRect();e.source.postMessage({type:'demo-visibility',visible:r.bottom>0&&r.top<innerHeight},location.origin);
});
