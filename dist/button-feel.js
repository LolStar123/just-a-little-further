import {SceneSound} from './soundscape.js';

// Shared by the main page, framed scenes and quiet secondary pages.
if(!window.__buttonFeel){
    window.__buttonFeel=true;
    const sound=new SceneSound('buttons');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const animations=new WeakMap();
    const css=document.createElement('style');
    css.textContent='button{touch-action:manipulation}button:focus-visible{outline:2px solid #8b7248;outline-offset:5px}.cheer-bit{position:fixed;pointer-events:none;z-index:1001;color:#847348;font:22px Pen,cursive}';
    document.head.append(css);
    function bounce(button,press){
        if(reduced.matches)return;
        animations.get(button)?.cancel();
        // Individual scale leaves positioning transforms (especially hill cards) intact.
        const a=button.animate(press?[{scale:'1'},{scale:'.91 1.06',offset:.16},{scale:'1.09 .94',offset:.45},{scale:'.985 1.015',offset:.75},{scale:'1'}]:[{scale:'1'},{scale:'1.035 .97',offset:.35},{scale:'.99 1.02',offset:.68},{scale:'1'}],{duration:press?360:310,easing:'ease-out'});
        animations.set(button,a);
    }
    document.addEventListener('pointerover',e=>{const b=e.target.closest?.('button');if(b&&!b.contains(e.relatedTarget)&&e.pointerType!=='touch')bounce(b,false);});
    document.addEventListener('click',e=>{
        const b=e.target.closest?.('button');if(!b||b.disabled)return;
        sound.bus.element=b;sound.active(true);sound.mix.enable(true);sound.play('click',{level:.7});bounce(b,true);
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
