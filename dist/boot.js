import {drawMeowl} from './little-creatures.js';
import {sharedMix} from './soundscape.js';
import './button-feel.js';
const overlay=document.querySelector('#little-boot');
const button=overlay.querySelector('button'),status=overlay.querySelector('.boot-progress'),hint=overlay.querySelector('.push-hint'),c=overlay.querySelector('canvas').getContext('2d');
let returning=false;try{returning=sessionStorage.getItem('meowl-entered')==='yes';}catch{}
let pushes=returning?3:0,loaded=false,done=false,failed=false,shown=returning?1:0,time=0,last=0,raf=0,keyboardEntry=false;
function stampPush(stage){
 const word=button.querySelector('.push-word'),ink=button.querySelector('.push-ink'),angle=[-4,3,-5,2][stage];
 word.textContent=['PUSH.','PUUUSH!','PUUUUUUSH!!!','made it.'][stage];word.style.rotate=angle+'deg';
 word.getAnimations().forEach(a=>a.cancel());ink.getAnimations().forEach(a=>a.cancel());
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  word.animate([{scale:'1.1 .78',rotate:(angle-7)+'deg'},{scale:'.96 1.08',rotate:(angle+2)+'deg',offset:.36},{scale:'1',rotate:angle+'deg'}],{duration:360,easing:'cubic-bezier(.2,.8,.3,1)'});
  ink.animate([{opacity:.9,scale:'.85'},{opacity:.7,scale:'1.06',offset:.35},{opacity:.35,scale:'1'}],{duration:420,easing:'ease-out'});
 }
}
stampPush(pushes);
if(returning){button.hidden=true;hint.textContent='drawing the hill back in...';status.textContent='';}
function inert(value){for(const e of document.querySelectorAll('#world,.sketchbook'))e.inert=value;}
inert(true);button.focus({preventScroll:true});
function drawEntrance(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=reduced?180:2850;
 const paths=[...document.querySelectorAll('.pen-thread .thread-segment')];
 if(paths.length&&!reduced){
  const lengths=paths.map(path=>path.getTotalLength()),total=lengths.reduce((a,b)=>a+b,0)||1;
  const pts=window.__inkPhysicsPoints||[];let visible=0;
  for(let i=1;i<pts.length;i++){if(pts[i][1]>innerHeight)break;visible+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);}
  const firstPage=Math.max(.001,Math.min(.8,visible/total));
  const at=f=>f<=firstPage?1785*f/firstPage:1785+765*(f-firstPage)/(1-firstPage);let distance=0;
  paths.forEach((path,i)=>{const delay=at(distance/total);distance+=lengths[i];path.setAttribute('pathLength','1000');const ink=path.animate([{strokeDasharray:'1000 1000',strokeDashoffset:1000},{strokeDasharray:'1000 1000',strokeDashoffset:0}],{delay,duration:Math.max(1,at(distance/total)-delay),fill:'backwards',easing:'linear'});ink.finished.finally(()=>path.removeAttribute('pathLength'));});
 }
 const hillInk=document.querySelector('.hill-thread path');if(hillInk)hillInk.animate([{opacity:0},{opacity:.7}],{duration:reduced?180:550,delay:reduced?0:1500,fill:'backwards'});
 const canvas=document.querySelector('#playground');
 if(canvas)canvas.animate(reduced?[{opacity:0},{opacity:1}]:[{opacity:0,clipPath:'polygon(0 0,0 0,0 100%,0 100%)'},{opacity:.7,clipPath:'polygon(0 0,36% 0,42% 12%,35% 25%,43% 38%,36% 52%,44% 66%,38% 80%,45% 100%,0 100%)',offset:.42},{opacity:1,clipPath:'polygon(0 0,100% 0,100% 12%,100% 25%,100% 38%,100% 52%,100% 66%,100% 80%,100% 100%,0 100%)'}],{duration:reduced?180:2100,easing:'ease-out'});
 const pieces=[...document.querySelectorAll('#world header,.sound-settings,.introduction,.pencil-note,.knot,.bottom-edge,.meowl-thought,.sketch-chapter,.sketch-foot,.line-guide')];
 pieces.forEach((el,i)=>{const delay=reduced?0:Math.min(1700,350+i*65);el.animate([{opacity:0,filter:reduced?'none':'blur(2px)'},{opacity:1,filter:'blur(0px)'}],{duration:reduced?180:850,delay,fill:'backwards',easing:'ease-out'});});
 window.__entrance={started:performance.now(),duration};setTimeout(()=>{window.__entrance.finished=true;},duration);
}
function finish(){if(!loaded||pushes<3||done)return;done=true;try{sessionStorage.setItem('meowl-entered','yes');}catch{}drawEntrance();document.documentElement.classList.remove('booting');inert(false);overlay.classList.add('finished');cancelAnimationFrame(raf);setTimeout(()=>{overlay.remove();if(keyboardEntry)document.querySelector('#help')?.focus({preventScroll:true});dispatchEvent(new Event('meowl-enter'));},250);}
button.addEventListener('click',e=>{keyboardEntry=e.detail===0;sharedMix().enable(true);pushes=Math.min(3,pushes+1);const left=3-pushes;hint.textContent=left?'help meowl by clicking '+left+(left===1?' time':' times'):'you helped. little guy appreciates it.';status.textContent=pushes===3&&!loaded?'preparing the hill...':'';stampPush(pushes);finish();});
function draw(now){
 const dt=Math.min(.04,(now-(last||now))/1000);last=now;time+=dt;shown+=(pushes/3-shown)*(1-Math.exp(-dt*8));c.clearRect(0,0,340,145);
 const ground=x=>139-x*.24+Math.sin(x*.17)*1.5+Math.sin(x*.43)*.7;
 c.strokeStyle='#69675e';c.lineWidth=1.15;c.beginPath();for(let x=12;x<=326;x+=4)x===12?c.moveTo(x,ground(x)):c.lineTo(x,ground(x));c.stroke();
 // A tiny hand-drawn climbing ribbon, with the fill following the broken ridge.
 c.beginPath();for(let x=18;x<=322;x+=4)x===18?c.moveTo(x,ground(x)+5):c.lineTo(x,ground(x)+5);for(let x=322;x>=18;x-=4)c.lineTo(x,ground(x)+11);c.closePath();c.stroke();
 c.strokeStyle='#8b7248';c.lineWidth=3;c.beginPath();for(let x=20;x<=20+300*shown;x+=2)x===20?c.moveTo(x,ground(x)+8):c.lineTo(x,ground(x)+8);c.stroke();
 const x=72+shown*220;c.save();c.translate(x,ground(x)-18);c.rotate(shown*8);c.strokeStyle='#69675e';c.lineWidth=1.2;c.beginPath();for(let i=0;i<11;i++){const angle=i/11*Math.PI*2,r=18+(i%3-1)*1.3;i?c.lineTo(Math.cos(angle)*r,Math.sin(angle)*r):c.moveTo(Math.cos(angle)*r,Math.sin(angle)*r);}c.closePath();c.stroke();c.restore();
 drawMeowl(c,x-27,ground(x-27),52,{id:'boot',time,mode:pushes===3?'happy':'push',effort:.85,stroke:time%1,ground});if(!done)raf=requestAnimationFrame(draw);
}
raf=requestAnimationFrame(draw);
const pageReady=import('./loose.js').then(()=>import('./pen-thread.js')).then(module=>module.lineReady);
Promise.all([import('./hill-physics.js'),pageReady,document.fonts.ready]).then(()=>{loaded=true;status.textContent='';finish();}).catch(error=>{failed=true;console.error(error);status.textContent='the hill could not load.';const retry=document.createElement('a');retry.href='';retry.textContent='reload';status.append(' ',retry);inert(false);});
window.__boot=()=>({completed:loaded?3:0,total:3,pushes,visible:!done,done,failed});
