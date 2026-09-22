import {projects} from './creations.js';
import {families,priceSamples,priceSummary} from './poe-statistics.js';
import {inkPath,smoothTrail} from './ink-path.js';
import {drawMeowl} from './little-creatures.js';
import {metrics,matchesFor,distribution} from './match-statistics.js';
const woven=!!window.frameElement?.classList.contains('sketch-demo');
const ink='#535248',soft='#a19986',paper='#eeeae0',gold='#a08a57';
const paperTitles=['fluid mechanics','options pricing','gamma scalping','market microstructure','stochastic calculus','optimal execution','statistical arbitrage','rough volatility','order flow','portfolio construction','causal inference','Bayesian learning','risk premia','limit order books','volatility surfaces','Monte Carlo methods','regime detection','information theory','mean reversion','momentum signals','jump diffusion','liquidity risk','agent simulations','extreme value theory','dynamic hedging','numerical optimisation','network effects','term structure','signal processing','entropy estimation','reinforcement learning','market impact'];
const auraStyles=[{name:'Celestial Aura',file:'celestial_aura_effect.png',color:'#796098',kind:'orbit'},{name:'Celestial Aura III',file:'celestial_aura_effect_iii.png',color:'#8767a0',kind:'nova'},{name:'Divine Righteous Fire',file:'divine_righteous_fire_effect.png',color:'#b19150',kind:'fire'}];
const specs={
 poe:['prices become probabilities','try another item family','sample prices / no live trade quotes'],
 scraper:['collecting papers','collect another paper','sample reading list'],
 pipeline:['market data to walk-forward tests','shuffle the data','sample market data'],
 smoothtato:['less clutter. same meowl.','change the preset','presets from the app'],
 mtxtato:['a little aura goes a long way','change the effect','effects from the app catalogue'],
 tfl:['the Tube gets a leaderboard','delay a different line','sample service history'],
 commute:['a week of getting there','add a commute day','example fares / check current prices before buying'],
 deadlock:['what actually changes the odds?','compare another stat','sample matches / association, not causation'],
 baxter:['one helper is never enough','send another task','example task / no live agent run']
};
export function miniScene(scene,canvas,wake,sfx){
 const $=s=>document.querySelector(s),spec=specs[scene]||specs.pipeline;
 $('.caption').textContent=spec[0];
 $('#scene').innerHTML=`<canvas class="toy mini-toy" id="mini-art" aria-label="${spec[0]}"></canvas><p class="toy-note" id="toy-note" aria-live="polite"></p><div class="controls"><button id="next">${spec[1]}</button></div><p class="disclosure">${spec[2]}</p>`;
 const artHeight=['deadlock','poe'].includes(scene)?430:330;
 const a=canvas('mini-art'),state={scene,choice:0,actions:0,cycles:0,elapsed:0,clock:0,transition:1},note=$('#toy-note');
 let previous=null,paperBag=[];const counts={scraper:paperTitles.length,pipeline:5,smoothtato:4,mtxtato:3,tfl:3,commute:5,deadlock:6,baxter:4,poe:3};
 const duration={scraper:2.5,pipeline:4.2,smoothtato:5,mtxtato:5,tfl:7,commute:4.5,deadlock:6,baxter:10,poe:6}[scene]||5;
 const auraImages=scene==='mtxtato'?auraStyles.map(style=>{const image=new Image();image.onload=()=>{draw();wake();};image.src='assets/mtx/'+style.file;return image;}):[];
 const presets=['Original','Performance','League Start','Barebones'];
 const deadlockStats=metrics.map(m=>m.name);
 let priceKey='',prices=[],priceIncoming=[],priceDomain=[],priceUpdates=0,priceCount=-1,priced=null;
 let matchKey='',matches=[],incoming=[],domain=[],distributionCount=-1,measured=null,windowUpdates=0;
 state.ratings=[1000,1000,1000];state.ratingTargets=[1000,1000,1000];state.lastTrainEvent=-1;
 function caption(){
  const n=state.choice;
  note.textContent=({poe:["Watcher's Eye",'Timeless jewels','Sublime Vision'][n%3]+' / prices to risk sheets.',scraper:paperTitles[n]+' / collecting paper '+(state.cycles+1)+'.',pipeline:'clean market data. test on the next unseen period.',smoothtato:presets[n]+': '+['all effects visible.','particles and bloom off.','decorative props and skill FX off.','shadows, reflections and fog off.'][n],mtxtato:auraStyles[n%3].name,tfl:['Central','Victoria','Northern'][n%3]+' is delayed. each checkpoint updates the ratings.',commute:(n%5+1)+' days: '+((n%5+1)*6===24?'both cost the same in this example.':((n%5+1)*6<24?'single journeys':'the weekly ticket')+' cost less in this example.'),deadlock:'Compare '+deadlockStats[n]+', holding the game stage fixed.',baxter:['baxter sorts the request','the product manager scopes it','the developer builds it','the verifier checks it'][Math.min(3,Math.floor(state.elapsed/2.4))]})[scene];
 }
 function change(manual=false){
  previous=document.createElement('canvas');previous.width=a.el.width;previous.height=a.el.height;previous.getContext('2d').drawImage(a.el,0,0);
  const choices=Array.from({length:counts[scene]||3},(_,i)=>i).filter(i=>i!==state.choice);
  if(scene==='scraper'){
   if(!paperBag.length){paperBag=choices;for(let i=paperBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[paperBag[i],paperBag[j]]=[paperBag[j],paperBag[i]];}}
   state.choice=paperBag.pop();
  }else state.choice=choices[Math.floor(Math.random()*choices.length)];
  state.cycles++;if(manual)state.actions++;
  state.elapsed=0;state.transition=0;caption();draw();wake();
 }
 $('#next').onclick=()=>change(true);caption();
 if(scene==='poe'||scene==='deadlock'){
  const details=document.createElement('details');details.className='stat-method';
  const summary=document.createElement('summary');summary.textContent=scene==='poe'?'from trade logs to a buying decision':'from match data to a useful comparison';
  const paragraph=document.createElement('p');paragraph.textContent=projects[scene].description;
  details.append(summary,paragraph);$('#scene').append(details);
 }

 function path(c,pts,color=ink,width=1.3){inkPath(c,pts,color,width);}
 function label(c,text,x,y,size=15){text=String(text).toLowerCase();const scale=Math.min(a.w/480,a.h/artHeight);c.fillStyle=ink;c.font=Math.max(size,14/Math.max(.1,scale))+'px Reader,Georgia,serif';c.textAlign='center';const half=c.measureText(text).width/2;x=Math.max(half+4,Math.min(476-half,x));c.fillText(text,x,y);}
 function page(c,x,y,w=52,h=64){path(c,[[x,y],[x+w,y+2],[x+w-2,y+h],[x+1,y+h-2],[x,y]]);for(let j=0;j<4;j++)path(c,[[x+9,y+15+j*9],[x+w-10-j%2*9,y+14+j*9]],soft,.7);}
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
 const levels={scraper:253,pipeline:221,poe:400,smoothtato:251,mtxtato:251,tfl:280,commute:308,deadlock:400,baxter:235};
 const floorLevel=levels[scene]||295;
 const floorShapes={poe:[[0,306],[100,306],[150,283],[218,283],[258,306],[480,306]],scraper:[[0,253],[32,253],[156,250],[295,255],[448,251],[480,253]],smoothtato:[[0,251],[80,251],[170,234],[290,234],[422,251],[480,251]],mtxtato:[[0,251],[58,251],[160,225],[320,225],[422,251],[480,251]]};
 const floorPoints=smoothTrail(floorShapes[scene]||[[0,floorLevel],[120,floorLevel-1],[260,floorLevel+1],[380,floorLevel-1],[480,floorLevel]]);
 function floorAt(x){let i=0;while(i<floorPoints.length-2&&floorPoints[i+1][0]<x)i++;const a=floorPoints[i],b=floorPoints[i+1],t=Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])));return a[1]+(b[1]-a[1])*t;}
 function owl(c,x,y,id='mini',size=55,extra={}){
  if(!['deadlock','poe'].includes(scene))return drawMeowl(c,x,floorAt(x),size,{id:scene+id,voice:sfx.mouth(scene+id),time:state.clock,speed:scene==='commute'?25:0,...extra,ground:floorAt});
  return drawMeowl(c,x,y,size,{id:scene+id,voice:sfx.mouth(scene+id),time:state.clock,...extra});
 }

 function audioEvents(){
  const t=state.elapsed,clock=state.clock,n=state.choice;
  const voiceId={scraper:'mini',pipeline:'sort',poe:'research',smoothtato:'effect',mtxtato:'effect',commute:'commuter',deadlock:'analyst'}[scene];
  if(voiceId)sfx.chirp(scene+voiceId,clock,['poe','deadlock'].includes(scene)?18:13);
  if(scene==='scraper')sfx.beat('paper',state.cycles+':'+Math.floor(t/1.25),'paper',{level:.8});
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
  if(!a.w||!a.h)return;a.clear();const c=a.c;
  if(previous&&state.transition<1){c.save();c.globalAlpha=1-state.transition;c.drawImage(previous,0,0,a.w,a.h);c.restore();}
  const s=Math.min(a.w/480,a.h/artHeight);c.save();c.translate((a.w-480*s)/2,(a.h-artHeight*s)/2);c.scale(s,s);c.globalAlpha=state.transition;
  const floor=floorLevel;
  const anchor=((a.h-artHeight*s)/2+floor*s).toFixed(2);if(a.el.dataset.threadY!==anchor){a.el.dataset.threadY=anchor;if(woven)parent.dispatchEvent(new Event('ink-anchors'));}
  // Loose stems join each stationary drawing to the page's travelling stroke.
  // Moving papers, trains and creatures remain free to move through that world.
  const stems={poe:[],scraper:[[37,146,15,234,40,253],[430,193,451,249,419,253]],pipeline:[[42,195,12,286,40,295],[441,220,468,287,437,295]],smoothtato:[[135,223,123,250,160,251],[350,223,377,249,403,251]],mtxtato:[[26,103,12,238,58,251],[348,225,387,250,420,251]],tfl:[[118,82,98,271,132,280],[349,242,456,270,449,280]],commute:[[42,102,15,311,40,328],[404,102,460,304,433,328]],baxter:[]}[scene]||[];
  c.beginPath();for(const [x,y,cx,cy,ex,ey]of stems){c.moveTo(x,y);c.quadraticCurveTo(cx,Math.min(cy,Math.max(y,floorAt(ex))),ex,floorAt(ex));}c.strokeStyle=soft;c.lineWidth=.65;c.stroke();
  if(!['deadlock','poe'].includes(scene)){
   const points=floorPoints;
   if(!woven)path(c,points,'#656054',1.15);
   const encoded=JSON.stringify(points.map(([x,y])=>[+(x*s+(a.w-480*s)/2).toFixed(2),+(y*s+(a.h-artHeight*s)/2).toFixed(2)]));
   if(a.el.dataset.threadPoints!==encoded){a.el.dataset.threadPoints=encoded;if(woven)parent.dispatchEvent(new Event('ink-anchors'));}
  }
  audioEvents();
  const t=state.elapsed,n=state.choice,u=scene==='scraper'?(t%2.5)/2.5:(t%5)/5,e=u*u*(3-2*u);
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
   note.textContent='50k variants. proxy logs. risk sheets. tiny chance, very long tail.';
  }else if(scene==='scraper'){
   for(let i=0;i<3;i++)page(c,36+i*15,85-i*6);
   page(c,338,73,92,120);label(c,'sources',70,188);label(c,'notebook',384,219);
   const x=112+210*e,y=110-Math.sin(u*Math.PI)*35;page(c,x,y,33,43);
   owl(c,260,247);label(c,paperTitles[n],240,292,21);

  }else if(scene==='pipeline'){
   const shuffle=Math.floor(t/.42),raw=[7,2,9,4,6,3].map((v,i)=>(v+n*(i+1))%10+1),rank=[...raw].map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v);
   const sorting=Math.max(0,Math.min(1,(t-.9)/2.4)),ease=sorting*sorting*(3-2*sorting);
   const shown=t<.9?raw.map((_,i)=>raw[(i+shuffle)%raw.length]):raw;
   state.pipeline={raw:shown,progress:sorting};
   for(let i=0;i<6;i++)label(c,String(shown[i]),42+(i%2)*35,96+Math.floor(i/2)*42,24);
   path(c,[[115,124],[180,126],[193,106],[228,126],[287,123],[315,125]],soft,1);
   owl(c,241,221,'sort',65,{mode:'push',effort:.6});
   raw.forEach((v,i)=>{const target=rank.findIndex(q=>q.i===i),x=330+(i+(target-i)*ease)*19;path(c,[[x,220],[x,220-v*11]],sorting>0&&sorting<1?gold:ink,4);});
   label(c,'market data',68,265);label(c,'python',230,265);label(c,'walk-forward',378,265);
  }else if(scene==='smoothtato'){
   const particles=n===0,props=n<2,fog=n<3;
   if(fog){c.globalAlpha=state.transition*.22;for(let i=0;i<5;i++){const x=70+i*86+Math.sin(t+i)*13;path(c,[[x-50,117+i%2*26],[x-20,106+i%2*26],[x+23,114+i%2*26],[x+58,108+i%2*26]],soft,8);}c.globalAlpha=state.transition;}
   if(props)for(const [x,y]of[[76,218],[390,221],[333,148]]){path(c,[[x-13,y],[x-18,y-23],[x-5,y-37],[x+14,y-18],[x+11,y],[x-13,y]],soft,.9);}
   // Boss telegraph stays legible in the actual playable presets.
   c.beginPath();c.ellipse(245,223,108,28,0,0,Math.PI*2);c.strokeStyle='#aa775d';c.lineWidth=1.4;c.stroke();
   owl(c,240,234,'effect',104,{hat:'goldrim',mode:'rest'});
   if(particles)for(let i=0;i<54;i++){const angle=i*.61+t*.9,r=42+i%8*13,x=240+Math.cos(angle)*r,y=168+Math.sin(angle)*r*.62;path(c,[[x-3,y+3],[x,y-5],[x+4,y]],i%2?gold:soft,1.3);}
   label(c,presets[n],240,44,26);label(c,n?'boss telegraph stays':'particles / props / fog',240,295,19);
   state.preset={name:presets[n],particles,props,fog,telegraph:true};

  }else if(scene==='mtxtato'){
   const style=auraStyles[n],image=auraImages[n],cy=225;
   // The real catalogue image is part of the selector; the wearable effect is animated ink.
   if(image?.complete&&image.naturalWidth){c.drawImage(image,28,37,64,64);path(c,[[25,34],[96,36],[95,105],[26,103],[25,34]],soft,.7);}
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
   const names=['Central','Victoria','Northern'];
   for(let i=0;i<3;i++){
    const y=82+i*80;path(c,[[118,y],[349,y+Math.sin(i)*3]],i===n%3?'#98766a':soft,1.5);
    for(let j=0;j<5;j++){c.beginPath();c.arc(126+j*52,y,3,0,Math.PI*2);c.fillStyle=paper;c.fill();c.stroke();}
    const phase=(state.clock/4+i*.19)%1,x=126+(i===n%3?Math.min(phase,.40):phase)*208;
    path(c,[[x-10,y-14],[x+10,y-13],[x+11,y-3],[x-9,y-3],[x-10,y-14]],ink,1.5);
    label(c,names[i],57,y+4,18);label(c,String(Math.round(state.ratings[i])),404,y+5,25);
   }label(c,'reliability elo',388,32,13);
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
   owl(c,218,190,'analyst',46,{mode:n===5?'carry':'watch',look:2,cargo:n===5?(ctx,grip)=>urn(ctx,grip.x,grip.y-7):null});
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
   if(sample===total)note.textContent=(d.excess>1?'a few very weird games. ':'mostly the usual suspects. ')+'green wins. rust loses. grey: outside the filter.';
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
 return{state,draw,advance(dt){state.elapsed+=dt;state.clock+=dt;state.transition=Math.min(1,state.transition+dt/.45);if(state.elapsed>=duration)change();if(scene==='baxter')caption();
  if(scene==='tfl'){
   const event=Math.floor(state.clock/.8);
   if(event!==state.lastTrainEvent){
    state.lastTrainEvent=event;const loser=state.choice,winner=(loser+1+event%2)%3,expected=1/(1+10**((state.ratingTargets[loser]-state.ratingTargets[winner])/400)),delta=18*(1-expected);
    state.ratingTargets[winner]+=delta;state.ratingTargets[loser]-=delta;
   }
   state.ratings=state.ratings.map((v,i)=>v+(state.ratingTargets[i]-v)*(1-Math.exp(-dt*7)));
  }}};
}
