import {drawMeowl} from './little-creatures.js';
import {sharedMix} from './soundscape.js';
import './button-feel.js';
const overlay=document.createElement('div');overlay.id='little-boot';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Give meowl three pushes to enter');
overlay.innerHTML='<div class="boot-art"><span>just a little further</span><canvas width="340" height="145" aria-hidden="true"></canvas><button id="boot-push">PUUUUSH!!!</button><p class="push-hint scribble-note">↖ click 3 times. tiny guy. big job.</p><p class="boot-progress" role="status">0 / 3 pushes</p></div>';
document.body.append(overlay);
const button=overlay.querySelector('button'),status=overlay.querySelector('.boot-progress'),c=overlay.querySelector('canvas').getContext('2d');
let pushes=0,loaded=false,done=false,failed=false,shown=0,time=0,last=0,raf=0,keyboardEntry=false;
function inert(value){for(const e of document.querySelectorAll('#world,.sketchbook'))e.inert=value;}
inert(true);button.focus({preventScroll:true});
function finish(){if(!loaded||pushes<3||done)return;done=true;inert(false);overlay.classList.add('finished');cancelAnimationFrame(raf);setTimeout(()=>{overlay.remove();if(keyboardEntry)document.querySelector('#help')?.focus({preventScroll:true});dispatchEvent(new Event('meowl-enter'));},250);}
button.addEventListener('click',e=>{keyboardEntry=e.detail===0;sharedMix().enable(true);pushes=Math.min(3,pushes+1);status.textContent=pushes+' / 3 pushes'+(pushes===3&&!loaded?' / preparing the hill...':'');button.textContent=pushes===3?'made it.':'PUUUUSH!!!';finish();});
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
Promise.all([import('./hill-physics.js'),import('./loose.js')]).then(()=>{loaded=true;status.textContent=pushes+' / 3 pushes';finish();}).catch(error=>{failed=true;console.error(error);status.textContent='the hill could not load.';const retry=document.createElement('a');retry.href='';retry.textContent='reload';status.append(' ',retry);inert(false);});
window.__boot=()=>({completed:loaded?3:0,total:3,pushes,visible:!done,done,failed});
