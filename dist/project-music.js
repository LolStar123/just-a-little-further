// Original small arrangements. No external track or video player is loaded.
const themes={tfl:[0,7,12,7],scraper:[0,4,7,11],pipeline:[0,7,4,9],poe:[0,3,7,10],commute:[0,7,9,4],smoothtato:[0,4,9,7],mtxtato:[0,7,11,14],deadlock:[0,3,10,7],baxter:[0,4,7,9],botato:[0,7,3,12],halo:[0,4,11,7],liquidation:[0,7,9,12],ocr:[0,3,7,12]};
export function projectMusic(mix,onChange){
 let key=null,gain=null,next=0,step=0,volume=.098,nodes=new Set();
 function level(){if(gain){const t=mix.context.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(key&&mix.enabled&&!document.hidden?volume*.24:0,t,.35);}}
 function ensure(){if(gain)return;const a=mix.initialize();gain=a.createGain();gain.gain.value=0;const filter=a.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1800;gain.connect(filter);filter.connect(mix.limiter);}
 function note(semitone,at,length,amp){const a=mix.context,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=196*2**(semitone/12);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(amp,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+length);o.connect(g);g.connect(gain);o.start(at);o.stop(at+length+.03);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();g.disconnect();};}
 const timer=setInterval(()=>{if(!key||!mix.enabled||document.hidden||mix.context?.state!=='running')return;const now=mix.context.currentTime;if(next<now)next=now+.02;while(next<now+.18){const notes=themes[key]||themes.baxter;note(notes[step%4]+(step%8===6?12:0),next,1.6,.22);if(step%4===0){note(-12,next,2.2,.18);note(7,next,2.1,.07);}step++;next+=.625;}},100);
 addEventListener('project-music',e=>{key=themes[e.detail]?e.detail:null;ensure();step=0;next=mix.context.currentTime+.05;level();onChange(!!key);});
 addEventListener('sound-state',level);document.addEventListener('visibilitychange',level);
 addEventListener('pagehide',()=>{clearInterval(timer);for(const n of nodes)try{n.stop();}catch{};});
 window.__projectMusic=()=>({key,active:!!key&&mix.enabled&&!document.hidden,nodes:nodes.size,step,volume});
 return {volume(v){volume=v;level();}};
}
