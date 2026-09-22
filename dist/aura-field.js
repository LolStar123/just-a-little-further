// World-space fire ink: buoyancy, a curl field, cooling and solid deflection.
// Research and approximation limits: research/AURA-FLOW.md.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export function curlFlow(x,y,t,scale=1){
    let vx=0,vy=0;
    for(let i=0;i<3;i++){
        const k=2*Math.PI/([126,63,29][i]*scale),a=[82,39,17][i]*scale;
        const u=x*k+t*(.78+i*.19)+i*2.1,v=y*k-t*(.63+i*.13);
        vx+=a*Math.sin(u)*Math.cos(v);vy-=a*Math.cos(u)*Math.sin(v);
    }
    return{x:vx,y:vy};
}
function rockSurface(p,rock){
    if(!rock||p.x<rock.bounds.min.x-3||p.x>rock.bounds.max.x+3||p.y<rock.bounds.min.y-3||p.y>rock.bounds.max.y+3)return null;
    const v=rock.vertices;let inside=false,best=null;
    for(let i=0,j=v.length-1;i<v.length;j=i++){
        const a=v[j],b=v[i],dx=b.x-a.x,dy=b.y-a.y;
        if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
        const u=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy),0,1),x=a.x+u*dx,y=a.y+u*dy,d=Math.hypot(p.x-x,p.y-y);
        if(!best||d<best.d){let nx=-dy,ny=dx,n=Math.hypot(nx,ny);nx/=n;ny/=n;if(nx*(x-rock.position.x)+ny*(y-rock.position.y)<0){nx=-nx;ny=-ny;}best={x,y,nx,ny,d};}
    }
    return inside||best.d<2?best:null;
}
export class AuraField {
    constructor(){this.clear();}
    clear(){this.particles=[];this.clock=0;this.serial=0;this.emit=0;this.wasActive=false;this.deflections=0;this.bounces=0;this.size=128;}
    spawn(hero,ground,spark=false){
        if(this.particles.length>=180)return;
        const id=++this.serial,a=random(id),b=random(id+73),side=id%2?1:-1,s=hero.size,unit=s/128;
        const x=hero.x+side*s*(spark?.22:.34+a*.18);
        const y=spark?ground(x)-3:hero.y-s*(.10+b*.85);
        const p={id,x,y,birthX:x,birthY:y,vx:hero.vx*.52+side*(spark?90:28)*unit,vy:-(spark?40:55+b*50)*unit,
            age:0,max:spark?.70+a*.45:1.12+a*.62,spark,front:spark||id%5===0,width:(1.25+a*1.4)*unit,
            trail:[{x,y}],sample:0,scale:unit};
        this.particles.push(p);
    }
    step(dt,hero,physics,reduced=false){
        if(reduced){this.particles.length=0;this.wasActive=false;return;}
        if(dt<=0)return;
        this.size=hero.size;const active=!!physics.assist&&!physics.drag&&!physics.splat;
        if(active&&!this.wasActive)for(let i=0;i<28;i++)this.spawn(hero,x=>physics.ground(x),i%5===0);
        this.wasActive=active;
        this.emit=active?this.emit+dt*88:0;
        while(this.emit>=1){this.emit--;this.spawn(hero,x=>physics.ground(x),this.serial%6===0);}
        const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps;
        for(let sub=0;sub<steps;sub++){
            this.clock+=h;
            for(const p of this.particles){
                p.age+=h;const heat=Math.max(0,1-p.age/p.max),flow=curlFlow(p.x,p.y,this.clock,p.scale);
                if(p.spark){p.vx+=h*(flow.x*.5-p.vx*.75);p.vy+=h*210*p.scale;}
                else{
                    p.vx+=h*(flow.x-p.vx)*2.3;
                    p.vy+=h*((flow.y-p.vy)*1.15-(95+95*heat)*p.scale);
                }
                p.x+=p.vx*h;p.y+=p.vy*h;
                const surface=rockSurface(p,physics.rock);
                if(surface){
                    const {x,y,nx,ny}=surface;p.x=x+nx*2.3;p.y=y+ny*2.3;
                    const rvx=(physics.rock.velocity?.x||0)*60,rvy=(physics.rock.velocity?.y||0)*60;
                    const inward=(p.vx-rvx)*nx+(p.vy-rvy)*ny;
                    if(inward<0){const rebound=p.spark?1.25:1;p.vx-=inward*nx*rebound;p.vy-=inward*ny*rebound;}
                    // Pressure sends hot ink tangentially up the stone's shoulder.
                    if(!p.spark){const tx=ny,ty=-nx,sign=ty>0?-1:1;p.vx+=tx*sign*55*p.scale*h;p.vy+=ty*sign*55*p.scale*h;}
                    this.deflections++;
                }
                const floor=physics.ground(p.x)-1.5;
                if(p.y>floor){
                    const slope=physics.slope(p.x),norm=Math.hypot(slope,1),nx=slope/norm,ny=-1/norm;
                    const inward=p.vx*nx+p.vy*ny;p.y=floor;
                    if(inward<0){p.vx-=inward*nx*1.3;p.vy-=inward*ny*1.3;p.vx*=.72;if(inward<-8)this.bounces++;}
                }
                p.sample+=h;
                if(p.sample>=.024){p.sample=0;p.trail.push({x:p.x,y:p.y});if(p.trail.length>28)p.trail.shift();}
            }
            this.particles=this.particles.filter(p=>p.age<p.max);
        }
    }
    draw(c,front,hero,physics,reduced=false){
        if(reduced){
            if(front||!physics.assist)return;
            c.save();c.strokeStyle='#b59b55';c.globalAlpha=.55;c.lineWidth=1.2;
            for(const side of [-1,1]){c.beginPath();c.moveTo(hero.x+side*hero.size*.48,hero.y);c.bezierCurveTo(hero.x+side*hero.size*.91,hero.y-hero.size*.55,hero.x+side*hero.size*.40,hero.y-hero.size*1.23,hero.x+side*hero.size*.25,hero.y-hero.size*1.35);c.stroke();}c.restore();return;
        }
        c.save();c.lineCap='round';c.lineJoin='round';
        for(const p of this.particles){
            if(p.front!==front||p.trail.length<2)continue;
            const heat=Math.max(0,1-p.age/p.max),fade=Math.min(1,p.age/.08)*Math.pow(heat,.65);
            const trail=p.trail;c.beginPath();c.moveTo(trail[0].x,trail[0].y);
            for(let i=1;i<trail.length-1;i++){const a=trail[i],b=trail[i+1];c.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}c.lineTo(p.x,p.y);
            if(!p.spark){c.strokeStyle='#d0ad43';c.globalAlpha=fade*.075;c.lineWidth=p.width*6;c.stroke();}
            c.strokeStyle=p.spark?'#ac8034':p.id%3===0?'#bf9240':'#cfb568';c.globalAlpha=fade*(p.spark?.8:.67);c.lineWidth=p.width*(.45+heat*.75);c.stroke();
            if(p.spark){c.fillStyle='#d4b453';c.globalAlpha=fade*.85;c.beginPath();c.arc(p.x,p.y,1.2*p.scale,0,Math.PI*2);c.fill();}
        }
        c.restore();
    }
    diagnostics(){return{count:this.particles.length,deflections:this.deflections,bounces:this.bounces,active:this.wasActive,particles:this.particles.map(p=>({id:p.id,x:p.x,y:p.y,birthX:p.birthX,birthY:p.birthY,vx:p.vx,vy:p.vy,spark:p.spark,age:p.age,trail:p.trail.length}))};}
}
