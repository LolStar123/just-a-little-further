// Same-origin illustrations share this world. A thrown prop is not confined to its iframe.
export function pageToyWorld(){
 const host=parent!==window?parent:window;if(host.__pageToyWorld)return host.__pageToyWorld;
 if(!host.Matter){if(!host.__toyMatterLoading){host.__toyMatterLoading=true;const script=host.document.createElement('script');script.src=new URL('./assets/vendor/matter.min.js',import.meta.url).href;host.document.head.append(script);}return null;}
 const {Engine,Bodies,Body,Composite,Events}=host.Matter,engine=Engine.create({gravity:{x:0,y:1.3,scale:.001}}),items=new Set(),pending=new Map();
 const canvas=host.document.createElement('canvas');canvas.className='page-toy-overlay';canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:30;width:100%;height:100%';host.document.body.append(canvas);const c=canvas.getContext('2d');
 let raf=0,last=0,collisionAt=0,terrain=[],textBodies=[],contacts=0;
 function wake(){if(!raf&&!host.document.hidden)raf=host.requestAnimationFrame(tick);}
 function pagePoint(item,x=item.x,y=item.y){const r=item.canvas.getBoundingClientRect(),frame=item.owner.frameElement?.getBoundingClientRect(),sx=r.width/item.canvas.width,sy=r.height/item.canvas.height;return{x:(frame?.left||0)+r.left+x*sx,y:(frame?.top||0)+r.top+y*sy+host.scrollY,sx,sy};}
 function updateHome(item){const p=pagePoint(item,item.home.x,item.home.y);item.pageHome={x:p.x,y:p.y-item.box.h*p.sy/2};item.pageSize={w:item.box.w*p.sx,h:item.box.h*p.sy};return p;}
 function register(item){item.hostFrame=item.owner!==host?item.owner.frameElement:null;items.add(item);updateHome(item);}
 function activate(item){items.add(item);if(item.body)return;updateHome(item);const p=pagePoint(item,item.home.x,item.home.y),w=Math.max(8,item.pageSize.w),h=Math.max(8,item.pageSize.h);item.body=Bodies.rectangle(p.x,p.y-h/2,w,h,{restitution:item.actor?.68:.52,friction:.35,frictionAir:.004,density:.002,label:item.id});Composite.add(engine.world,item.body);item.pageActive=true;item.active=true;item.carried=false;item.rescueAnchor=null;collisionAt=0;item.released=host.performance.now();makeHandle(item);wake();}
 function detachCargo(item){
  if(item.retriever){item.retriever.retrieving=null;item.retriever.delivery=null;item.retriever=null;}
  if(item.retrieving){item.retrieving.retriever=null;item.retrieving.carried=false;item.retrieving.released=host.performance.now();item.retrieving=null;}
  if(item.delivery){item.delivery.retriever=null;item.delivery.carried=false;item.delivery.released=host.performance.now();item.delivery=null;}
  item.carried=false;item.detour=null;
 }
 function grab(item){activate(item);detachCargo(item);item.body.collisionFilter.mask=0;item.controlForce=null;if(item.actor){const cargo=[...items].find(p=>!p.actor&&!p.body&&p.canvas===item.canvas&&p.drawOrder>item.drawOrder&&Math.abs(p.pageHome.x-item.pageHome.x)<item.pageSize.w*.6&&Math.abs(p.pageHome.y-item.pageHome.y)<item.pageSize.h*.55);if(cargo){cargo.originalCarrier=item;activate(cargo);}}Body.setStatic(item.body,true);item.pageHeld=true;item.releaseVelocity={x:0,y:0};item.pointerAt=host.performance.now();}
 function move(item){if(!item.body)return;const p=pagePoint(item),now=host.performance.now(),dt=Math.max(.008,(now-item.pointerAt)/1000),next={x:p.x,y:p.y-item.pageSize.h/2};item.releaseVelocity={x:Math.max(-28,Math.min(28,(next.x-item.body.position.x)/dt/60)),y:Math.max(-28,Math.min(28,(next.y-item.body.position.y)/dt/60))};Body.setPosition(item.body,next);item.pointerAt=now;wake();}
 function release(item){if(!item.body)return;item.controlForce=null;item.rescueAnchor=null;item.pageHeld=false;item.body.collisionFilter.mask=0xFFFFFFFF;item.body.plugin.returning=false;Body.setStatic(item.body,false);const fresh=host.performance.now()-item.pointerAt<140;Body.setVelocity(item.body,fresh?(item.releaseVelocity||{x:0,y:0}):{x:0,y:0});Body.setAngularVelocity(item.body,item.actor?.025:(item.releaseVelocity?.x||0)*.008);item.released=host.performance.now();wake();}
 function restore(item){if(item.retriever){item.retriever.retrieving=null;item.retriever.delivery=null;}item.handle?.remove();item.handle=null;Composite.remove(engine.world,item.body);item.body=null;item.x=item.home.x;item.y=item.home.y;item.vx=0;item.vy=0;item.pageActive=false;item.active=false;item.held=false;item.pageHeld=false;item.controlForce=null;item.detour=null;item.retriever=null;collisionAt=0;}
 function makeHandle(item){
  const h=host.document.createElement('div');h.tabIndex=0;h.setAttribute('role','button');h.setAttribute('aria-label','Pick up '+(item.actor?'meowl':item.id));h.style.cssText='position:fixed;left:0;top:0;z-index:31;touch-action:none;cursor:grab;background:transparent;user-select:none';host.document.body.append(h);item.handle=h;
  let grip=null;
  h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();grab(item);grip={x:e.clientX-item.body.position.x,y:e.clientY+host.scrollY-item.body.position.y};h.setPointerCapture(e.pointerId);});
  h.addEventListener('pointermove',e=>{if(!grip)return;e.preventDefault();const now=host.performance.now(),dt=Math.max(.008,(now-item.pointerAt)/1000),p={x:e.clientX-grip.x,y:e.clientY+host.scrollY-grip.y};item.releaseVelocity={x:Math.max(-28,Math.min(28,(p.x-item.body.position.x)/dt/60)),y:Math.max(-28,Math.min(28,(p.y-item.body.position.y)/dt/60))};Body.setPosition(item.body,p);item.pointerAt=now;wake();});
  const drop=(e)=>{if(!grip)return;if(e?.type==='pointercancel')item.releaseVelocity={x:0,y:0};grip=null;release(item);};h.addEventListener('pointerup',drop);h.addEventListener('pointercancel',drop);h.addEventListener('lostpointercapture',drop);
  h.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();item.releaseVelocity={x:2,y:-7};item.pointerAt=host.performance.now();release(item);}if(e.key==='Escape'){item.releaseVelocity={x:0,y:0};drop();}});
 }
 function rebuild(){
  for(const item of items)if(!item.body&&host.performance.now()-(item.lastFrame+item.owner.performance.timeOrigin-host.performance.timeOrigin)>30000)items.delete(item);
  for(const body of [...terrain,...textBodies])Composite.remove(engine.world,body);terrain=[];textBodies=[];
  const points=host.__inkPhysicsPoints||[],ranges=[...items].filter(i=>i.body).map(i=>i.body.position.y);
  if(points.length&&ranges.length){const low=Math.min(...ranges)-300,high=Math.max(...ranges)+400;let previous=points[0];for(let i=1;i<points.length;i++){const p=points[i],dx=p[0]-previous[0],dy=p[1]-previous[1],len=Math.hypot(dx,dy);if(len<18&&i<points.length-1)continue;if(Math.max(previous[1],p[1])>low&&Math.min(previous[1],p[1])<high&&len<100){terrain.push(Bodies.rectangle((previous[0]+p[0])/2,(previous[1]+p[1])/2,len+3,3,{isStatic:true,angle:Math.atan2(dy,dx),friction:.35,label:'thread',collisionFilter:{category:2}}));}previous=p;}}
  const addRect=(x,y,w,h,item=null)=>{if(w>1&&h>1)textBodies.push(Bodies.rectangle(x+w/2,y+h/2,w,h,{isStatic:true,label:'page obstacle',plugin:{toy:item}}));};
  for(const el of host.document.querySelectorAll('.chapter-copy h2,.chapter-copy p,.project-links,.sketch-foot')){const r=el.getBoundingClientRect(),y=r.top+host.scrollY;if(ranges.some(v=>Math.abs(v-y)<500))addRect(r.left,y,r.width,r.height);}
  const bottom=Math.max(host.document.body.scrollHeight,host.innerHeight);addRect(-25,0,20,bottom);addRect(host.innerWidth+5,0,20,bottom);addRect(0,bottom+15,host.innerWidth,20);
  for(const i of items){if(i.body||host.performance.now()-(i.lastFrame+i.owner.performance.timeOrigin-host.performance.timeOrigin)>900)continue;updateHome(i);const p=i.pageHome;addRect(p.x-i.pageSize.w/2,p.y-i.pageSize.h/2,i.pageSize.w,i.pageSize.h,i);}
  Composite.add(engine.world,[...terrain,...textBodies]);
 }
 Events.on(engine,'collisionStart',event=>{contacts+=event.pairs.length;for(const pair of event.pairs){for(const [fixed,moving]of[[pair.bodyA,pair.bodyB],[pair.bodyB,pair.bodyA]])if(!moving.plugin.returning&&!fixed.plugin.returning&&fixed.plugin.toy&&!fixed.plugin.toy.body&&!moving.isStatic&&Math.hypot(moving.velocity.x,moving.velocity.y)>2)pending.set(fixed.plugin.toy,{...moving.velocity});}const i=[...items].find(i=>i.body&&event.pairs.some(p=>p.bodyA===i.body||p.bodyB===i.body));i?.sfx?.play(i.actor?'step':'place',{level:.25});});
 function steer(item,target,force=1){
  const b=item.body;
  // Flight is a separate collision-free layer. Throws still collide until recovery begins.
  b.collisionFilter.mask=0;b.plugin.returning=true;item.detour=null;
  const dx=target.x-b.position.x,dy=target.y-b.position.y,speed=9;
  const wingLift=item.actor?-.00028*Math.sin(host.performance.now()/1000*19)*Math.min(1,Math.hypot(dx,dy)/90):0;
  item.controlForce={x:Math.max(-.003,Math.min(.003,(dx*.06-b.velocity.x)*.0005))*b.mass*force,y:(-engine.gravity.y*engine.gravity.scale+wingLift+Math.max(-.003,Math.min(.003,(dy*.06-b.velocity.y)*.0005)))*b.mass*force};
  if(Math.abs(b.velocity.x)>speed)Body.setVelocity(b,{x:Math.sign(b.velocity.x)*speed,y:b.velocity.y});Body.setAngularVelocity(b,-b.angle*.08);
 }
 function tick(now){
  raf=0;const dt=Math.min(32,now-(last||now));last=now;
  if(canvas.width!==host.innerWidth||canvas.height!==host.innerHeight){canvas.width=host.innerWidth;canvas.height=host.innerHeight;}
  c.clearRect(0,0,canvas.width,canvas.height);
  for(const i of items)if(i.owner!==host&&!i.hostFrame?.isConnected){if(i.body)restore(i);detachCargo(i);items.delete(i);}
  if(![...items].some(i=>i.body)){last=0;return;}
  if(now>collisionAt){rebuild();collisionAt=now+350;}
  // Change collision layer before stepping, so recovery cannot trigger a new collision chain.
  for(const i of items)if(i.body&&!i.pageHeld&&now-i.released>(i.actor?700:900)){i.body.collisionFilter.mask=0;i.body.plugin.returning=true;}
  // Small substeps keep fast tosses from tunnelling through the thin thread.
  for(let left=dt;left>0;left-=4){for(const i of items)if(i.body&&!i.pageHeld&&i.controlForce)Body.applyForce(i.body,i.body.position,i.controlForce);Engine.update(engine,Math.min(4,left));}
  for(const [item,v]of pending){if(item.body)continue;activate(item);Body.setVelocity(item.body,{x:v.x*.6,y:v.y*.6});}pending.clear();
  for(const item of items){
   if(!item.body)continue;updateHome(item);const body=item.body,age=now-item.released;
   if(!item.pageHeld&&age>(item.actor?700:900)){
    if(item.actor){const target=item.delivery?{x:item.delivery.pageHome.x,y:item.delivery.pageHome.y-35}:item.retrieving?.body?.position||item.pageHome;steer(item,target);if(!item.retrieving&&!item.delivery&&Math.hypot(body.position.x-target.x,body.position.y-target.y)<2&&Math.hypot(body.velocity.x,body.velocity.y)<1&&Math.abs(body.angle)<.08){restore(item);continue;}}
    else{
     // Returning props also have god mode; a helper never chases an endlessly falling target.
     if(!item.carried){
      // These keepsakes wait for their desk meowl rather than flying home alone.
      if(item.needsRescue&&!item.rescueAnchor)item.rescueAnchor={...body.position};
      steer(item,item.needsRescue?item.rescueAnchor:item.pageHome);
     }
     if(!item.retriever){const candidates=[...items].filter(a=>a.actor&&a.canvas===item.canvas&&!a.body&&!a.retrieving);candidates.sort((a,b)=>(a===item.originalCarrier?-1:b===item.originalCarrier?1:Math.hypot(a.pageHome.x-body.position.x,a.pageHome.y-body.position.y)-Math.hypot(b.pageHome.x-body.position.x,b.pageHome.y-body.position.y)));const helper=candidates[0];if(helper){activate(helper);helper.body.collisionFilter.mask=0;helper.body.plugin.returning=true;helper.retrieving=item;helper.released=now-3000;item.retriever=helper;}}
     const helper=item.retriever;
     if(helper?.body&&Math.hypot(helper.body.position.x-body.position.x,helper.body.position.y-body.position.y)<Math.max(95,helper.pageSize.w*1.4))item.carried=true;
     if(item.carried&&helper?.body){helper.retrieving=null;helper.delivery=item;steer(item,{x:helper.body.position.x,y:helper.body.position.y+35});}
     if((!item.needsRescue||item.carried)&&Math.hypot(body.position.x-item.pageHome.x,body.position.y-item.pageHome.y)<2&&Math.hypot(body.velocity.x,body.velocity.y)<1){restore(item);continue;}
    }
   }
   if(item.constrain){const bounded=item.constrain({x:body.position.x,y:body.position.y,vx:body.velocity.x,vy:body.velocity.y});if(bounded.hit){Body.setPosition(body,{x:bounded.x,y:bounded.y});Body.setVelocity(body,{x:bounded.vx,y:bounded.vy});}}
   const inPanel=!!item.hostFrame?.closest('#project-panel'),shown=!host.document.body.classList.contains('panel-open')||inPanel;
   if(item.handle)item.handle.hidden=!shown;
   const x=body.position.x,y=body.position.y-host.scrollY;if(item.handle){item.handle.style.width=item.pageSize.w+'px';item.handle.style.height=item.pageSize.h+'px';item.handle.style.transform=`translate(${x-item.pageSize.w/2}px,${y-item.pageSize.h/2}px) rotate(${body.angle}rad)`;}if(!shown||y<-200||y>host.innerHeight+200)continue;
   c.save();c.translate(x,y);c.rotate(body.angle);
   if(item.actor&&item.actorPainter)item.actorPainter(c,item.pageSize,now/1000,item.pageHeld?'held':age>700?'air':'spring',body.velocity);
   else if(item.sprite)c.drawImage(item.sprite,-item.pageSize.w/2-3,-item.pageSize.h/2-3,item.pageSize.w+6,item.pageSize.h+6);
   c.restore();
  }
  wake();
 }
 host.addEventListener('blur',()=>{for(const i of items)if(i.pageHeld){i.releaseVelocity={x:0,y:0};release(i);}});
 host.document.addEventListener('visibilitychange',()=>{last=0;if(!host.document.hidden)wake();});
 const api={register,activate,grab,move,release,updateHome,wake,items,diagnostics:()=>({active:[...items].filter(i=>i.body).map(i=>({id:i.id,x:i.body.position.x,y:i.body.position.y,held:i.pageHeld,actor:i.actor,mask:i.body.collisionFilter.mask,age:host.performance.now()-i.released,home:i.pageHome,velocity:i.body.velocity,retrieving:i.retrieving?.id,delivery:i.delivery?.id})),contacts,terrain:terrain.length})};host.__pageToyWorld=api;return api;
}
