import {drawMeowl} from './little-creatures.js';

// Progress counts completed startup tasks. Never add a minimum loading time.
const overlay=document.createElement('div');
overlay.id='little-boot';overlay.hidden=true;overlay.setAttribute('role','status');
overlay.innerHTML='<div class="boot-art"><span>a little further</span><canvas width="340" height="138" aria-hidden="true"></canvas><p>finding a foothold<span aria-hidden="true">...</span></p></div>';
document.body.append(overlay);
const canvas=overlay.querySelector('canvas'),c=canvas.getContext('2d');
let completed=0,shown=0,done=false,raf=0,last=0,elapsed=0,failed=false;
window.__boot=()=>({completed,total:3,visible:!overlay.hidden,done,failed});
function mark(){completed++;}
function setInert(value){for(const el of document.querySelectorAll('#world,.sketchbook'))el.inert=value;}
const reveal=setTimeout(()=>{if(!done){overlay.hidden=false;setInert(true);raf=requestAnimationFrame(draw);}},180);
function draw(now){
    const dt=Math.min(.04,(now-(last||now))/1000);last=now;elapsed+=dt;
    shown+=(completed/3-shown)*(1-Math.exp(-dt*5));
    c.clearRect(0,0,340,138);c.fillStyle='#eeeae0';c.fillRect(0,0,340,138);
    const x=57+shown*234,y=82,ground=105;
    c.strokeStyle='#4a453c';c.lineWidth=1;c.strokeRect(19,ground,302,13);
    for(let i=0;i<30;i++)if((i+1)/30<=shown){c.fillStyle='#6a6253';c.fillRect(22+i*9.8,108,7.8,7);}
    c.save();c.translate(x,y+8);c.rotate(shown*12);
    c.beginPath();for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=i%2?13:14;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
    c.closePath();c.fillStyle='#d2c9b6';c.fill();c.stroke();c.restore();
    drawMeowl(c,x-21,ground,40,{time:elapsed,mode:'push',effort:.8,stroke:(elapsed/2.2)%1,ground:()=>ground,id:'boot'});
    c.font='10px monospace';c.fillStyle='#69675e';c.textAlign='right';c.fillText(Math.round(completed/3*100)+'%',320,134);
    if(!done&&!document.hidden)raf=requestAnimationFrame(draw);
}
// Optional fonts and scenery stream in without holding controls hostage.
const character=Promise.resolve().then(mark);
const engine=import('./hill-physics.js').then(mark);
const hill=import('./loose.js').then(()=>new Promise(resolve=>{
    const check=()=>window.__hill?.().physics?resolve():requestAnimationFrame(check);check();
})).then(mark);
Promise.all([hill,character,engine]).then(()=>{
    done=true;clearTimeout(reveal);cancelAnimationFrame(raf);setInert(false);
    if(overlay.hidden){overlay.remove();return;}
    overlay.classList.add('finished');setTimeout(()=>{overlay.hidden=true;overlay.remove();},220);
}).catch(error=>{
    console.error("Hill startup failed:",error);
    failed=true;done=true;clearTimeout(reveal);cancelAnimationFrame(raf);overlay.hidden=false;setInert(true);
    overlay.querySelector('p').innerHTML='The hill could not load. <a href="">Try again</a>.';
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);last=0;}else if(!done&&!overlay.hidden)raf=requestAnimationFrame(draw);});
