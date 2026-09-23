// Original pocket arrangements: every entry starts with its harmonic identity.
// Voicings are semitones above G3. Cents are independent tuning offsets.
export const musicThemes={
 tfl:{bpm:102,root:0,meter:16,swing:.12,tone:'reed',chords:[[0,4,11,14,18],[2,5,9,12,16],[-1,3,9,13,16],[0,4,9,14,19]],bass:[-24,-22,-25,-24],cents:[0,-14,2,0,17],bend:25,rhythm:[0,3,6,8,11,14],name:'timetable / lydian shuffle'},
 scraper:{bpm:88,root:2,meter:16,swing:.2,tone:'felt',chords:[[0,4,11,14,19],[0,5,9,14,18],[-1,3,10,14,17],[0,4,9,14,19]],bass:[-24,-19,-25,-24],cents:[0,-14,-12,4,2],bend:-35,rhythm:[0,2.5,5,8,10.5,14],name:'margin notes / close ninths'},
 pipeline:{bpm:112,root:-2,meter:14,swing:0,tone:'reed',chords:[[0,5,10,15,19],[2,7,12,17,21],[1,5,11,15,20],[0,4,9,14,19]],bass:[-24,-22,-23,-24],cents:[0,2,-31,4,12],bend:50,rhythm:[0,2,4,7,8,10,12],name:'walk forward / seven eighths'},
 poe:{bpm:96,root:-5,meter:16,swing:.16,tone:'bell',chords:[[0,3,11,14,19],[-1,3,9,13,18],[0,3,10,14,17],[0,4,9,14,19]],bass:[-24,-25,-24,-24],cents:[0,16,-12,0,2],bend:-50,rhythm:[0,3,5.5,8,11,14.5],name:'rare roll / minor major nine'},
 commute:{bpm:98,root:5,meter:16,swing:.24,tone:'felt',chords:[[0,4,9,14,16],[-2,2,7,12,16],[-1,3,10,13,18],[0,4,9,14,19]],bass:[-24,-26,-25,-24],cents:[0,-14,-16,0,-14],bend:18,rhythm:[0,3,6,9,12,14],name:'homeward / three three two'},
 smoothtato:{bpm:92,root:0,meter:16,swing:.1,tone:'felt',chords:[[0,4,11,12,19],[0,4,9,14,19],[2,5,9,12,16],[0,4,11,14,19]],bass:[-24,-24,-22,-24],cents:[0,-14,0,7,2],bend:32,rhythm:[0,8/3,16/3,8,32/3,40/3],name:'smooth edges / triplet melt'},
 mtxtato:{bpm:86,root:7,meter:16,swing:0,tone:'bell',chords:[[0,4,11,18,21],[0,5,10,17,21],[1,5,11,16,20],[0,4,9,16,18]],bass:[-24,-19,-23,-24],cents:[0,-14,-12,-49,-16],bend:50,rhythm:[0,3.2,6.4,9.6,12.8],name:'prismatic / five over four'},
 deadlock:{bpm:116,root:-7,meter:16,swing:.1,tone:'reed',chords:[[0,3,10,14,18],[-1,3,9,13,16],[0,3,7,11,14],[0,5,10,15,19]],bass:[-24,-25,-24,-19],cents:[0,16,-31,0,20],bend:-50,rhythm:[0,3,6,10,12,15],name:'side street / altered minor'},
 baxter:{bpm:108,root:3,meter:16,swing:.27,tone:'felt',chords:[[0,4,10,14,21],[2,5,9,12,16],[-1,3,9,13,18],[0,4,9,14,19]],bass:[-24,-22,-25,-24],cents:[0,-14,-31,0,-16],bend:28,rhythm:[0,2,5,7,10,13.5],name:'desk jazz / displaced handoffs'},
 botato:{bpm:118,root:-2,meter:14,swing:.08,tone:'reed',chords:[[0,5,10,14,19],[0,3,9,14,17],[1,5,10,15,18],[0,4,9,14,19]],bass:[-24,-24,-23,-24],cents:[0,2,-31,0,2],bend:-38,rhythm:[0,2,4,6,8,11,13],name:'little feet / two two three'},
 halo:{bpm:96,root:2,meter:16,swing:.08,tone:'bell',chords:[[0,4,11,12,18],[0,4,9,14,19],[2,5,11,14,18],[0,4,11,14,19]],bass:[-24,-24,-22,-24],cents:[0,-14,-12,0,18],bend:50,rhythm:[0,3,7,8,10.6667,13.3333],name:'thought arrives / suspended seconds'},
 liquidation:{bpm:106,root:-3,meter:16,swing:.22,tone:'felt',chords:[[0,4,10,13,21],[-1,3,9,14,18],[-2,2,9,12,16],[0,4,9,14,19]],bass:[-24,-25,-26,-24],cents:[0,-14,-31,12,-16],bend:-25,rhythm:[0,3,6,8,11.5,14],name:'second hand / chromatic bargain'},
 ocr:{bpm:110,root:5,meter:15,swing:0,tone:'reed',chords:[[0,3,9,14,19],[1,5,10,15,20],[0,5,11,14,18],[0,4,9,14,19]],bass:[-24,-23,-24,-24],cents:[0,16,-16,0,2],bend:40,rhythm:[0,3,6,9,12,14],name:'odd characters / five small groups'}
};
const spectra={felt:[0,1,.16,.065,.035,.012],reed:[0,1,.09,.22,.025,.07],bell:[0,1,.24,.055,.13,.03,.045]};
const waves=new WeakMap();
function wave(a,tone){let bank=waves.get(a);if(!bank){bank={};waves.set(a,bank);}return bank[tone]??=a.createPeriodicWave(new Float32Array(spectra[tone].length),Float32Array.from(spectra[tone]));}
export function renderThemeBar(a,out,key,at,bar=0,variation=0,track=()=>{}){
 const t=musicThemes[key],tick=60/t.bpm/4,duration=t.meter*tick,cycle=(bar+variation)%t.chords.length,events=[];
 function voice(semi,when,length,amp,cents=0,bend=0,tone=t.tone,pan=0){
  const o=a.createOscillator(),g=a.createGain(),p=a.createStereoPanner();o.setPeriodicWave(wave(a,tone));o.frequency.value=196*2**((semi+t.root)/12);
  o.detune.setValueAtTime(cents+bend,when);// Signed cents use linear interpolation.
  o.detune.linearRampToValueAtTime(cents,when+.19);p.pan.value=pan;
  g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(amp,when+.012);g.gain.exponentialRampToValueAtTime(Math.max(.0001,amp*.2),when+.18);g.gain.exponentialRampToValueAtTime(.0001,when+length);
  o.connect(g);g.connect(p);p.connect(out);o.start(when);o.stop(when+length+.02);track(o,g);o.onended=()=>{o.disconnect();g.disconnect();p.disconnect();};events.push({at:when,semitone:semi+t.root,cents,bend,amp});
 }
 // First chord is immediate. Two distinct answers follow before three seconds.
 for(let k=0;k<3;k++){
  const slot=(cycle+k)%4,chord=t.chords[slot],when=at+[0,5,10][k]*tick;
  chord.forEach((pitch,i)=>voice(pitch,when+i*.009,.68+k*.06,.038*(i===0?.75:1),t.cents[i],i===3?t.bend*(k===1?-.5:1):0,t.tone,(i-2)*.13));
  voice(t.bass[slot],when,Math.min(1.1,duration),.11,0,0,'felt');
 }
 const chord=t.chords[cycle];t.rhythm.forEach((beat,i)=>{
  // Triplets and quintuplets retain their exact spacing; only integer offbeats swing.
  const off=Number.isInteger(beat)&&beat%2?t.swing:0,when=at+(beat+off)*tick;
  const pitch=chord[(i*2+bar)%chord.length]+12,ghost=i%3===1;
  voice(pitch,when+.035,ghost?.30:.5,ghost?.032:.065,t.cents[(i*2+bar)%5],i===1?-t.bend*.5:0,t.tone,Math.sin(i*1.9)*.32);
  if(i===t.rhythm.length-2&&bar%2===0)voice(pitch-1,when-.025,.22,.023,0,25,t.tone,-.18);
 });
 // Quiet inharmonic bell colour. Never spread detuning across the bass anchor.
 if(t.tone==='bell')voice(t.chords[cycle][2]+12,at+.055,.9,.015,17,0,'felt',.25);
 return {duration,events,name:t.name};
}
export function projectMusic(mix,onChange){
 let key=null,gain=null,next=0,bar=0,volume=.0882,bank=null,entry=0,lastEvents=[],openedAt=0;const nodes=new Set();
 function ensure(){if(gain)return;const a=mix.initialize();gain=a.createGain();gain.gain.value=0;const filter=a.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2300;gain.connect(filter);filter.connect(mix.limiter);}
 function level(){if(gain){const t=mix.context.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(key&&mix.enabled?volume*.24:0,t,.055);}}
 function clear(){const a=mix.context;if(!a)return;for(const n of nodes){try{n.g.gain.cancelScheduledValues(a.currentTime);n.g.gain.setTargetAtTime(.0001,a.currentTime,.018);n.o.stop(a.currentTime+.09);}catch{}}nodes.clear();if(bank){const old=bank;bank=null;setTimeout(()=>old.disconnect(),120);}}
 function schedule(){if(!key||!mix.enabled||mix.context?.state!=='running')return;const a=mix.context,now=a.currentTime;if(next<now)next=now+.015;while(next<now+2.5){if(!bank){bank=a.createGain();bank.connect(gain);}const result=renderThemeBar(a,bank,key,next,bar++,entry%2,(o,g)=>{const n={o,g};nodes.add(n);o.addEventListener('ended',()=>nodes.delete(n));});lastEvents=result.events;next+=result.duration;}}
 const timer=setInterval(schedule,70);
 addEventListener('project-music',e=>{clear();key=musicThemes[e.detail]?e.detail:null;ensure();bar=0;entry++;openedAt=mix.context.currentTime;next=openedAt+.018;level();onChange(!!key);schedule();});
 addEventListener('sound-state',()=>{level();if(!mix.enabled)clear();else{if(!bank)next=mix.context.currentTime+.015;schedule();}});
 document.addEventListener('visibilitychange',()=>{level();schedule();});
 addEventListener('pagehide',()=>{clearInterval(timer);clear();});
 window.__projectMusic=()=>({key,active:!!key&&mix.enabled,nodes:nodes.size,step:bar,volume,name:musicThemes[key]?.name,openedAt,events:lastEvents});
 return {volume(v){volume=v;level();}};
}
