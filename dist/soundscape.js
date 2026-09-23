import {recordings} from './recorded-sounds.js';
// One audio clock and mix for the entire sketchbook, including its same-origin frames.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export class Soundscape {
    constructor({autoStart=true}={}){
        this.enabled=true;this.sfxVolume=.48;this.context=null;this.buses=new Map();this.buffers=[];this.recorded=null;this.envelopes=new Map();this.loading=null;
        this.history=[];this.choices=new Map();this.voices=new Map();this.nodes=new Set();this.sampleError=false;
        document.addEventListener('visibilitychange',()=>{
            if(!document.hidden&&this.enabled)this.enable(true);
        });
        const refresh=()=>this.refresh();
        addEventListener('scroll',refresh,{passive:true});addEventListener('resize',refresh);
        if(autoStart)queueMicrotask(()=>this.enable(this.enabled));
    }
    initialize(){
        if(!this.context){
            const a=this.context=new (window.AudioContext||window.webkitAudioContext)();
            this.master=a.createGain();this.master.gain.value=0;
            this.limiter=a.createDynamicsCompressor();this.limiter.threshold.value=-15;this.limiter.knee.value=12;this.limiter.ratio.value=6;
            this.limiter.attack.value=.004;this.limiter.release.value=.2;
            this.master.connect(this.limiter);this.limiter.connect(a.destination);
            for(const bus of this.buses.values())this.connect(bus);
        }
        return this.context;
    }
    enable(value=!this.enabled){
        this.enabled=value;
        if(value){this.initialize();this.context.resume().catch(()=>{});this.loadSamples();}
        if(this.master)this.master.gain.setTargetAtTime(value?this.sfxVolume:0,this.context.currentTime,.045);
        if(!value)this.voices.clear();
        this.refresh();this.notify();return this.enabled;
    }
    setEffectsVolume(value){
        this.sfxVolume=clamp(value);
        if(this.master)this.master.gain.setTargetAtTime(this.enabled?this.sfxVolume:0,this.context.currentTime,.05);
    }
    notify(){
        dispatchEvent(new CustomEvent('sound-state',{detail:this.enabled}));
        for(const bus of this.buses.values())try{bus.owner.dispatchEvent(new CustomEvent('sound-state',{detail:this.enabled}));}catch{}
    }
    loadSamples(){
        if(this.loading)return this.loading;
        const decode=async file=>{const r=await fetch(new URL(file,import.meta.url));if(!r.ok)throw Error('sample unavailable');return this.context.decodeAudioData(await r.arrayBuffer());};
        this.loading=Promise.all([
            Promise.all(Array.from({length:10},(_,i)=>decode(`./assets/audio/plinko-${i}.mp3`))).then(b=>{this.buffers=b;}),
            decode('./assets/audio/recorded-soundboard.mp3').then(b=>{
                this.recorded=b;const data=b.getChannelData(0),sr=b.sampleRate;
                for(const kind of Object.keys(recordings).filter(k=>k==='meow'||k==='yap'||k.startsWith('voice-')))for(const cut of recordings[kind]){
                    const envelope=[],hop=Math.round(sr*.012),start=Math.round(cut.offset*sr),end=Math.round((cut.offset+cut.duration)*sr);
                    for(let i=start;i<end;i+=hop){let sum=0,n=0;for(let j=i;j<Math.min(end,i+hop);j++){sum+=data[j]*data[j];n++;}envelope.push(Math.sqrt(sum/Math.max(n,1)));}
                    const peak=Math.max(.001,...envelope);this.envelopes.set(cut.cut,envelope.map(v=>clamp(v/peak)));
                }
            })
        ]).catch(()=>{this.sampleError=true;});return this.loading;
    }

    connect(bus){if(!bus.node){bus.node=this.context.createGain();bus.node.gain.value=0;bus.node.connect(this.master);}}
    register(id,owner,element){
        let key=id,serial=1;while(this.buses.has(key))key=id+'#'+serial++;
        const bus={id,key,owner,element,active:false,weight:0,node:null,last:new Map()};
        this.buses.set(key,bus);if(this.context)this.connect(bus);return bus;
    }
    proximity(bus){
        if(!bus.active||document.hidden||bus.owner.document.hidden)return 0;
        const element=bus.owner===window?bus.element:bus.owner.frameElement;
        if(!element)return bus.owner===window?1:0;
        if(document.body.classList.contains('panel-open')&&!element.closest('#project-panel'))return 0;
        const r=element.getBoundingClientRect(),overlap=Math.min(innerHeight,r.bottom)-Math.max(0,r.top);
        if(overlap<=0||r.width===0)return 0;
        return Math.pow(clamp(overlap/Math.min(r.height,innerHeight)),1.25);
    }
    refresh(){for(const bus of this.buses.values()){
        if(bus.owner!==window&&!bus.owner.frameElement?.isConnected){
            bus.node?.disconnect();this.buses.delete(bus.key);
            for(const key of this.voices.keys())if(key.startsWith(bus.key+':'))this.voices.delete(key);
            continue;
        }
        bus.weight=this.proximity(bus);
        if(bus.node)bus.node.gain.setTargetAtTime(bus.weight,this.context.currentTime,bus.weight?.12:.025);
    }}
    select(key,n){
        const last=this.choices.get(key)??-1;
        let i=Math.floor(Math.random()*(n-1));if(i>=last&&last>=0)i++;i%=n;
        this.choices.set(key,i);return i;
    }
    sample(bus,buffer,offset,duration,level,rate=1){
        const a=this.context,t=a.currentTime,source=a.createBufferSource(),gain=a.createGain(),length=duration/rate;
        source.buffer=buffer;source.playbackRate.value=rate;
        gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+Math.min(.012,length*.1));
        gain.gain.setValueAtTime(level,t+length*.82);gain.gain.linearRampToValueAtTime(0,t+length);
        source.connect(gain);gain.connect(bus.node);this.nodes.add(source);
        source.onended=()=>{source.disconnect();gain.disconnect();this.nodes.delete(source);};
        source.start(t,offset,duration);source.stop(t+length+.015);return length;
    }
    mouth(bus,id){
        if(!this.enabled||!bus.active||!bus.weight||this.context?.state!=='running')return 0;
        const voice=this.voices.get(bus.key+':'+id);if(!voice)return 0;
        const u=(this.context.currentTime-voice.start)/(voice.end-voice.start);
        if(u<=0||u>=1)return 0;
        const p=u*(voice.envelope.length-1),i=Math.floor(p),f=p-i;
        return Math.pow((voice.envelope[i]||0)*(1-f)+(voice.envelope[i+1]||0)*f,.65);
    }
    play(bus,kind,options={}){
        bus.weight=this.proximity(bus);
        if(!this.enabled||!bus.weight||this.context?.state!=='running')return false;
        const now=this.context.currentTime,key=kind+':'+(options.id||''),gap=kind==='plink'?.08:kind==='yap'?.13:.065;
        if(now-(bus.last.get(key)??-10)<gap)return false;bus.last.set(key,now);
        const moodBank={crying:'crying',sad:'sad',upset:'sad',desperate:'crying',strain:'effort',determined:'effort',angry:'angry',panic:'panic',relieved:'relief',worried:'worried',dazed:'dazed'}[options.mood];
        const bank=kind==='impact'?'spring':kind==='meow'&&moodBank?'voice-'+moodBank:kind,cuts=recordings[bank],pluck=kind==='plink'||kind==='blink';
        if(pluck?!this.buffers.length:!cuts||!this.recorded)return false;
        const variant=this.select(bus.key+':'+key+':'+bank,pluck?10:cuts.length),level=clamp(options.level??1,0,1.5);
        let cut=null;
        if(pluck){
            const blink=kind==='blink',buffer=this.buffers[variant],rate=(blink?1.55:options.good?1.19:1)*(blink?.98+Math.random()*.04:.97+Math.random()*.06);
            this.sample(bus,buffer,0,Math.min(blink?.14:.17,buffer.duration),(blink?.18:options.good?.096:.0612)*level,rate);
        }else{
            cut=cuts[variant];
            const gains={step:.115,paper:.08,train:.165,meow:.14,yap:.15,squish:.20,place:.12,swish:.09,aura:.13,stone:.18,chip:.12,friction:.065,slurp:.15,click:.16,spring:.14,roll:.11,trip:.15,data:.095,impact:.25,blast:.23};
            const rate=kind==='impact'?.88+Math.random()*.06:.98+Math.random()*.04,length=this.sample(bus,this.recorded,cut.offset,cut.duration,gains[kind]*level,rate);
            if(kind==='meow'||kind==='yap')this.voices.set(bus.key+':'+(options.id||'main'),{start:now,end:now+length,variant,envelope:this.envelopes.get(cut.cut)||[0,1,0]});
        }
        this.history.push({scene:bus.id,kind,id:options.id||null,variant,recording:cut?.cut||('plinko-'+variant),mood:options.mood||null,good:!!options.good,at:now,weight:bus.weight});
        if(this.history.length>300)this.history.shift();return true;
    }
    diagnostics(){return{enabled:this.enabled,sfxVolume:this.sfxVolume,state:this.context?.state||'locked',samples:this.buffers.length,recorded:!!this.recorded,recordedCuts:Object.values(recordings).reduce((n,c)=>n+c.length,0),sampleError:this.sampleError,nodes:this.nodes.size,buses:[...this.buses.values()].map(b=>({id:b.id,active:b.active,weight:b.weight})),events:this.history.slice(),voices:[...this.voices.entries()]};}
}
export function sharedMix(){
    try{if(parent!==window&&parent.__meowlSound)return parent.__meowlSound;}catch{}
    return window.__meowlSound??=new Soundscape();
}
export class SceneSound {
    constructor(id,element=null){this.mix=sharedMix();this.bus=this.mix.register(id,window,element);this.marks=new Map();this.nextMeows=new Map();
        if(!window.__meowlAudioGesture){
            window.__meowlAudioGesture=true;
            const unlock=e=>{
                if(e.type==='keydown'&&(e.repeat||['Shift','Control','Alt','Meta'].includes(e.key)))return;
                if(e.target?.closest?.('[data-sound-toggle],#sound,#sound-demo'))return;
                if(this.mix.enabled)this.mix.enable(true);
            };
            document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
            document.addEventListener('pointerup',unlock,{capture:true,passive:true});
            document.addEventListener('keydown',unlock,{capture:true});
        }
    }
    active(value){this.bus.active=value;this.mix.refresh();}
    play(kind,options){return this.mix.play(this.bus,kind,options);}
    mouth(id){return this.mix.mouth(this.bus,id);}
    beat(key,value,kind,options){if(this.marks.get(key)===value)return;this.marks.set(key,value);this.play(kind,options);}
    chirp(id,time,interval=10,allowed=true,options={}){
        const delay=()=>Array.isArray(interval)?interval[0]+Math.random()*(interval[1]-interval[0]):interval*(.8+Math.random()*.4);
        if(!this.nextMeows.has(id))this.nextMeows.set(id,time+(Array.isArray(interval)?delay():2+Math.random()*4));
        if(time>=this.nextMeows.get(id)&&allowed){this.play('meow',{id,...options});this.nextMeows.set(id,time+delay());}
    }
}
