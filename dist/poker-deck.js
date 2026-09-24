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
const symbols={spades:'M15 16 C9 23 7 25 11 27 Q14 29 15 25 Q16 29 19 27 C23 25 21 23 15 16 M15 24 L13 31 L18 31 Z',hearts:'M15 30 C13 26 5 22 9 18 Q12 15 15 20 Q19 14 22 19 C25 23 17 28 15 30 Z',clubs:'M15 27 C6 32 5 20 12 22 C6 11 24 11 18 22 C27 19 25 32 16 27 L18 32 L12 32 Z',diamonds:'M15 15 Q18 21 23 24 L15 33 Q12 28 7 24 Z'};
export function drawPokerFace(c,card){
 c.save();c.translate(-18,-35);c.scale(1.2,1.2);c.fillStyle=card.color;
 c.font='bold 12px Reader,Georgia,serif';c.textAlign='left';c.textBaseline='alphabetic';c.save();c.translate(6,13);c.rotate(-.07);c.fillText(card.suit==='joker'?'?':card.rank,0,0);c.restore();
 if(symbols[card.suit])c.fill(new Path2D(symbols[card.suit]));
 else{c.strokeStyle=card.color;c.lineWidth=1.7;c.beginPath();c.moveTo(8,24);c.lineTo(7,17);c.lineTo(12,20);c.lineTo(15,15);c.lineTo(18,21);c.lineTo(23,18);c.lineTo(21,26);c.stroke();c.beginPath();c.arc(15,25,5,0,Math.PI);c.stroke();}
 c.restore();
}
