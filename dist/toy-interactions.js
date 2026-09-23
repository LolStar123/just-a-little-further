import {pageToyWorld} from './page-toys.js';
// Shared toy-space interaction. Drawing coordinates stay independent of DPR,
// CSS scaling and the responsive transforms used by each illustration.
const worlds=new WeakMap();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function attachToys(canvas,wake,sfx){
    if(worlds.has(canvas))return;
    const world={page:pageToyWorld(),canvas,actors:new Map(),props:new Map(),held:null,wake,sfx,last:0,throws:0};worlds.set(canvas,world);
    canvas.tabIndex=0;canvas.setAttribute('aria-label',(canvas.getAttribute('aria-label')||'Meowl scene')+'. Drag a helper or an object. Press space to toss a helper. Escape releases.');
    function point(e,item){const r=canvas.getBoundingClientRect();return new DOMPoint((e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height);}
    function release(e){
        const item=world.held;if(!item)return;
        if(e?.type==='pointercancel'){item.vx=0;item.vy=0;}
        if(item.pageActive)world.page.release(item);
        item.held=false;item.returnAt=performance.now()+700;world.held=null;
        if(canvas.hasPointerCapture(item.pointer))canvas.releasePointerCapture(item.pointer);
        canvas.style.touchAction='pan-y';world.throws++;wake();
    }
    canvas.addEventListener('pointerdown',e=>{
        if(e.button!==0)return;
        const items=[...world.props.values(),...world.actors.values()].filter(item=>performance.now()-item.lastFrame<200&&!item.pageActive);items.sort((a,b)=>b.drawOrder-a.drawOrder);
        for(const item of items){
            const p=point(e,item),box=item.box;
            if(p.x<item.x-box.w/2||p.x>item.x+box.w/2||p.y<item.y-box.h||p.y>item.y+3)continue;
            if(item.actor&&((p.x-item.x)/(box.w*.49))**2+((p.y-(item.y-box.h*.46))/(box.h*.49))**2>1)continue;
            world.held=item;item.active=true;item.held=true;item.pointer=e.pointerId;item.grip={x:p.x-item.x,y:p.y-item.y};item.last=performance.now();item.vx=item.vy=0;
            world.page=world.page||pageToyWorld();world.page?.grab(item);
            canvas.style.touchAction='none';canvas.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation();wake();return;
        }
    },true);
    canvas.addEventListener('pointermove',e=>{
        const item=world.held;if(!item)return;const p=point(e,item),now=performance.now(),dt=Math.max(.008,(now-item.last)/1000);
        const x=p.x-item.grip.x,y=p.y-item.grip.y;
        item.vx=clamp((x-item.x)/dt,-550,550);item.vy=clamp((y-item.y)/dt,-600,600);item.x=x;item.y=y;item.last=now;if(item.pageActive)world.page.move(item);wake();e.preventDefault();
    });
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',()=>release());
    addEventListener('blur',()=>release({type:'pointercancel'}));document.addEventListener('visibilitychange',()=>{if(document.hidden)release({type:'pointercancel'});});
    canvas.addEventListener('keydown',e=>{if(e.key==='Escape')release({type:'pointercancel'});if(e.code==='Space'){e.preventDefault();const item=world.actors.values().next().value;if(item){item.active=true;item.vx=130;item.vy=-310;item.returnAt=performance.now()+650;world.throws++;wake();}}});
    canvas.__toys=()=>({throws:world.throws,held:world.held?.id,actors:[...world.actors.values()].map(({id,x,y,home,active,mode,box})=>({id,x,y,home,active,mode,box})),props:[...world.props.values()].filter(item=>performance.now()-item.lastFrame<200).map(({id,x,y,active,box})=>({id,x,y,active,box}))});
}
function itemFor(c,id,x,y,w,h,actor,ground){
    const world=worlds.get(c.canvas);if(!world)return null;
    const matrix=c.getTransform(),localHome={x,y},projected=new DOMPoint(x,y).matrixTransform(matrix),unit=Math.hypot(matrix.a,matrix.b);
    x=projected.x;y=projected.y;w*=unit;h*=unit;
    const bank=actor?world.actors:world.props;if(bank.size>900)for(const [key,p]of bank)if(!p.active&&performance.now()-p.lastFrame>4000)bank.delete(key);let item=bank.get(id);
    if(!item){item={id,canvas:c.canvas,owner:window,actor,sfx:world.sfx,x,y,vx:0,vy:0,active:false,mode:'rest',lastFrame:performance.now()};bank.set(id,item);}
    item.drawOrder=world.drawOrder=(world.drawOrder||0)+1;
    item.home={x,y};item.box={w,h};item.matrix=matrix;
    item.width=c.canvas.width;item.height=c.canvas.height;
    const now=performance.now(),dt=Math.min(.04,(now-item.lastFrame)/1000);item.lastFrame=now;
    world.page=world.page||pageToyWorld();world.page?.register(item);
    if(item.pageActive)return {item,world,matrix,localHome};
    if(!item.active){item.x=x;item.y=y;}
    else if(!item.held){
        const returning=now>item.returnAt;
        if(actor||!returning)item.vy+=600*dt;
        item.x+=item.vx*dt;item.y+=item.vy*dt;
        if(item.x<12||item.x>item.width-12){item.x=clamp(item.x,12,item.width-12);item.vx*=-.45;}
        const localX=new DOMPoint(item.x,item.y).matrixTransform(matrix.inverse()).x;
        const terrain=ground?new DOMPoint(localX,ground(localX)).matrixTransform(matrix).y:y;
        const floor=actor?terrain:Math.max(y,item.height-20);
        if(item.y>=floor){item.y=floor;if(Math.abs(item.vy)>55){world.sfx.play(actor?'step':'place',{level:.35});item.vy*=-.27;}else item.vy=0;item.vx*=Math.exp(-dt*6);}
        if(returning){
            const dx=x-item.x,dy=y-item.y;
            if(actor){
                item.vx+=(clamp(dx*3,-165,165)-item.vx)*Math.min(1,dt*6);item.mode='scurry';
                // Vault intervening paper/data objects. The route replans as they move.
                const ahead=[...world.props.values()].find(p=>Math.abs(p.x-item.x)<w*.7&&Math.abs(p.y-item.y)<h*.65);
                if((ahead||dy<-25)&&Math.abs(item.vy)<2&&now>(item.hopAt||0)){item.vy=-230;item.hopAt=now+700;item.mode='spring';}
                if(dy>25)item.mode='slide';
            }else{item.vx+=(dx*7-item.vx)*Math.min(1,dt*5);item.vy+=(dy*7-item.vy)*Math.min(1,dt*5);}
            if(Math.hypot(dx,dy)<7&&Math.hypot(item.vx,item.vy)<35){item.active=false;item.x=x;item.y=y;}
        }
    }
    return {item,world,matrix,localHome};
}
export function toyPose(c,id,x,y,size,options,painter){
    const result=itemFor(c,id,x,y,size*.8,size*1.12,true,options.ground);if(!result)return {x,y,options};
    const {item,world,matrix}=result;
    item.actorPainter=(ctx,box,time,mode,velocity)=>painter(ctx,0,box.h/2,box.h/1.12,{...options,time,mode,air:true,ground:undefined,cargo:null,parkour:{kind:mode==='air'?'flutter':'leap'},speed:Math.hypot(velocity.x,velocity.y)*60,facing:velocity.x<0?-1:1});
    if(item.pageActive)return{x,y,options,hidden:true};
    const stolen=[...world.props.values()].find(p=>p.active&&performance.now()-p.lastFrame<200);
    if(stolen&&!item.active&&options.chase!==false){
        const target=clamp(stolen.x,20,item.width-20);item.chase=(item.chase??item.x)+(target-(item.chase??item.x))*.055;
        const local=new DOMPoint(item.chase,item.y).matrixTransform(matrix.inverse());
        return {x:local.x,y:options.ground?.(local.x)??y,options:{...options,mode:'panic',emotion:'worried',speed:95}};
    }
    if(!item.active){item.chase=undefined;return{x,y,options};}
    const local=new DOMPoint(item.x,item.y).matrixTransform(matrix.inverse());
    return{x:local.x,y:local.y,options:{...options,mode:item.held?'held':item.vy<-30?'spring':item.mode,air:item.held||Math.abs(item.vy)>30,ground:undefined,speed:item.vx,facing:item.vx<0?-1:1,emotion:item.held?'panic':'determined'}};
}
export function toyBusy(canvas){const world=worlds.get(canvas);return !!world&&(!!world.held||[...world.props.values()].some(p=>p.active&&performance.now()-p.lastFrame<200));}
export function toyProp(c,id,x,y,w,h,paint){
    const result=itemFor(c,id,x,y,w,h,false);
    if(result){
        const {item,matrix}=result;
        if(!item.pageActive&&(!item.sprite||performance.now()-(item.spriteAt||0)>180)){
            item.spriteAt=performance.now();const pad=4,sprite=item.sprite||document.createElement('canvas'),sw=Math.ceil(item.box.w+pad*2),sh=Math.ceil(item.box.h+pad*2);sprite.width=sw;sprite.height=sh;
            const ctx=sprite.getContext('2d');ctx.setTransform(matrix.a,matrix.b,matrix.c,matrix.d,matrix.e-item.home.x+item.box.w/2+pad,matrix.f-item.home.y+item.box.h+pad);ctx.strokeStyle=c.strokeStyle;ctx.fillStyle=c.fillStyle;ctx.font=c.font;ctx.lineWidth=c.lineWidth;paint(ctx);item.sprite=sprite;
        }
        if(item.pageActive)return{x,y,active:true,held:item.held};
    }
    c.save();if(result){const local=new DOMPoint(result.item.x,result.item.y).matrixTransform(result.matrix.inverse());c.translate(local.x-x,local.y-y);}paint(c);c.restore();
    if(result){const local=new DOMPoint(result.item.x,result.item.y).matrixTransform(result.matrix.inverse());return{x:local.x,y:local.y,active:result.item.active,held:result.item.held};}
    return{x,y,active:false,held:false};
}
