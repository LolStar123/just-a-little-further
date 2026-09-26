import {SceneSound} from './soundscape.js';

// Shared by the main page, framed scenes and quiet secondary pages.
if(!window.__buttonFeel){
    window.__buttonFeel=true;
    const sound=new SceneSound('buttons');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const animations=new WeakMap();
    const css=document.createElement('style');
    css.textContent='button{touch-action:manipulation}button:focus-visible{outline:2px solid #8b7248;outline-offset:5px}.cheer-bit{position:fixed;pointer-events:none;z-index:1001;color:#847348;font:22px Pen,cursive}.chapter-copy a,#panel-content a{text-decoration-line:underline;text-decoration-thickness:1px;text-decoration-style:solid;text-underline-offset:4px}.inline-project-link{color:inherit}';
    document.head.append(css);
    const gameTargets='.chapter-copy p,.chapter-copy small,.legal p,.scene-intro p,.project-note p,.halo-cue .cue-detail,#panel-content>p';
    const gameDestinations={deadlock:'https://store.steampowered.com/app/1422450/Deadlock/','path of exile':'https://www.pathofexile.com/'};
    function linkGameNames(root=document){
        const targets=root.matches?.(gameTargets)?[root]:root.querySelectorAll?.(gameTargets)||[];
        for(const target of targets){
            const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement?.closest('a,button,script,style')||!/(path of exile|deadlock)/i.test(node.data)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
            const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
            for(const node of nodes){
                const fragment=document.createDocumentFragment();let at=0;
                node.data.replace(/path of exile|deadlock/gi,(word,index)=>{fragment.append(node.data.slice(at,index));const link=document.createElement('a');link.className='inline-project-link';link.href=gameDestinations[word.toLowerCase()];link.target='_blank';link.rel='noopener noreferrer';link.textContent=word;fragment.append(link);at=index+word.length;return word;});
                fragment.append(node.data.slice(at));node.replaceWith(fragment);
            }
        }
    }
    linkGameNames();
    const projectPanel=document.querySelector('#project-panel');if(projectPanel)new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===Node.ELEMENT_NODE)linkGameNames(node);}).observe(projectPanel,{childList:true,subtree:true});
    function bounce(button,press){
        if(reduced.matches)return;
        const current=getComputedStyle(button).scale;
        animations.get(button)?.cancel();
        // Individual scale leaves positioning transforms (especially hill cards) intact.
        const a=button.animate(press?[{scale:current},{scale:'.94 .73',translate:'0 3px',offset:.14},{scale:'1.13 1.16',translate:'0 -2px',offset:.43},{scale:'1.025 .91',translate:'0 1px',offset:.66},{scale:'.985 1.04',translate:'0 0',offset:.84},{scale:'1',translate:'0 0'}]:[{scale:current},{scale:'1.035 .97',offset:.35},{scale:'.99 1.02',offset:.68},{scale:'1'}],{duration:press?480:310,easing:'ease-out'});
        animations.set(button,a);
    }
    let pressedButton=null;
    document.addEventListener('pointerdown',e=>{const b=e.target.closest?.('button');if(!b||b.disabled||reduced.matches)return;pressedButton=b;const current=getComputedStyle(b).scale;animations.get(b)?.cancel();animations.set(b,b.animate([{scale:current,translate:'0 0'},{scale:'.94 .8',translate:'0 3px'}],{duration:75,fill:'forwards',easing:'ease-out'}));},true);
    document.addEventListener('pointerup',e=>{if(pressedButton&&!pressedButton.contains(e.target))bounce(pressedButton,true);pressedButton=null;},true);
    document.addEventListener('pointercancel',()=>{if(pressedButton)animations.get(pressedButton)?.cancel();pressedButton=null;},true);
    addEventListener('blur',()=>{if(pressedButton)animations.get(pressedButton)?.cancel();pressedButton=null;});
    document.addEventListener('focusin',e=>{const b=e.target.closest?.('button');if(b&&b!==pressedButton)bounce(b,false);});
    document.addEventListener('pointerover',e=>{const b=e.target.closest?.('button');if(b&&b!==pressedButton&&!b.contains(e.relatedTarget)&&e.pointerType!=='touch')bounce(b,false);});
    document.addEventListener('click',e=>{
        const b=e.target.closest?.('button');if(!b||b.disabled)return;
        sound.bus.element=b;sound.active(true);sound.mix.enable(true);
        if(b.id==='boot-push'){
            // The first gesture resumes audio asynchronously. Do not lose its click.
            const at=performance.now();
            Promise.all([sound.mix.context.resume(),sound.mix.loadSamples()]).then(()=>{
                if(performance.now()-at>900||!b.isConnected)return;
                sound.play('click',{level:1.15});
                setTimeout(()=>{if(b.isConnected)sound.play('spring',{level:.28});},85);
            }).catch(()=>{});
        }else sound.play('click',{level:.95});
        bounce(b,true);
        if(b.classList.contains('squish-yoshi')){
            const mascot=b.querySelector('img'),current=getComputedStyle(mascot).scale;mascot.getAnimations().forEach(a=>a.cancel());
            b.dataset.squishes=String(Number(b.dataset.squishes||0)+1);sound.play('squish',{level:1.2,id:'yoshi'});
            mascot.animate([{scale:current},{scale:'1.65 .23',offset:.13},{scale:'1.58 .27',offset:.32},{scale:'.77 1.22',offset:.57},{scale:'1.14 .88',offset:.76},{scale:'.97 1.035',offset:.9},{scale:'1'}],{duration:reduced.matches?120:980,easing:'cubic-bezier(.2,.7,.3,1)'});
        }
        if(b.id==='encourage'){
            const r=b.getBoundingClientRect();
            for(let i=0;i<9;i++){
                const bit=document.createElement('span');bit.className='cheer-bit';bit.innerHTML=i%3?'<svg width="31" height="34" viewBox="0 0 31 34" aria-hidden="true"><path d="M3 13 Q1 4 5 2 L11 7 Q16 5 21 7 L27 1 Q29 7 27 14 Q33 28 16 31 Q0 29 3 13Z M5 17 Q8 10 13 16 Q14 23 7 22 Q3 20 5 17 M18 16 Q23 10 27 17 Q28 23 21 23 Q16 21 18 16 M14 24 L16 27 L18 24" fill="#eeeae0" stroke="currentColor" stroke-width="1.2"/><circle cx="9" cy="18" r="1.5"/><circle cx="22" cy="18" r="1.5"/></svg>':'♪' ;
                bit.style.left=r.left+r.width/2+'px';bit.style.top=r.top+'px';document.body.append(bit);
                const dx=(i-4)*19,dy=-45-Math.random()*65;
                const a=bit.animate([{transform:'translate(-50%,0) scale(.4)',opacity:0},{opacity:1,offset:.15},{transform:`translate(${dx}px,${dy}px) rotate(${dx*.6}deg) scale(1)`,opacity:.9,offset:.65},{transform:`translate(${dx*1.25}px,${dy+25}px) scale(.7)`,opacity:0}],{duration:reduced.matches?1:1100+Math.random()*300,easing:'ease-out'});a.onfinish=()=>bit.remove();
            }
        }
    },true);
}
