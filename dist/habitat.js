import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const host = document.querySelector('#habitat');
const canvas = document.querySelector('#habitat-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const projects = [
  {id:'halo',name:'HALO',position:[0,0,0.7],scale:.61,color:0xb8cfc8,desc:'HALO turns spoken questions and screen context into a small, readable desktop overlay.',caption:'HALO resident: listening very carefully. Probably.'},
  {id:'botato',name:'Botato',position:[-2,0,1.2],scale:.40,color:0xcbd1a4,desc:'Botato turns Path of Exile into a playground for automation, pathing and state machines.',caption:'Botato resident: observe. Decide. Hop.'},
  {id:'gpu',name:'GPU flips',position:[2.0,0,.55],scale:.44,color:0xc2bdd8,desc:'GPU prices, resale evidence and the economics of running AI at home. An ongoing hardware rabbit hole.',caption:'GPU resident: found the warmest piece of hardware.'},
  {id:'liquidation',name:'Liquidation',position:[-1.6,0,-1.45],scale:.38,color:0xd5c4a7,desc:'A sourcing pipeline connecting Companies House liquidation research, hardware lots and eBay resale evidence.',caption:'Auction resident: checking the lot. Not the hype.'},
  {id:'stories',name:'Stories',position:[1.15,0,-1.65],scale:.38,color:0xc6d0b6,desc:'Last Shift Stories follows ordinary people building businesses. Fiction, choices and consequences.',caption:'Story resident: the side quest has developed a plot.'}
];
let selected = 'halo';
let paused = reduce.matches;
let visible = true;
let renderer, scene, camera, stage;
let initialized = false;
let raf = 0;
let time = 0;
let lastTime = 0;
let targetRotation = -.10;
let rotationVelocity = 0;
let currentRotation = -.10;
let pendingHops = [];
const residents = [];
const pickables = [];
const pointer = new THREE.Vector2(0,0);
const raycaster = new THREE.Raycaster();
const focusPoint = new THREE.Vector3();

function select(id, hop=true) {
  const data = projects.find(item=>item.id === id);
  if (!data) return;
  selected=id;
  document.querySelectorAll('[data-habitat]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.habitat===id)));
  document.querySelector('#habitat-description').textContent=data.desc;
  document.querySelector('#habitat-caption').textContent=data.caption;
  document.querySelector('#habitat-details').dataset.project=id;
  residents.forEach(item=>{item.label.classList.toggle('active',item.data.id===id); if(item.data.id===id && hop && !paused && !reduce.matches){item.velocity=2.9;item.jumpAt=time;}});
  if(initialized) render();
}
document.querySelectorAll('[data-habitat]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.habitat)));
const pauseButton=document.querySelector('#habitat-pause');
function applyPause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.textContent=paused?'Resume motion':'Pause motion';pendingHops=[];if(paused){residents.forEach(r=>{r.height=0;r.velocity=0;});} if(initialized){update(0);render();start();}}
pauseButton.addEventListener('click',()=>{paused=!paused;applyPause();});
reduce.addEventListener('change',()=>{paused=reduce.matches;applyPause();});
document.querySelector('#gather-meowls').addEventListener('click',()=>{
  if(paused||reduce.matches){document.querySelector('#habitat-caption').textContent='Five residents. Quiet mode. Everyone accounted for.';return;}
  pendingHops=projects.map((project,index)=>({id:project.id,at:time+index*.105}));
  document.querySelector('#habitat-caption').textContent='An entirely unnecessary roll call. Everyone is here.';
  start();
});

function addRing(radius,y,color,opacity){
  const points=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*radius,y,Math.sin(a)*radius*.77));}
  const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}));stage.add(ring);
}
function contactShadow(size){
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const gradient=ctx.createRadialGradient(64,64,3,64,64,62);gradient.addColorStop(0,'rgba(23,45,26,.30)');gradient.addColorStop(.45,'rgba(23,45,26,.13)');gradient.addColorStop(1,'rgba(23,45,26,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const texture=new THREE.CanvasTexture(c);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;return mesh;
}
function makeStation(data){
  const group=new THREE.Group();group.position.set(...data.position);stage.add(group);
  const radius=data.id==='halo'?.85:.67;
  const base=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius+.045,.22,64),new THREE.MeshStandardMaterial({color:data.color,roughness:.65,metalness:.08}));base.position.y=.08;group.add(base);base.userData.project=data.id;pickables.push(base);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(radius-.015,.012,8,80),new THREE.MeshStandardMaterial({color:0xf1f0d7,metalness:.3,roughness:.4}));rim.rotation.x=Math.PI/2;rim.position.y=.195;group.add(rim);
  const shadow=contactShadow(radius*3.6);shadow.position.y=-.035;group.add(shadow);
  const label=document.createElement('span');label.className='habitat-label'+(data.id===selected?' active':'');label.textContent=data.name;document.querySelector('#habitat-labels').append(label);
  return {data,group,base,label,height:0,velocity:0,jumpAt:-10,phase:projects.indexOf(data)*1.25,model:null,head:null,wingL:null,wingR:null};
}
function resize(){
  if(!renderer)return;
  const width=host.clientWidth,height=host.clientHeight;
  renderer.setSize(width,height,false);
  const aspect=width/height;
  const span=aspect<1?3.85:2.95;
  camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();
  render();
}
function render(){
  if(!renderer)return;
  renderer.render(scene,camera);
  const width=host.clientWidth,height=host.clientHeight;
  for(const r of residents){
    focusPoint.set(0,r.data.position[2]<0?1.3:.12,r.data.position[2]<0?-.1:.86);r.group.localToWorld(focusPoint);focusPoint.project(camera);
    r.label.style.left=`${(focusPoint.x*.5+.5)*width}px`;r.label.style.top=`${(-focusPoint.y*.5+.5)*height+18}px`;
  }
}
function update(dt){
  const moving=!paused&&!reduce.matches;
  if(moving){
    time+=dt;
    rotationVelocity+=(targetRotation-currentRotation)*28*dt;
    rotationVelocity*=Math.exp(-9*dt);currentRotation+=rotationVelocity*dt;
  }else currentRotation=targetRotation;
  stage.rotation.y=currentRotation;
  pendingHops=pendingHops.filter(hop=>{if(hop.at>time)return true;const r=residents.find(r=>r.data.id===hop.id);if(r){r.velocity=2.8;r.jumpAt=time;}return false;});
  for(const r of residents){
    if(!r.model)continue;
    if(moving){r.velocity-=8*dt;r.height+=r.velocity*dt;if(r.height<0){r.height=0;r.velocity=0;}}
    const bob=moving?Math.sin(time*1.6+r.phase)*.012:0;
    r.model.position.y=.19+r.height+bob;
    const active=r.data.id===selected;
    if(r.head){
      const targetY=moving?pointer.x*.16+(active?Math.sin(time*.7)*.025:0):0;
      r.head.rotation.y=THREE.MathUtils.damp(r.head.rotation.y,targetY,7,dt||1);
      r.head.rotation.x=THREE.MathUtils.damp(r.head.rotation.x,moving?pointer.y*.055:0,7,dt||1);
      r.head.rotation.z=moving?Math.sin(time*.8+r.phase)*(active&&r.data.id==='halo'?.12:.035):0;
      if(active&&moving&&r.data.id==='liquidation')r.head.rotation.y+=Math.sin(time*.8)*.11;
      if(active&&moving&&r.data.id==='stories')r.head.rotation.x+=Math.sin(time*1.1)*.075;
    }
    const flap=moving?(r.height>0?.25+Math.sin(time*15)*.08:.008+Math.sin(time*1.6+r.phase)*.012):0;
    if(r.wingL)r.wingL.rotation.z=-flap;if(r.wingR)r.wingR.rotation.z=flap;
    if(active&&moving&&r.data.id==='botato'){r.model.rotation.y=-.1+Math.sin(time*.65)*.2;}else r.model.rotation.y=THREE.MathUtils.damp(r.model.rotation.y,-.1,5,dt||1);
    r.base.material.emissive.setHex(active&&r.data.id==='gpu'?0xd9a969:0x000000);
    r.base.material.emissiveIntensity=active&&r.data.id==='gpu'?.14:0;
    const squish=moving&&time-r.jumpAt<.16?1-.08*Math.sin((time-r.jumpAt)/.16*Math.PI):1;
    r.model.scale.set(r.data.scale/Math.sqrt(squish),r.data.scale*squish,r.data.scale/Math.sqrt(squish));
    r.ring.material.opacity=active?.75:.18;
    r.ring.rotation.z=moving?time*.12:0;
    if(r.data.id==='halo'&&moving&&active)r.ring.scale.setScalar(1+Math.sin(time*2)*.055);
    else r.ring.scale.setScalar(1);
  }
}
function tick(now){
  raf=0;
  if(!visible||document.hidden)return;
  const dt=Math.min((now-lastTime)/1000||0,.033);lastTime=now;
  update(dt);render();
  if(!paused&&!reduce.matches)raf=requestAnimationFrame(tick);
}
function start(){if(!initialized||raf||!visible||document.hidden)return;lastTime=performance.now();raf=requestAnimationFrame(tick);}

async function init(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
    scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-4,4,3.8,-3.8,.1,100);camera.position.set(2.5,3.8,8);camera.lookAt(0,.05,0);
    stage=new THREE.Group();scene.add(stage);
    scene.add(new THREE.HemisphereLight(0xffffff,0x6c7664,3));
    const key=new THREE.DirectionalLight(0xfff1d7,3);key.position.set(-4,7,6);scene.add(key);
    const fill=new THREE.DirectionalLight(0xe3f0ed,1.5);fill.position.set(5,3,-4);scene.add(fill);
    addRing(2.8,-.06,0x8d9e7e,.35);addRing(3.08,-.06,0x8d9e7e,.15);
    projects.forEach(data=>residents.push(makeStation(data)));
    resize();
    const gltf=await new GLTFLoader().loadAsync('assets/meowl.glb');
    for(const resident of residents){
      const model=clone(gltf.scene);model.scale.setScalar(resident.data.scale);model.position.y=.19;model.rotation.y=-.10;
      model.traverse(obj=>{if(obj.isMesh){obj.frustumCulled=false;obj.userData.project=resident.data.id;pickables.push(obj);if(obj.material){obj.material.roughness=.9;obj.material.metalness=0;}}});
      resident.group.add(model);resident.model=model;
      resident.head=model.getObjectByName('HeadJoint');resident.wingL=model.getObjectByName('LeftWingJoint');resident.wingR=model.getObjectByName('RightWingJoint');
      const ring=new THREE.Mesh(new THREE.TorusGeometry(resident.data.id==='halo'?.98:.79,.008,6,72),new THREE.MeshBasicMaterial({color:0x7c9465,transparent:true,opacity:.18}));ring.rotation.x=Math.PI/2;ring.position.y=.015;resident.group.add(ring);resident.ring=ring;
    }
    initialized=true;host.classList.add('ready');host.dataset.ready='true';update(0);render();start();
    window.__habitatDiagnostics=()=>({ready:initialized,residents:residents.length,headBones:residents.filter(r=>r.head).length,selected,paused,visible,time,rotation:currentRotation,frame:renderer.info.render.frame,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls});
  }catch(error){
    host.classList.add('fallback');document.querySelector('#habitat-hint').textContent='The residents are resting. Explore with the buttons below.';
    document.querySelector('#gather-meowls').hidden=true;pauseButton.hidden=true;
    console.warn('Meowl habitat fallback:',error.message);
  }
}
new ResizeObserver(resize).observe(host);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0;}},{threshold:.05}).observe(host);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);raf=0;host.classList.remove('ready');host.dataset.ready='false';document.querySelector('#habitat-hint').textContent='3D paused. The project buttons still work.';});
canvas.addEventListener('webglcontextrestored',()=>{host.classList.add('ready');host.dataset.ready='true';start();});
let dragging=false,startX=0,startY=0,origin=0,moved=false;
canvas.addEventListener('pointerdown',event=>{dragging=true;moved=false;startX=event.clientX;startY=event.clientY;origin=targetRotation;canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointermove',event=>{
  const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  if(dragging&&Math.abs(event.clientX-startX)>6){moved=true;targetRotation=THREE.MathUtils.clamp(origin+(event.clientX-startX)*.004,-1.2,1.2);if(paused||reduce.matches){update(0);render();}}
});
canvas.addEventListener('pointerup',event=>{
  if(!dragging)return;dragging=false;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
  if(!moved&&Math.abs(event.clientY-startY)<8&&initialized){const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(pickables,false);if(hits[0]?.object.userData.project)select(hits[0].object.userData.project);}
});
canvas.addEventListener('pointercancel',()=>{dragging=false;});
canvas.addEventListener('pointerleave',()=>{if(!dragging)pointer.set(0,0);});
canvas.addEventListener('keydown',event=>{
  const index=projects.findIndex(p=>p.id===selected);
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();select(projects[(index+(event.key==='ArrowRight'?1:4))%5].id);}
  if(event.key==='Enter'||event.key===' '){event.preventDefault();document.querySelector('#habitat-details').click();}
});
applyPause();init();
