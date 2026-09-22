// Vanilla adaptation of Rare UI's StepPlayer by Swami Malode (MIT).
// Upstream: github.com/swamimalode07/rare-ui, commit 539567414bac024260ed696c9647c737380514a7.
// Original component and license: vendor/rare-ui in the source checkout.
// The owner's existing frame loop drives playback; no second animation timer.
export class StepPlayer {
    constructor(parent,{labels,duration=2.8,onChange}){
        this.labels=labels;this.duration=duration;this.onChange=onChange;this.index=0;this.elapsed=0;this.playing=true;
        this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
        // Preserve the upstream dot/bar proportion with a larger independent hit target.
        this.dot=4;this.bar=Math.round(this.dot*8.2);
        this.widths=labels.map((_,i)=>({x:i?this.dot:this.bar,v:0}));
        this.el=document.createElement('div');this.el.className='rare-step-player';this.el.setAttribute('role','group');this.el.setAttribute('aria-label','Interview scene playback');
        this.buttons=labels.map((label,i)=>{
            const button=document.createElement('button');button.type='button';button.className='rare-step';button.setAttribute('aria-label',`Scene ${i+1}: ${label}`);button.title=label;
            button.innerHTML='<span class="rare-step-track"><span class="rare-step-fill"></span></span>';
            button.addEventListener('click',()=>this.seek(i));
            button.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:-1)+labels.length)%labels.length;this.seek(next);this.buttons[next].focus();}});
            this.el.append(button);return button;
        });
        this.control=document.createElement('button');this.control.type='button';this.control.className='rare-transport';this.control.setAttribute('aria-label','Pause interview');
        this.control.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path class="rare-play" d="M9.8 7 L17.7 12 L9.8 17 Z"/><path class="rare-pause" d="M8.4 5.9 L10.4 5.9 L10.4 18.1 L8.4 18.1 Z M13.6 5.9 L15.6 5.9 L15.6 18.1 L13.6 18.1 Z"/></svg>';
        this.control.addEventListener('click',()=>{this.playing=!this.playing;this.control.setAttribute('aria-label',this.playing?'Pause interview':'Play interview');this.paint();});
        this.el.append(this.control);parent.append(this.el);this.seek(0);
    }
    seek(index){this.index=index;this.elapsed=0;this.onChange(index);this.paint();}
    update(dt){
        if(this.playing){this.elapsed+=dt;if(this.elapsed>=this.duration){this.elapsed%=this.duration;this.index=(this.index+1)%this.labels.length;this.onChange(this.index);}}
        for(let i=0;i<this.widths.length;i++){
            const p=this.widths[i],target=i===this.index?this.bar:this.dot;
            if(this.reduced.matches){p.x=target;p.v=0;}
            else{p.v+=((target-p.x)*260-p.v*23)*dt;p.x+=p.v*dt;}
        }
        this.paint();
    }
    paint(){
        this.el.dataset.playing=String(this.playing);
        for(let i=0;i<this.buttons.length;i++){
            const button=this.buttons[i],active=i===this.index;
            button.setAttribute('aria-current',active?'step':'false');
            button.firstElementChild.style.width=this.widths[i].x+'px';
            button.querySelector('.rare-step-fill').style.transform=`scaleX(${i<this.index?1:active?Math.min(1,this.elapsed/this.duration):0})`;
        }
    }
    diagnostics(){return{index:this.index,elapsed:this.elapsed,playing:this.playing};}
}
