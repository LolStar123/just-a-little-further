import {meowl,hardware,line,INK} from './creatures.js';
import {findPath} from './pathfinding.js';
import {StepPlayer} from './rare-step-player.js';
const embed=new URLSearchParams(location.search).get('embed');
if(['halo','botato','liquidation'].includes(embed)){document.body.classList.add('embedded','embed-'+embed);}
if(embed)document.addEventListener('keydown',e=>{if(e.key==='Escape')parent.postMessage({type:'close-project'},location.origin);});
const $=s=>document.querySelector(s), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
// Atul explicitly wants the interactive scenes enabled, including on his Windows setup
// with OS animations disabled. The visible site control remains an independent opt-out.
let paused=false,time=0,last=0,frame=0,dirty=true,companion=null,scenePlayer=null;
const surfaces=[];
class Surface{
 constructor(id,draw){
  this.canvas=$('#'+id);this.ctx=this.canvas.getContext('2d');this.draw=draw;this.visible=false;this.w=0;this.h=0;
  if(!this.ctx)return;
  surfaces.push(this);
  new ResizeObserver(()=>{const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.w=r.width;this.h=r.height;this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.ctx.setTransform(d,0,0,d,0,0);this.render(0);wake();}).observe(this.canvas);
  new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;wake();},{rootMargin:'80px'}).observe(this.canvas);
 }
 render(dt){if(!this.ctx||!this.w||!this.h)return;this.ctx.clearRect(0,0,this.w,this.h);this.draw(this.ctx,this.w,this.h,dt);}
}
function wake(){dirty=true;if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
function tick(now){
 frame=0;const dt=paused?0:Math.min(.035,(now-(last||now))/1000);last=now;if(!paused)time+=dt;
 scenePlayer?.update(dt);
 for(const s of surfaces)if(s.visible||dirty)s.render(dt);
 companion?.update(dt,time);
 dirty=false;if(!paused&&!document.hidden&&(companion||surfaces.some(s=>s.visible)))frame=requestAnimationFrame(tick);
}
function setPaused(value){paused=value;$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').textContent=paused?'Resume creatures':'Pause creatures';last=0;wake();}
$('#motion').addEventListener('click',()=>setPaused(!paused));
reduce.addEventListener('change',()=>{scrollScene();wake();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();});
setPaused(paused);

// A loose string with five autonomous residents. The pointer changes their decisions.
const pointer={x:-999,y:-999,active:false}, rope=Array.from({length:65},()=>({y:0,v:0}));
const flock=Array.from({length:4},(_,i)=>({u:.22+i*.19,target:.2+i*.18,v:0,hop:0,vy:0,decide:1+i*.6,seed:i*1.83,scale:[.81,.66,.95,.71][i]}));
let gatherUntil=0;
function baseY(u,h){return h*.65+Math.sin(u*Math.PI*2-.4)*h*.11;}
const hero=new Surface('meowl-field',(c,w,h,dt)=>{
 const ww=Math.max(1,w-65),start=32;
 for(let i=1;i<rope.length-1;i++){
  const p=rope[i],lap=rope[i-1].y+rope[i+1].y-2*p.y;
  p.v+=(lap*180-p.y*16-p.v*6)*dt;p.y+=p.v*dt;
 }
 c.beginPath();for(let i=0;i<rope.length;i++){const u=i/(rope.length-1),x=start+u*ww,y=baseY(u,h)+rope[i].y;i?c.lineTo(x,y):c.moveTo(x,y);}
 c.strokeStyle='#657266';c.lineWidth=1.25;c.stroke();
 for(let i=0;i<flock.length;i++){
  const b=flock[i],x=start+b.u*ww,idx=clamp(Math.round(b.u*64),1,63),floor=baseY(b.u,h)+rope[idx].y;
  if(dt){
   b.decide-=dt;
   const close=pointer.active&&Math.hypot(pointer.x-x,pointer.y-(floor-24))<82;
   if(close&&gatherUntil<time){b.target=clamp(b.u+(pointer.x<x?1:-1)*.23,.045,.955);if(b.hop===0){b.vy=130+i*14;b.hop=.1;}b.decide=1.5;}
   else if(b.decide<=0&&gatherUntil<time){b.target=clamp(b.u+(Math.random()-.5)*.35,.05,.95);b.decide=2+Math.random()*4;}
   const distance=b.target-b.u,desired=Math.abs(distance)<.008?0:Math.sign(distance)*(close?135:gatherUntil>time?180:34+i*6)/ww;
   b.v+=(desired-b.v)*(1-Math.exp(-dt*5));b.u=clamp(b.u+b.v*dt,.03,.97);
   for(const other of flock){if(other===b)continue;const gap=b.u-other.u;if(Math.abs(gap)<26/ww&&b.hop===0&&other.hop===0){if(Math.abs(b.v)>.01){b.hop=.1;b.vy=105;}else{b.u=clamp(b.u+(Math.sign(gap)||Math.sign(i-flock.indexOf(other)))*dt*.025,.03,.97);}}}
   if(b.hop>0){b.vy-=470*dt;b.hop=Math.max(0,b.hop+b.vy*dt);if(b.hop===0){rope[idx].v+=18;b.vy=0;}}
   rope[idx].v+=dt*5;
  }
  const scale=b.scale*(w<600?.77:1.05);
  meowl(c,start+b.u*ww,floor-b.hop,scale,{time,seed:b.seed,speed:b.v*ww,air:b.hop>5,look:pointer.active?(pointer.x-x)/60:Math.sign(b.v),tilt:clamp(b.v*ww/1300,-.12,.12),coat:i%2?'#dbd4bf':'#e5dfcf'});
 }
});
hero.canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=hero.canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=true;wake();});
hero.canvas.addEventListener('pointerleave',()=>{pointer.active=false;wake();});
hero.canvas.addEventListener('pointerup',e=>{if(paused)return;const r=hero.canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;for(const b of flock){const bx=32+b.u*(hero.w-65),by=baseY(b.u,hero.h);if(Math.hypot(x-bx,y-by+22)<55){b.vy=200;b.hop=.1;}}wake();});
$('#gather').addEventListener('click',()=>{gatherUntil=time+4;flock.forEach((b,i)=>{b.target=.36+i*.07;b.decide=5;if(paused)b.u=b.target;});companion?.gather();$('#creature-note').textContent='a meeting of absolutely no importance.';wake();});

// The call is a four-beat scroll sequence. No play gate or captured input.
let phase=-1;
const call=$('.call-wrap');
const candidate=new Surface('candidate-art',(c,w,h)=>{
 line(c,[[0,h-32],[w,h-32]],'#9fa69d',1);
 meowl(c,w*.5,h-30,Math.min(w/118,h/111),{time,seed:2,nervous:phase<2,look:phase>=2?-2:Math.sin(time)*2,tilt:phase>=3?-.06:Math.sin(time*1.4)*.025});
});
new Surface('interviewer-art',(c,w,h)=>{
 const scale=Math.min(w/170,h/170);c.save();c.translate(w/2,h-30);c.scale(scale,scale);
 c.fillStyle='#7d877f';c.beginPath();c.moveTo(-45,0);c.quadraticCurveTo(-40,-52,-16,-55);c.lineTo(17,-55);c.quadraticCurveTo(40,-45,45,0);c.closePath();c.fill();
 c.beginPath();c.ellipse(0,-72,22,28,Math.sin(time*.6)*.025,0,Math.PI*2);c.fillStyle='#c2ac93';c.fill();c.strokeStyle=INK;c.lineWidth=1.2;c.stroke();
 line(c,[[-21,-82],[-19,-98],[-5,-104],[15,-98],[21,-84]],INK,5);
 for(const s of [-1,1]){c.strokeRect(s*10-8,-79,16,12);line(c,[[s*10-2,-73],[s*10+1,-73]],INK,2);}
 line(c,[[-2,-76],[2,-76]],INK,1);line(c,[[0,-73],[2,-64],[-1,-62]],INK,1);line(c,[[-5,-56],[0,-54],[6,-56]],INK,1);
 line(c,[[-15,-44],[0,-30],[16,-44]],'#dcdcd4',2);c.restore();
});
const phrases=['normal question.\nall thoughts have left.','there was definitely\na thought here.','oh. right.\nthat thing i built.','I started with\nPath of Exile...'];
const results=[embed==='halo'?'A familiar moment.':'Scroll a little. It will come back.','A brief, deeply unhelpful silence.','One useful sentence. Enough to get moving.','There we go. Back in the room.'];
if(embed==='halo')$('#call-result').textContent=results[0];
function setPhase(next){
 if(next===phase)return;phase=next;call.dataset.phase=String(next);$('.halo-cue').setAttribute('aria-hidden',String(next<2));
 const text=$('#candidate-line');text.textContent=phrases[next];text.style.whiteSpace='pre-line';$('#call-result').textContent=results[next];$('#call-time').textContent=['04','07','09','12'][next];$('#call-status').textContent=next>=3?'Camera on / Brain reconnected':'Camera on / Brain reconnecting';
 if(!paused){for(const el of [text,$('#call-result')]){el.getAnimations().forEach(a=>a.cancel());el.animate(reduce.matches?[{opacity:.15},{opacity:1}]:[{opacity:.15,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});}}
 if(companion){companion.layoutDirty=true;companion.pathDirty=true;}
 wake();
}
let scrollQueued=false;
function scrollScene(){
 scrollQueued=false;
 if(embed==='halo')return;
 const r=$('#halo').getBoundingClientRect(),travel=Math.max(1,r.height-innerHeight);
 setPhase(clamp(Math.floor((-r.top+40)/travel*4),0,3));
}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(scrollScene);}},{passive:true});
addEventListener('resize',scrollScene);
scrollScene();

// A small real pathfinder. Obstacles are used by the route algorithm as well as the drawing.
const cols=13,rows=6,blocked=new Set();
for(const [x,y] of [[4,0],[4,1],[4,2],[4,3],[8,2],[8,3],[8,4],[8,5],[2,4],[3,4],[10,0]])blocked.add(x+','+y);
const robot={x:1,y:2,route:[],target:[11,2],visited:[],arrived:false};
function routeTo(tx,ty){
 tx=clamp(tx,0,cols-1);ty=clamp(ty,0,rows-1);if(blocked.has(tx+','+ty))return false;
 const path=findPath(cols,rows,blocked,[robot.x,robot.y],[tx,ty]);
 if(!path.length||path.at(-1)[0]!==tx||path.at(-1)[1]!==ty)return false;
 robot.route=path;robot.target=[tx,ty];robot.arrived=false;robot.visited=[];
 if(paused){robot.x=tx;robot.y=ty;robot.route=[];robot.arrived=true;}
 $('#botato-state').textContent=paused?'found it.':'finding a way through';wake();return true;
}
routeTo(11,2);
const game=new Surface('botato-art',(c,w,h,dt)=>{
 const cellX=(w-42)/(cols-1),cellY=(h-105)/(rows-1),point=(x,y)=>[21+x*cellX,58+y*cellY];
 if(dt&&robot.route.length){const [tx,ty]=robot.route[0],dx=tx-robot.x,dy=ty-robot.y,dist=Math.hypot(dx,dy),step=dt*2.7;if(dist<=step){robot.x=tx;robot.y=ty;robot.visited.push(robot.route.shift());}else{robot.x+=dx/dist*step;robot.y+=dy/dist*step;}}
 if(!robot.route.length&&!robot.arrived){robot.arrived=true;$('#botato-state').textContent='found it. no manual clicking.';}
 c.strokeStyle='#8e9a8b';c.lineWidth=1.2;
 for(const key of blocked){const [gx,gy]=key.split(',').map(Number),[x,y]=point(gx,gy);c.beginPath();c.moveTo(x-cellX*.36,y+cellY*.35);c.lineTo(x-cellX*.3,y-cellY*.25);c.lineTo(x+cellX*.17,y-cellY*.39);c.lineTo(x+cellX*.4,y-cellY*.12);c.lineTo(x+cellX*.34,y+cellY*.3);c.closePath();c.fillStyle='#9ca999';c.fill();c.stroke();}
 const full=[...robot.visited,...robot.route];if(full.length){c.setLineDash([3,6]);line(c,full.map(p=>point(...p)),'#647363',1.5);c.setLineDash([]);}
 const [tx,ty]=point(...robot.target);c.save();c.translate(tx,ty);c.rotate(Math.PI/4);c.fillStyle=robot.arrived?'#773c35':'#917a45';c.fillRect(-6,-6,12,12);c.restore();
 const [x,y]=point(robot.x,robot.y);meowl(c,x,y,clamp(w/700,.52,.78),{hat:"goldrim",time,speed:robot.route.length?48:0,look:robot.route.length?Math.sign(robot.route[0][0]-robot.x):0,seed:3});
});
let pointerDown;
game.canvas.addEventListener('pointerdown',e=>pointerDown=[e.clientX,e.clientY]);
game.canvas.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>12)return;const r=game.canvas.getBoundingClientRect();routeTo(Math.round((e.clientX-r.left-21)/((game.w-42)/(cols-1))),Math.round((e.clientY-r.top-58)/((game.h-105)/(rows-1))));});
const targets=[[1,5],[11,0],[6,4],[0,0],[12,5]];let targetIndex=0;
$('#new-target').addEventListener('click',()=>{routeTo(...targets[targetIndex++%targets.length]);});

// The hardware hunt is one project: opening, checking and rehoming a lot.
let lotStart=-1,lotIndex=0,lotStage=-1;
const lotNames=['a GPU worth a closer look.','enterprise SSDs. the unglamorous good stuff.','useful hardware, looking for a new home.'];
const lot=new Surface('liquidation-art',(c,w,h)=>{
 const t=lotStart<0?0:paused?7:Math.min(7,time-lotStart),stage=lotStart<0?0:t<1?1:t<3?2:3;
 if(stage!==lotStage){lotStage=stage;$('#lot-state').textContent=stage===0?'an unopened box. naturally, I am interested.':stage===1?'catalogue first. then a closer look.':stage===2?'checking the kit, fees and resale evidence.':lotNames[lotIndex%lotNames.length];}
 const floor=h*.74,boxX=w*.22,end=w*.72,move=clamp((t-2.8)/3.4,0,1),ease=move*move*(3-2*move),itemX=boxX+(end-boxX)*ease;
 line(c,[[12,floor+3],[w-12,floor+3]],'#8f968a',1);
 c.strokeStyle=INK;c.lineWidth=1.3;c.fillStyle='#aa987f';c.fillRect(boxX-38,floor-59,76,58);c.strokeRect(boxX-38,floor-59,76,58);
 if(stage===0){line(c,[[boxX-38,floor-59],[boxX,floor-75],[boxX+38,floor-59]],INK,1.3);line(c,[[boxX,floor-74],[boxX,floor-34]],'#d7cfbd',4);}
 else{line(c,[[boxX-38,floor-59],[boxX-54,floor-80],[boxX-13,floor-66]],INK,1.5);line(c,[[boxX+38,floor-59],[boxX+53,floor-81],[boxX+8,floor-66]],INK,1.5);}
 c.font='12px Plex, sans-serif';c.fillStyle=INK;c.textAlign='center';c.fillText('LOT '+String(lotIndex+1).padStart(2,'0'),boxX,floor-18);
 if(stage>=2)hardware(c,itemX,floor-74+ease*38-Math.sin(move*Math.PI)*25,lotIndex%2?'ssd':'gpu',w<400?.8:1.1,-.08*(1-ease));
 const helperX=stage<2?w*.48:itemX+42;
 meowl(c,helperX,floor,w<400?.66:.77,{time,speed:move>0&&move<1?32:0,look:-2,tilt:stage===2?-.15:0,seed:1});
 meowl(c,w*.94,floor,w<400?.55:.64,{time,look:-2,seed:5,coat:'#cbc4ad'});
 // A little arrival perch, without a fake profit number.
 line(c,[[end-35,floor],[end-35,floor-21],[end+30,floor-21],[end+30,floor]],'#8f968a',1);
 c.fillStyle='#535b55';c.font='12px Plex, sans-serif';c.fillText('new home',end,floor+30);
});
$('#inspect-lot').addEventListener('click',()=>{if(lotStart>=0)lotIndex++;lotStart=time;lotStage=-1;wake();});
new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&lotStart<0){lotStart=time;wake();}},{threshold:.45}).observe(lot.canvas);

if(embed==='halo')scenePlayer=new StepPlayer(call,{labels:['The question','Brain goes blank','HALO offers a thread','Back in the room'],onChange:setPhase});
// Pointer companion is temporarily retired; Botato keeps its own pathfinder.
window.__siteDiagnostics=()=>({paused,time,phase,reducedMotion:reduce.matches,companion:companion?.diagnostics(),creatures:flock.map(b=>({x:b.u,hop:b.hop,velocity:b.v})),game:{position:[robot.x,robot.y],target:robot.target,route:robot.route,blocked:[...blocked]},lot:{index:lotIndex,stage:lotStage},activeCanvases:surfaces.filter(s=>s.visible).length,raf:!!frame});
wake();
