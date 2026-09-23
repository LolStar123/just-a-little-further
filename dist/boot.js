import {drawMeowl} from './little-creatures.js';
import {sharedMix} from './soundscape.js';
import './button-feel.js';
const overlay=document.createElement('div');overlay.id='little-boot';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Give meowl three pushes to enter');
overlay.innerHTML='<div class="boot-art"><span>a little further</span><canvas width="340" height="145" aria-hidden="true"></canvas><button id="boot-push">PUUUUSH!!!</button><p class="push-hint scribble-note">↖ click 3 times. tiny guy. big job.</p><p class="boot-progress" role="status">0 / 3 pushes</p></div>';
document.body.append(overlay);
const button=overlay.querySelector('button'),status=overlay.querySelector('.boot-progress'),c=overlay.querySelector('canvas').getContext('2d');
let pushes=0,loaded=false,done=false,failed=false,shown=0,time=0,last=0,raf=0;
function inert(value){for(const e of document.querySelectorAll('#world,.sketchbook'))e.inert=value;}
inert(true);button.focus({preventScroll:true});
function finish(){if(!loaded||pushes<3||done)return;done=true;inert(false);overlay.classList.add('finished');cancelAnimationFrame(raf);setTimeout(()=>{overlay.remove();document.querySelector('#help')?.focus({preventScroll:true});dispatchEvent(new Event('meowl-enter'));},250);}
button.addEventListener('click',()=>{sharedMix().enable(true);pushes=Math.min(3,pushes+1);status.textContent=pushes+' / 3 pushes'+(pushes===3&&!loaded?' / preparing the hill...':'');button.textContent=pushes===3?'made it.':'PUUUUSH!!!';finish();});
function draw(now){const dt=Math.min(.04,(now-(last||now))/1000);last=now;time+=dt;shown+=(pushes/3-shown)*(1-Math.exp(-dt*8));c.clearRect(0,0,340,145);c.strokeStyle='#69675e';c.lineWidth=1.2;c.beginPath();c.moveTo(12,116);c.bezierCurveTo(100,113,210,122,325,113);c.stroke();c.strokeRect(18,122,304,9);c.fillStyle='#8b7248';c.fillRect(20,124,300*shown,5);const x=72+shown*220;c.save();c.translate(x,97);c.rotate(shown*8);c.beginPath();for(let i=0;i<11;i++){const a=i/11*Math.PI*2,r=18+(i%3-1)*1.3;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.stroke();c.restore();drawMeowl(c,x-26,115,52,{id:'boot',time,mode:pushes===3?'happy':'push',effort:.85,stroke:time%1});if(!done)raf=requestAnimationFrame(draw);}
raf=requestAnimationFrame(draw);
Promise.all([import('./hill-physics.js'),import('./loose.js')]).then(()=>{loaded=true;status.textContent=pushes+' / 3 pushes';finish();}).catch(error=>{failed=true;console.error(error);status.textContent='the hill could not load.';const retry=document.createElement('a');retry.href='';retry.textContent='reload';status.append(' ',retry);inert(false);});
window.__boot=()=>({completed:loaded?3:0,total:3,pushes,visible:!done,done,failed});
