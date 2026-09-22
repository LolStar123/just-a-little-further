import {inkPath} from './ink-path.js';
import {drawMeowl} from "./little-creatures.js";
// Every project uses the same articulated pencil character as the hill.
export const INK='#29312e';
export function line(ctx,points,color=INK,width=1.5){inkPath(ctx,points,color,width);}
function ellipse(c,x,y,rx,ry,fill,stroke=null){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function meowl(c,x,y,scale=1,o={}){return drawMeowl(c,x,y,scale*61,{...o,facing:o.facing??((o.speed||0)<-5?-1:1),pet:o.blink});}
export function hardware(c,x,y,type='gpu',scale=1,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);c.lineWidth=1.4;c.strokeStyle=INK;c.fillStyle='#969f91';c.beginPath();c.moveTo(-25,-12);c.bezierCurveTo(-11,-15,12,-11,25,-13);c.quadraticCurveTo(27,1,24,14);c.quadraticCurveTo(-2,11,-25,13);c.quadraticCurveTo(-27,1,-25,-12);c.fill();c.stroke();
 if(type==='gpu'){for(let k of [-11,11]){ellipse(c,k,0,8,8,'#c7c8c2',INK);for(let a=0;a<5;a++){let n=a*6.28/5;line(c,[[k,0],[k+Math.cos(n)*6,Math.sin(n)*6]],INK,.8);}}}
 else {c.fillStyle='#394c43';for(let i=0;i<3;i++)c.fillRect(-18+i*13,-7,9,14);}
 line(c,[[-16,14],[18,14]],'#9b7e45',3);c.restore();
}
