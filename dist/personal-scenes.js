import {drawMeowl} from './little-creatures.js';
import {toyProp} from './toy-interactions.js';
import {inkPath} from './ink-path.js';
export const normalise=text=>text.toLowerCase().replace(/\s+/g,' ').replace(/[1i|]/g,'l').trim();
export function inverse2([a,b,c,d]){const det=a*d-b*c;if(Math.abs(det)<1e-8)return null;return[d/det,-b/det,-c/det,a/det];}
export function personalScene(scene,canvas,wake,sfx){
 const interests=scene==='interests',ink='#535248',paper='#eeeae0',olive='#60715d';
 document.querySelector('.caption').textContent=interests?'a few constants in my brain':'pixels, text, a stopping rule';
 document.querySelector('#scene').innerHTML='<canvas id="personal-art" class="toy mini-toy" aria-label="'+(interests?'Interests and matrix inversion':'OCR text normalisation example')+'"></canvas><p class="toy-note" id="personal-note"></p>';
 const a=canvas('personal-art'),state={clock:0,scene},note=document.querySelector('#personal-note');
 const labels=['deadlock','path of exile','poker','halo','indomie sandwich','little code projects'];
 const inputs=['Adds cold damage','GrAnd Des1gn','Adds fire damage','Remarkab|e'];
 function text(c,str,x,y,size=17){const scale=Math.min(a.w/480,a.h/350);c.font=Math.max(size,12.5/Math.max(.1,scale))+'px Reader,Georgia,serif';c.fillStyle=ink;c.textAlign='center';c.fillText(str,x,y);}
 function line(c,p,color=ink,w=1.2){inkPath(c,p,color,w);}
 function draw(){
  if(!a.w||!a.h)return;a.clear();const c=a.c,s=Math.min(a.w/480,a.h/350),ox=(a.w-480*s)/2,oy=(a.h-350*s)/2;c.save();c.translate(ox,oy);c.scale(s,s);
  const time=state.clock,phase=time%8,round=Math.floor(time/8);
  const floor=[[0,308],[80,308],[170,304],[320,309],[480,308]],encoded=JSON.stringify(floor.map(([x,y])=>[x*s+ox,y*s+oy]));
  if(a.el.dataset.threadPoints!==encoded){a.el.dataset.threadPoints=encoded;parent.dispatchEvent(new Event('ink-anchors'));}
  if(!window.frameElement?.classList.contains('sketch-demo'))line(c,floor);
  if(interests){
   const matrices=[[1,1,0,1],[2,1,1,1],[1,-1,1,1]],m=matrices[round%3],inv=inverse2(m);
   state.matrix=m;state.inverse=inv;state.product=[m[0]*inv[0]+m[1]*inv[2],m[0]*inv[1]+m[1]*inv[3],m[2]*inv[0]+m[3]*inv[2],m[2]*inv[1]+m[3]*inv[3]];
   for(let i=0;i<6;i++){
    const x=34+i%3*151,y=28+Math.floor(i/3)*56,visible=phase>i*.48;
    line(c,[[x,y],[x+132,y+1],[x+131,y+39],[x-1,y+41],[x,y]],'#a19986',.8);
    if(visible){if(i>=4){const words=i===4?['indomie','sandwich']:['little code','projects'];words.forEach((word,j)=>text(c,word,x+65,y+16+j*19,15));}else text(c,labels[i],x+65,y+25,15);}
    else for(let j=0;j<5;j++)line(c,[[x+8+j*23,y+32],[x+20+j*23,y+8]],'#b4a993',.7);
   }
   const values=phase<3.7?m:inv,title=phase<3.7?'A':phase<6?'A inverse':'A × A inverse = I';text(c,title,103,171,18);
   line(c,[[61,180],[48,180],[48,248],[61,248]]);line(c,[[145,180],[158,180],[158,248],[145,248]]);
   values.forEach((v,i)=>text(c,Number(v.toFixed(2)),80+i%2*49,205+Math.floor(i/2)*32,21));
   const mix=phase<3?0:phase<4?(phase-3):phase<5.3?1:Math.max(0,1-(phase-5.3)/.7);
   c.save();c.translate(302,267);c.transform(1+(m[0]-1)*mix,m[2]*mix*.25,m[1]*mix*.3,1+(m[3]-1)*mix*.15,0,0);c.translate(-302,-267);
   drawMeowl(c,302,302,82,{id:'sandwich',time,mode:phase>6?'happy':'watch',voice:sfx.mouth('sandwich'),emotion:mix?'dazed':'relieved'});
   // Two rough slices and a tangle of noodles. A sandwich, somehow wearing a meowl.
   toyProp(c,'sandwich',302,284,77,36,()=>{for(const yy of [252,281]){c.beginPath();c.ellipse(302,yy,39,8,0,0,Math.PI*2);c.fillStyle='#c9af77';c.fill();c.strokeStyle=ink;c.stroke();}for(let i=0;i<5;i++)line(c,Array.from({length:13},(_,j)=>[270+j*5,262+i*3+Math.sin(j+i)*3]),'#9f804a',.8);});
   c.restore();
   if(phase>6&&phase<6.8){text(c,'blink. blink.',370,200,15);sfx.beat('matrix-blink',round+':'+Math.floor((phase-6)/.4),'plink',{level:.5});}
   note.textContent=phase<6?'a perfectly respectable interests matrix.':'still me. unfortunately for the sandwich.';
   sfx.chirp('sandwich',time,[10,15]);
  }else{
   const raw=inputs[round%inputs.length],clean=normalise(raw),hit=['grand design','remarkable'].find(word=>clean.includes(normalise(word)));
   state.raw=raw;state.normalised=clean;state.hit=hit||null;
   toyProp(c,'tooltip',125,141,204,88,()=>{line(c,[[23,54],[223,55],[226,141],[22,140],[23,54]]);text(c,'captured tooltip text',124,78,14);text(c,raw,124,116,21);});
   if(phase>1.6){text(c,'normalise',338,83,16);text(c,clean,338,115,19);line(c,[[230,111],[248,115],[254,105]],olive);}
   if(phase>3.2){text(c,hit?'target found. stop.':'no target. keep looking.',261,185,22);sfx.beat('ocr-result',round,'data',{level:.4});}
   drawMeowl(c,140+Math.sin(time*1.4)*36,307,79,{id:'ocr',hat:'goldrim',time,mode:hit&&phase>3.2?'happy':'scurry',speed:65,voice:sfx.mouth('ocr')});
   line(c,[[225,141],[251,222],[350,264],[390,308]],'#a19986',.8);
   note.textContent='sample OCR output → clean confusable letters → check target → stop on a match.';
   sfx.chirp('ocr',time,[12,18]);
  }
  c.restore();
 }
 return {state,draw,advance(dt){state.clock+=dt;}};
}
