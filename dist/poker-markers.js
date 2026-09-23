export function pokerMarker(number){
    const ranks=number<=10?[number]:[7,number-7];
    return ranks.map((rank,i)=>`<svg class="poker-card" viewBox="0 0 30 40" aria-hidden="true" style="rotate:${i?9:-6}deg"><path d="M3 2 Q15 0 28 3 L27 37 Q15 40 2 37 Z" fill="#eeeae0" stroke="currentColor" stroke-width="1.1"/><text x="6" y="13" font-size="11">${rank===1?'A':rank}</text><path d="M15 16 C9 23 7 25 11 27 Q14 29 15 25 Q16 29 19 27 C23 25 21 23 15 16 M15 24 L13 31 L18 31 Z" fill="currentColor"/></svg>`).join('');
}
