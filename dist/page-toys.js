// Same-origin illustrations share this world. A thrown prop is not confined to its iframe.
export function pageToyWorld(){
 const host=parent!==window?parent:window;if(host.__pageToyWorld)return host.__pageToyWorld;
 if(!host.Matter){if(!host.__toyMatterLoading){host.__toyMatterLoading=true;const script=host.document.createElement('script');script.src=new URL('./assets/vendor/matter.min.js',import.meta.url).href;host.document.head.append(script);}return null;}
 const {Engine,Bodies,Body,Composite,Events}=host.Matter,engine=Engine.create({gravity:{x:0,y:1,scale:.001}}),items=new Set(),pending=new Map();
 const canvas=host.document.createElement('canvas');canvas.className='page-toy-overlay';canvas.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9;width:100%;height:100%';host.document.body.append(canvas);const c=canvas.getContext('2d');
 let raf=0,last=0,collisionAt=0,terrain=[],textBodies=[],contacts=0;
 function wake(){if(!raf&&!host.document.hidden)raf=host.requestAnimationFrame(tick);}
 function pagePoint(item,x=item.x,y=item.y){const r=item.canvas.getBoundingClientRect(),frame=item.owner.frameElement?.getBoundingClientRect(),sx=r.width/item.canvas.width,sy=r.height/item.canvas.height;return{x:(frame?.left||0)+r.left+x*sx,y:(frame?.top||0)+r.top+y*sy+host.scrollY,sx,sy};}
 function updateHome(item){const p=pagePoint(item,item.home.x,item.home.y);item.pageHome={x:p.x,y:p.y-item.box.h*p.sy/2};item.pageSize={w:item.box.w*p.sx,h:item.box.h*p.sy};return p;}
 function register(item){items.add(item);updateHome(item);}
 function activate(item){items.add(item);if(item.body)return;updateHome(item);const p=pagePoint(item),w=Math.max(8,item.pageSize.w),h=Math.max(8,item.pageSize.h);item.body=Bodies.rectangle(p.x,p.y-h/2,w,h,{restitution:item.actor?.68:.52,friction:.35,frictionAir:.012,density:.002,label:item.id});Composite.add(engine.world,item.body);item.pageActive=true;item.active=true;item.carried=false;item.released=host.performance.now();makeHandle(item);wake();}
 function grab(item){activate(item);item.controlForce=null;if(item.actor){const cargo=[...items].find(p=>!p.actor&&!p.body&&p.canvas===item.canvas&&p.drawOrder>item.drawOrder&&Math.abs(p.pageHome.x-item.pageHome.x)<item.pageSize.w*.6&&Math.abs(p.pageHome.y-item.pageHome.y)<item.pageSize.h*.55);if(cargo)activate(cargo);}Body.setStatic(item.body,true);item.pageHeld=true;item.releaseVelocity={x:0,y:0};item.pointerAt=host.performance.now();}
 function move(item){if(!item.body)return;const p=pagePoint(item),now=host.performance.now(),dt=Math.max(.008,(now-item.pointerAt)/1000),next={x:p.x,y:p.y-item.pageSize.h/2};item.releaseVelocity={x:Math.max(-28,Math.min(28,(next.x-item.body.position.x)/dt/60)),y:Math.max(-28,Math.min(28,(next.y-item.body.position.y)/dt/60))};Body.setPosition(item.body,next);item.pointerAt=now;wake();}
 function release(item){if(!item.body)return;item.controlForce=null;item.pageHeld=false;Body.setStatic(item.body,false);Body.setVelocity(item.body,item.releaseVelocity||{x:2,y:-5});Body.setAngularVelocity(item.body,item.actor?.025:(item.releaseVelocity?.x||0)*.008);item.released=host.performance.now();wake();}
 function restore(item){if(item.retriever){item.retriever.retrieving=null;item.retriever.delivery=null;}item.handle?.remove();item.handle=null;Composite.remove(engine.world,item.body);item.body=null;item.pageActive=false;item.active=false;item.retriever=null;}
 function makeHandle(item){
  const h=host.document.createElement('div');h.tabIndex=0;h.setAttribute('role','button');h.setAttribute('aria-label','Pick up '+(item.actor?'meowl':item.id));h.style.cssText='position:fixed;left:0;top:0;z-index:10;touch-action:none;cursor:grab;background:transparent;user-select:none';host.document.body.append(h);item.handle=h;
  let grip=null;
  h.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();grab(item);grip={x:e.clientX-item.body.position.x,y:e.clientY+host.scrollY-item.body.position.y};h.setPointerCapture(e.pointerId);});
  h.addEventListener('pointermove',e=>{if(!grip)return;e.preventDefault();const now=host.performance.now(),dt=Math.max(.008,(now-item.pointerAt)/1000),p={x:e.clientX-grip.x,y:e.clientY+host.scrollY-grip.y};item.releaseVelocity={x:Math.max(-28,Math.min(28,(p.x-item.body.position.x)/dt/60)),y:Math.max(-28,Math.min(28,(p.y-item.body.position.y)/dt/60))};Body.setPosition(item.body,p);item.pointerAt=now;wake();});
  const drop=()=>{if(!grip)return;grip=null;release(item);};h.addEventListener('pointerup',drop);h.addEventListener('pointercancel',drop);h.addEventListener('lostpointercapture',drop);
  h.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();item.releaseVelocity={x:2,y:-7};release(item);}if(e.key==='Escape')drop();});
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
 Events.on(engine,'collisionStart',event=>{contacts+=event.pairs.length;for(const pair of event.pairs){for(const [fixed,moving]of[[pair.bodyA,pair.bodyB],[pair.bodyB,pair.bodyA]])if(fixed.plugin.toy&&!fixed.plugin.toy.body&&!moving.isStatic&&Math.hypot(moving.velocity.x,moving.velocity.y)>2)pending.set(fixed.plugin.toy,{...moving.velocity});}const i=[...items].find(i=>i.body&&event.pairs.some(p=>p.bodyA===i.body||p.bodyB===i.body));i?.sfx?.play(i.actor?'step':'place',{level:.25});});
 function steer(item,target,force=1){
  const b=item.body,now=host.performance.now();
  // Winged recovery lifts above the thin wire plane. Ballistic throws still hit it.
  const finalApproach=!item.retrieving&&Math.hypot(target.x-b.position.x,target.y-b.position.y)<70;
  if(item.actor)b.collisionFilter.mask=finalApproach?0:1;
  if(finalApproach)item.detour=null;
  if(item.actor&&!finalApproach&&now>(item.routeAt||0)){
   const hits=host.Matter.Query.ray(textBodies,b.position,target,item.pageSize.w*.7).filter(hit=>!hit.bodyA.plugin.toy&&hit.bodyA.bounds.min.y>0);
   const ceiling=hits.length?Math.min(...hits.map(h=>h.bodyA.bounds.min.y))-item.pageSize.h/2-24:null;
   if(ceiling!==null&&ceiling<Math.min(b.position.y,target.y)-10)item.detour=[{x:b.position.x,y:ceiling},{x:target.x,y:ceiling}];
   item.routeAt=now+1100;
  }
  if(item.detour?.length){if(Math.hypot(b.position.x-item.detour[0].x,b.position.y-item.detour[0].y)<14)item.detour.shift();if(item.detour.length)target=item.detour[0];}
  const dx=target.x-b.position.x,dy=target.y-b.position.y,speed=9;
  item.controlForce={x:Math.max(-.003,Math.min(.003,(dx*.06-b.velocity.x)*.0005))*b.mass*force,y:(-.001+Math.max(-.003,Math.min(.003,(dy*.06-b.velocity.y)*.0005)))*b.mass*force};
  if(Math.abs(b.velocity.x)>speed)Body.setVelocity(b,{x:Math.sign(b.velocity.x)*speed,y:b.velocity.y});Body.setAngularVelocity(b,-b.angle*.08);
 }
 function tick(now){
  raf=0;const dt=Math.min(32,now-(last||now));last=now;
  if(canvas.width!==host.innerWidth||canvas.height!==host.innerHeight){canvas.width=host.innerWidth;canvas.height=host.innerHeight;}
  c.clearRect(0,0,canvas.width,canvas.height);
  if(![...items].some(i=>i.body)){last=0;return;}
  if(now>collisionAt){rebuild();collisionAt=now+350;}
  // Small substeps keep fast tosses from tunnelling through the thin thread.
  for(let left=dt;left>0;left-=4){for(const i of items)if(i.body&&!i.pageHeld&&i.controlForce)Body.applyForce(i.body,i.body.position,i.controlForce);Engine.update(engine,Math.min(4,left));}
  for(const [item,v]of pending){activate(item);Body.setVelocity(item.body,{x:v.x*.6,y:v.y*.6});}pending.clear();
  for(const item of items){
   if(!item.body)continue;updateHome(item);const body=item.body,age=now-item.released;
   if(!item.pageHeld&&age>(item.actor?1000:2800)){
    if(item.actor){const target=item.delivery?{x:item.delivery.pageHome.x,y:item.delivery.pageHome.y-35}:item.retrieving?.body?.position||item.pageHome;steer(item,target);if(!item.retrieving&&!item.delivery&&Math.hypot(body.position.x-target.x,body.position.y-target.y)<2&&Math.hypot(body.velocity.x,body.velocity.y)<1){restore(item);continue;}}
    else{
     if(!item.retriever){const helper=[...items].find(a=>a.actor&&a.canvas===item.canvas&&!a.body&&!a.retrieving);if(helper){activate(helper);helper.retrieving=item;helper.released=now-3000;item.retriever=helper;}}
     const helper=item.retriever;
     if(helper?.body&&Math.hypot(helper.body.position.x-body.position.x,helper.body.position.y-body.position.y)<45)item.carried=true;
     if(item.carried&&helper?.body){helper.retrieving=null;helper.delivery=item;body.collisionFilter.mask=Math.hypot(body.position.x-item.pageHome.x,body.position.y-item.pageHome.y)<70?0:1;steer(item,{x:helper.body.position.x,y:helper.body.position.y+35});if(Math.hypot(body.position.x-item.pageHome.x,body.position.y-item.pageHome.y)<2&&Math.hypot(body.velocity.x,body.velocity.y)<1){restore(item);continue;}}
    }
   }
   const x=body.position.x,y=body.position.y-host.scrollY;if(item.handle){item.handle.style.width=item.pageSize.w+'px';item.handle.style.height=item.pageSize.h+'px';item.handle.style.transform=`translate(${x-item.pageSize.w/2}px,${y-item.pageSize.h/2}px) rotate(${body.angle}rad)`;}if(y<-200||y>host.innerHeight+200)continue;
   c.save();c.translate(x,y);c.rotate(body.angle);
   if(item.actor&&item.actorPainter)item.actorPainter(c,item.pageSize,now/1000,item.pageHeld?'held':age>1000?'air':'spring',body.velocity);
   else if(item.sprite)c.drawImage(item.sprite,-item.pageSize.w/2-3,-item.pageSize.h/2-3,item.pageSize.w+6,item.pageSize.h+6);
   c.restore();
  }
  wake();
 }
 host.document.addEventListener('visibilitychange',()=>{last=0;if(!host.document.hidden)wake();});
 const api={register,activate,grab,move,release,updateHome,wake,items,diagnostics:()=>({active:[...items].filter(i=>i.body).map(i=>({id:i.id,x:i.body.position.x,y:i.body.position.y,held:i.pageHeld,actor:i.actor,home:i.pageHome,velocity:i.body.velocity,retrieving:i.retrieving?.id,delivery:i.delivery?.id})),contacts,terrain:terrain.length})};host.__pageToyWorld=api;return api;
}
