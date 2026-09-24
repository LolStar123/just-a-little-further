import {musicParts} from './music-parts.js';

// Native background audio. No embedded player, external runtime or video requests.
export function musicPlayer(mix){
    const controls=document.createElement('div');controls.className='sound-settings';
    controls.setAttribute('role','group');controls.setAttribute('aria-label','Sound settings');
    controls.innerHTML=`<label>music <input id="music-volume" type="range" min="0" max="100" step="0.0001" value="3.3075" aria-label="Music volume"></label><label>sfx <input id="sfx-volume" type="range" min="0" max="100" value="48" aria-label="Sound effects volume"></label><span id="audio-status" role="status"></span>`;
    document.querySelector('#world').prepend(controls);
    const status=controls.querySelector('#audio-status');
    let volume=.033075,part=0,slot=0,blocked=false,error=null,switching=false,fadeEnd=0,fromSlot=0,prepared=-1;
    const media=[new Audio(),new Audio()],gains=[];
    for(const el of media){el.preload='none';el.controls=false;el.volume=1;el.playsInline=true;}
    function connect(){
        if(gains.length)return;
        const a=mix.initialize();
        for(const el of media){const source=a.createMediaElementSource(el),gain=a.createGain();gain.gain.value=0;source.connect(gain);gain.connect(mix.limiter);gains.push(gain);}
        gains[slot].gain.value=volume;
    }
    function assign(index,which){media[which].src=new URL(musicParts[index],import.meta.url).href;media[which].preload='none';}
    assign(0,0);
    function sync(){
        status.textContent=error?'music could not load.':'';
    }
    function level(){
        if(!gains.length)return;const t=mix.context.currentTime;
        gains.forEach((gain,i)=>{gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(mix.enabled&&i===slot?volume:0,t,.35);});
    }
    function stop(){
        for(const el of media)el.pause();switching=false;fadeEnd=0;level();
    }
    function play(){
        if(!mix.enabled){stop();sync();return;}
        connect();level();
        if(!media[slot].paused){sync();return;}
        error=null;
        media[slot].play().then(()=>{blocked=false;sync();}).catch(e=>{
            if(e.name==='NotAllowedError')blocked=true;
            else if(e.name!=='AbortError')error=e.message;
            sync();
        });
        sync();
    }
    function prepare(){
        const next=(part+1)%musicParts.length;
        if(prepared!==next){assign(next,1-slot);media[1-slot].preload='auto';media[1-slot].load();prepared=next;}
    }
    function next(){
        if(switching||!mix.enabled)return;
        prepare();const target=1-slot;switching=true;
        media[target].play().then(()=>{
            if(!mix.enabled){media[target].pause();switching=false;return;}
            const t=mix.context.currentTime;fromSlot=slot;slot=target;part=(part+1)%musicParts.length;prepared=-1;
            gains[fromSlot].gain.cancelScheduledValues(t);gains[fromSlot].gain.setValueAtTime(volume,t);gains[fromSlot].gain.linearRampToValueAtTime(0,t+.09);
            gains[slot].gain.cancelScheduledValues(t);gains[slot].gain.setValueAtTime(0,t);gains[slot].gain.linearRampToValueAtTime(volume,t+.09);
            fadeEnd=performance.now()+110;blocked=false;error=null;sync();
        }).catch(e=>{switching=false;blocked=e.name==='NotAllowedError';if(!blocked&&e.name!=='AbortError')error=e.message;sync();});
    }
    for(const [i,el] of media.entries()){
        el.addEventListener('ended',()=>{if(i===slot)next();});
        el.addEventListener('error',()=>{if(i===slot){error='audio unavailable';sync();}});
    }
    const timer=setInterval(()=>{
        if(fadeEnd&&performance.now()>fadeEnd){media[fromSlot].pause();fadeEnd=0;switching=false;}
        if(!mix.enabled||media[slot].paused)return;
        const left=media[slot].duration-media[slot].currentTime;
        if(left<10)prepare();if(left<.10&&!switching)next();
    },50);
    controls.querySelector('#music-volume').oninput=e=>{volume=Number(e.target.value)/100;level();};
    controls.querySelector('#sfx-volume').oninput=e=>mix.setEffectsVolume(Number(e.target.value)/100);
    addEventListener('sound-state',play);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)play();});
    addEventListener('pagehide',()=>{stop();clearInterval(timer);});
    window.__musicDiagnostics=()=>({native:true,enabled:mix.enabled,blocked,error,part,parts:musicParts.length,playing:!media[slot].paused,ready:media[slot].readyState,time:media[slot].currentTime,duration:media[slot].duration,volume,src:media[slot].currentSrc||media[slot].src,prepared,switching,decoded:media[slot].webkitAudioDecodedByteCount||0});
    play();return{pause:stop};
}
