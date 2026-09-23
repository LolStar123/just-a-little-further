// Original small arrangements. No external track or video player is loaded.
const themes={tfl:[0,7,12,7],scraper:[0,4,7,11],pipeline:[0,7,4,9],poe:[0,3,7,10],commute:[0,7,9,4],smoothtato:[0,4,9,7],mtxtato:[0,7,11,14],deadlock:[0,3,10,7],baxter:[0,4,7,9],botato:[0,7,3,12],halo:[0,4,11,7],liquidation:[0,7,9,12],ocr:[0,3,7,12]};
const arrangements={
 tfl:[88,0,'triangle',.08,[0,7,4,9]],scraper:[76,2,'sine',.13,[0,4,9,7]],pipeline:[94,-2,'triangle',.03,[0,9,4,7]],poe:[72,-5,'sine',.17,[0,3,10,7]],commute:[84,5,'sine',.1,[0,7,9,4]],smoothtato:[78,0,'sine',.16,[0,9,4,7]],mtxtato:[70,7,'sine',.12,[0,4,11,7]],deadlock:[96,-7,'triangle',.07,[0,3,7,10]],baxter:[90,3,'triangle',.14,[0,4,9,7]],botato:[102,-2,'triangle',.12,[0,7,3,10]],halo:[74,2,'sine',.04,[0,4,11,7]],liquidation:[86,-3,'triangle',.15,[0,7,9,4]],ocr:[98,5,'sine',.06,[0,3,7,10]]};
export function projectMusic(mix,onChange){
 let key=null,gain=null,next=0,step=0,volume=.098,nodes=new Set();
 function level(){if(gain){const t=mix.context.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(key&&mix.enabled&&!document.hidden?volume*.24:0,t,.35);}}
 function ensure(){if(gain)return;const a=mix.initialize();gain=a.createGain();gain.gain.value=0;const filter=a.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1800;gain.connect(filter);filter.connect(mix.limiter);}
 function note(semitone,at,length,amp,type='sine'){const a=mix.context,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=196*2**(semitone/12);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(amp,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+length);o.connect(g);g.connect(gain);o.start(at);o.stop(at+length+.03);nodes.add(o);o.onended=()=>{nodes.delete(o);o.disconnect();g.disconnect();};}
 const timer=setInterval(()=>{if(!key||!mix.enabled||document.hidden||mix.context?.state!=='running')return;const now=mix.context.currentTime;if(next<now)next=now+.02;while(next<now+.18){const [bpm,root,timbre,swing,chords]=arrangements[key],notes=themes[key],bar=Math.floor(step/8),chord=chords[Math.floor(bar/2)%4],beat=step%8;
 const melody=notes[(beat+(bar%2?1:0))%4]+root+(bar%3===2&&beat===6?12:0);
 if(beat!==7||bar%2===0)note(melody,next,timbre==='triangle'?.85:1.7,.18,timbre);
 if(beat===0||beat===4){note(root+chord-24,next,2.3,.17);note(root+chord+7,next,1.8,.055);}
 if(beat===5&&bar%3===1)note(melody+12,next+.12,.7,.035);
 step++;next+=(60/bpm)*.75*(1+(beat%2?-swing:swing));}},100);
 addEventListener('project-music',e=>{key=themes[e.detail]?e.detail:null;ensure();step=0;next=mix.context.currentTime+.05;level();onChange(!!key);});
 addEventListener('sound-state',level);document.addEventListener('visibilitychange',level);
 addEventListener('pagehide',()=>{clearInterval(timer);for(const n of nodes)try{n.stop();}catch{};});
 window.__projectMusic=()=>({key,active:!!key&&mix.enabled&&!document.hidden,nodes:nodes.size,step,volume});
 return {volume(v){volume=v;level();}};
}
