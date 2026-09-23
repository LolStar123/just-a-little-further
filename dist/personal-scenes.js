import {drawMeowl} from './little-creatures.js';
import {toyProp} from './toy-interactions.js';
import {inkPath} from './ink-path.js';
export const normalise=text=>text.toLowerCase().replace(/\s+/g,' ').replace(/[1i|]/g,'l').trim();
export function inverse2([a,b,c,d]){const det=a*d-b*c;if(Math.abs(det)<1e-8)return null;return[d/det,-b/det,-c/det,a/det];}
export function personalScene(scene,canvas,wake,sfx){
 const interests=scene==='interests',ink='#535248',paper='#eeeae0',olive='#60715d';
 document.querySelector('.caption').textContent=interests?'a few constants in my brain':'pixels, text, a stopping rule';
 document.querySelector('#scene').innerHTML='<canvas id="personal-art" class="toy mini-toy" aria-label="'+(interests?'A thought bubble of competitive games, poker and indomie':'OCR text normalisation example')+'"></canvas><p class="toy-note" id="personal-note"></p>';
 const a=canvas('personal-art'),state={clock:0,scene},note=document.querySelector('#personal-note');
 const labels=[['top 100','deadlock'],['wealthiest','path of exile player'],['top 5000','dota 2'],['bath poker','tourney winner'],['indomie','sandwich']];
 const atoms=labels.map((words,i)=>({words,x:94+(i%3)*145,y:70+Math.floor(i/3)*90,vx:(i%2?-1:1)*(21+i*3),vy:(i%3-1)*19,w:[116,165,116,158,112][i],h:48,spin:0}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function moveAtoms(dt){
  for(const b of atoms){b.x+=b.vx*dt;b.y+=b.vy*dt;b.spin*=Math.exp(-dt*4);if(b.x-b.w/2<30){b.x=30+b.w/2;b.vx=Math.abs(b.vx);}if(b.x+b.w/2>450){b.x=450-b.w/2;b.vx=-Math.abs(b.vx);}if(b.y-b.h/2<35){b.y=35+b.h/2;b.vy=Math.abs(b.vy);}if(b.y+b.h/2>222){b.y=222-b.h/2;b.vy=-Math.abs(b.vy);}}
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){const a=atoms[i],b=atoms[j],dx=b.x-a.x,dy=b.y-a.y,px=(a.w+b.w)/2+8-Math.abs(dx),py=(a.h+b.h)/2+8-Math.abs(dy);if(px<=0||py<=0)continue;if(px<py){const sign=dx<0?-1:1;a.x-=sign*px/2;b.x+=sign*px/2;[a.vx,b.vx]=[b.vx,a.vx];}else{const sign=dy<0?-1:1;a.y-=sign*py/2;b.y+=sign*py/2;[a.vy,b.vy]=[b.vy,a.vy];}a.spin=.07;b.spin=-.07;}
 }

 const inputs=['Adds cold damage','GrAnd Des1gn','Adds fire damage','Remarkab|e'];
 function text(c,str,x,y,size=17){const scale=Math.min(a.w/480,a.h/350);c.font=Math.max(size,14/Math.max(.1,scale))+'px Reader,Georgia,serif';c.fillStyle=ink;c.textAlign='center';c.fillText(str,x,y);}
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
   for(const b of atoms){c.save();c.translate(b.x,b.y);c.rotate(reduced.matches?0:b.spin+Math.sin(time*2+b.x)*.018);b.words.forEach((word,i)=>text(c,word,0,i*20-3,18));c.restore();}
   c.restore();
   line(c,[[0,308],[122,307],[139,283],[153,268],[172,258],[167,254],[161,260],[174,269],[194,246]],olive,1);
   drawMeowl(c,141,307,59,{id:'thoughtful',time,mode:'watch',voice:sfx.mouth('thoughtful')});
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
 return {state,draw,advance(dt){state.clock+=dt;if(interests&&!reduced.matches)moveAtoms(Math.min(dt,.035));}};
}
