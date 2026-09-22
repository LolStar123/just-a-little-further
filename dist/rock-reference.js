// Original clipboard ink, with sub-2% edge nicks added to the shared physical contour.
export const rockSource={x:304,y:293,width:202,height:196,unit:100};
export const rockContour=[[307,385],[310,366],[316,349],[328,332],[343,318],[360,309],[381,298],[401,295],[422,300],[442,307],[460,319],[476,335],[489,353],[497,374],[501,394],[503,418],[499,438],[489,455],[472,469],[453,478],[434,484],[415,487],[397,482],[377,474],[359,463],[342,449],[329,433],[318,417],[311,401]].map(([x,y],i)=>{const inset=i%4===1?.018:i%4===3?.007:0;return{x:x+(405-x)*inset,y:y+(391-y)*inset};});
export const rockImage=new Image();
rockImage.src=new URL('./assets/sisyphus-reference.png',import.meta.url).href;
export const rockReady=rockImage.decode();
export function drawReferenceRock(c,physics){
    const b=physics.rock,s=physics.radius/rockSource.unit,origin=physics.referenceOrigin;
    c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);
    c.beginPath();physics.outline().forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip();
    c.drawImage(rockImage,rockSource.x,rockSource.y,rockSource.width,rockSource.height,origin.x+rockSource.x*s,origin.y+rockSource.y*s,rockSource.width*s,rockSource.height*s);
    c.restore();
    c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);c.beginPath();physics.outline().forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.strokeStyle='#555047';c.lineWidth=.8;c.lineJoin='round';c.stroke();c.restore();
}
