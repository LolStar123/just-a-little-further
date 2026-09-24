import {projects} from './creations.js';
import {families,priceSamples,priceSummary} from './poe-statistics.js';
import {inkPath,smoothTrail} from './ink-path.js';
import {drawMeowl} from './little-creatures.js';
import {toyProp,toyBusy} from './toy-interactions.js';
import {metrics,matchesFor,distribution} from './match-statistics.js';
const woven=!!window.frameElement?.classList.contains('sketch-demo');
const ink='#535248',soft='#a19986',paper='#eeeae0',gold='#a08a57';
const paperTitles=['fluid mechanics','options pricing','gamma scalping','market microstructure','stochastic calculus','optimal execution','statistical arbitrage','rough volatility','order flow','portfolio construction','causal inference','Bayesian learning','risk premia','limit order books','volatility surfaces','Monte Carlo methods','regime detection','information theory','mean reversion','momentum signals','jump diffusion','liquidity risk','agent simulations','extreme value theory','dynamic hedging','numerical optimisation','network effects','term structure','signal processing','entropy estimation','reinforcement learning','market impact'];
const auraStyles=[{name:'Celestial Aura',file:'celestial_aura_effect.png',color:'#796098',kind:'orbit'},{name:'Celestial Aura III',file:'celestial_aura_effect_iii.png',color:'#8767a0',kind:'nova'},{name:'Divine Righteous Fire',file:'divine_righteous_fire_effect.png',color:'#b19150',kind:'fire'}];
const specs={
 poe:['prices become probabilities','try another item family','sample prices / no live trade quotes'],
 scraper:['papers to walk-forward tests','collect another paper','sample reading list'],
 pipeline:['market data to walk-forward tests','shuffle the data','sample market data'],
 smoothtato:['less clutter. more wardrobe.','change the preset','presets from the app'],
 mtxtato:['a little aura goes a long way','change the effect','effects from the app catalogue'],
 tfl:['the Tube gets a leaderboard','delay a different line','sample service history'],
 commute:['a week of getting there','add a commute day','example fares / check current prices before buying'],
 deadlock:['what actually changes the odds?','','sample matches / association, not causation'],
 baxter:['one helper is never enough','send another task','example task / no live agent run']
};
export function miniScene(scene,canvas,wake,sfx){
 const $=s=>document.querySelector(s),spec=specs[scene]||specs.pipeline;
 $('.caption').textContent=spec[0];
 $('#scene').innerHTML=`<canvas class="toy mini-toy" id="mini-art" aria-label="${spec[0]}"></canvas><p class="toy-note" id="toy-note" aria-live="polite"></p><p class="disclosure">${spec[2]}</p>`;
 if(scene==='deadlock')$('#toy-note').hidden=true;
 if(scene==='baxter'){
  const note=document.createElement('aside');note.className='baxter-favourite';note.innerHTML='<svg viewBox="0 0 90 92" aria-hidden="true"><path d="M79 80 C42 88 17 64 34 48 C52 31 63 63 42 62 C12 60 13 23 59 14 M40 12 Q52 13 61 13 Q62 23 63 34"/></svg><span>my fav<br><b>meowlz</b></span>';
  $('#scene').append(note);
 }
 const artHeight=['deadlock','poe'].includes(scene)?430:scene==='tfl'?380:330;
 const a=canvas('mini-art'),state={scene,choice:0,actions:0,cycles:0,elapsed:0,clock:0,routeTime:0,transition:1},note=$('#toy-note');
 let previous=null,paperBag=[];const counts={scraper:paperTitles.length,pipeline:5,smoothtato:4,mtxtato:3,tfl:6,commute:5,deadlock:6,baxter:4,poe:3};
 const duration={scraper:2.5,pipeline:4.2,smoothtato:5/1.5,mtxtato:5,tfl:7,commute:4.5,deadlock:6,baxter:10,poe:6}[scene]||5;
 const auraImages=['smoothtato','mtxtato'].includes(scene)?auraStyles.map(style=>{const image=new Image();image.onload=()=>{draw();wake();};image.src='assets/mtx/'+style.file;return image;}):[];
 const presets=['Original','Performance','League Start','Barebones'];
 const deadlockStats=metrics.map(m=>m.name);
 let priceKey='',prices=[],priceIncoming=[],priceDomain=[],priceUpdates=0,priceCount=-1,priced=null;
 let matchKey='',matches=[],incoming=[],domain=[],distributionCount=-1,measured=null,windowUpdates=0;
 state.ratings=Array(6).fill(1000);state.ratingTargets=Array(6).fill(1000);state.lastTrainEvent=-1;
 function caption(){
  const n=state.choice;
  note.textContent=({poe:["Watcher's Eye",'Timeless jewels','Sublime Vision'][n%3]+' / prices to risk sheets.',scraper:paperTitles[n]+' / collecting paper '+(state.cycles+1)+'.',pipeline:'clean market data. test on the next unseen period.',smoothtato:presets[n]+': '+['all effects visible.','particles and bloom off.','decorative props and skill FX off.','shadows, reflections and fog off.'][n],mtxtato:auraStyles[n%3].name,tfl:['Central','Victoria','Northern'][n%3]+' is delayed. each checkpoint updates the ratings.',commute:(n%5+1)+' days: '+((n%5+1)*6===24?'both cost the same in this example.':((n%5+1)*6<24?'single journeys':'the weekly ticket')+' cost less in this example.'),deadlock:'',baxter:['baxter sorts the request','the product manager scopes it','the developer builds it','the verifier checks it'][Math.min(3,Math.floor(state.elapsed/2.4))]})[scene];
 }
 function change(manual=false){
  if(!['scraper','tfl'].includes(scene)){previous=document.createElement('canvas');previous.width=a.el.width;previous.height=a.el.height;previous.getContext('2d').drawImage(a.el,0,0);}
  const choices=Array.from({length:counts[scene]||3},(_,i)=>i).filter(i=>i!==state.choice);
  if(scene==='scraper'){
   if(!paperBag.length){paperBag=choices;for(let i=paperBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[paperBag[i],paperBag[j]]=[paperBag[j],paperBag[i]];}}
   state.choice=paperBag.pop();
  }else state.choice=choices[Math.floor(Math.random()*choices.length)];
  state.cycles++;if(manual)state.actions++;
  if(scene!=='scraper'||!manual)state.elapsed=0;state.transition=['scraper','tfl'].includes(scene)?1:0;caption();draw();wake();
 }
 caption();
 if(scene==='poe'||scene==='deadlock'){
  const details=document.createElement('details');details.className='stat-method';
  const summary=document.createElement('summary');summary.textContent=scene==='poe'?'from trade logs to a buying decision':'from match data to a useful comparison';
  const paragraph=document.createElement('p');paragraph.textContent=projects[scene].description;
  details.append(summary,paragraph);$('#scene').append(details);
 }

 function path(c,pts,color=ink,width=1.3){inkPath(c,pts,color,width);}
 function label(c,text,x,y,size=15){text=String(text).toLowerCase();const scale=Math.min(a.w/480,a.h/artHeight);c.fillStyle=ink;c.font=Math.max(size*1.06,15/Math.max(.1,scale))+'px Reader,Georgia,serif';c.textAlign='center';const half=c.measureText(text).width/2;x=Math.max(half+4,Math.min(476-half,x));c.fillText(text,x,y);}
 let paperIndex=0;
 function page(c,x,y,w=52,h=64){const id='paper-'+paperIndex++;toyProp(c,id,x+w/2,y+h,w,h,(c)=>{path(c,[[x,y],[x+w,y+2],[x+w-2,y+h],[x+1,y+h-2],[x,y]]);for(let j=0;j<4;j++)path(c,[[x+9,y+15+j*9],[x+w-10-j%2*9,y+14+j*9]],soft,.7);});}
 function urn(c,x,y){
  c.save();c.translate(x,y);c.beginPath();c.moveTo(-12,-29);c.lineTo(12,-29);c.lineTo(10,-23);
  c.bezierCurveTo(19,-20,19,-15,16,-1);c.quadraticCurveTo(14,12,5,16);c.lineTo(-5,16);
  c.quadraticCurveTo(-16,12,-17,-2);c.bezierCurveTo(-20,-18,-14,-19,-10,-23);c.closePath();
  c.fillStyle='#a4beb5';c.fill();c.strokeStyle=ink;c.lineWidth=1.15;c.stroke();
  path(c,[[-14,-29],[-14,-33],[0,-35],[14,-32],[14,-29],[-14,-29]],ink,1);
  for(const side of [-1,1]){
   path(c,[[side*7,14],[side*15,19],[side*12,26],[side*15,28]],ink,1.2);
   const pts=[];for(let i=0;i<=12;i++)pts.push([side*7+Math.sin(i*.8)*3,-20+i*2.7]);path(c,pts,'#687e76',.7);
  }
  path(c,[[-6,17],[0,13],[6,17]],ink,.8);c.restore();
 }
 function statProp(c,n,x,y){
  toyProp(c,'match-token',x,y+9,38,40,(c)=>{
   c.save();c.translate(x,y);
   if(n===5)urn(c,0,-7);
   else if(n===0){c.beginPath();c.moveTo(0,-25);c.bezierCurveTo(-20,-8,-14,14,1,10);c.bezierCurveTo(18,6,12,-10,0,-25);c.fillStyle='#a4beb5';c.fill();c.strokeStyle=ink;c.stroke();path(c,[[-4,-4],[1,-8],[5,-3]],ink,.8);}
   else if(n===1)path(c,[[-19,-13],[18,-13],[18,-8],[3,-7],[-1,6],[-8,6],[-7,-6],[-19,-7],[-19,-13]],ink,1.7);
   else if(n===2){path(c,[[-12,9],[-11,-23],[-6,-23],[-6,-17],[0,-17],[0,-23],[6,-23],[6,-17],[12,-17],[13,9],[-12,9]],ink,1.4);path(c,[[-3,9],[-3,-1],[3,-1],[3,9]],soft,1);}
   else if(n===3){path(c,[[-19,5],[-12,-8],[-2,2],[8,-15],[18,-19]],gold,1.5);path(c,[[10,-19],[18,-19],[17,-11]],gold,1.5);}
   else{c.beginPath();c.ellipse(0,-10,13,15,0,0,Math.PI*2);c.fillStyle=paper;c.fill();c.strokeStyle=ink;c.stroke();for(const xx of [-5,5]){c.beginPath();c.arc(xx,-12,3,0,7);c.fillStyle=ink;c.fill();}path(c,[[-6,1],[-6,7],[6,7],[6,1]],ink,1);}
   c.restore();
  });
 }
 const levels={scraper:253,pipeline:221,poe:400,smoothtato:251,mtxtato:251,tfl:354,commute:308,deadlock:400,baxter:235};
 const floorLevel=levels[scene]||295;
 const floorShapes={poe:[[0,306],[100,306],[150,283],[218,283],[258,306],[480,306]],scraper:[[0,253],[32,253],[156,250],[295,255],[448,251],[480,253]],smoothtato:[[0,251],[55,251],[80,234],[175,234],[210,251],[280,251],[310,225],[400,225],[435,251],[480,251]],mtxtato:[[0,251],[58,251],[160,225],[320,225],[422,251],[480,251]]};
 const floorPoints=smoothTrail(floorShapes[scene]||[[0,floorLevel],[120,floorLevel-1],[260,floorLevel+1],[380,floorLevel-1],[480,floorLevel]]);
 function floorAt(x){let i=0;while(i<floorPoints.length-2&&floorPoints[i+1][0]<x)i++;const a=floorPoints[i],b=floorPoints[i+1],t=Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])));return a[1]+(b[1]-a[1])*t;}
 function owl(c,x,y,id='mini',size=55,extra={}){
  if(!['deadlock','poe'].includes(scene))return drawMeowl(c,x,floorAt(x),size,{id:scene+id,voice:sfx.mouth(scene+id),time:state.clock,speed:scene==='commute'?25:0,...extra,ground:floorAt});
  return drawMeowl(c,x,y,size,{id:scene+id,voice:sfx.mouth(scene+id),time:state.clock,...extra});
 }

 function audioEvents(){
  const t=state.elapsed,clock=state.clock,n=state.choice;
  const voiceId={scraper:'mini',pipeline:'sort',poe:'research',mtxtato:'effect',commute:'commuter',deadlock:'analyst'}[scene];
  if(scene==='smoothtato'){sfx.chirp('smoothtatoeffect-clear',clock,17);sfx.chirp('smoothtatoeffect-aura',clock+3,19);}
  if(voiceId)sfx.chirp(scene+voiceId,clock,['poe','deadlock'].includes(scene)?18:13);
  if(scene==='scraper'){const lap=Math.floor(state.routeTime/2.5),placing=state.routeTime%2.5>=1.625;sfx.beat('paper-handoff',lap+':'+(placing?'place':'grab'),'paper',{id:'paper-handoff',level:placing?1.12:1});}
  if(scene==='scraper'){sfx.chirp('scrapersort',clock+3,17);sfx.beat('research-data',Math.floor(clock/1.4),'data',{level:.45});}
  if(scene==='pipeline'&&t<3.3)sfx.beat('shuffle',state.cycles+':'+Math.floor(t/(t<.9?.42:.65)),'data',{level:.65});
  if(scene==='commute')sfx.beat('steps',Math.floor(clock*3.2),'step',{level:.55});
  if(scene==='tfl')sfx.beat('chug',Math.floor(clock/1.85),'train',{level:.85});
  if(scene==='mtxtato')sfx.beat('glow',state.cycles,'aura',{style:n,level:.5});
  if(scene==='smoothtato')sfx.beat('glow',state.cycles,'aura',{style:n,level:n===0?.55:.275});
  if(scene==='baxter'){
   const carrier=Math.min(3,Math.floor(t/2.4));
   if(t<8.4)sfx.beat('waddle',Math.floor(clock*4),'step',{level:.6});
   sfx.beat('pass',state.cycles+':'+carrier,'paper',{level:.9});
   // Each colleague answers their own handoff, rather than all four mouths sharing a clock.
   for(let i=0;i<4;i++)if(t>i*2.4+.22&&t<i*2.4+.72)sfx.beat('worker'+i,state.cycles,'meow',{id:'baxterworker'+i});
  }
 }
 function draw(){
  paperIndex=0;
  if(!a.w||!a.h)return;a.clear();const c=a.c;
  if(previous&&state.transition<1){c.save();c.globalAlpha=1-state.transition;c.drawImage(previous,0,0,a.w,a.h);c.restore();}
  const s=Math.min(a.w/480,a.h/artHeight);c.save();c.translate((a.w-480*s)/2,(a.h-artHeight*s)/2);c.scale(s,s);c.globalAlpha=state.transition;
  const floor=floorLevel;
  const anchor=((a.h-artHeight*s)/2+floor*s).toFixed(2);if(a.el.dataset.threadY!==anchor){a.el.dataset.threadY=anchor;if(woven)parent.dispatchEvent(new Event('ink-anchors'));}
  // Loose stems join each stationary drawing to the page's travelling stroke.
  // Moving papers, trains and creatures remain free to move through that world.
  const stems={poe:[],scraper:[[24,147,12,234,40,253],[237,164,246,240,257,253],[463,167,470,240,448,251]],pipeline:[[42,195,12,286,40,295],[441,220,468,287,437,295]],smoothtato:[[135,223,123,250,160,251],[350,223,377,249,403,251]],mtxtato:[[26,103,12,238,58,251],[348,225,387,250,420,251]],tfl:[],commute:[[42,102,15,311,40,328],[404,102,460,304,433,328]],baxter:[]}[scene]||[];
  c.beginPath();for(const [x,y,cx,cy,ex,ey]of stems){c.moveTo(x,y);c.quadraticCurveTo(cx,Math.min(cy,Math.max(y,floorAt(ex))),ex,floorAt(ex));}c.strokeStyle=soft;c.lineWidth=.65;c.stroke();
  if(!['deadlock','poe'].includes(scene)){
   const points=floorPoints;
   if(!woven)path(c,points,'#656054',1.15);
   const encoded=JSON.stringify(points.map(([x,y])=>[+(x*s+(a.w-480*s)/2).toFixed(2),+(y*s+(a.h-artHeight*s)/2).toFixed(2)]));
   if(a.el.dataset.threadPoints!==encoded){a.el.dataset.threadPoints=encoded;if(woven)parent.dispatchEvent(new Event('ink-anchors'));}
  }
  audioEvents();
  const t=state.elapsed,n=state.choice,u=scene==='scraper'?(state.routeTime%2.5)/2.5:(t%5)/5,e=u*u*(3-2*u);
  if(scene==='poe'){
   const family=families[n%3],count=Math.min(240,Math.floor(t*480)),key=n+':'+state.cycles;
   if(priceKey!==key){priceKey=key;prices=priceSamples(n,state.cycles);priceIncoming=Array.from({length:4},(_,i)=>priceSamples(n,state.cycles+113+i)).flat();const all=[...prices,...priceIncoming].map(r=>r.value),hi=Math.max(...all);priceDomain=[-family.cost*1.6,hi*1.15];priceUpdates=0;priceCount=-1;}
   const entered=Math.max(0,Math.floor((t-.7)*20))*8;
   if(entered>priceUpdates){while(priceUpdates<entered){prices[priceUpdates%240]=priceIncoming[priceUpdates%priceIncoming.length];priceUpdates++;}priceCount=-1;}
   if(priceCount!==count){priced=priceSummary(prices,count,priceDomain,family.cost);priceCount=count;}
   if(priceCount&&priceUpdates!==state.audioPrices){const r=prices[(Math.max(1,priceUpdates)-1)%240];sfx.play('plink',{good:!!r.rare&&r.value>0});state.audioPrices=priceUpdates;}
   const d=priced,fmt=v=>v===null?'...':v.toFixed(2),xFor=v=>28+(v-priceDomain[0])/(priceDomain[1]-priceDomain[0])*424;
   state.metrics={ev:d.ev,netEV:d.netEV,sharpe:d.sharpe,profitFactor:d.profitFactor};
   label(c,family.name,240,29,24);label(c,count+' sampled outcomes',132,61,17);label(c,'cost '+family.cost+'c',385,61,17);
   ['net EV / c','return / risk','profit factor'].forEach((v,i)=>label(c,v,85+i*155,96,16));
   [d.netEV,d.sharpe,d.profitFactor].forEach((v,i)=>label(c,fmt(v),85+i*155,129,30));
   const share=d.tailShare===null?'...':Math.round(d.tailShare*100)+'%';
   label(c,'top 5% = '+share+' of the upside',240,165,18);
   for(let i=0;i<3;i++){const r=prices[(Math.floor(t*5)+i)%prices.length],x=48+i*35,y=198+Math.sin(t*3+i)*3;page(c,x,y,25,31);}
   label(c,Math.round(prices[Math.floor(t*5)%prices.length].price)+'c',96,247,15);
   owl(c,229,242,'research',57,{hat:'goldrim',mode:'carry',cargo:(ctx,grip)=>page(ctx,grip.x-12,grip.y-20,24,28)});
   label(c,'the roll you screenshot',364,246,15);
   const peak=Math.max(1/family.cost*.45,...d.density.map(p=>p[1])),points=d.density.map(([x,y])=>[xFor(x),400-y/peak*125]);
   const perch=points.reduce((a,p)=>Math.abs(p[0]-229)<Math.abs(a[0]-229)?p:a,points[0]);
   c.beginPath();c.moveTo(229,242);c.bezierCurveTo(215,264,247,280,...perch);c.strokeStyle=soft;c.lineWidth=.8;c.stroke();
   // The longest tail really belongs to the best priced outcome in this window.
   if(count){const best=Math.max(...prices.slice(0,count).map(r=>r.value)),bx=xFor(best);c.beginPath();c.moveTo(360,253);c.bezierCurveTo(395,271,bx,287,bx,397);c.strokeStyle=gold;c.lineWidth=.65;c.stroke();path(c,[[bx-3,388],[bx,384],[bx+3,388]],gold,.9);}
   if(!woven)path(c,points,ink,1.15);
   // Rug ticks retain individual prices beneath the frequency landscape.
   for(const r of prices.slice(0,count)){const x=xFor(r.value);path(c,[[x,402],[x,407]],r.value<0?'#aa7562':r.rare?gold:'#879382',.55);}
   const zero=xFor(0);path(c,[[zero,396],[zero,411]],ink,.8);
   label(c,'loss',43,426,14);label(c,'profit per outcome / c',240,426,14);label(c,Math.round(priceDomain[1])+'c',439,426,14);
   const thread=JSON.stringify(points.map(([x,y])=>[+(x*s+(a.w-480*s)/2).toFixed(2),+(y*s+(a.h-artHeight*s)/2).toFixed(2)]));
   if(a.el.dataset.threadPoints!==thread){a.el.dataset.threadPoints=thread;if(woven)parent.dispatchEvent(new Event('ink-anchors'));}
   state.priceDistribution={...d,points,domain:priceDomain,values:prices.slice(0,count).map(r=>r.value),windowUpdates:priceUpdates};
   note.textContent='50k variants. proxy logs. risk sheets.';
  }else if(scene==='scraper'){
   label(c,'collect papers',117,34,20);label(c,'test the idea',359,34,20);
   for(let i=0;i<3;i++)page(c,24+i*9,104-i*5,35,43);
   page(c,180,88,57,76);
   const outbound=u<.65,travel=outbound?u/.65:1-(u-.65)/.35,x=72+108*travel*travel*(3-2*travel);state.runner={x,phase:u,outbound};
   owl(c,x,247,'mini',65,{mode:outbound?'carry':'scurry',overhead:outbound,effort:.84,speed:outbound?150:210,facing:outbound?1:-1,emotion:'worried',cargo:outbound?(ctx,grip)=>page(ctx,grip.x-30,grip.y-63,60,66):null});
   const phase=state.clock%4.2,cycle=Math.floor(state.clock/4.2),progress=Math.min(1,phase/3.5);
   const values=Array.from({length:8},(_,i)=>Math.sin(i*1.1+cycle)*19+Math.cos(i*.6+cycle)*14+45);
   path(c,[[263,92],[263,167],[463,167]],soft,.8);
   path(c,values.slice(0,Math.max(2,Math.ceil(progress*8))).map((v,i)=>[270+i*26,163-v]),ink,1.4);
   path(c,[[366,81],[367,169]],gold,1);
   label(c,'train',307,190,15);label(c,'unseen',419,190,15);
   owl(c,355+Math.sin(state.clock*2)*7,247,'sort',66,{mode:'push',effort:.6,speed:15});
   state.pipeline={raw:values,progress};
   label(c,paperTitles[n],240,291,19);
   state.papersCollected=Math.floor((state.routeTime+.875)/2.5);
   label(c,state.papersCollected+' papers collected',120,318,15);label(c,'walk-forward / costs',359,318,15);

  }else if(scene==='pipeline'){
   const shuffle=Math.floor(t/.42),raw=[7,2,9,4,6,3].map((v,i)=>(v+n*(i+1))%10+1),rank=[...raw].map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v);
   const sorting=Math.max(0,Math.min(1,(t-.9)/2.4)),ease=sorting*sorting*(3-2*sorting);
   const shown=t<.9?raw.map((_,i)=>raw[(i+shuffle)%raw.length]):raw;
   state.pipeline={raw:shown,progress:sorting};
   for(let i=0;i<6;i++)label(c,String(shown[i]),42+(i%2)*35,96+Math.floor(i/2)*42,24);
   path(c,[[115,124],[180,126],[193,106],[228,126],[287,123],[315,125]],soft,1);
   owl(c,241,221,'sort',65,{mode:'push',effort:.6});
   raw.forEach((v,i)=>{const target=rank.findIndex(q=>q.i===i),x=330+(i+(target-i)*ease)*19;toyProp(c,'datum-'+i,x,220,17,v*11,(c)=>path(c,[[x,220],[x,220-v*11]],sorting>0&&sorting<1?gold:ink,4));});
   label(c,'market data',68,265);label(c,'python',230,265);label(c,'walk-forward',378,265);
  }else if(scene==='smoothtato'){
   const t=state.clock; // Continuous motion stays at its original speed while options cycle faster.
   const particles=n===0,props=n<2,fog=n<3;
   label(c,'remove graphics',122,40,19);label(c,'add cosmetics',354,40,19);
   if(fog){c.globalAlpha=state.transition*.22;for(let i=0;i<4;i++){const x=65+i*37+Math.sin(t+i)*7;path(c,[[x-30,107+i%2*26],[x-12,99+i%2*26],[x+18,109+i%2*26],[x+34,104+i%2*26]],soft,6);}c.globalAlpha=state.transition;}
   if(props)for(const x of [37,213])path(c,[[x-10,225],[x-14,205],[x-4,181],[x+10,207],[x+9,225],[x-10,225]],soft,.9);
   c.beginPath();c.ellipse(123,234,79,20,0,0,Math.PI*2);c.strokeStyle='#aa775d';c.lineWidth=1.3;c.stroke();
   owl(c,123,234,'effect-clear',95,{hat:'goldrim',mode:'rest'});
   if(particles)for(let i=0;i<30;i++){const angle=i*.61+t*.9,r=31+i%7*9,x=123+Math.cos(angle)*r,y=177+Math.sin(angle)*r*.65;path(c,[[x-3,y+3],[x,y-5],[x+4,y]],i%2?gold:soft,1.2);}
   const effect=Math.floor(state.clock/(6.3/1.5))%3,style=auraStyles[effect],image=auraImages[effect],cy=225;
   if(image?.complete&&image.naturalWidth)toyProp(c,'aura-gem',424,112,44,44,c=>{c.drawImage(image,402,68,44,44);});
   for(let layer=0;layer<3;layer++){
    const pts=[],radius=68+layer*8;
    for(let j=0;j<=70;j++){const angle=j/70*Math.PI*2+t*(layer%2?.13:-.17),r=radius+(style.kind==='fire'?Math.sin(angle*13+t*6)*5:Math.sin(angle*7+t)*2);pts.push([350+Math.cos(angle)*r,cy+Math.sin(angle)*r*.29]);}
    path(c,pts,layer===1?style.color:gold,layer===1?1.7:.9);
   }
   owl(c,350,225,'effect-aura',100,{hat:'goldrim',mode:'happy'});
   for(let i=0;i<10;i++){const angle=i/10*Math.PI*2+t*.65,x=350+Math.cos(angle)*75,y=cy+Math.sin(angle)*22;if(style.kind==='fire')path(c,[[x-4,y],[x-2,y-12-10*Math.sin(t*6+i)],[x+4,y]],gold,1.2);else{c.beginPath();c.arc(x,y,3+i%3,0,Math.PI*2);c.strokeStyle=style.color;c.stroke();}}
   label(c,presets[n],123,285,17);label(c,['celestial','celestial III','righteous fire'][effect],350,285,17);
   state.preset={name:presets[n],particles,props,fog,telegraph:true};state.aura={name:style.name,imageLoaded:!!image?.naturalWidth};
  }else if(scene==='mtxtato'){
   const style=auraStyles[n],image=auraImages[n],cy=225;
   // The real catalogue image is part of the selector; the wearable effect is animated ink.
   if(image?.complete&&image.naturalWidth)toyProp(c,'aura-gem',60,101,64,64,(c)=>{c.drawImage(image,28,37,64,64);path(c,[[25,34],[96,36],[95,105],[26,103],[25,34]],soft,.7);});
   for(let layer=0;layer<3;layer++){
    const pts=[],radius=79+layer*12;
    for(let j=0;j<=90;j++){const angle=j/90*Math.PI*2+t*(layer%2?.13:-.17),r=radius+(style.kind==='fire'?Math.sin(angle*13+t*6)*6:Math.sin(angle*7+t)*2);pts.push([240+Math.cos(angle)*r,cy+Math.sin(angle)*r*.29]);}
    path(c,pts,layer===1?style.color:gold,layer===1?1.7:.9);
   }
   owl(c,240,225,'effect',111,{hat:'goldrim',mode:'happy'});
   for(let i=0;i<12;i++){
    const angle=i/12*Math.PI*2+t*.65,r=style.kind==='nova'?96:84,x=240+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.3;
    if(style.kind==='fire'){const height=12+10*Math.sin(t*6+i);path(c,[[x-4,y],[x-2,y-height],[x+3,y-7],[x+5,y]],gold,1.2);}
    else{c.beginPath();c.ellipse(x,y,3+i%3,3+i%3,0,0,Math.PI*2);c.strokeStyle=i%3?gold:style.color;c.lineWidth=1;c.stroke();if(i%3===0)path(c,[[x-7,y],[x+7,y]],gold,.7);}
   }
   if(style.kind==='nova')for(let i=0;i<6;i++){const y=209-((t*20+i*23)%125),x=240+Math.sin(i*2.4+t*.4)*56;path(c,[[x,y+5],[x+2,y],[x+3,y+5]],style.color,.9);}
   state.aura={name:style.name,imageLoaded:!!image?.naturalWidth};

  }else if(scene==='tfl'){
   const names=['central','victoria','northern','jubilee','district','piccadilly'],colors=['#a76b5e','#7099a3','#72716b','#93948d','#7b8d6c','#6d7f9e'];
   label(c,'reliability elo',397,24,16);
   for(let i=0;i<6;i++){
    const y=51+i*32;path(c,[[132,y],[339,y]],colors[i],1.2);
    for(let j=0;j<4;j++){c.beginPath();c.arc(140+j*63,y,2,0,Math.PI*2);c.fillStyle=paper;c.fill();c.stroke();}
    const phase=(state.routeTime/4+i*.19)%1,x=140+(i===n%6?Math.min(phase,.40):phase)*189;
    toyProp(c,'train-'+i,x,y-2,25,16,(c)=>path(c,[[x-10,y-12],[x+10,y-11],[x+11,y-2],[x-9,y-2],[x-10,y-12]],ink,1.3));
    label(c,names[i],64,y+4,16);label(c,String(Math.round(state.ratings[i])),408,y+5,20);
   }
   const q=state.routeTime%8,round=Math.floor(state.routeTime/8),days=[1,5,2,4,3][round%5],pay=days*6,weekly=24;
   const tie=pay===weekly,winning=pay<=weekly?0:1,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
   const leftX=113,rightX=372,home=242,near=[204,281];
   let cx=home,moving=false,side=winning;
   if(q<2.1){cx=home+(near[winning]-home)*smooth((q-.65)/1.45);moving=q>.65;}
   else if(tie&&q>3.05&&q<4.35){side=1;cx=near[0]+(near[1]-near[0])*smooth((q-3.05)/1.3);moving=true;}
   else if(q<5.35){side=tie&&q>=4.35?1:winning;cx=near[side];}
   else {side=tie?1:winning;cx=near[side]+(home-near[side])*smooth((q-5.35)/2);moving=q<7.35;}
   if(reduced){cx=home;moving=false;}
   const stampTimes=tie?[2.2,4.45]:[winning===0?2.2:99,winning===1?2.2:99];
   const stamped=stampTimes.map(at=>q>=at+.18),stamping=stampTimes.some(at=>q>=at-.15&&q<at+.38);
   label(c,days+(days===1?' day':' days')+' this week',240,248,18);
   function ticket(ctx,x,y,index){
    const tilt=(index?1:-1)*.035;ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
    ctx.beginPath();ctx.moveTo(-53,-31);ctx.lineTo(53,-29);ctx.lineTo(51,-10);ctx.quadraticCurveTo(41,-6,51,-1);ctx.lineTo(53,43);ctx.lineTo(-52,41);ctx.lineTo(-50,5);ctx.quadraticCurveTo(-41,0,-51,-5);ctx.closePath();ctx.fillStyle=paper;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='17px Reader,Georgia,serif';ctx.fillText(index?'week pass':'pay as you go',0,-9);ctx.font='23px Reader,Georgia,serif';ctx.fillText('£'+(index?weekly:pay),0,15);
    for(let j=0;j<7;j++)path(ctx,[[33+j*2.1,21],[33+j*2.1,27]],soft,j%2?.65:1);
    if(stamped[index]){const age=q-stampTimes[index]-.18,pop=reduced?1:1+Math.exp(-age*9)*Math.sin(age*21)*.14;ctx.save();ctx.translate(0,29);ctx.rotate(-.12);ctx.scale(pop,pop);ctx.strokeStyle='#687a58';ctx.lineWidth=1.5;ctx.strokeRect(-35,-8,70,20);ctx.fillStyle='#687a58';ctx.font='bold 15px Reader,Georgia,serif';ctx.fillText(tie?'either!':'this one',0,7);ctx.restore();}
    ctx.restore();
   }
   for(let i=0;i<2;i++){
    const tx=i?rightX:leftX,arrival=reduced?0:Math.exp(-q*6)*Math.sin(q*14)*5;
    toyProp(c,'fare-ticket-'+i,tx,345,110,78,ctx=>ticket(ctx,tx,301+arrival,i));
   }
   owl(c,cx,354,'conductor',65,{mode:stamping?'push':moving?'walk':stamped[side]?'happy':'watch',speed:moving?52:0,facing:side===0?-1:1,effort:stamping?.8:.15,costume:'verifier',emotion:stamped[side]?'happy':'curious',cargo:stamping?(ctx,g)=>{path(ctx,[[g.x-7,g.y-12],[g.x+7,g.y-12],[g.x+7,g.y-5],[g.x+2,g.y-5],[g.x+2,g.y+3],[g.x+12,g.y+3],[g.x+12,g.y+9],[g.x-12,g.y+9],[g.x-12,g.y+3],[g.x-2,g.y+3],[g.x-2,g.y-5],[g.x-7,g.y-5],[g.x-7,g.y-12]],ink,1.2);}:null});
   for(let i=0;i<2;i++){
    const age=q-stampTimes[i],tx=i?rightX:leftX;
    if(!reduced&&age>=0&&age<.45){const hit=Math.sin(Math.min(1,age/.18)*Math.PI/2),lift=age>.18?(age-.18)*90:0;ctxStamp(c,tx,280+hit*18-lift,1-age/.45);}
    if(!reduced&&age>.18&&age<.75)for(let j=0;j<5;j++){const a=-Math.PI+j*Math.PI/4,r=14+(age-.18)*32,px=tx+Math.cos(a)*r,py=317+Math.sin(a)*r;path(c,[[px,py],[px+Math.cos(a)*4,py+Math.sin(a)*4]],gold,.9);}
    if(age>=.18)sfx.beat('fare-stamp-'+i,round,'place',{level:.23});
   }
   function ctxStamp(ctx,x,y,alpha){ctx.save();ctx.globalAlpha*=Math.max(0,alpha);path(ctx,[[x-9,y-27],[x+9,y-27],[x+7,y-16],[x+3,y-15],[x+3,y-6],[x+22,y-6],[x+22,y],[x-22,y],[x-22,y-6],[x-3,y-6],[x-3,y-15],[x-7,y-16],[x-9,y-27]],ink,1.8);ctx.restore();}
   if(stamped[winning])label(c,tie?'same fare. take either.':'£'+Math.abs(pay-weekly)+' stays in your pocket',240,377,16);
   path(c,[[132,51],[123,153],[128,218],[51,243],[52,335],[65,354]],soft,.65);
   sfx.chirp('tflconductor',state.clock,[14,22]);
   if(moving)sfx.beat('fare-waddle',Math.floor(state.routeTime*3),'step',{level:.25});
   state.commute={days,pay,weekly,cheapest:Math.min(pay,weekly),phase:q,stamped,conductorX:cx,tie};
   note.textContent='';
  }else if(scene==='commute'){
   const days=n%5+1,pay=days*6,weekly=24,max=32;
   for(let i=0;i<5;i++){page(c,42+i*78,44,50,58);label(c,['M','T','W','T','F'][i],67+i*78,127);if(i<days)path(c,[[52+i*78,71],[62+i*78,82],[81+i*78,56]],gold,2);}
   label(c,'journeys',71,193);path(c,[[130,188],[130+pay/max*230,188]],pay<weekly?gold:soft,7);label(c,String(pay),406,195,22);
   label(c,'week ticket',71,240);path(c,[[130,234],[130+weekly/max*230,234]],weekly<=pay?gold:soft,7);label(c,String(weekly),406,240,22);
   owl(c,132+e*214,308,'commuter',45);
  }else if(scene==='deadlock'){
   const total=400,sample=Math.min(total,Math.floor(t*800)),metric=metrics[n],key=n+':'+state.cycles;
   if(matchKey!==key){matchKey=key;matches=matchesFor(n,state.cycles,0,true);incoming=Array.from({length:4},(_,i)=>matchesFor(n,state.cycles+997+i,0,true)).flat();const values=[...matches,...incoming].map(m=>m.value),lo=Math.min(...values),hi=Math.max(...values),pad=(hi-lo)*.20;domain=[lo-pad,hi+pad];distributionCount=-1;windowUpdates=0;}
   // Independent random records replace the window at its existing speed.
   // Fixed bins jitter from real counts, without ordered left/right cohorts.
   const entered=Math.max(0,Math.floor((t-.7)*20))*12;
   if(entered>windowUpdates){while(windowUpdates<entered){matches[windowUpdates%400]=incoming[windowUpdates%incoming.length];windowUpdates++;}distributionCount=-1;}
   if(sample!==distributionCount){measured=distribution(matches,sample,domain);distributionCount=sample;}
   if(sample&&(windowUpdates!==state.audioMatches||sample!==state.audioCount)){const r=matches[(Math.max(1,windowUpdates||sample)-1)%400];sfx.play('plink',{good:r.won&&r.selected&&measured.sd>0&&r.value>measured.mean+1.6*measured.sd});state.audioMatches=windowUpdates;state.audioCount=sample;}
   const d=measured,fmt=v=>v===null?'...':v.toFixed(2),pct=d.probability===null?'...':Math.round(d.probability*100)+'%';
   label(c,deadlockStats[n]+' / '+metric.unit,240,29,24);
   label(c,sample+' matches',112,60,18);label(c,metric.condition,350,60,17);
   for(let i=0;i<total;i++){
    const x=47+i%20*6.3,y=83+Math.floor(i/20)*6.3;
    c.beginPath();c.arc(x,y,1.8,0,Math.PI*2);c.fillStyle=i>=sample?'#d5cfc0':!matches[i].selected?'#b3ac9d':matches[i].won?'#607c6b':'#aa7562';c.fill();
   }
   label(c,pct,350,107,37);label(c,d.wins+' / '+d.selected+' wins',350,132,17);
   label(c,'mean '+fmt(d.mean),350,160,18);label(c,'stdev '+fmt(d.sd),350,185,18);label(c,'excess kurt. '+fmt(d.excess),350,210,17);
   owl(c,218,190,'analyst',46,{mode:'carry',look:2,cargo:(ctx,grip)=>statProp(ctx,n,grip.x,grip.y)});
   label(c,'raw sample frequencies',134,238,16);
   const peak=Math.max(1/(metric.spread*Math.sqrt(2*Math.PI))*1.15,...d.density.map(p=>p[1])),points=d.density.map(([x,y])=>[28+(x-domain[0])/(domain[1]-domain[0])*424,400-y/peak*150]);
   const perch=points.reduce((a,p)=>Math.abs(p[0]-257)<Math.abs(a[0]-257)?p:a,points[0]);c.beginPath();c.moveTo(218,190);c.bezierCurveTo(239,195,250,218,...perch);c.strokeStyle=soft;c.lineWidth=.8;c.stroke();
   // The parent traces these same points as part of the single landscape stroke.
   if(!woven)path(c,points,ink,1.15);path(c,[[28,400],[452,400]],soft,.45);
   const px=v=>28+(v-domain[0])/(domain[1]-domain[0])*424;
   if(d.mean!==null){path(c,[[px(d.mean),400],[px(d.mean),404]],ink,1);}
   label(c,domain[0].toFixed(0),40,423,14);label(c,metric.unit,240,423,14);label(c,domain[1].toFixed(0),439,423,14);
   label(c,'peak '+Math.max(...d.density.map(p=>p[1])).toFixed(3),360,239,14);
   const thread=JSON.stringify(points.map(([x,y])=>[+(x*s+(a.w-480*s)/2).toFixed(2),+(y*s+(a.h-artHeight*s)/2).toFixed(2)]));
   if(a.el.dataset.threadPoints!==thread){a.el.dataset.threadPoints=thread;if(woven)parent.dispatchEvent(new Event('ink-anchors'));}
   state.conditional={stat:deadlockStats[n],sample:d.selected,counted:sample,wins:d.wins,probability:d.probability,urn:n===5};
   state.distribution={...d,metric:metric.name,unit:metric.unit,values:matches.slice(0,sample).map(m=>m.value),points,windowUpdates,densityScale:peak};
  }else{
   const names=['baxter','product manager','developer','verifier'],home=[49,174,299,424],leg=Math.min(2,Math.floor(t/2.4)),q=Math.min(1,(t-leg*2.4)/2.4),travel=Math.min(1,q/.78),ease=travel*travel*(3-2*travel),done=t>=7.2;
   const carrier=done?3:leg,positions=[...home];
   // Each helper walks back to their desk after passing the sheet wing to wing.
   for(let i=0;i<carrier;i++){const returned=Math.min(1,Math.max(0,(t-(i+1)*2.4)/1.2));positions[i]=home[i+1]-42+(home[i]-(home[i+1]-42))*returned;}
   if(!done)positions[carrier]=home[carrier]+(home[carrier+1]-42-home[carrier])*ease;
   for(let i=0;i<4;i++){
    const carrying=i===carrier,walking=!done&&i===carrier&&travel<1||i<carrier&&t-(i+1)*2.4<1.2;
    const reach=carrying&&!done?Math.max(0,Math.min(1,(q-.80)/.20))*42/.65:0;
    owl(c,positions[i],235,'worker'+i,65,{costume:['baxter','product-manager','developer','verifier'][i],mode:carrying?'carry':walking?'walk':'watch',speed:walking?65:0,facing:i<carrier&&walking?-1:1,cargoOffset:reach,cargo:carrying?(ctx,grip)=>page(ctx,grip.x-15,grip.y-28,30,37):null});
    if(i===1){label(c,'product',home[i],271,15);label(c,'manager',home[i],288,15);}else label(c,names[i],home[i],276,i===0?18:15);
   }
   state.relay={carrier,positions,sheetOwner:carrier,handOff:!done&&travel===1};

   if(done){path(c,[[398,104],[410,115],[435,86]],gold,2);label(c,'checked',412,70,19);}
  }
  c.restore();
 }
 return{state,draw,advance(dt){const movementDt=toyBusy(a.el)?0:dt;state.elapsed+=movementDt;state.routeTime+=movementDt;state.clock+=dt;state.transition=Math.min(1,state.transition+dt/.45);if(state.elapsed>=duration)change();if(scene==='baxter')caption();
  if(scene==='tfl'){
   const event=Math.floor(state.routeTime/.8);
   if(event!==state.lastTrainEvent){
    state.lastTrainEvent=event;const loser=state.choice,winner=(loser+1+event%5)%6,expected=1/(1+10**((state.ratingTargets[loser]-state.ratingTargets[winner])/400)),delta=18*(1-expected);
    state.ratingTargets[winner]+=delta;state.ratingTargets[loser]-=delta;state.ratingTargets=state.ratingTargets.map(v=>Math.max(100,Math.min(3500,v+(1000-v)*.002)));
   }
   state.ratings=state.ratings.map((v,i)=>v+(state.ratingTargets[i]-v)*(1-Math.exp(-dt*7)));
  }}};
}
