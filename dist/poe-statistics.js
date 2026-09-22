import {distribution} from './match-statistics.js';
export const families=[
 {name:"Watcher's Eye",values:[4,18,110],weights:[.60,.33,.07],cost:9},
 {name:'Timeless jewels',values:[3,35,140],weights:[.70,.25,.05],cost:12},
 {name:'Sublime Vision',values:[8,80,230],weights:[.65,.30,.05],cost:24}
];
export function priceSamples(index,round=0){
 const family=families[index];let seed=(index+1)*4919+round*65537;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296;};
 return Array.from({length:240},()=>{const p=rand();let group=0,weight=family.weights[0];while(p>weight&&group<2)weight+=family.weights[++group];const price=Math.max(.1,family.values[group]*(.48+rand()*1.12));return{price,value:price-family.cost,selected:price>family.cost,won:price>family.cost,rare:group===2};});
}
export function priceSummary(records,count,domain,cost){
 const current=records.slice(0,count),d=distribution(current,count,domain);
 const gains=current.reduce((n,r)=>n+Math.max(0,r.value),0),losses=current.reduce((n,r)=>n+Math.max(0,-r.value),0);
 const top=[...current].sort((a,b)=>b.value-a.value).slice(0,Math.ceil(current.length*.05));
 return{...d,prices:current.map(r=>r.price),ev:d.mean===null?null:d.mean+cost,netEV:d.mean,sharpe:d.sd?d.mean/d.sd:null,profitFactor:losses?gains/losses:null,tailShare:gains?top.reduce((n,r)=>n+Math.max(0,r.value),0)/gains:null,gains,losses,cost};
}
