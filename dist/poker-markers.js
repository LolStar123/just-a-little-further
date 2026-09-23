const suits=['spades','hearts','clubs','diamonds'];
const suitColors={spades:'#242424',hearts:'#ec302b',clubs:'#326bc1',diamonds:'#e78314'};
const symbols={spades:'M15 16 C9 23 7 25 11 27 Q14 29 15 25 Q16 29 19 27 C23 25 21 23 15 16 M15 24 L13 31 L18 31 Z',hearts:'M15 30 C13 26 5 22 9 18 Q12 15 15 20 Q19 14 22 19 C25 23 17 28 15 30 Z',clubs:'M15 27 C6 32 5 20 12 22 C6 11 24 11 18 22 C27 19 25 32 16 27 L18 32 L12 32 Z',diamonds:'M15 15 Q18 21 23 24 L15 33 Q12 28 7 24 Z'};
export function cardHand(number){
 const pairs={10:[6,4],11:[8,3],12:[7,5],13:[9,4]};
 return (pairs[number]||[number]).map((rank,i)=>({rank,suit:suits[(number-1+i*3)%4]}));
}
export function pokerMarker(number){
 const tilts=[-18,11,-7,22,-13,6,15,-21,9,-4,18,-11,4];
 return cardHand(number).map(({rank,suit},i)=>{
  const tilt=tilts[(number-1+i*5)%tilts.length],j=(number*7+i*3)%9;
  const ring=`M${-3+j*.2} 15 C${-8+j} ${-7+j}, ${36-j} ${-8+j*.2}, 34 13 S${39-j} 47, 15 45 S${-7+j*.3} 29, -2 10`;
  return `<svg class="poker-card" data-rank="${rank}" data-suit="${suit}" data-tilt="${tilt}" viewBox="0 0 30 40" aria-hidden="true" style="rotate:${tilt}deg;translate:0 ${(number+i)%3-1}px;color:${suitColors[suit]};--ink-speed:${.27+(number%5)*.06}s"><path class="card-flash" pathLength="100" d="${ring}" fill="none" stroke="currentColor" stroke-width="1.3"/><path class="card-border" d="M3 2 Q15 0 28 3 L27 37 Q15 40 2 37 Z" fill="#eeeae0" stroke="currentColor" stroke-width="1.1"/><text class="card-rank" x="6" y="13" font-size="11">${rank===1?'A':rank}</text><path class="card-suit" d="${symbols[suit]}" fill="currentColor"/></svg>`;
 }).join('');
}
