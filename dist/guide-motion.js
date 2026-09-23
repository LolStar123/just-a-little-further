// A world-space actor. Only construction assigns a position; every later move integrates velocity.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lines={
 landing:["psst. ready to see what's down there?","c'monnn. tiny legs are ready.","hey! shall we have a look below?","little scroll? for me?","follow me. i found some good stuff."],
 tfl:["eleven lines. one tiny league table.","the trains are competing. i'm walking."],
 scraper:["papers! quick, before he finds another.","that notebook is getting suspiciously full."],
 pipeline:["test it on data it hasn't seen.","mind the loop. i'm taking the scenic shortcut."],
 poe:["fifty thousand variants. tiny calculator.","have a poke at the item prices."],
 deadlock:["the data moved. rude.","watch this. statistically questionable landing.","little hop. big confidence interval."],
 botato:["try moving him around in there!", "your turn. i'll hang about.","a tiny obstacle course. go on."],
 halo:["he's thinking. give him a second.","meeting assistant. professional drooler."],
 baxter:["baxter's in charge. allegedly.","tiny team. enormous paperwork."],
 commute:["the cheapest way home. very important."],
 smoothtato:["less clutter. more frames. give it a try."],
 mtxtato:["a little aura never hurt anyone."],
 liquidation:["he's carrying the whole margin."],
 ocr:["pixels in. useful numbers out."],
 interests:["we made it. have a nose around."],
 travel:["keep scrolling. there's some good stuff down there.","wait for my tiny legs!","this way. probably.","i have a route. mostly.","one more little detour.","you scroll. i'll handle the acrobatics.","coming! give me a wingbeat.","nearly there. probably."]
};
export class GuideMotion{
 constructor(point){this.x=point.x;this.y=point.y;this.vx=0;this.vy=0;this.mode='run';this.kind='scamper';this.age=0;this.time=0;this.nextMove=1;this.moveCount=0;this.facing=1;this.held=false;this.history=[];this.bags=new Map();this.text='psst. follow me!';this.sayAt=0;this.lastScene='';this.releasedLedges=new Set();this.airTarget=null;this.triplet=0;this.rotation=0;}
 say(context){const bank=lines[context]||lines.travel;let bag=this.bags.get(context);if(!bag?.length){bag=bank.map((_,i)=>i).sort(()=>Math.random()-.5);if(bank[bag.at(-1)]===this.text)bag.reverse();this.bags.set(context,bag);}this.text=bank[bag.pop()];this.contextText=this.text;this.sayAt=this.time+(context==='landing'?5+Math.random()*3:8+Math.random()*5);return this.text;}
 state(mode,kind=mode){if(['held','thrown','flutter','fly','hang'].includes(mode))this.triplet=0;this.mode=mode;this.kind=kind;this.age=0;this.history.push({mode,kind,at:this.time});if(this.history.length>100)this.history.shift();}
 hold(){this.held=true;this.state('held');this.vx=this.vy=0;}
 drag(x,y,dt){const vx=(x-this.x)/Math.max(.008,dt),vy=(y-this.y)/Math.max(.008,dt);this.vx=clamp(this.vx*.35+vx*.65,-1900,1900);this.vy=clamp(this.vy*.35+vy*.65,-1900,1900);this.x=x;this.y=y;}
 release(){this.held=false;this.state('thrown');this.text='wheeeee!';this.sayAt=this.time+3;}
 hop(){if(this.held)return;this.vy=-330;this.state('air','leap');this.airTarget=null;}
 jump(target,kind){target={...target,x:clamp(target.x,45,(this.pageWidth||1440)-45)};this.airTarget={...target};const duration=clamp(Math.hypot(target.x-this.x,target.y-this.y)/320,.5,1.15);this.vx=clamp((target.x-this.x)/duration,-620,620);this.vy=(target.y-this.y)/duration-460*duration;this.jumpDuration=duration;this.state('air',kind);}
 tick(dt,route,viewport,scene,reduced=false){
  this.time+=dt;this.age+=dt;this.rotation=0;this.pageWidth=viewport.width;
  if(this.held)return;
  const {near,ahead,target,shortcut}=route,sceneKey=viewport.top<90?'landing':scene?.key||'travel';
  if(this.time>this.sayAt||sceneKey!==this.lastScene){this.say(sceneKey==='landing'?'landing':sceneKey!==this.lastScene?sceneKey:(this.moveCount%3?'travel':sceneKey));this.lastScene=sceneKey;}
  const offscreen=this.y<viewport.top-130||this.y>viewport.bottom+130;
  const distance=Math.hypot(target.x-this.x,target.y-this.y);
  const ledge=scene?.key==='botato'&&!this.releasedLedges.has(scene.top)&&viewport.top<scene.top+180;
  if(this.mode==='hang'&&!scene){this.releasedLedges.add(this.hangPoint?.y);this.state('flutter');}
  if(this.mode==='hang'){
   // The grips stay on the same physical ledge until the reader moves on.
   if(viewport.top>scene.bottom-120||viewport.top>this.hangScroll+100){this.releasedLedges.add(scene.top);this.vx=35;this.vy=45;this.state('flutter');this.text='dropping in!';this.sayAt=this.time+5;}
   else{this.vx+=(this.hangPoint.x-this.x)*24*dt-this.vx*8*dt;this.vy+=(this.hangPoint.y-this.y)*24*dt-this.vy*8*dt;}
  }else if(this.mode==='thrown'){
   this.vy+=920*dt;this.vx*=Math.exp(-.32*dt);
   if(this.age>1){this.state('flutter');this.text='i have wings. i remembered.';this.sayAt=this.time+5;}
  }else if(this.mode==='flutter'||this.mode==='fly'){
   const goal=ledge?{x:scene.right-18,y:scene.top+64}:target;
   const dx=goal.x-this.x,dy=goal.y-this.y,d=Math.hypot(dx,dy),cruise=offscreen?Math.min(1450,300+distance*.4):310;
   const wanted= Math.min(cruise,d*3),flap=1+.2*Math.sin(this.time*19);
   this.vx+=clamp(dx/(d||1)*wanted-this.vx,-850,850)*dt*2;
   this.vy+=clamp(dy/(d||1)*wanted-this.vy,-1000,1000)*dt*2*flap;
   if(d<9&&Math.hypot(this.vx,this.vy)<55){
    if(ledge){this.hangPoint=goal;this.hangScroll=viewport.top;this.state('hang');this.text="your turn. i'll hang about.";this.sayAt=this.time+10;}
    else{this.state('land');this.nextMove=this.time+.8;}
   }
  }else if(this.mode==='air'){
   this.vy+=920*dt;
   const goal=this.airTarget||near;
   if(this.age>.2&&this.vy>0&&this.y>=goal.y-8&&Math.abs(this.x-goal.x)<42){this.state('land');this.nextMove=Math.max(this.nextMove,this.time+1.1);}
   else if(this.age>(this.jumpDuration||.8)+.4||offscreen&&distance>550)this.state('flutter');
   if(this.kind==='triple'&&this.triplet===3&&!reduced)this.rotation=Math.PI*2*clamp(this.age/(this.jumpDuration||.8),0,1);
   if(this.kind==='kong')this.rotation=Math.sin(this.age/(this.jumpDuration||.8)*Math.PI)*.65*this.facing;
  }else if(this.mode==='crouch'){
   this.vx*=Math.exp(-14*dt);this.vy*=Math.exp(-14*dt);
   if(this.age>.18)this.jump(this.planned.target,this.planned.kind);
  }else if(this.mode==='land'){
   this.vx*=Math.exp(-12*dt);this.vy+=(near.y-this.y)*80*dt-this.vy*16*dt;
   if(this.age>.18){
    if(this.triplet>0&&this.triplet<3){this.triplet++;this.jump({x:this.x+this.facing*(38+this.triplet*17),y:near.y},'triple');this.vy-=this.triplet*35;}
    else{this.triplet=0;this.state('run');}
   }
  }else{
   const dx=ahead.x-this.x,dy=ahead.y-this.y,d=Math.hypot(dx,dy),slope=dy/(Math.abs(dx)+8);
   if(offscreen&&distance>300||Math.hypot(near.x-this.x,near.y-this.y)>100){this.state('fly');}
   else if(ledge&&Math.abs(this.y-scene.top)<150){this.state('flutter');}
   else{
    this.kind=slope<-.7?'climb':slope>.35&&(!scene||this.y>scene.bottom-15)?'grind':slope>.85?'scramble':['halo','baxter'].includes(sceneKey)?'tiptoe':sceneKey==='mtxtato'?'balance':'scamper';
    // Footfalls drive travel: speed pulses at the planted steps instead of a constant glide.
    const pace=(this.kind==='climb'?70:this.kind==='grind'?225:135)*(1+.32*Math.sin(this.time*16)),speed=Math.min(pace,d*5);
    this.vx+=(dx/(d||1)*speed-this.vx)*(1-Math.exp(-dt*12));this.vy+=(dy/(d||1)*speed-this.vy)*(1-Math.exp(-dt*12));
    if(!reduced&&this.time>this.nextMove){
     this.moveCount++;let kind='leap',goal=shortcut||ahead;
     if(sceneKey==='deadlock'){kind='leap';goal={x:ahead.x,y:ahead.y-2};this.text=['that peak looks friendly.','mind the outliers.','the floor is doing statistics.'][this.moveCount%3];}
     else if(['scraper','pipeline'].includes(sceneKey)&&shortcut){kind=this.moveCount%2?'leap':'kong';this.text='shortcut. watch my feet.';}
     else if(sceneKey==='tfl'){kind='leap';this.text='mind the gap. tiny feet.';}
     else if(sceneKey==='halo'){kind='leap';this.text="shh. he's concentrating.";}
     else if(sceneKey==='baxter'){kind='kong';this.text='under the paperwork. local shortcut.';}
     else if(sceneKey==='liquidation'){kind='kong';this.text='i know a way up the pile.';}
     else if(sceneKey==='smoothtato'&&this.moveCount%2===0){this.state('flutter');this.nextMove=this.time+4;return;}
     else if(this.kind==='climb'){kind='kong';goal=ahead;this.text='one wing. other wing. up.';}
     else if(this.moveCount%3===0){kind='triple';this.triplet=1;goal={x:this.x+this.facing*45,y:near.y};this.text='one... two...';}
     else if(this.moveCount%3===1)kind='kong';
     this.planned={kind,target:goal};this.state('crouch');this.nextMove=this.time+2.5+Math.random()*2;
    }
   }
  }
  if(sceneKey==='landing')this.text=this.contextText||'psst. ready to see what is below?';
  if(Math.abs(this.vx)>12)this.facing=this.vx<0?-1:1;
  // No position snaps, even on scroll, resize, route changes or recovery.
  this.x+=this.vx*dt;this.y+=this.vy*dt;
  if(this.x<38&&this.vx<0)this.vx=Math.abs(this.vx)*.45;
  if(this.x>viewport.width-38&&this.vx>0)this.vx=-Math.abs(this.vx)*.45;
 }
 get pose(){return {kind:['air','crouch','land','hang','flutter','fly'].includes(this.mode)?this.mode==='air'?this.kind:this.mode:this.kind,phase:this.age/(this.jumpDuration||1)};}
}
