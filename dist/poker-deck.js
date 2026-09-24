// A complete pack, including two distinct jokers. Selection happens per shuffle,
// never per paint: the canvas also paints draggable toy snapshots.
const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const POKER_PACK=Object.freeze([
 ...[
  ['spades','\u2660','#535248'],['hearts','\u2665','#a04d40'],
  ['clubs','\u2663','#535248'],['diamonds','\u2666','#a04d40']
 ].flatMap(([suit,symbol,color])=>ranks.map(rank=>Object.freeze({id:rank+'-'+suit,rank,suit,symbol,color}))),
 Object.freeze({id:'black-joker',rank:'J',suit:'joker',symbol:'\u2605',color:'#535248'}),
 Object.freeze({id:'red-joker',rank:'J',suit:'joker',symbol:'\u2605',color:'#a04d40'})
]);
export const SHUFFLE_SECONDS=4.8;
export function pickPokerCard(random=Math.random){return POKER_PACK[Math.min(53,Math.floor(random()*POKER_PACK.length))];}
export function drawPokerFace(c,card){
 c.save();c.fillStyle=card.color;c.textAlign='left';c.textBaseline='alphabetic';
 // Two opposed corner indices stay recognisable while the deck is split.
 for(const turn of [0,Math.PI]){
  c.save();c.translate(0,-10);c.rotate(turn);c.font='7px Georgia,serif';
  c.fillText(card.rank,-13,-12);c.font='6px Georgia,serif';c.fillText(card.symbol,-13,-5);c.restore();
 }
 c.textAlign='center';
 if(card.suit==='joker'){
  c.lineWidth=.8;c.strokeStyle=card.color;
  c.beginPath();c.moveTo(-8,-11);c.lineTo(-10,-23);c.lineTo(-3,-18);c.lineTo(0,-26);c.lineTo(4,-18);c.lineTo(10,-23);c.lineTo(8,-11);c.stroke();
  for(const [x,y] of [[-10,-23],[0,-26],[10,-23]]){c.beginPath();c.arc(x,y,1.2,0,Math.PI*2);c.fill();}
  c.beginPath();c.arc(0,-9,5,0,Math.PI);c.stroke();c.font='5px Georgia,serif';c.fillText('JOKER',0,4);
 }else if(['J','Q','K'].includes(card.rank)){
  c.font='16px Georgia,serif';c.fillText(card.rank,0,-8);c.font='10px Georgia,serif';c.fillText(card.symbol,0,3);
 }else if(card.rank==='A'){
  c.font='19px Georgia,serif';c.fillText(card.symbol,0,-3);
 }else{
  const count=Number(card.rank),pairs=Math.floor(count/2),gap=pairs>1?24/(pairs-1):0;
  c.font='6px Georgia,serif';
  for(let row=0;row<pairs;row++)for(const x of [-5,5])c.fillText(card.symbol,x,pairs===1?-7:-20+row*gap);
  if(count%2)c.fillText(card.symbol,0,-7);
 }
 c.restore();
}
