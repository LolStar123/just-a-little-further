// A drawn stagehand occupies the scene until the child confirms it can paint.
const pending=new Map();
let raf=0;
const art=`<svg viewBox="0 0 240 120" aria-hidden="true"><path class="loading-thread" d="M5 102 C35 96 49 110 65 99 S105 91 130 101 C156 112 191 71 222 96 S228 116 235 100"/><g class="loading-meowl"><path class="loading-wing" d="M87 65 Q110 47 130 78 Q108 86 91 75"/><path d="M60 42 L55 19 L75 32 Q86 26 98 32 L111 21 L108 47 Q124 91 96 98 Q65 104 58 82 Q53 66 60 42Z"/><path d="M61 45 Q73 33 83 47 Q94 32 106 45 Q110 65 95 68 Q87 66 83 59 Q75 70 64 62Z"/><ellipse cx="73" cy="51" rx="3" ry="6"/><ellipse cx="96" cy="51" rx="3" ry="6"/><path d="M81 61 L87 61 L84 65Z M67 99 l-7 6 13 -1 M94 99 l8 6 -12 -1 M62 67 l-12 -2 M63 71 l-14 4"/><path class="loading-rope" d="M99 75 Q122 85 138 100"/></g><path class="loading-puff" d="M40 78 l-8 -4 M40 88 l-12 1 M45 96 l-8 5"/></svg>`;

function layout(){
    raf=0;
    for(const [frame,state] of pending){
        if(!frame.isConnected){forget(frame);continue;}
        const r=frame.getBoundingClientRect();
        state.el.style.cssText=`left:${r.left+scrollX}px;top:${r.top+scrollY}px;width:${r.width}px;height:${r.height}px;z-index:${frame.closest('#project-panel')?12:2}`;
        state.el.classList.toggle('visible',r.bottom>0&&r.top<innerHeight);
    }
}

function schedule(){if(pending.size&&!raf)raf=requestAnimationFrame(layout);}

function probe(frame){
    const state=pending.get(frame);
    if(!state)return;
    frame.contentWindow?.postMessage({type:'demo-probe'},location.origin);
    state.attempts++;
    const delay=Math.min(1600,100*Math.pow(1.55,state.attempts));
    state.timer=setTimeout(()=>probe(frame),delay);
}

function forget(frame){
    const state=pending.get(frame);
    if(!state)return;
    clearTimeout(state.timer);
    frame.removeEventListener('load',state.onLoad);
    state.el.remove();
    observer.unobserve(frame);
    pending.delete(frame);
}

function ready(frame){
    if(!frame)return;
    frame.dataset.sceneReady='true';
    frame.removeAttribute('aria-busy');
    forget(frame);
}

function add(frame){
    if(pending.has(frame)||frame.dataset.sceneReady)return;
    const el=document.createElement('div');
    el.className='scene-loading';
    el.setAttribute('role','status');
    el.innerHTML=art+'<span>one little moment...</span>';
    document.body.append(el);
    frame.setAttribute('aria-busy','true');
    const state={el,attempts:0,timer:0,onLoad:null};
    state.onLoad=()=>{state.attempts=0;clearTimeout(state.timer);probe(frame);};
    frame.addEventListener('load',state.onLoad);
    pending.set(frame,state);
    observer.observe(frame);
    schedule();
    queueMicrotask(()=>probe(frame));
}

const observer=new ResizeObserver(schedule);
function scan(){document.querySelectorAll('iframe.sketch-demo,iframe.scene-frame').forEach(add);schedule();}

new MutationObserver(records=>{
    for(const record of records){
        if([...record.removedNodes].some(node=>node.nodeType===1))schedule();
        for(const node of record.addedNodes){
            if(node.nodeType!==1)continue;
            if(node.matches('iframe.sketch-demo,iframe.scene-frame'))add(node);
            node.querySelectorAll('iframe.sketch-demo,iframe.scene-frame').forEach(add);
        }
    }
}).observe(document.body,{childList:true,subtree:true});

addEventListener('message',event=>{
    if(event.origin!==location.origin||event.data?.type!=='demo-ready')return;
    const frame=[...document.querySelectorAll('iframe.sketch-demo,iframe.scene-frame')].find(candidate=>candidate.contentWindow===event.source);
    ready(frame);
});
addEventListener('scroll',schedule,true);
addEventListener('resize',schedule);
scan();
