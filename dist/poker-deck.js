// A complete pack, including two distinct jokers. Selection happens per shuffle,
// never per paint: the canvas also paints draggable toy snapshots.
const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const POKER_PACK=Object.freeze([
 ...[
  ['spades','\u2660','#535248'],['hearts','\u2665','#b97870'],
  ['clubs','\u2663','#8099ab'],['diamonds','\u2666','#c5996c']
 ].flatMap(([suit,symbol,color])=>ranks.map(rank=>Object.freeze({id:rank+'-'+suit,rank,suit,symbol,color}))),
 Object.freeze({id:'black-joker',rank:'J',suit:'joker',symbol:'\u2605',color:'#535248'}),
 Object.freeze({id:'red-joker',rank:'J',suit:'joker',symbol:'\u2605',color:'#b97870'})
]);
export const SHUFFLE_SECONDS=4.8;
export function pickPokerCard(random=Math.random){return POKER_PACK[Math.min(53,Math.floor(random()*POKER_PACK.length))];}
export function drawPokerFace(c,card){
 c.save();c.fillStyle=card.color;c.textAlign='left';c.textBaseline='alphabetic';
 // Two opposed corner indices stay recognisable while the deck is split.
 for(const turn of [0,Math.PI]){
  c.save();c.translate(0,-10);c.rotate(turn);c.font='bold 8px Reader,Georgia,serif';
  c.fillText(card.rank,-13,-12);c.font='6px Georgia,serif';c.fillText(card.symbol,-13,-5);c.restore();
 }
 c.textAlign='center';
 if(card.suit==='joker'){
  c.lineWidth=.8;c.strokeStyle=card.color;
  c.beginPath();c.moveTo(-8,-11);c.lineTo(-10,-23);c.lineTo(-3,-18);c.lineTo(0,-26);c.lineTo(4,-18);c.lineTo(10,-23);c.lineTo(8,-11);c.stroke();
  for(const [x,y] of [[-10,-23],[0,-26],[10,-23]]){c.beginPath();c.arc(x,y,1.2,0,Math.PI*2);c.fill();}
  c.beginPath();c.arc(0,-9,5,0,Math.PI);c.stroke();c.font='5px Georgia,serif';c.fillText('JOKER',0,4);
 }else if(['J','Q','K'].includes(card.rank)){
  c.strokeStyle=card.color;c.lineWidth=1.2;c.beginPath();c.moveTo(-7,-17);c.lineTo(-8,-25);c.lineTo(-3,-21);c.lineTo(0,-28);c.lineTo(4,-21);c.lineTo(8,-25);c.lineTo(7,-17);c.stroke();c.beginPath();c.ellipse(0,-11,7,8,.08,0,Math.PI*2);c.stroke();for(const x of [-2.5,2.5]){c.beginPath();c.arc(x,-12,.8,0,Math.PI*2);c.fill();}c.beginPath();c.moveTo(-3,-7);c.quadraticCurveTo(0,-4,3,-8);c.stroke();drawSuit(c,card,0,5,4);
 }else if(card.rank==='A'){
  drawSuit(c,card,0,-8,11);
 }else{
  const count=Number(card.rank),pairs=Math.floor(count/2),gap=pairs>1?24/(pairs-1):0;
  c.font='6px Georgia,serif';
  for(let row=0;row<pairs;row++)for(const x of [-5,5])drawSuit(c,card,x,(pairs===1?-7:-20+row*gap)-2,3.1);
  if(count%2)drawSuit(c,card,0,-9,3.1);
 }
 c.restore();
}

function drawSuit(c,card,x,y,size){
 c.save();c.translate(x,y);c.scale(size,size);c.fillStyle=card.color;c.strokeStyle=card.color;c.lineWidth=.10;c.beginPath();
 if(card.suit==='diamonds'){c.moveTo(.05,-1.1);c.lineTo(.72,-.04);c.lineTo(-.08,1.03);c.lineTo(-.7,.08);c.closePath();}
 else if(card.suit==='hearts'){c.moveTo(0,.92);c.bezierCurveTo(-1.5,-.1,-.85,-1.32,0,-.6);c.bezierCurveTo(.96,-1.4,1.42,-.05,0,.92);}
 else if(card.suit==='spades'){c.moveTo(.02,-1.07);c.bezierCurveTo(-1.5,.12,-.65,.85,-.12,.42);c.lineTo(-.28,.99);c.lineTo(.36,.95);c.lineTo(.12,.4);c.bezierCurveTo(.9,.9,1.35,.02,.02,-1.07);}
 else {for(const [cx,cy] of [[0,-.55],[-.47,.1],[.49,.15]]){c.moveTo(cx+.5,cy);c.arc(cx,cy,.5,0,Math.PI*2);}c.moveTo(-.1,.2);c.lineTo(-.3,1);c.lineTo(.35,.96);c.lineTo(.1,.2);}
 c.fill();c.stroke();c.restore();
}
