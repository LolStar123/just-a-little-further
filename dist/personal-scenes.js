import {drawMeowl} from './little-creatures.js';
import {toyProp} from './toy-interactions.js';
import {inkPath} from './ink-path.js';
import {POKER_PACK,SHUFFLE_SECONDS,pickPokerCard,drawPokerFace} from './poker-deck.js';
import {thoughtPose,deadlockBlink,eyeGaze} from './thought-motion.js';
export const normalise=text=>text.toLowerCase().replace(/\s+/g,' ').replace(/[1i|]/g,'l').trim();
export function inverse2([a,b,c,d]){const det=a*d-b*c;if(Math.abs(det)<1e-8)return null;return[d/det,-b/det,-c/det,a/det];}
export function personalScene(scene,canvas,wake,sfx){
 const interests=scene==='interests',ink='#535248',paper='#eeeae0',olive='#60715d';
 document.querySelector('.caption').textContent=interests?'a few constants in my brain':'pixels, text, a stopping rule';
 document.querySelector('#scene').innerHTML='<canvas id="personal-art" class="toy mini-toy" aria-label="'+(interests?'A thought bubble of competitive games, poker and indomie':'OCR text normalisation example')+'"></canvas><p class="toy-note" id="personal-note"></p>';
 const a=canvas('personal-art'),state={clock:0,scene},note=document.querySelector('#personal-note');
 let shuffleCycle=0,frontCard=interests?pickPokerCard():null;
 const eyePointer={x:0,y:0,active:false};
 if(interests){
  const follow=e=>{
   if(e.pointerType==='touch')return;
   const frame=window.frameElement?.getBoundingClientRect();
   const outside=e.currentTarget!==window;
   eyePointer.x=e.clientX-(outside&&frame?frame.left:0);
   eyePointer.y=e.clientY-(outside&&frame?frame.top:0);eyePointer.active=true;
  };
  addEventListener('pointermove',follow,{passive:true});
  try{if(parent!==window)parent.addEventListener('pointermove',follow,{passive:true});}catch{}
  addEventListener('pagehide',()=>{try{if(parent!==window)parent.removeEventListener('pointermove',follow);}catch{}},{once:true});
 }
 const labels=[['top 100','deadlock'],['wealthiest','path of exile player'],['top 5000','dota 2'],['bath poker','tourney winner'],['indomie','sandwich']];
 const gameLinks=interests?['https://store.steampowered.com/app/1422450/Deadlock/','https://www.pathofexile.com/','https://www.dota2.com/'].map((href,i)=>{
  const link=document.createElement('a');link.href=href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=labels[i][1];link.className='interest-game-link';
  Object.assign(link.style,{position:'absolute',zIndex:3,color:ink,fontFamily:'Reader,Georgia,serif',lineHeight:'1',whiteSpace:'nowrap',transform:'translate(-50%,-80%)',textDecoration:'underline',textDecorationThickness:'1px',textUnderlineOffset:'3px'});
  a.el.parentElement.style.position='relative';a.el.parentElement.append(link);return link;
 }):[];
 const atoms=labels.map((words,i)=>({words,x:94+(i%3)*145,y:70+Math.floor(i/3)*90,vx:(i%2?-1:1)*(21+i*3),vy:(i%3-1)*19,w:[116,165,116,158,112][i],h:48,spin:0}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function moveAtoms(dt){
  for(const b of atoms){b.x+=b.vx*dt;b.y+=b.vy*dt;b.spin*=Math.exp(-dt*4);if(b.x-b.w/2<30){b.x=30+b.w/2;b.vx=Math.abs(b.vx);}if(b.x+b.w/2>450){b.x=450-b.w/2;b.vx=-Math.abs(b.vx);}if(b.y-b.h/2<35){b.y=35+b.h/2;b.vy=Math.abs(b.vy);}if(b.y+b.h/2>222){b.y=222-b.h/2;b.vy=-Math.abs(b.vy);}}
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){const a=atoms[i],b=atoms[j],dx=b.x-a.x,dy=b.y-a.y,px=(a.w+b.w)/2+8-Math.abs(dx),py=(a.h+b.h)/2+8-Math.abs(dy);if(px<=0||py<=0)continue;if(px<py){const sign=dx<0?-1:1;a.x-=sign*px/2;b.x+=sign*px/2;[a.vx,b.vx]=[b.vx,a.vx];}else{const sign=dy<0?-1:1;a.y-=sign*py/2;b.y+=sign*py/2;[a.vy,b.vy]=[b.vy,a.vy];}a.spin=.07;b.spin=-.07;}
 }

 const inputs=['Adds cold damage','GrAnd Des1gn','Adds fire damage','Remarkab|e'];
 function text(c,str,x,y,size=17){const scale=Math.min(a.w/480,a.h/350);c.font=Math.max(size*1.06,15/Math.max(.1,scale))+'px Reader,Georgia,serif';c.fillStyle=ink;c.textAlign='center';c.fillText(str,x,y);}
 function line(c,p,color=ink,w=1.2){inkPath(c,p,color,w);}
 function draw(){
  if(!a.w||!a.h)return;a.clear();const c=a.c,s=Math.min(a.w/480,a.h/350),ox=(a.w-480*s)/2,oy=(a.h-350*s)/2;c.save();c.translate(ox,oy);c.scale(s,s);
  const time=state.clock,phase=time%8,round=Math.floor(time/8);
  const floor=[[0,308],[80,308],[170,304],[320,309],[480,308]],encoded=JSON.stringify(floor.map(([x,y])=>[x*s+ox,y*s+oy]));
  if(a.el.dataset.threadPoints!==encoded){a.el.dataset.threadPoints=encoded;parent.dispatchEvent(new Event('ink-anchors'));}
  if(!window.frameElement?.classList.contains('sketch-demo'))line(c,floor);
  if(interests){
   const expansion=reduced.matches?1:Math.min(1,time/1.5),growth=1-Math.pow(1-expansion,3);
   c.save();c.translate(240,244);c.scale(.12+.88*growth,.12+.88*growth);c.translate(-240,-244);
   c.beginPath();c.moveTo(46,242);c.bezierCurveTo(10,240,8,197,22,172);c.bezierCurveTo(-1,137,9,59,35,42);c.bezierCurveTo(44,7,131,7,164,20);c.bezierCurveTo(225,-2,297,13,325,20);c.bezierCurveTo(395,-2,467,20,463,60);c.bezierCurveTo(485,118,469,171,464,181);c.bezierCurveTo(478,233,425,244,386,239);c.bezierCurveTo(292,261,124,247,46,242);c.strokeStyle=ink;c.lineWidth=1.1;c.stroke();
   const seats=[[90,74],[244,74],[392,74],[143,179],[335,179]],active=Math.floor(time/2.6)%5,phase=(time%2.6)/2.6;
   state.activeThought=active;state.thoughtMotion=seats.map((_,i)=>thoughtPose(i,time));
   // The words never move. The doodles do the daydreaming above each label.
   const thread=[[35,42],[68,23],[137,30],[201,14],[278,29],[339,13],[445,34],[453,113],[377,128],[313,120],[249,143],[182,120],[87,134],[47,215],[85,236],[194,246]];
   line(c,thread,'#b2aa98',.75);
   for(let j=0;j<5;j++){
    const [x,y]=seats[j],selected=j===active,{lift,angle,sway}=thoughtPose(j,time);
    c.save();c.translate(x+sway,y-30-lift);c.rotate(angle);c.strokeStyle=selected?olive:ink;c.lineWidth=1.5;
    toyProp(c,['deadlock-emblem','divine-orb','dota-emblem','poker-hand','indomie-sandwich'][j],0,16,j===3?82:52,60,c=>{
    if(j===0){ // Deadlock's eight-part wheel and little watching eye.
     c.save();c.translate(0,-8);c.rotate(reduced.matches?0:Math.sin(time*1.7)*.11);
     for(let k=0;k<8;k++){const angle=k*Math.PI/4+.04;const pts=[];for(let q=0;q<=5;q++){const t=angle+q*.11,r=20+(q%2?.7:-.5);pts.push([Math.cos(t)*r,Math.sin(t)*r]);}line(c,pts,ink,2);line(c,[[Math.cos(angle)*12,Math.sin(angle)*12],[Math.cos(angle)*21,Math.sin(angle)*21]],ink,1.3);}
     const bounds=a.el.getBoundingClientRect(),px=(eyePointer.x-bounds.left)*a.w/bounds.width,py=(eyePointer.y-bounds.top)*a.h/bounds.height;
     const targetX=(px-ox)/s-x-sway,targetY=(py-oy)/s-(y-38-lift);
     const gaze=eyePointer.active?eyeGaze(targetX,targetY):{x:0,y:0},blink=deadlockBlink(time);
     c.save();c.scale(1,blink);
     line(c,[[-12,0],[-6,-6],[1,-8],[8,-4],[12,0],[5,6],[-2,7],[-9,3],[-12,0]],ink,1.3);
     c.beginPath();c.ellipse(gaze.x,gaze.y,3,4,0,0,Math.PI*2);c.fillStyle=ink;c.fill();c.restore();c.restore();
     state.deadlockEye={...gaze,blink,following:eyePointer.active};
    }else if(j===1){ // A badly minted divine orb, bald brow and all.
     c.save();c.rotate(reduced.matches?0:Math.sin(time*2)*.1);
     line(c,[[-14,9],[-20,-3],[-17,-21],[-9,-29],[5,-30],[17,-23],[20,-9],[13,9],[4,15],[-6,14],[-14,9]],'#987a35',1.8);
     line(c,[[-16,-16],[-8,-20],[-1,-15],[5,-19],[15,-15]],'#a2884f',1.3);
     line(c,[[-13,-10],[-6,-12],[-4,-8],[-11,-7],[-13,-10]],ink,1.6);line(c,[[5,-10],[12,-12],[14,-8],[6,-7],[5,-10]],ink,1.6);
     line(c,[[1,-10],[-2,-1],[3,1],[5,-2]],'#987a35',1.3);line(c,[[-8,6],[-2,4],[6,5],[10,7]],ink,1.3);line(c,[[-6,10],[3,11],[7,9]],'#987a35',1);
     line(c,[[-13,-22],[-6,-25],[7,-25],[14,-20]],'#b49959',.8);c.restore();
    }else if(j===2){ // Dota's cut diagonal and two ragged windows.
     c.save();c.rotate(reduced.matches?-.05:Math.sin(time*1.8)*.095-.05);
     const red='#b74936';c.beginPath();c.moveTo(-20,-28);c.lineTo(19,-26);c.lineTo(21,10);c.lineTo(-18,13);c.closePath();c.fillStyle=red;c.fill();line(c,[[-20,-28],[19,-26],[21,10],[-18,13],[-20,-28]],red,1.6);
     c.fillStyle=paper;for(const cut of [[[-14,-23],[17,4],[10,9],[-18,-18]],[[5,-23],[15,-22],[16,-10]],[[-15,-6],[-4,7],[-14,8]]]){c.beginPath();cut.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}c.restore();
    }else if(j===3){
     // A repeating face-up riffle; twelve visible edges suggest the full pack.
     const q=time%SHUFFLE_SECONDS,cycle=shuffleCycle,ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
     const split=q<.65?ease(q/.65):q<2.2?1:1-ease((q-2.2)/.65);
     const bridge=q>=2.85&&q<3.65?Math.sin((q-2.85)/.8*Math.PI)*9:0;
     for(let k=0;k<12;k++){
      const side=k%2?1:-1,rank=Math.floor(k/2),dealt=ease((q-.8-k*.095)/.34),separate=split*(1-dealt);
      const px=side*19*separate,py=-7+rank*.7-Math.sin(dealt*Math.PI)*9;
      c.save();c.translate(px,py);c.rotate(side*separate*.24);
      c.beginPath();c.moveTo(-16,13);c.quadraticCurveTo(0,13-bridge,16,13);c.lineTo(16,-33);c.quadraticCurveTo(0,-34-bridge,-16,-33);c.closePath();c.fillStyle=paper;c.fill();c.strokeStyle=ink;c.lineWidth=.75;c.stroke();
      c.save();c.translate(0,-bridge*.45);drawPokerFace(c,k===11?frontCard:POKER_PACK[(POKER_PACK.indexOf(frontCard)+k+1)%54]);c.restore();
      c.restore();
     }
     if(q>3.65&&q<4.1&&!reduced.matches){const puff=(q-3.65)/.45;for(const side of [-1,1])line(c,[[side*(18+puff*8),2],[side*(23+puff*10),-2]],olive,(1-puff)*1.1);}
     if(q>.8&&q<2.2)sfx.beat('poker-riffle',cycle+':'+Math.floor((q-.8)*5),'paper',{level:.12});
     if(q>3.65)sfx.beat('poker-square',cycle,'click',{level:.10});
     state.shuffle={phase:q,split,bridge,cards:54,visibleLayers:12,cycle,frontCard:frontCard.id,faceUp:true};
    }else{
     // Heat rises in separate drifting curls, with a few noodles refusing to stay put.
     for(let k=0;k<5;k++){
      const age=reduced.matches?.45:(time*.43+k*.21)%1,x=-15+k*7+Math.sin(time*1.4+k)*3,y=-22-age*32;
      c.save();c.globalAlpha*=Math.sin(age*Math.PI)*.65;c.beginPath();c.moveTo(x,y+9);c.bezierCurveTo(x-8,y+3,x+8,y-4,x+Math.sin(time*2+k)*5,y-12);c.strokeStyle=k%2?'#a18b63':ink;c.lineWidth=.8+k%2*.25;c.stroke();c.restore();
     }
     line(c,[[-24,-10],[-19,-19],[15,-19],[24,-10],[-24,-10],[-19,7],[18,7],[24,-10]],'#946313',1.4);
     for(let k=0;k<3;k++){const wiggle=reduced.matches?0:Math.sin(time*3+k*1.7)*2;c.beginPath();c.moveTo(-20,-6+k*3);c.bezierCurveTo(-10,-13+wiggle,0,3-k*2,8,-5+k);c.bezierCurveTo(13,-10+wiggle,21,0,25,-3+k*2);c.strokeStyle=k===1?olive:'#b59350';c.lineWidth=1.15;c.stroke();}
     for(let k=0;k<4;k++)line(c,[[-12+k*7,-15],[-10+k*7,-14]],'#ba9b60',.7);
     state.steamWisps=5;
    }
    },{rescue:true});
    c.restore();atoms[j].words.forEach((word,i)=>{if(j>=3||i===0)text(c,word,x,y+i*20,18);});
    if(gameLinks[j]){const link=gameLinks[j];link.style.left=(a.el.offsetLeft+ox+x*s)+'px';link.style.top=(a.el.offsetTop+oy+(y+20)*s)+'px';link.style.fontSize=Math.max(18*1.06*s,15)+'px';link.style.opacity=String(growth);link.style.visibility=growth>.98?'visible':'hidden';}
    if(selected){const spread=20+Math.sin(phase*Math.PI)*23;line(c,[[x-spread,y+26],[x-7,y+28],[x+spread,y+25]],olive,1.1);}
   }
   c.restore();
   // A tiny desk grown out of the same floor. Deliberately uneven, never blurry.
   const typing=time%6<4.8,clank=reduced.matches?0:[0,.8,-.5][Math.floor(time*5)%3];
   line(c,[[112,307],[114,293],[145,292],[145,305]],olive,1);
   line(c,[[126,291],[126,310],[118,311]],ink,1.4);
   drawMeowl(c,140,294,59,{id:'thoughtful',time,mode:'watch',parkour:{kind:typing?'typing':'wave'},look:typing?3:Math.sin(time*.7),voice:sfx.mouth('thoughtful')});
   line(c,[[154,305],[157,282],[252,283],[255,307]],ink,1.3);
   c.save();c.translate(0,clank);
   line(c,[[199,275],[215,273],[210,264],[210,258]],ink,1.1);
   c.beginPath();c.moveTo(180,233);c.lineTo(239,230);c.lineTo(242,262);c.lineTo(181,264);c.closePath();c.fillStyle=paper;c.fill();c.strokeStyle=ink;c.lineWidth=1.5;c.stroke();
   line(c,[[186,238],[234,236],[235,256],[186,258],[186,238]],olive,.8);
   // Tiny stars, a wandering kitten cursor and stepped loading bars.
   const screenPhase=Math.floor(time/3)%3;state.screenPhase=screenPhase;state.typing=typing;
   if(screenPhase===0){for(let i=0;i<3;i++)line(c,[[191,242+i*5],[191+((Math.floor(time*5)+i*4)%28),242+i*5]],olive,1.2);}
   else if(screenPhase===1){const x=210+Math.sin(time*2)*8;line(c,[[x-6,250],[x-6,240],[x-2,244],[x+2,242],[x+6,239],[x+7,250],[x-6,250]],ink,1);c.fillRect(x-3,246,1.3,1.3);c.fillRect(x+3,245,1.3,1.3);}
   else{line(c,[[195,253],[219,251],[226,241]],olive,1.4);for(let i=0;i<2;i++){const x=194+i*30;line(c,[[x-2,242],[x+2,242],[x,239],[x,245]],ink,.8);}}
   c.restore();
   line(c,[[158,276],[192,277],[196,282],[156,281],[158,276]],ink,1.2);
   for(let i=0;i<7;i++){const press=typing&&!reduced.matches&&Math.floor(time*9)%7===i?1.7:0;line(c,[[160+i*4,277+press],[162+i*4,277+press]],ink,1.1);}
   line(c,[[210,282],[215,293],[229,299],[229,308]],olive,.8);
   line(c,[[243,280],[250,279],[251,272],[244,272],[243,280]],ink,1);line(c,[[250,273],[255,274],[254,277],[250,277]],ink,.8);
   if(typing)sfx.beat('desk-keys',Math.floor(time*5.5),'click',{id:'thoughtful-keys',level:.22});
   note.textContent='a few things taking up brain space.';state.atoms=atoms;
   sfx.chirp('thoughtful',time,[13,19]);
  }else{
   const raw=inputs[round%inputs.length],clean=normalise(raw),hit=['grand design','remarkable'].find(word=>clean.includes(normalise(word)));
   state.raw=raw;state.normalised=clean;state.hit=hit||null;
   toyProp(c,'tooltip',125,141,204,88,(c)=>{line(c,[[23,54],[223,55],[226,141],[22,140],[23,54]]);text(c,'captured tooltip text',124,78,14);text(c,raw,124,116,21);});
   if(phase>1.6){text(c,'normalise',338,83,16);text(c,clean,338,115,19);line(c,[[230,111],[248,115],[254,105]],olive);}
   if(phase>3.2){text(c,hit?'target found. stop.':'no target. keep looking.',261,185,22);sfx.beat('ocr-result',round,'data',{level:.4});}
   drawMeowl(c,140+Math.sin(time*1.4)*36,307,79,{id:'ocr',hat:'goldrim',time,mode:hit&&phase>3.2?'happy':'scurry',speed:65,voice:sfx.mouth('ocr')});
   line(c,[[225,141],[251,222],[350,264],[390,308]],'#a19986',.8);
   note.textContent='sample OCR output → clean confusable letters → check target → stop on a match.';
   sfx.chirp('ocr',time,[12,18]);
  }
  c.restore();
 }
 return {state,draw,advance(dt){
  state.clock+=dt;
  const cycle=Math.floor(state.clock/SHUFFLE_SECONDS);
  if(interests&&cycle!==shuffleCycle){shuffleCycle=cycle;frontCard=pickPokerCard();}
 }};
}
