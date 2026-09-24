// Independent smooth random targets, with no shared repeating sway cycle.
function noise(seed,t){
 const hash=n=>{const x=Math.sin(n*127.1+seed*311.7)*43758.5453;return (x-Math.floor(x))*2-1;};
 const i=Math.floor(t),f=t-i,u=f*f*(3-2*f);return hash(i)*(1-u)+hash(i+1)*u;
}
export function thoughtPose(index,time){
 const seed=17+index*83,t=time+index*13.71;
 return {lift:noise(seed,t*(.46+index*.037))*(index<3?3.2:2),
 sway:(noise(seed+3,t*(.61+index*.023))*.8+noise(seed+11,t*1.13)*.2)*(index<3?6:4),
 angle:noise(seed+27,t*(.73+index*.041))*(index<3?.13:.075)};
}
export function deadlockBlink(time){
 const phase=time%3;
 const lid=start=>{const t=phase-start;if(t<0||t>.38)return 1;if(t<.09)return 1-t/.09;if(t<.23)return .025;return Math.max(.025,(t-.23)/.15);};
 return Math.max(.025,Math.min(lid(1.15),lid(1.7)));
}
export function eyeGaze(dx,dy){
 const distance=Math.hypot(dx,dy),scale=distance?Math.min(1,distance/90)/distance:0;
 return {x:dx*scale*5.8,y:dy*scale*2.6};
}
