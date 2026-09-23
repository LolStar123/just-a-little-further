// A world-space actor. Only construction assigns a position; every later move integrates velocity.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lines={
 landing:["heyyy! scroll down!","c'mon, hurry upppppp!","come downnnn!","helloooo? little scroll please?","hey! there's more down here!","c'monnn. follow me down!","scroll down! i have things to show you!","pssst. down here. pleeease!"],
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
 travel:["keep scrolling down! there's good stuff below!","wait for my tiny legs!","this way. probably.","i have a route. mostly.","one more little detour.","you scroll. i'll handle the acrobatics.","coming! give me a wingbeat.","nearly there. probably."]
};
export class GuideMotion{
 constructor(point){this.x=point.x;this.y=point.y;this.vx=0;this.vy=0;this.mode='run';this.kind='scamper';this.age=0;this.time=0;this.nextMove=.35;this.idleTime=0;this.lastScroll=0;this.attentionBounce=0;this.moveCount=0;this.facing=1;this.held=false;this.history=[];this.bags=new Map();this.text='psst. follow me!';this.sayAt=0;this.lastScene='';this.releasedLedges=new Set();this.airTarget=null;this.triplet=0;this.rotation=0;}
 say(context){const bank=lines[context]||lines.travel;let bag=this.bags.get(context);if(!bag?.length){bag=bank.map((_,i)=>i).sort(()=>Math.random()-.5);if(bank[bag.at(-1)]===this.text)bag.reverse();this.bags.set(context,bag);}this.text=bank[bag.pop()];this.contextText=this.text;this.sayAt=this.time+(context==='landing'?4.2+Math.random()*1.8:8+Math.random()*5);return this.text;}
 state(mode,kind=mode){if(['held','thrown','flutter','fly','hang'].includes(mode))this.triplet=0;this.mode=mode;this.kind=kind;this.age=0;this.history.push({mode,kind,at:this.time});if(this.history.length>100)this.history.shift();}
 hold(){this.attentionBounce=0;this.held=true;this.state('held');this.vx=this.vy=0;}
 drag(x,y,dt){const vx=(x-this.x)/Math.max(.008,dt),vy=(y-this.y)/Math.max(.008,dt);this.vx=clamp(this.vx*.35+vx*.65,-1900,1900);this.vy=clamp(this.vy*.35+vy*.65,-1900,1900);this.x=x;this.y=y;}
 release(){this.held=false;this.state('thrown');this.text='wheeeee!';this.sayAt=this.time+3;}
 cheer(){if(this.held)return;this.cheerBounced=false;this.cheerFloor=this.y;this.vx=0;this.vy=-650;this.state('cheer');this.text='GO LITTLE GUYYYY!!';this.contextText=this.text;this.sayAt=this.time+4;}
 hop(){if(this.held)return;this.vy=-330;this.state('air','leap');this.airTarget=null;}
 jump(target,kind){target={...target};this.airTarget={...target};const duration=['hello','starhop','peek'].includes(kind)?(this.reboundJump?.68:1.08+(this.moveCount%3)*.12):clamp(Math.hypot(target.x-this.x,target.y-this.y)/320,.5,1.15);this.vx=clamp((target.x-this.x)/duration,-620,620);this.vy=(target.y-this.y)/duration-460*duration;this.jumpDuration=duration;if(kind==='walljump'||kind==='wallkick'){this.wallKick=kind==='wallkick'?Math.sign(target.x-this.x)||this.facing:this.x<this.pageLeft+90?1:this.x>this.pageLeft+this.pageWidth-90?-1:(this.moveCount%2?1:-1);this.wallBaseVx=this.vx;this.vx+=this.wallKick*170;}this.reboundJump=false;this.state('air',kind);}
 tick(dt,route,viewport,scene,reduced=false){
  this.time+=dt;this.age+=dt;this.rotation=0;this.pageWidth=viewport.width;this.pageLeft=viewport.left||0;
  const scrolling=Math.abs(viewport.top-this.lastScroll)>2;this.idleTime=scrolling?0:this.idleTime+dt;this.lastScroll=viewport.top;
  if(scrolling)this.attentionBounce=0;
  if(this.held)return;
  if(this.mode==='cheer'){
   this.vy+=1100*dt;this.vx*=Math.exp(-dt*8);this.x+=this.vx*dt;this.y+=this.vy*dt;
   if(this.age>.3&&this.vy>0&&this.y>=this.cheerFloor-5){if(!this.cheerBounced){this.cheerBounced=true;this.vy=-230;}else{this.cheerBounced=false;this.state('flutter');}}
   return;
  }
  const {near,ahead,shortcut}=route;let target=route.target;const sceneKey=viewport.top<90?'landing':scene?.key||'travel';
  if(route.goodbye&&!['held','thrown','cheer'].includes(this.mode)){
   const d=Math.hypot(target.x-this.x,target.y-this.y);
   if(!this.sayingGoodbye){this.sayingGoodbye=true;this.text='byeeee! come back soon!';this.contextText=this.text;this.sayAt=this.time+6;this.bypassTarget=null;}
   if(d<23){this.mode='goodbye';this.kind='wave';this.vx+=(target.x-this.x)*65*dt-this.vx*16*dt;this.vy+=(target.y-this.y)*65*dt-this.vy*16*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;if(this.time>this.sayAt){this.text=this.text.startsWith('byeee')?'thanks for coming. little wave!':'byeeee! come back soon!';this.sayAt=this.time+6;}return;}
   if(!['flutter','fly'].includes(this.mode))this.state('flutter');
  }else if(this.sayingGoodbye){this.sayingGoodbye=false;this.state('run');this.sayAt=0;}
  if(!route.goodbye&&(this.time>this.sayAt||sceneKey!==this.lastScene)){this.say(sceneKey==='landing'?'landing':sceneKey!==this.lastScene?sceneKey:(this.moveCount%3?'travel':sceneKey));this.lastScene=sceneKey;}
  const bandTop=viewport.top+(viewport.bottom-viewport.top)*.8;
  const offscreen=this.y<viewport.top-130||this.y>viewport.bottom+130;
  // Watch actual progress, not repeated state changes around the same curl.
  const routeDistance=Math.hypot(target.x-this.x,target.y-this.y),progressDistance=route.remaining??routeDistance;
  if(!this.progressGoal||Math.hypot(target.x-this.progressGoal.x,target.y-this.progressGoal.y)>90){this.progressGoal={...target};this.bestDistance=progressDistance;this.stalledFor=0;}
  if(progressDistance<this.bestDistance-22){this.bestDistance=progressDistance;this.stalledFor=0;}
  else if((routeDistance>35||route.remaining>180)&&['run','air','land','crouch'].includes(this.mode))this.stalledFor=(this.stalledFor||0)+dt;
  else if(routeDistance<30&&route.remaining<100)this.stalledFor=0;
  const grounded=['run','land','crouch'].includes(this.mode);
  if(grounded&&Math.hypot(this.vx,this.vy)<12&&(routeDistance>28||route.remaining>100))this.junctionWait=(this.junctionWait||0)+dt;
  else this.junctionWait=0;
  if((this.stalledFor>1.8||this.junctionWait>.7)&&this.time>(this.bypassAfter||0)&&!this.held){
   this.stalledFor=0;this.junctionWait=0;this.bypassAfter=this.time+2;this.attentionBounce=0;this.triplet=0;
   this.text=['this curl? taking a shortcut!','tiny wings. big shortcut.','coming! hopping over this bit.'][this.moveCount++%3];this.contextText=this.text;this.sayAt=this.time+4;
   const foothold=shortcut||route.cornerExit||ahead;this.landingPoint=null;this.jump(foothold,'kong');
  }
  if(this.bypassTarget){if(Math.hypot(this.bypassTarget.x-route.target.x,this.bypassTarget.y-route.target.y)>350)this.bypassTarget=null;else target=this.bypassTarget;}
  const distance=Math.hypot(target.x-this.x,target.y-this.y);
  const ledge=scene?.key==='botato'&&!this.releasedLedges.has(scene.top)&&viewport.top<scene.top+180&&scene.top+64>=bandTop&&scene.top+64<viewport.bottom-16;
  if(this.mode==='hang'&&(!scene||!ledge)){this.releasedLedges.add(this.hangPoint?.y);this.state('flutter');}
  if(this.mode==='hang'){
   // The grips stay on the same physical ledge until the reader moves on.
   if(viewport.top>scene.bottom-120||viewport.top>this.hangScroll+100){this.releasedLedges.add(scene.top);this.vx=35;this.vy=45;this.state('flutter');this.text='dropping in!';this.sayAt=this.time+5;}
   else{this.vx+=(this.hangPoint.x-this.x)*24*dt-this.vx*8*dt;this.vy+=(this.hangPoint.y-this.y)*24*dt-this.vy*8*dt;}
  }else if(this.mode==='thrown'){
   this.vy+=1300*dt;this.vx*=Math.exp(-.18*dt);
   if(this.age>.7){this.state('flutter');this.text='i have wings. i remembered.';this.sayAt=this.time+5;}
  }else if(this.mode==='flutter'||this.mode==='fly'){
   const goal=ledge?{x:scene.right-18,y:scene.top+64}:target;
   const dx=goal.x-this.x,dy=goal.y-this.y,d=Math.hypot(dx,dy),cruise=offscreen?Math.min(4350,900+distance*1.2):930;
   const wanted= Math.min(cruise,d*5),flap=1+.2*Math.sin(this.time*19);
   this.vx+=clamp(dx/(d||1)*wanted-this.vx,-2550,2550)*dt*3;
   this.vy+=clamp(dy/(d||1)*wanted-this.vy,-3000,3000)*dt*3*flap;
   if(d<9&&Math.hypot(this.vx,this.vy)<55){
    if(ledge){this.hangPoint=goal;this.hangScroll=viewport.top;this.state('hang');this.text="your turn. i'll hang about.";this.sayAt=this.time+10;}
    else{this.bypassTarget=null;this.landingPoint={...goal};this.state('land');this.nextMove=this.time+.2;}
   }
  }else if(this.mode==='air'){
   if(this.kind==='walljump'||this.kind==='wallkick')this.vx=this.wallBaseVx+this.wallKick*170*Math.cos(Math.PI*Math.min(1,this.age/this.jumpDuration));
   this.vy+=920*dt;
   const goal=this.airTarget||near;
   if(this.age>.2&&this.vy>0&&this.y>=goal.y-8&&Math.abs(this.x-goal.x)<42){this.landingPoint={...goal};this.state('land');this.nextMove=this.time+(sceneKey==='landing'?.28:.7);}
   else if(this.age>(this.jumpDuration||.8)+.4||offscreen&&distance>550)this.state('flutter');
   if(this.kind==='triple'&&this.triplet===3&&!reduced)this.rotation=Math.PI*2*clamp(this.age/(this.jumpDuration||.8),0,1);
   if(this.kind==='kong')this.rotation=Math.sin(this.age/(this.jumpDuration||.8)*Math.PI)*.65*this.facing;
  }else if(this.mode==='crouch'){
   this.vx*=Math.exp(-14*dt);this.vy*=Math.exp(-14*dt);
   if(this.age>.18)this.jump(this.planned.target,this.planned.kind);
  }else if(this.mode==='land'){
   const foot=this.landingPoint||near;this.vx+=(foot.x-this.x)*65*dt-this.vx*16*dt;this.vy+=(foot.y-this.y)*80*dt-this.vy*16*dt;
   if(this.age>.18){
    if(this.attentionBounce&&!reduced&&this.idleTime>1){this.attentionBounce=0;this.reboundJump=true;this.jump(route.perchAt(this.x-this.facing*28,foot.y),'starhop');}
    else if(this.triplet>0&&this.triplet<3){this.triplet++;this.jump({x:this.x+this.facing*(38+this.triplet*17),y:near.y},'triple');this.vy-=this.triplet*35;}
    else{this.triplet=0;this.state('run');}
   }
  }else{
   const dx=ahead.x-this.x,dy=ahead.y-this.y,d=Math.hypot(dx,dy),slope=dy/(Math.abs(dx)+8);
   if(offscreen&&distance>850){this.state('fly');}
   else if(Math.hypot(near.x-this.x,near.y-this.y)>100){this.jump(near,'leap');}
   else if(!ledge&&distance<32&&(route.remaining??0)<60&&this.idleTime>.35){
    // A local attention routine: full-body wave, high hop, then an occasional rebound.
    this.kind='wave';const perch=route.perchAt(this.x,this.y);this.vx+=(perch.x-this.x)*60*dt-this.vx*14*dt;this.vy+=(perch.y-this.y)*60*dt-this.vy*14*dt;
    if(!reduced&&this.time>this.nextMove){
     this.moveCount++;const kind=['hello','peek','starhop'][this.moveCount%3],side=this.moveCount%2?1:-1;
     this.planned={kind,target:route.perchAt(this.x+side*(52+this.moveCount%3*19),perch.y)};
     this.attentionBounce=this.moveCount%2===0?1:0;this.state('crouch');this.nextMove=this.time+.55;
     if(this.time>this.sayAt-.8)this.say('landing');
    }
   }
   else if(ledge&&Math.abs(this.y-scene.top)<150){this.state('flutter');}
   else{
    const exitPoint=route.cornerExit;
    const ax=ahead.x-near.x,ay=ahead.y-near.y,ex=(exitPoint?.x??ahead.x)-ahead.x,ey=(exitPoint?.y??ahead.y)-ahead.y;
    const bend=(ax*ex+ay*ey)/(Math.hypot(ax,ay)*Math.hypot(ex,ey)||1);
    if(bend<-.12&&this.time>(this.cornerAfter||0)&&route.remaining>90){
     this.cornerAfter=this.time+1.25;this.attentionBounce=0;this.triplet=0;
     this.jump(shortcut||exitPoint,'kong');this.nextMove=this.time+1.3;
     this.x+=this.vx*dt;this.y+=this.vy*dt;return;
    }
    const previousTerrain=this.kind;
    // Hold the slide through hand-drawn bumps; leave only for a sustained exit.
    const descending=dy>8&&Math.abs(dx)<18;
    if(descending)this.poleGrace=.28;else this.poleGrace=Math.max(0,(this.poleGrace||0)-dt);
    const slide=descending||(previousTerrain==='pole'&&this.poleGrace>0&&dy>-10);
    this.kind=slide?'pole':slope<-.7?'climb':slope>.35&&(!scene||this.y>scene.bottom-15)?'grind':slope>.85?'scramble':['halo','baxter'].includes(sceneKey)?'tiptoe':sceneKey==='mtxtato'?'balance':'scamper';
    const exit=route.cornerExit;
    if(previousTerrain==='pole'&&this.kind!=='pole'&&exit&&Math.abs(exit.x-this.x)>28&&Math.abs(exit.y-this.y)<100&&!reduced){
     this.kickPoint={x:near.x,y:near.y};this.kickDirection=Math.sign(exit.x-this.x);this.kickCount=(this.kickCount||0)+1;
     this.facing=this.kickDirection;this.attentionBounce=0;this.triplet=0;this.jump(exit,'wallkick');this.nextMove=this.time+1.1;
     this.text=this.kickDirection<0?'and... left!':'and... right!';this.contextText=this.text;this.sayAt=this.time+3;
     this.x+=this.vx*dt;this.y+=this.vy*dt;return;
    }
    // Footfalls drive travel: speed pulses at the planted steps instead of a constant glide.
    const pace=this.kind==='pole'?520*(1+.07*Math.sin(this.time*9)):(this.kind==='climb'?420:this.kind==='grind'?950:780)*(1+.26*Math.sin(this.time*19)),speed=Math.min(pace,d*32,Math.max(40,(route.remaining??distance)*8));
    this.vx+=(dx/(d||1)*speed-this.vx)*(1-Math.exp(-dt*12));this.vy+=(dy/(d||1)*speed-this.vy)*(1-Math.exp(-dt*12));
    if(!reduced&&this.kind!=='pole'&&this.time>this.nextMove){
     this.moveCount++;let kind='leap',goal=shortcut||ahead;
     if(slope< -1.25){kind='walljump';goal=ahead;this.text=['little kick. up we go!','one wall. two tiny feet.','boing. taking the upstairs route.'][this.moveCount%3];}
     else if(sceneKey==='deadlock'){kind='leap';goal={x:ahead.x,y:ahead.y-2};this.text=['that peak looks friendly.','mind the outliers.','the floor is doing statistics.'][this.moveCount%3];}
     else if(['scraper','pipeline'].includes(sceneKey)&&shortcut){kind=this.moveCount%2?'leap':'kong';this.text='shortcut. watch my feet.';}
     else if(sceneKey==='tfl'){kind='leap';this.text='mind the gap. tiny feet.';}
     else if(sceneKey==='halo'){kind='leap';this.text="shh. he's concentrating.";}
     else if(sceneKey==='baxter'){kind='kong';this.text='under the paperwork. local shortcut.';}
     else if(sceneKey==='liquidation'){kind='kong';this.text='i know a way up the pile.';}
     else if(sceneKey==='smoothtato'&&this.moveCount%2===0){kind='starhop';goal=shortcut||ahead;}
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
  if(this.x<this.pageLeft+4&&this.vx<0)this.vx=Math.abs(this.vx)*.45;
  if(this.x>this.pageLeft+viewport.width-4&&this.vx>0)this.vx=-Math.abs(this.vx)*.45;
 }
 get pose(){return {kind:['air','crouch','land','hang','flutter','fly'].includes(this.mode)?this.mode==='air'?this.kind:this.mode:this.kind,phase:this.age/(this.jumpDuration||1)};}
}
