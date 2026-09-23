const suits=['spades','hearts','clubs','diamonds'];
const symbols={spades:'M15 16 C9 23 7 25 11 27 Q14 29 15 25 Q16 29 19 27 C23 25 21 23 15 16 M15 24 L13 31 L18 31 Z',hearts:'M15 30 C13 26 5 22 9 18 Q12 15 15 20 Q19 14 22 19 C25 23 17 28 15 30 Z',clubs:'M15 27 C6 32 5 20 12 22 C6 11 24 11 18 22 C27 19 25 32 16 27 L18 32 L12 32 Z',diamonds:'M15 15 Q18 21 23 24 L15 33 Q12 28 7 24 Z'};
export function cardHand(number){
 const pairs={10:[6,4],11:[8,3],12:[7,5],13:[9,4]};
 return (pairs[number]||[number]).map((rank,i)=>({rank,suit:suits[(number-1+i*3)%4]}));
}
export function pokerMarker(number){
 return cardHand(number).map(({rank,suit},i)=>`<svg class="poker-card" data-rank="${rank}" data-suit="${suit}" viewBox="0 0 30 40" aria-hidden="true" style="rotate:${i?9:-6}deg;color:${['hearts','diamonds'].includes(suit)?'#936957':'#3b3a36'}"><path class="card-border" d="M3 2 Q15 0 28 3 L27 37 Q15 40 2 37 Z" fill="#eeeae0" stroke="currentColor" stroke-width="1.1"/><text class="card-rank" x="6" y="13" font-size="11">${rank===1?'A':rank}</text><path class="card-suit" d="${symbols[suit]}" fill="currentColor"/></svg>`).join('');
}
