import {rockContour,rockSource} from './rock-reference.js';
await new Promise((resolve,reject)=>{if(globalThis.Matter)return resolve();const script=document.createElement('script');script.src=new URL('./assets/vendor/matter.min.js',import.meta.url).href;script.onload=resolve;script.onerror=()=>reject(new Error('Physics engine could not load'));document.head.append(script);});
const {Engine,Bodies,Body,Composite,Events,Constraint,Vertices}=globalThis.Matter;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const EROSION_RATE=3;
const smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
// The user's clipboard ridge: a resting shelf and uneven ledges, then a summit
// that keeps rising. No crown shelf or reverse-facing notch can park the stone.
const profile=[[0,0],[.075,0],[.105,-.003],[.13,0],[.163,.045],[.195,.052],[.218,.09],[.234,.16],[.253,.18],[.265,.225],[.292,.23],[.315,.216],[.335,.215],[.348,.23],[.366,.218],[.392,.30],[.403,.355],[.438,.40],[.46,.444],[.477,.43],[.496,.427],[.511,.49],[.527,.512],[.56,.53],[.583,.528],[.596,.604],[.627,.65],[.647,.627],[.667,.62],[.689,.66],[.717,.75],[.74,.786],[.76,.822],[.771,.845],[.783,.87],[.807,.905],[.839,.965],[.856,1.005],[.875,1.048],[.90,1.095],[.92,1.15],[.927,1.169],[.948,1.219],[.966,1.261],[1,1.34]];
function elevation(u){let i=0;while(i<profile.length-2&&profile[i+1][0]<u)i++;const a=profile[i],b=profile[i+1],f=clamp((u-a[0])/(b[0]-a[0]),0,1);return a[1]+(b[1]-a[1])*f;}
const ridge=Array.from({length:53},(_,i)=>elevation(i/52));

export class HillPhysics {
    constructor(w,h,onImpact){
        this.w=w;this.h=h;this.onImpact=onImpact;this.accumulator=0;this.steps=0;this.time=0;
        this.engine=Engine.create({positionIterations:12,velocityIterations:10,constraintIterations:6});
        this.engine.gravity.y=1;this.engine.gravity.scale=.001;
        this.radius=clamp(w*.058,35,80);this.segmentCount=52;
        this.nodes=Array.from({length:53},(_,i)=>({x:i*w/52,y:0,v:0,eroded:0,damage:0}));this.segments=[];this.faults=[];this.slabs=[];this.terrainBreaks=0;this.terrainVersion=0;this.terrainChanging=false;
        for(let i=0;i<52;i++){
            const [x1,y1]=this.point(i),[x2,y2]=this.point(i+1);
            const body=Bodies.rectangle((x1+x2)/2,(y1+y2)/2+82,Math.hypot(x2-x1,y2-y1)+3,164,{isStatic:true,friction:.62,restitution:0,label:'soil'});
            this.segments.push(body);Composite.add(this.engine.world,body);
        }
        Composite.add(this.engine.world,[Bodies.rectangle(-60,h/2,120,h*4,{isStatic:true,restitution:.2}),Bodies.rectangle(w+60,h/2,120,h*4,{isStatic:true,restitution:.2}),Bodies.rectangle(w/2,h+100,w+240,160,{isStatic:true})]);
        // Physical contact follows the clipboard stone's traced silhouette.
        const scale=this.radius/rockSource.unit;
        const hull=Vertices.clockwiseSort(Vertices.hull(rockContour.map(p=>({x:p.x*scale,y:p.y*scale}))));
        const centre=Vertices.centre(hull);this.referenceOrigin={x:-centre.x,y:-centre.y};
        this.initialReferenceOrigin={...this.referenceOrigin};
        this.rock=Bodies.fromVertices(w*.59,this.ground(w*.59)-this.radius-4,[hull],{density:.0138,friction:.82,frictionStatic:1.15,frictionAir:.0018,restitution:.22,label:'boulder'});
        this.originalArea=this.rock.area;this.chips=[];this.chipCount=0;this.fractures=[];this.lastChip=-100;
        this.initialOutline=this.rock.vertices.map(v=>({x:v.x-this.rock.position.x,y:v.y-this.rock.position.y}));
        Composite.add(this.engine.world,this.rock);
        this.rock.collisionFilter.category=2;
        this.reposition=null;this.intercept=null;this.lane=0;this.facing=1;this.repositionCount=0;
        this.catchGap=0;this.lastGripAt=-100;this.lastGroundAt=-100;this.gripGrace=false;this.catchArmed=false;this.catchBeat=0;this.catchImpactAt=-100;this.catchSpeed=0;
        this.stepUntil=0;this.nextStep=0;
        this.drag=null;this.dragSamples=[];this.impactCount=0;this.maxIndent=0;this.catchCount=0;this.maxSlide=0;
        this.emotion='calm';this.emotionSince=0;this.setbackAt=-100;this.earnedX=w*.59;this.nextPanicHop=0;this.panicHops=0;
        this.trip=null;this.tripCount=0;this.nextTrip=0;this.assist=null;this.actorFlight=null;
        this.splat=null;this.springUntil=0;this.actor=null;this.control={pet:0};this.mode='walk';this.effort=0;this.catchAge=0;this.catchActive=false;this.contact=false;this.grounded=false;this.landed=0;this.celebrate=0;this.restUntil=0;this.workAge=0;this.stroke=0;this.pushForce=0;this.slipUntil=0;this.recoverUntil=0;
        Events.on(this.engine,'beforeUpdate',()=>{this.rock.plugin.preV={...this.rock.velocity};if(this.actor)this.actor.plugin.preV={...this.actor.velocity};});
        Events.on(this.engine,'collisionStart',({pairs})=>{
            for(const p of pairs){
                const a=p.bodyA,b=p.bodyB;
                if((a===this.rock&&b===this.actor)||(b===this.rock&&a===this.actor)){
                    let v=this.rock.plugin.preV||this.rock.velocity;const av=this.actor.plugin.preV||this.actor.velocity;
                    if(this.drag?.bodyB===this.rock){const scale=(1000/60)/(this.rock.deltaTime||1000/180),moved={x:(this.rock.position.x-this.rock.positionPrev.x)*scale,y:(this.rock.position.y-this.rock.positionPrev.y)*scale};if(Math.hypot(moved.x,moved.y)>Math.hypot(v.x,v.y))v=moved;}
                    const dx=this.actor.position.x-this.rock.position.x,dy=this.actor.position.y-this.rock.position.y,d=Math.hypot(dx,dy)||1;
                    const closing=((v.x-av.x)*dx+(v.y-av.y)*dy)/d;
                    if(!this.splat&&this.drag?.bodyB!==this.actor&&closing>(this.assist?10:5.2)){this.flatten();continue;}
                    if(!this.drag&&!this.actorFlight&&(this.catchArmed||this.intercept||v.x<-.9||v.y>1.5)&&this.time>this.restUntil)this.startCatch();
                }
                if(!((a.label==='soil'&&b===this.rock)||(b.label==='soil'&&a===this.rock)))continue;
                const v=this.rock.plugin.preV||this.rock.velocity,s=this.slope(this.rock.position.x);
                const speed=(v.y-v.x*s)/Math.hypot(1,s);
                if(speed<1.7||this.time-(this.rock.plugin.lastImpact??-100)<.13)continue;
                this.rock.plugin.lastImpact=this.time;const x=this.rock.position.x,y=this.ground(x);
                this.dent(x,clamp(speed*9,0,155));this.impactCount++;
                if(speed>5.8&&this.time-this.lastChip>.65)this.chipRock(s,p.collision.supports);
                this.onImpact?.({x,y,speed,rock:true});
            }
        });
        this.updateGround();this.seedTerrain();
    }
    base(x){
        const k=clamp(x/this.w*52,0,52),i=Math.min(51,Math.floor(k)),f=k-i;
        const rise=Math.min(this.h*.40,this.w*.48),baseline=this.w<760?(this.h<700?.70:.74):.84;
        // The last quarter grows steadily steeper; retain the same crag offsets.
        const lo=clamp((i/52-.78)/.22,0,1),hi=clamp(((i+1)/52-.78)/.22,0,1);
        const summit=.60*(lo*lo+(hi*hi-lo*lo)*f);
        return this.h*baseline-rise*(ridge[i]+(ridge[i+1]-ridge[i])*f+summit);
    }
    point(i){const n=this.nodes[i];return[n.x,this.base(n.x)+n.y];}
    ground(x){const k=clamp(x/this.w*52,0,51.9999),i=Math.floor(k),f=k-i;return this.base(x)+this.nodes[i].y*(1-f)+this.nodes[i+1].y*f;}
    slope(x){return(this.ground(x+3)-this.ground(x-3))/6;}
    fracturePaths(x,width,seed=this.terrainBreaks){
        let state=(Math.round(x*173)+seed*7919+223)|0;
        const rand=()=>{state=(Math.imul(state,1664525)+1013904223)|0;return(state>>>0)/4294967296;};
        const paths=[];
        for(let trunk=0;trunk<4;trunk++){
            const root=clamp(x+(rand()-.5)*width*.65,0,this.w),side=rand()>.5?1:-1;
            const span=width*(.38+rand()*.68),depth=13+rand()*35,pts=[];
            for(let i=0;i<8;i++){
                const u=i/7,px=clamp(root+side*span*u+(Math.sin(i*1.7+trunk)*.12+(rand()-.5)*.15)*width*u,0,this.w);
                pts.push([px,this.ground(px)+depth*(u*.75+u*u*.25)+(i?Math.sin(i*2.2+trunk)*3:0)]);
            }
            paths.push(pts);
            const start=pts[2+Math.floor(rand()*3)],branch=[start];
            for(let i=1;i<5;i++){
                const px=clamp(start[0]-side*span*i*.14+(rand()-.5)*6,0,this.w);
                branch.push([px,Math.max(this.ground(px)+2,start[1]+i*(2+rand()*3))]);
            }
            paths.push(branch);
        }
        return paths;
    }
    seedTerrain(){
        // Uneven weathered patches carry real initial damage, just like later hits.
        const width=Math.max(this.w/52*1.7,this.radius*.85);
        for(let i=0,x=width*.36;x<this.w*.965;i++){
            const variation=Math.abs(Math.sin(i*31.73+4));
            this.dent(x,15+variation*8);
            const fault=this.faults.at(-1);fault.born=this.time-1;
            x+=width*(.80+variation*.47);
        }
    }
    dent(x,power){
        x=clamp(x,0,this.w*.955);
        const speed=power/9,width=Math.max(this.w/52*1.7,this.radius*.85);
        const node=this.nodes[Math.round(clamp(x/this.w*52,0,52))];
        let fault=this.faults.find(f=>!f.broken&&Math.abs(f.x-x)<width*.70);
        if(!fault){
            const paths=this.fracturePaths(x,width);
            fault={x,born:this.time,speed,width,paths,damage:0,broken:false,breakAt:Infinity,depth:0};
            this.faults.push(fault);if(this.faults.length>64)this.faults.shift();
        }
        // One persistent fracture per patch. Impact energy consumes its remaining
        // capacity; the same damage determines crack growth and actual collapse.
        fault.damage=Math.min(1.5,fault.damage+(speed/5.8)**2*EROSION_RATE*.95);
        fault.speed=Math.max(fault.speed,speed);
        fault.depth=Math.max(fault.depth,clamp((speed-4)*.75,1.8,6.5)*EROSION_RATE);
        if(fault.damage>=1&&!Number.isFinite(fault.breakAt))fault.breakAt=this.time+.16/EROSION_RATE;
    }
    erodeGround(dt){
        const loaded=!this.drag&&!this.rock.isStatic&&this.engine.pairs.list.some(p=>p.isActive&&((p.bodyA===this.rock&&p.bodyB.label==='soil')||(p.bodyB===this.rock&&p.bodyA.label==='soil')));
        for(const n of this.nodes)n.damage=0;
        for(const fault of this.faults){
            if(!fault.broken){
                const overlap=Math.max(0,1-Math.abs(this.rock.position.x-fault.x)/(fault.width+this.radius*.6));
                // A cracked ledge creeps under the rock's actual supported weight.
                if(loaded&&overlap>0)fault.damage=Math.min(1.5,fault.damage+dt*.225*overlap*this.rock.mass/(this.originalArea*.0138));
                if(fault.damage>=1&&!Number.isFinite(fault.breakAt))fault.breakAt=this.time+.16/EROSION_RATE;
                for(const n of this.nodes){const local=Math.max(0,1-Math.abs(n.x-fault.x)/fault.width);n.damage=Math.max(n.damage,Math.min(1,fault.damage)*local);}
            }
            if(fault.broken||this.time<fault.breakAt)continue;
            fault.broken=true;this.terrainBreaks++;
            if(fault.depth>8)this.collapseSlab(fault);
            for(let i=0;i<this.nodes.length;i++){
                const n=this.nodes[i],u=Math.abs(n.x-fault.x)/fault.width;
                  if(u>=1.5||n.x>this.w*.963)continue;
                const weight=Math.pow(Math.max(0,1-u/1.5),1.6);
                const crag=.82+.18*Math.sin(i*13.17+fault.x*.037)**2;
                n.eroded+=fault.depth*weight*crag/(1+n.eroded/(this.h*.75));
            }
            this.onImpact?.({x:fault.x,y:this.ground(fault.x),speed:clamp(fault.depth/2,3,7),rock:false,terrain:true,depth:fault.depth,width:fault.width});
        }
        let changing=false;
        for(const n of this.nodes){
            const left=n.eroded-n.y;
            if(left>0){n.y=left<.0001?n.eroded:n.y+left*Math.min(1,dt*30*EROSION_RATE);changing=true;}
            this.maxIndent=Math.max(this.maxIndent,n.y);
        }
        if(changing)this.terrainVersion++;
        this.terrainChanging=changing;
        const offspring=[];
        for(const f of this.faults){
            if(!f.broken||f.propagated||this.time-f.breakAt<.13)continue;
            f.propagated=true;
            offspring.push([f.x,17+Math.min(.5,f.damage-1)*12]);
            for(const side of [-1,1])offspring.push([clamp(f.x+side*f.width*.85,0,this.w),10+Math.min(f.depth,20)*.25]);
        }
        // Collapse weakens the newly exposed floor and stresses the two shoulders.
        // These children carry damage and can fail on the next hit or sustained load.
        for(const [x,power]of offspring)this.dent(x,power);
        // A surviving fault can have its entire visible mouth eroded away by a
        // neighbour. Keep its structural damage, but expose new branches below
        // the current surface rather than treating buried ink as visible cracks.
        for(const f of this.faults){
            if(f.broken)continue;
            const mouths=f.paths.filter(path=>path[0][1]>=this.ground(path[0][0])-4).length;
            const visible=f.paths.filter(path=>path.some(([x,y])=>y>this.ground(x)+3)).length;
            if(mouths<f.paths.length/2||visible<3){
                f.paths=this.fracturePaths(f.x,f.width,this.terrainVersion+this.terrainBreaks);
                f.born=this.time-.05;f.generation=(f.generation||0)+1;
            }
        }
        // Fractures belong to the material, not to a decal that follows the surface.
        this.faults=this.faults.filter(f=>!f.broken||!f.propagated||this.time-f.breakAt<.35&&f.paths.some(path=>path.some(([x,y])=>y>this.ground(x)+.3)));
    }
    failUnsupportedRidge(dt){
        const spacing=this.w/52,failures=[];
        for(let i=1;i<=50;i++){
            const n=this.nodes[i],surface=this.base(n.x)+n.eroded;
            let deficit=0;
            for(const j of[i-1,i+1]){const neighbour=this.nodes[j];if(neighbour.eroded<18)continue;const initial=Math.abs(this.base(neighbour.x)-this.base(n.x)),capacity=Math.max(spacing*.9,initial*1.35);deficit=Math.max(deficit,this.base(neighbour.x)+neighbour.eroded-capacity-surface);}
            n.supportStress=Math.max(0,(n.supportStress||0)+(deficit>7?dt*deficit/spacing*1.7:-dt));
            if(n.supportStress>.55){n.supportStress=0;failures.push({n,depth:Math.min(deficit,this.h*.12)});}
        }
        for(const {n,depth}of failures){
            const width=spacing*1.4;
            this.collapseSlab({x:n.x,width,depth});n.eroded+=depth;this.terrainBreaks++;this.terrainVersion++;
            this.dent(n.x,17);this.dent(Math.max(0,n.x-spacing),11);this.dent(Math.min(this.w*.955,n.x+spacing),11);
            this.onImpact?.({x:n.x,y:this.ground(n.x),speed:5,terrain:true,depth,width});
        }
        // The off-page continuation inherits summit movement instead of acting as an immortal support.
        if(this.nodes[50].eroded>0)for(let i=51;i<53;i++)this.nodes[i].eroded=Math.max(this.nodes[i].eroded,this.nodes[50].eroded);
    }
    collapseSlab(fault){
        if(this.slabs.length>=12)return;
        const width=Math.min(fault.width*.55,23),height=5+Math.min(fault.depth*.35,8),x=clamp(fault.x,width,this.w*.95),y=this.ground(x)+height;
        // The visible shard comes from this ledge's actual surface and a wandering fracture.
        // A convex collision hull is hidden behind that irregular pen outline.
        const outline=[];
        for(let i=0;i<=6;i++){const px=x-width*.5+width*i/6;outline.push({x:px,y:this.ground(px)+1});}
        for(let i=6;i>=0;i--){const px=x-width*.5+width*i/6,jag=Math.sin(fault.x*.37+i*4.71)*height*.17;outline.push({x:px+Math.sin(i*2.3)*2,y:this.ground(px)+height*(.5+.26*Math.sin(i*.8+1)**2)+jag});}
        const centre=Vertices.centre(Vertices.hull(outline));
        const body=Bodies.fromVertices(centre.x,centre.y,[Vertices.hull(outline)],{density:.0015,friction:.65,restitution:.08,collisionFilter:{category:4,mask:4},label:'fractured ledge'});
        const inkOutline=outline.map(p=>({x:p.x-centre.x,y:p.y-centre.y}));
        const anchor=clamp(x-width*.75,0,this.w*.95);
        const tether=Constraint.create({pointA:{x:anchor,y:this.ground(anchor)},bodyB:body,pointB:{x:-width*.3,y:-height*.35},length:width*.65,stiffness:.025,damping:.12});
        Body.setAngularVelocity(body,(this.terrainBreaks%2?1:-1)*.07);Body.setVelocity(body,{x:.6,y:1.3});
        Composite.add(this.engine.world,[body,tether]);this.slabs.push({body,tether,anchor,inkOutline,born:this.time});
    }
    contour(){
        const points=[];
        for(let i=0;i<=51;i++){const x=Math.min(this.w*.963,i*this.w/52);points.push([x,this.ground(x)]);}
        return points;
    }
    updateGround(){
        for(let i=0;i<52;i++){
            const[x1,y1]=this.point(i),[x2,y2]=this.point(i+1),b=this.segments[i];
            if(b.plugin.surface?.[0]===y1&&b.plugin.surface?.[1]===y2)continue;
            const slope=(y2-y1)/(x2-x1),pad=.8;
            Body.setAngle(b,0);
            Body.setVertices(b,[{x:x1-pad,y:y1-slope*pad},{x:x2+pad,y:y2+slope*pad},{x:x2+pad,y:y2+slope*pad+164},{x:x1-pad,y:y1-slope*pad+164}]);
            Body.setPosition(b,{x:(x1+x2)/2,y:(y1+y2)/2+82});
            b.plugin.surface=[y1,y2];
        }
    }
    terrainState(){
        return {height:this.h,surface:this.nodes.map(n=>[n.y,n.eroded]),breaks:this.terrainBreaks,faults:this.faults.map(f=>({...f,x:f.x/this.w,width:f.width/this.w,age:this.time-f.born,wait:f.breakAt-this.time,depth:f.depth/this.h,paths:f.paths.map(path=>path.map(([x,y])=>[x/this.w,(y-this.base(x))/this.h]))}))};
    }
    restoreTerrain(state){
        if(!state)return;const scale=this.h/state.height;
        state.surface.forEach(([y,eroded],i)=>{this.nodes[i].y=y*scale;this.nodes[i].eroded=eroded*scale;});
        this.faults=state.faults.map(f=>({...f,x:f.x*this.w,width:f.width*this.w,born:this.time-f.age,breakAt:this.time+f.wait,depth:f.depth*this.h,paths:f.paths.map(path=>path.map(([u,d])=>[u*this.w,this.base(u*this.w)+d*this.h]))}));
        this.terrainBreaks=state.breaks;this.terrainVersion++;this.updateGround();
    }
    outline(){const b=this.rock,co=Math.cos(b.angle),si=Math.sin(b.angle);return b.vertices.map(v=>{const x=v.x-b.position.x,y=v.y-b.position.y;return{x:x*co+y*si,y:-x*si+y*co};});}
    chipRock(slope){
        if(this.chipCount>=7||this.rock.area<this.originalArea*.955)return;
        const b=this.rock,points=b.vertices.map(v=>({x:v.x,y:v.y}));
        let k=0;for(let i=1;i<points.length;i++)if(points[i].y-points[i].x*slope>points[k].y-points[k].x*slope)k=i;
        const v=points[k],prev=points[(k+points.length-1)%points.length],next=points[(k+1)%points.length];
        const trim=Math.min(clamp(this.radius*.08,2,6),Math.hypot(prev.x-v.x,prev.y-v.y)*.35,Math.hypot(next.x-v.x,next.y-v.y)*.35),a=trim/Math.hypot(prev.x-v.x,prev.y-v.y),d=trim/Math.hypot(next.x-v.x,next.y-v.y);
        if(a>.48||d>.48)return; // Never chew a tiny existing facet into numerical slivers.
        const left={x:v.x+(prev.x-v.x)*a,y:v.y+(prev.y-v.y)*a},right={x:v.x+(next.x-v.x)*d,y:v.y+(next.y-v.y)*d};
        const clipped=[...points.slice(0,k),left,right,...points.slice(k+1)],newCentre=Vertices.centre(clipped),velocity={...b.velocity},angular=b.angularVelocity;
        const oldArea=b.area,dx=b.position.x-newCentre.x,dy=b.position.y-newCentre.y;
        this.referenceOrigin.x+=dx*Math.cos(b.angle)+dy*Math.sin(b.angle);
        this.referenceOrigin.y+=-dx*Math.sin(b.angle)+dy*Math.cos(b.angle);
        Body.setVertices(b,clipped);Body.setPosition(b,newCentre);Body.setVelocity(b,velocity);Body.setAngularVelocity(b,angular);
        // The missing corner is also a small rigid body, with inherited momentum.
        const shardCentre=Vertices.centre([v,left,right]);
        const shard=Bodies.fromVertices(shardCentre.x,shardCentre.y,[[v,left,right]],{density:.0045,friction:.72,restitution:.16,frictionAir:.003,label:'chip'},false,0,0);
        Body.setVelocity(shard,{x:velocity.x-slope*1.2+(this.chipCount%2?1:-1),y:Math.min(-1.4,velocity.y*.08-1.8)});Body.setAngularVelocity(shard,angular+.12);
        this.chips.push({body:shard,born:this.time});Composite.add(this.engine.world,shard);
        const co=Math.cos(b.angle),si=Math.sin(b.angle),local=p=>({x:(p.x-b.position.x)*co+(p.y-b.position.y)*si,y:-(p.x-b.position.x)*si+(p.y-b.position.y)*co});
        this.fractures.push({a:local(left),b:local(right)});this.chipCount++;this.lastChip=this.time;
        this.lastChipArea=oldArea-b.area;
    }
    addMeowl(size){
        this.actorSize=size;this.actorHeight=size*.79;this.actorWidth=size*.38;
        const x=this.rock.position.x-this.radius-size*.32;
        this.actor=Bodies.rectangle(x,this.ground(x)-this.actorHeight/2,this.actorWidth,this.actorHeight,{chamfer:{radius:size*.14},friction:.72,frictionStatic:.9,frictionAir:.009,restitution:0,inertia:Infinity,label:'meowl'});
        Body.setMass(this.actor,size*size*.0022);this.strength=this.actor.mass*(this.w<760?.0108*1.224:.0096*1.05);this.baseStrength=this.strength;Body.setInertia(this.actor,Infinity);Composite.add(this.engine.world,this.actor);
    }
    flatten(){
        if(this.splat||!this.actor)return;
        const a=this.actor;if(this.drag?.bodyB===a)this.release(false);this.actorFlight=null;this.catchActive=false;this.catchArmed=false;this.reposition=null;this.intercept=null;this.lane=0;
        this.splat={age:0,width:this.actorWidth,height:this.actorHeight,mass:a.mass,x:a.position.x};this.mode='flattened';
        const bottom=a.position.y+this.actorHeight/2;
        Body.scale(a,2.7,.10);Body.setMass(a,this.splat.mass);Body.setInertia(a,Infinity);
        this.actorWidth*=2.7;this.actorHeight*=.10;
        Body.setPosition(a,{x:a.position.x,y:bottom-this.actorHeight/2});Body.setVelocity(a,{x:a.velocity.x*.3,y:0});
        a.collisionFilter.mask=0xFFFFFFFF;Body.setVelocity(a,{x:0,y:0});Body.setStatic(a,true);a.friction=.9;
    }
    unsplat(jump=true){
        if(!this.splat)return;
        const a=this.actor,s=this.splat,bottom=this.ground(a.position.x);
        Body.setStatic(a,false);Body.scale(a,s.width/this.actorWidth,s.height/this.actorHeight);Body.setMass(a,s.mass);Body.setInertia(a,Infinity);
        this.actorWidth=s.width;this.actorHeight=s.height;
        Body.setPosition(a,{x:a.position.x,y:bottom-s.height/2-2});a.collisionFilter.mask=0xFFFFFFFF;
        Body.setVelocity(a,{x:jump?(s.escape||-1)*2.2:0,y:jump?-4.2:0});this.splat=null;this.springUntil=jump?this.time+.7:0;
        this.mode=jump?'spring':'walk';this.catchAge=0;this.workAge=0;
    }
    startCatch(){
        if(this.catchActive||this.reposition||this.splat||!this.actor||this.rock.position.x<this.actor.position.x)return;
        const braced=this.catchArmed||!!this.intercept||this.mode==='anticipate';
        const v=this.rock.plugin.preV||this.rock.velocity;
        this.catchSpeed=Math.hypot(v.x-this.actor.velocity.x,v.y-this.actor.velocity.y);
        this.catchActive=true;this.catchArmed=false;this.intercept=null;this.catchAge=0;this.catchGap=0;this.catchX=this.actor.position.x;
        this.catchCount++;this.mode='brace';this.facing=1;
        // The planted pose arms the accent. Actual contact releases it even if
        // friction has slowed the stone below the old speed gate. catchActive
        // prevents successive polygon contacts from replaying the same catch.
        if(braced||(this.catchSpeed>2.6&&this.time-this.catchImpactAt>1.1)){this.catchImpactAt=this.time;this.catchBeat++;}
    }
    plantIntercept(){
        this.reposition=null;this.intercept={age:0};this.catchArmed=true;this.facing=1;
        this.actor.collisionFilter.mask=0xFFFFFFFF;this.actor.friction=.86;
        this.mode='anticipate';this.effort=.65;this.workAge=0;
    }
    waitForRock(dt){
        const a=this.actor,b=this.rock,r=this.intercept;r.age+=dt;
        this.lane*=Math.exp(-dt*16);this.facing=1;this.mode='anticipate';this.effort=.7;
        if(this.contact){this.startCatch();return false;}
        const gap=b.bounds.min.x-a.bounds.max.x;
        if(b.bounds.max.x<a.bounds.min.x-this.actorSize*.2){
            this.intercept=null;this.reposition={phase:'around',age:0};a.collisionFilter.mask=0xFFFFFFFF;return true;
        }
        if(r.age>2.5&&b.velocity.x>-.2){this.intercept=null;this.lane=0;return false;}
        // Stop chasing a moving grip point. Plant downhill and let it arrive.
        // If it settles on a ledge, close the remaining gap once, facing uphill.
        const approach=r.age>.4&&b.velocity.x>-.35?clamp((b.position.x-this.radius+this.actorWidth*.13-a.position.x)*.065,0,1.1):0;
        a.friction=approach>.1?.4:.86;a.frictionStatic=1.2;
        this.pushForce=clamp((approach-a.velocity.x)*a.mass*.009,-this.strength*1.1,this.strength*1.4);
        Body.applyForce(a,a.position,{x:this.pushForce,y:0});
        if(r.age>5.5&&gap>this.actorSize*2){this.intercept=null;this.lane=0;}
        return true;
    }
    recoverSide(dt){
        const a=this.actor,b=this.rock,r=this.reposition;
        r.age+=dt;this.catchActive=false;this.contact=false;this.effort=0;
        a.friction=.05;a.frictionStatic=.1;
        // Recover by physically hopping over the stone; never change collision layers.
        const edge=b.bounds.min.x-this.actorWidth*.72;
        const target=clamp(edge-this.actorSize*.48-Math.max(0,-b.velocity.x)*16,this.actorWidth*.65+3,this.w-this.actorWidth);
        let desired=0;
        if(r.phase==='startle'){
            this.mode='scramble';this.facing=1;
            this.lane=smooth(r.age/.36);desired=-.65;
            if(r.age>.36){r.phase='around';r.age=0;a.collisionFilter.mask=0xFFFFFFFF;}
        }else if(r.phase==='around'){
            this.mode='scurry';this.facing=-1;this.lane=0;
            if(a.position.x>b.position.x&&Math.abs(a.position.x-b.position.x)<this.radius+this.actorWidth*1.6&&this.grounded){this.actorFlight={age:.7,phase:'flutter',homeX:target};return;}
            desired=clamp((target-a.position.x)*.16,-6.8,0);
            const clear=a.bounds.max.x<b.bounds.min.x-Math.min(this.actorSize*.4,Math.max(5,b.bounds.min.x-this.actorWidth*1.9));
            if(clear){this.plantIntercept();return;}
            // At the edge, wait in the foreground instead of chattering into a wall.
            if(a.position.x<this.actorWidth*.8+4&&target<=this.actorWidth*.65+4&&!clear){r.phase='edgebrace';r.age=0;}
        }else if(r.phase==='edgebrace'){
            // A short foreground shove makes room to step behind a stone at the wall.
            // Use the same finite strength, never translate the rock or scale by its mass.
            this.mode='heave';this.facing=1;this.lane=.8;this.effort=.9;
            this.stroke=(r.age%2.55)/2.55;
            const pulse=.45+.55*Math.sin(Math.PI*clamp(this.stroke/.8,0,1));
            if(!this.drag&&this.grounded&&b.position.x>a.position.x&&b.bounds.min.x<a.bounds.max.x+12){
                Body.applyForce(b,{x:b.bounds.min.x+4,y:b.position.y+this.radius*.4},{x:this.strength*pulse,y:-this.strength*.12});
            }
            if(a.bounds.max.x<b.bounds.min.x-5){this.plantIntercept();return;}
        }
        this.pushForce=clamp((desired-a.velocity.x)*a.mass*.0028,-this.strength*1.35,this.strength*.8);
        Body.applyForce(a,a.position,{x:this.pushForce,y:0});
    }
    driveActor(dt){
        const a=this.actor,b=this.rock;if(!a)return;
        // A pointer throw owns the entire actor until its landing is complete.
        // Hill chasing, pushing, foot planting and panic cannot steer it meanwhile.
        if(this.drag?.bodyB===a){this.mode='held';this.contact=false;this.gripGrace=false;this.grounded=false;this.effort=0;this.pushForce=0;this.lane=0;a.collisionFilter.mask=0xFFFFFFFF;return;}
        if(this.actorFlight){
            const f=this.actorFlight;f.age+=dt;this.contact=false;this.gripGrace=false;this.grounded=false;this.pushForce=0;this.effort=0;this.lane=0;
            if(f.age<.7){this.mode='tossed';return;}
            f.phase='flutter';this.mode='flutter';a.collisionFilter.mask=0xFFFFFFFF;
            const tx=f.homeX??=clamp(b.bounds.min.x-this.actorWidth*.7-14,this.actorWidth*.7+8,this.w-this.actorWidth);
            const homeY=this.ground(tx)-this.actorHeight/2-3;
            const crossing=(a.position.x>b.bounds.min.x&&tx<b.bounds.min.x)||(a.position.x<b.bounds.max.x&&tx>b.bounds.max.x);
            const clearance=Math.min(b.bounds.min.y,this.ground(a.position.x),this.ground(tx))-this.actorHeight*.65-16;
            const blocked=crossing&&a.bounds.max.y>b.bounds.min.y-10;
            const targetX=blocked?a.position.x:tx,targetY=blocked?clearance:homeY;
            const dx=targetX-a.position.x,dy=targetY-a.position.y,d=Math.hypot(tx-a.position.x,homeY-a.position.y);
            const speed=Math.hypot(a.velocity.x,a.velocity.y),lift=Math.sin(this.time*19)*Math.min(1,d/80)*.00018;
            // Desired velocities are Matter's pixels per nominal 60 Hz step.
            const vx=clamp(dx*.055,-7.5,7.5),vy=clamp(dy*.055,-7.5,7.5);
            Body.applyForce(a,a.position,{x:a.mass*(vx-a.velocity.x)*.0008,y:a.mass*((vy-a.velocity.y)*.0008-this.engine.gravity.y*this.engine.gravity.scale+lift)});
            if(Math.abs(dx)>14)this.facing=dx<0?-1:1;
            if(d<5&&speed<.8){this.actorFlight=null;a.collisionFilter.mask=0xFFFFFFFF;this.mode='recover';this.recoverUntil=this.time+.35;this.lastGripAt=-100;this.nextTrip=this.time+2;}
            return;
        }
        if(this.splat){
            this.splat.age+=dt;this.mode='flattened';this.contact=false;this.effort=0;this.pushForce=0;
            // A pancake is painted onto this exact patch of ground. It cannot
            // surf downhill with the stone; only the spring restores its body.
            Body.setPosition(a,{x:this.splat.x,y:this.ground(this.splat.x)-this.actorHeight/2});
            if(this.splat.age>2.05){
                const clear=Math.abs(b.position.x-a.position.x)>this.radius+this.splat.width*.65||b.position.y+this.radius<this.ground(a.position.x)-this.splat.height-12;
                if(clear||this.drag?.bodyB===b){this.unsplat();return;}
                if(this.splat.age>2.8){
                    this.unsplat();a.collisionFilter.mask=0xFFFFFFFF;
                    this.reposition={phase:'around',age:0};this.lane=1;return;
                }
            }
            return;
        }
        if(this.time<this.springUntil){this.mode='spring';this.effort=0;return;}
        this.celebrate=Math.max(0,this.celebrate-dt);this.landed=Math.max(0,this.landed-dt);
        const wasContact=this.contact;this.gripGrace=false;this.contact=false;this.rockGrounded=false;let ground=false;
        for(const pair of this.engine.pairs.list){if(!pair.isActive)continue;
            const one=pair.bodyA,two=pair.bodyB;
            if((one===a&&two===b)||(one===b&&two===a))this.contact=true;
            if((one===a&&two.label==='soil')||(two===a&&one.label==='soil'))ground=true;
            if((one===b&&two.label==='soil')||(two===b&&one.label==='soil'))this.rockGrounded=true;
        }
        if(ground&&!this.grounded&&this.time-this.lastGroundAt>.14){this.landed=.35;this.recoverUntil=this.time+.4;}
        if(ground)this.lastGroundAt=this.time;
        this.grounded=ground;this.pushForce=0;
        if(this.drag){this.trip=null;this.intercept=null;}
        if(this.drag?.bodyB===a){this.mode='held';this.catchActive=false;this.effort=0;this.reposition=null;this.lane=0;a.collisionFilter.mask=0xFFFFFFFF;return;}
        if(!this.trip&&!this.drag&&!this.assist&&this.contact&&ground&&b.position.x>this.w*.84&&this.time>this.nextTrip){
            this.trip={age:0};this.tripCount++;this.nextTrip=this.time+12;this.catchActive=false;this.setbackAt=this.time;
            Body.setVelocity(a,{x:-1.9,y:-1.1});
        }
        if(this.trip){
            this.trip.age+=dt;this.mode='trip';this.effort=0;a.friction=.06;
            if(this.trip.age>.45&&this.contact){this.trip=null;this.flatten();return;}
            if(this.trip.age>2.5){this.trip=null;this.recoverUntil=this.time+.8;}else return;
        }
        const rockAbove=b.position.y+this.radius<Math.min(this.ground(b.position.x)-this.actorSize*1.05,a.position.y+this.actorHeight*.1);
        if(rockAbove&&!this.contact&&!this.reposition&&!(this.control.pet>0)){
            // Chase the real airborne rock, then jump from actual ground contact.
            // Air steering is bounded; neither character nor rock is teleported.
            this.mode='panic';this.catchActive=false;this.effort=.4;
            const dx=b.position.x-a.position.x,desired=clamp(dx*.055,-2.3,2.3);
            if(Math.abs(dx)>this.actorSize*.45)this.facing=dx<0?-1:1;
            this.pushForce=clamp((desired-a.velocity.x)*a.mass*.0022,-this.strength*.8,this.strength*.8);
            a.friction=.22;Body.applyForce(a,a.position,{x:this.pushForce,y:0});
            if(ground&&this.time>this.nextPanicHop&&Math.abs(dx)<this.actorSize*1.7){
                Body.setVelocity(a,{x:a.velocity.x,y:-4.4});this.nextPanicHop=this.time+1.05;this.panicHops++;
            }
            return;
        }
        // A grounded meowl can support the rock over a ledge. Contact means it is reachable.
        const reachGap=b.bounds.min.x-a.bounds.max.x;
        const atWingHeight=b.bounds.max.y>a.bounds.min.y+this.actorHeight*.18&&b.bounds.min.y<a.bounds.max.y;
        const closeReach=atWingHeight&&reachGap<this.actorSize*.24&&reachGap>-this.radius&&b.position.x>a.position.x;
        if(this.contact&&closeReach)this.lastGripAt=this.time;
        this.gripGrace=!this.drag&&closeReach&&this.time-this.lastGripAt<.18;
        const rockLow=b.position.y+this.radius>this.ground(b.position.x)-18||(this.contact&&ground)||closeReach;
        if(this.intercept&&this.waitForRock(dt))return;
        if(!this.reposition&&!this.catchActive&&rockLow&&b.position.x<a.position.x-this.radius*.12){
            this.reposition={phase:'startle',age:0};this.repositionCount++;
            this.catchActive=false;this.effort=0;
        }
        if(this.reposition){this.recoverSide(dt);return;}
        const feet=a.position.y+this.actorHeight/2;
        if(!ground&&!this.catchActive&&!this.gripGrace&&!this.assist&&feet<this.ground(a.position.x)-14){this.mode='air';this.effort=0;return;}
        const overhead=this.contact&&Math.abs(b.position.x-a.position.x)<this.radius*.55&&b.position.y<a.position.y-this.actorHeight*.3;
        if(this.contact&&!this.drag&&(this.catchArmed||b.velocity.x<-1.0||overhead)&&!this.catchActive)this.startCatch();
        if(this.catchActive){
            this.catchAge+=dt;this.maxSlide=Math.max(this.maxSlide,this.catchX-a.position.x);
            this.catchGap=this.contact?0:this.catchGap+dt;
            const separated=b.bounds.min.x-a.bounds.max.x>this.actorSize*.55||b.bounds.max.x<a.bounds.min.x-8;
            if(this.catchGap>.45&&separated){this.catchActive=false;this.recoverUntil=this.time+.25;}
        }
        if(wasContact&&!this.contact&&!this.gripGrace&&a.velocity.x<-.45)this.recoverUntil=this.time+.65;
        const widthScale=clamp(this.w/1100,.4,1);
        const target=clamp(b.position.x-this.radius+this.actorWidth*.13,this.actorWidth*.6,this.w-this.actorWidth);
        const distance=target-a.position.x;
        let force=0;
        if(((this.contact||this.gripGrace)&&rockLow&&(ground||this.gripGrace||this.assist)||this.catchActive)&&!this.drag){
            this.facing=1;
            this.workAge+=dt;const cycle=this.workAge%12.6;
            this.stroke=(this.workAge%2.55)/2.55;
            const drive=Math.sin(Math.PI*clamp((this.stroke-.17)/.57,0,1));
            // Strength is independent of rock mass. Each stroke has preparation,
            // a force peak, then a weak replant in which gravity can win.
            let power=.28+drive*.72;
            this.mode=cycle<4.8?'push':cycle<6.8?'heave':cycle<7.35?'turn':cycle<11.55?'backpush':'recover';
            if(this.mode==='turn')power=.3;
            if(this.mode==='backpush')power=.35+drive*.75;
            if(this.mode==='recover')power=.22;
            this.effort=clamp(.44+drive*.55,0,1);
            a.friction=.60+drive*.26;a.frictionStatic=1.1;
            if(b.velocity.x<-.65&&!this.catchActive){this.slipUntil=this.time+.5;this.startCatch();}
            if(this.catchActive){
                const age=this.catchAge,plant=smooth((age-.12)/1.1);
                this.mode=age<.18?'brace':age<.95?'slide':age<1.2?'stagger':'heave';
                this.effort=.78+plant*.22;a.friction=.24+plant*.66;
                power=.52+plant*(.78+drive*.25);
                if(age>3.1&&b.velocity.x>-.12){this.catchActive=false;this.workAge=6.8;}
            }
            if(this.control.cheer>0){power*=1.24;this.mode='heave';this.effort=1;}
            // Prevent automatic shoves becoming a constant accelerating motor.
            if(this.assist){power=1.35;a.friction=.72;this.catchActive=false;this.mode='heave';this.effort=1;}
            const speedLimit=(this.assist?1.8:.48)*widthScale;
            force=this.strength*power*clamp(1-(a.velocity.x-speedLimit)*2.4,0,1.15);
            if(overhead)Body.applyForce(b,b.position,{x:this.strength*.38,y:-this.strength*.28});
        }else{
            this.effort*=Math.exp(-dt*6);a.friction=.45;
            let desired=clamp(distance*.09,-1.7,1.8)*widthScale;
            if(b.position.x>a.position.x)this.facing=1;else if(Math.abs(distance)>this.actorSize*.45)this.facing=distance<0?-1:1;
            this.mode=!rockLow?'watch':Math.abs(distance)>5?'walk':'rest';
            if(this.time<this.recoverUntil&&!this.assist){this.mode='stagger';desired*=.6;}
            if(this.control.pet>0){this.mode='happy';desired=0;}
            if(this.drag?.bodyB===b){this.mode='watch';desired*=.4;}
            force=clamp((desired-a.velocity.x)*a.mass*.006,-this.strength*.65,this.strength*.85);
        }
        if(ground&&(!this.contact||this.assist)&&!this.drag&&(distance>this.actorSize*.12||this.assist)&&a.velocity.x<.35&&this.time>this.nextStep&&this.ground(a.position.x+this.actorWidth*.65)<this.ground(a.position.x)-this.actorSize*.05){
            this.stepUntil=this.time+.13;this.nextStep=this.time+.65;
        }
        const lift=this.time<this.stepUntil?-a.mass*(this.assist?.0027:.0021):0;
        this.pushForce=force;Body.applyForce(a,a.position,{x:force,y:lift});
    }
    feel(){
        const b=this.rock,age=this.time-this.setbackAt;
        this.earnedX=Math.max(this.earnedX,b.position.x);
        if(this.earnedX-b.position.x>this.radius*.8&&age>8){this.setbackAt=this.time;this.earnedX=b.position.x;}
        const since=this.time-this.setbackAt,loaded=['push','heave','backpush','brace','slide'].includes(this.mode);
        let next='calm';
        if(this.mode==='flattened')next='dazed';
        else if(['happy','celebrate'].includes(this.mode)||this.control.pet>0||this.control.cheer>0)next='relieved';
        else if(['panic','trip','scramble','scurry'].includes(this.mode))next='panic';
        else if(this.mode==='anticipate'||this.mode==='brace')next='determined';
        else if(this.mode==='slide')next='strain';
        else if(this.mode==='stagger')next='desperate';
        else if(since<1.2)next='upset';
        else if(since<3.7)next='crying';
        else if(since<6.2||this.mode==='backpush')next='angry';
        else if(loaded)next=this.effort>.72?'strain':'determined';
        else if(['air','held','watch'].includes(this.mode))next='worried';
        if(next!==this.emotion){this.emotion=next;this.emotionSince=this.time;}
    }
    step(dt,control={}){
        this.control=control;this.accumulator+=Math.min(dt,.05);const step=1/180;
        while(this.accumulator>=step){
            this.time+=step;this.steps++;
            if(this.drag?.bodyB===this.rock&&!this.splat&&!this.actorFlight&&this.actor){const b=this.rock,a=this.actor;if(b.bounds.max.y>a.bounds.min.y+this.actorHeight*.3&&b.bounds.min.y<a.bounds.max.y&&Math.abs(b.position.x-a.position.x)<this.actorWidth*.7&&b.position.y<a.position.y)this.flatten();}
            this.erodeGround(step);this.failUnsupportedRidge(step);
            for(let i=this.slabs.length-1;i>=0;i--){const slab=this.slabs[i];if(this.time-slab.born>5){Composite.remove(this.engine.world,slab.body);Composite.remove(this.engine.world,slab.tether);this.slabs.splice(i,1);}else{slab.tether.pointA.y=this.ground(slab.anchor);if(this.time-slab.born>.16&&!slab.detached){Composite.remove(this.engine.world,slab.tether);slab.detached=true;}if(slab.detached&&!slab.shattered&&this.time-slab.born>.65&&slab.body.speed<1.8){slab.shattered=true;this.onImpact?.({x:slab.body.position.x,y:slab.body.position.y,speed:4,terrain:true,depth:10,width:24});}}}
            if(this.assist){
                const a=this.actor,b=this.rock;
                const unavailable=this.splat||this.reposition||this.time<this.springUntil||!a||Math.abs(b.position.x-a.position.x)>this.radius+this.actorSize*1.5||b.bounds.max.y<this.ground(b.position.x)-this.actorSize;
                if(unavailable)this.assist.until+=step;
                if(this.time>Math.min(this.assist.until,this.assist.deadline)||this.drag)this.assist=null;
            }
            const upper=clamp((this.rock.position.x/this.w-.78)/.16,0,1);
            // Footholds narrow on the final face. Extra strength cannot replace traction.
            const footing=1-upper*upper*.95;
            this.strength=this.baseStrength*(this.assist?(this.w<760?5:4):1)*footing;
            this.updateGround();this.driveActor(step);this.feel();
            const b=this.rock,gap=this.ground(b.position.x)-b.position.y-this.radius;
            b.restitution=Math.abs(b.velocity.y)<1.6?.025:.22;
            // A planted wing shove grips the stone. Couple translation to rotation
            // through bounded torque; never set its angle or angular velocity.
            if(!this.drag&&!this.splat&&this.contact&&this.rockGrounded){
                const slope=this.slope(b.position.x),travel=(b.velocity.x+b.velocity.y*slope)/Math.hypot(1,slope);
                const target=travel/this.radius,grip=(target-b.angularVelocity)*b.inertia*.0045;
                const turn=this.grounded&&(!this.catchActive||this.catchAge>1.2)?Math.min(Math.max(0,this.pushForce),this.baseStrength*1.3)*this.radius*.8:0;
                b.torque+=clamp(grip+turn,-this.baseStrength*this.radius*1.4,this.baseStrength*this.radius*1.4);
            }
            if(!this.drag&&!this.contact&&b.position.x>this.w*.74&&this.engine.pairs.list.some(p=>p.isActive&&((p.bodyA===b&&p.bodyB.label==='soil')||(p.bodyB===b&&p.bodyA.label==='soil')))){
                // Passive ground grip trades sliding speed for rotation. The
                // opposing force pays for the torque instead of adding spin energy.
                const slope=this.slope(b.position.x),norm=Math.hypot(1,slope),travel=(b.velocity.x+b.velocity.y*slope)/norm;
                const slip=travel-b.angularVelocity*this.radius,effectiveMass=1/(b.inverseMass+this.radius*this.radius*b.inverseInertia);
                const grip=clamp(slip*effectiveMass*.009,-b.mass*.0007,b.mass*.0007);
                Body.applyForce(b,b.position,{x:-grip/norm,y:-grip*slope/norm});b.torque+=grip*this.radius;
            }
            if(gap<5&&!this.drag)b.torque-=b.angularVelocity*b.inertia*.000045;
            for(const body of [b,this.actor])if(body){const speed=Math.hypot(body.velocity.x,body.velocity.y);if(speed>24)Body.setVelocity(body,{x:body.velocity.x/speed*24,y:body.velocity.y/speed*24});Body.setAngularVelocity(body,clamp(body.angularVelocity,-.30,.30));}
            Engine.update(this.engine,1000/180);this.accumulator-=step;
            for(let i=this.chips.length-1;i>=0;i--)if(this.time-this.chips[i].born>12){Composite.remove(this.engine.world,this.chips[i].body);this.chips.splice(i,1);}
        }
    }
    bodyAt(x,y){
        const vertices=this.rock.vertices;
        if(Vertices.contains(vertices,{x,y}))return this.rock;
        for(let i=0;i<vertices.length;i++){
            const a=vertices[i],b=vertices[(i+1)%vertices.length],dx=b.x-a.x,dy=b.y-a.y;
            const t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
            if(Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<=10)return this.rock;
        }
        return null;
    }
    grab(body,x,y){
        if(body===this.actor&&this.splat)this.unsplat(false);
        this.release(false);if(body===this.actor){this.actorFlight=null;this.trip=null;this.springUntil=0;this.reposition=null;this.contact=false;this.gripGrace=false;this.lane=0;body.collisionFilter.mask=0xFFFFFFFF;}const dx=x-body.position.x,dy=y-body.position.y;
        this.drag=Constraint.create({pointA:{x,y},bodyB:body,pointB:{x:dx,y:dy},stiffness:body===this.rock?.065:.7,damping:body===this.rock?.38:.85,length:0});
        this.catchArmed=false;this.dragSamples=[{x,y,t:performance.now()}];Composite.add(this.engine.world,this.drag);this.catchActive=false;this.intercept=null;return this.drag;
    }
    move(x,y){if(!this.drag)return;this.drag.pointA.x=clamp(x,8,this.w-8);this.drag.pointA.y=clamp(y,35,this.h-35);const t=performance.now();this.dragSamples.push({x,y,t});this.dragSamples=this.dragSamples.filter(s=>t-s.t<90);}
    release(flick=true){
        if(!this.drag)return;const b=this.drag.bodyB,s=this.dragSamples,first=s[0],last=s.at(-1);
        if(flick&&s.length>1&&last.t-first.t>8&&performance.now()-last.t<85){const scale=1000/(60*(last.t-first.t)),weight=b===this.rock?.45:1,limit=b===this.rock?9:19;Body.setVelocity(b,{x:clamp((last.x-first.x)*scale*weight,-limit,limit),y:clamp((last.y-first.y)*scale*weight,-limit,limit)});}
        if(b===this.actor){if(!flick||!last||performance.now()-last.t>=85)Body.setVelocity(b,{x:0,y:0});this.actorFlight={age:0,phase:'ballistic'};b.collisionFilter.mask=0xFFFFFFFF;this.mode='tossed';this.contact=false;this.gripGrace=false;this.trip=null;this.reposition=null;}
        Composite.remove(this.engine.world,this.drag);this.drag=null;this.dragSamples=[];
    }
    liftRock(){this.release(false);Body.setPosition(this.rock,{x:clamp(this.rock.position.x+35,this.radius,this.w-this.radius),y:Math.max(this.radius+95,this.rock.position.y-125)});Body.setVelocity(this.rock,{x:.8,y:-2});}
    helpRock(){
        this.release(false);this.trip=null;this.nextTrip=this.time+5;this.recoverUntil=0;this.slipUntil=0;
        if(this.splat){this.unsplat(false);this.actor.collisionFilter.mask=0xFFFFFFFF;this.reposition={phase:'around',age:0};this.lane=1;}
        this.assist={until:this.time+3,deadline:this.time+10};
    }

    ruinDay(){this.release(false);this.assist=null;const b=this.rock,height=Math.max(180,Math.min(this.h*.55,b.position.y-this.radius-24));Body.setVelocity(b,{x:0,y:-Math.sqrt(2*(1000/3600)*height)});Body.setAngularVelocity(b,.055);}
    reset(){
        for(const slab of this.slabs){Composite.remove(this.engine.world,slab.body);Composite.remove(this.engine.world,slab.tether);}this.slabs=[];
        this.release(false);this.actorFlight=null;this.unsplat(false);this.springUntil=0;for(const n of this.nodes){n.y=0;n.v=0;n.eroded=0;n.damage=0;}this.faults=[];this.terrainBreaks=0;this.terrainVersion++;this.updateGround();this.seedTerrain();
        for(const chip of this.chips)Composite.remove(this.engine.world,chip.body);this.chips=[];this.fractures=[];this.referenceOrigin={...this.initialReferenceOrigin};
        Body.setAngle(this.rock,0);Body.setVertices(this.rock,this.initialOutline.map(p=>({...p})));this.chipCount=0;this.lastChip=-100;this.lastChipArea=0;
        Body.setPosition(this.rock,{x:this.w*.59,y:this.ground(this.w*.59)-this.radius-5});Body.setVelocity(this.rock,{x:0,y:0});Body.setAngularVelocity(this.rock,0);Body.setAngle(this.rock,0);
        if(this.actor){const x=this.rock.position.x-this.radius-this.actorSize*.32;Body.setPosition(this.actor,{x,y:this.ground(x)-this.actorHeight/2});Body.setVelocity(this.actor,{x:0,y:0});}
        this.catchActive=false;this.catchArmed=false;this.lastGripAt=-100;this.lastGroundAt=-100;this.gripGrace=false;this.catchAge=0;this.celebrate=0;this.effort=0;this.restUntil=0;this.workAge=0;this.stroke=0;this.pushForce=0;this.recoverUntil=0;this.mode='walk';
        this.reposition=null;this.intercept=null;this.catchGap=0;this.catchImpactAt=-100;this.lane=0;this.facing=1;if(this.actor)this.actor.collisionFilter.mask=0xFFFFFFFF;
        this.emotion='calm';this.emotionSince=this.time;this.setbackAt=-100;this.earnedX=this.rock.position.x;this.nextPanicHop=0;this.panicHops=0;
        this.trip=null;this.tripCount=0;this.nextTrip=0;this.assist=null;this.strength=this.baseStrength;
        this.stepUntil=0;this.nextStep=0;
    }
    dispose(){this.release(false);Events.off(this.engine);Composite.clear(this.engine.world,false);Engine.clear(this.engine);}
    diagnostics(){return{actorFlight:this.actorFlight?{...this.actorFlight}:null,actorMask:this.actor?.collisionFilter.mask,rockMask:this.rock.collisionFilter.mask,slabs:this.slabs.length,terrainBreaks:this.terrainBreaks,terrainFaults:this.faults.length,terrainVersion:this.terrainVersion,erosion:this.nodes.map(n=>n.eroded),structuralDamage:this.nodes.map(n=>n.damage),intercept:this.intercept?{...this.intercept}:null,catchBeat:this.catchBeat,catchArmed:this.catchArmed,catchImpactAge:this.time-this.catchImpactAt,catchSpeed:this.catchSpeed,catchGap:this.catchGap,assisting:!!this.assist,powerLeft:this.assist?Math.max(0,this.assist.until-this.time):0,tripCount:this.tripCount,emotion:this.emotion,emotionAge:this.time-this.emotionSince,panicHops:this.panicHops,setbackAge:this.time-this.setbackAt,splatAge:this.splat?.age||0,flattened:!!this.splat,position:{...this.rock.position},velocity:{...this.rock.velocity},angle:this.rock.angle,radius:this.radius,outline:this.outline(),area:this.rock.area,originalArea:this.originalArea,chipCount:this.chipCount,chips:this.chips.length,lastChipArea:this.lastChipArea||0,ground:this.ground(this.rock.position.x),dragging:!!this.drag,impacts:this.impactCount,maxIndent:this.maxIndent,indent:this.nodes.map(n=>n.y),steps:this.steps,catchCount:this.catchCount,maxSlide:this.maxSlide,contact:this.contact,gripGrace:this.gripGrace,mode:this.mode,catchAge:this.catchAge,stroke:this.stroke,workAge:this.workAge,pushForce:this.pushForce,strength:this.strength,mass:this.rock.mass,actorMass:this.actor?.mass,facing:this.facing,lane:this.lane,reposition:this.reposition?{...this.reposition}:null,repositionCount:this.repositionCount,actor:this.actor?{position:{...this.actor.position},velocity:{...this.actor.velocity}}:null};}
}
