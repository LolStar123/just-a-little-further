export function thoughtPose(index,time){
 // Requested persistent idle movement, including reduced-motion desktops.
 return {lift:Math.sin(time*(1.65+index*.13)+index*.9)*(index<3?4:2.5),
  sway:Math.sin(time*(1.85+index*.21)+index*1.1)*(index<3?8:5),
  angle:Math.sin(time*(1.4+index*.17)+index*1.3)*(index<3?.19:.10)};
}
export function deadlockBlink(time){
 const phase=time%3.8;
 const lid=start=>{const t=phase-start;if(t<0||t>.38)return 1;if(t<.09)return 1-t/.09;if(t<.23)return .025;return Math.max(.025,(t-.23)/.15);};
 return Math.max(.025,Math.min(lid(1.15),lid(1.7)));
}
export function eyeGaze(dx,dy){
 const distance=Math.hypot(dx,dy),scale=distance?Math.min(1,distance/90)/distance:0;
 return {x:dx*scale*5.8,y:dy*scale*2.6};
}
