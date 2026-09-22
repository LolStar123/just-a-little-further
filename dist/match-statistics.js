// Illustrated matches, never presented as observed player data.
export const metrics=[
 {name:'soul lead',unit:'k souls',center:1,spread:4,threshold:2,condition:'lead > 2k',shape:0},
 {name:'kill participation',unit:'%',center:52,spread:14,threshold:60,condition:'participation > 60%',shape:1,bounds:[0,100]},
 {name:'objective damage',unit:'k damage',center:7,spread:3,threshold:8,condition:'damage > 8k',shape:2,bounds:[0,60]},
 {name:'lane pressure',unit:'k soul lead',center:.6,spread:1.8,threshold:1,condition:'lane lead > 1k',shape:3},
 {name:'deaths',unit:'deaths',center:5,spread:2,threshold:4,condition:'deaths < 4',shape:1,bounds:[0,20],below:true,integer:true},
 {name:'urn return time',unit:'seconds',center:36,spread:10,threshold:40,condition:'return < 40s',shape:2,bounds:[8,120],below:true}
];
export function matchesFor(index,round=0,regime=0,restless=false){
 const metric=metrics[index];let seed=(index+1)*8171+round*104729;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return(seed+.5)/4294967296;};
 const normal=()=>Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());
 return Array.from({length:400},()=>{
  let z=normal();if(metric.shape===1)z*=random()<.10?2.7:.72;
  if(metric.shape===2)z=(Math.exp(z*.58)-1)/.70;
  if(metric.shape===3)z=z*.58+(random()<.28?2:-.5);
  const shift=restless?(random()-.5)*1.2+(random()<.12?(random()-.5)*3:0):regime;
  const width=restless?.4+random()*1.3:1+regime*.48;
  let value=metric.center+metric.spread*(shift*2.3+z*width);
  if(metric.bounds)value=Math.max(metric.bounds[0],Math.min(metric.bounds[1],value));
  if(metric.integer)value=Math.round(value);
  const selected=metric.below?value<metric.threshold:value>metric.threshold;
  const advantage=(value-metric.threshold)/metric.spread*(metric.below?-1:1);
  return {value,selected,won:random()<.33+.40/(1+Math.exp(-advantage))};
 });
}
export function moments(values){
 const n=values.length;if(!n)return{n,mean:null,sd:null,skew:null,excess:null};
 const mean=values.reduce((a,b)=>a+b,0)/n;let m2=0,m3=0,m4=0;
 for(const x of values){const d=x-mean;m2+=d*d;m3+=d*d*d;m4+=d*d*d*d;}
 m2/=n;m3/=n;m4/=n;
 return{n,mean,sd:Math.sqrt(m2),skew:m2?m3/m2**1.5:null,excess:m2?m4/m2**2-3:null};
}
export function distribution(matches,count,domain){
 const samples=matches.slice(0,count),values=samples.map(x=>x.value),stats=moments(values);
 const binCount=119,binWidth=(domain[1]-domain[0])/binCount,bins=Array(binCount).fill(0);
 for(const v of values){const i=Math.max(0,Math.min(binCount-1,Math.floor((v-domain[0])/binWidth)));bins[i]++;}
 // Raw bin frequencies, joined directly. No kernel, spline or animated translation.
 const density=[[domain[0],0],...bins.map((n,i)=>[domain[0]+(i+.5)*binWidth,count?n/(count*binWidth):0]),[domain[1],0]];
 const selected=samples.filter(x=>x.selected),wins=selected.filter(x=>x.won).length;
 return{...stats,binWidth,bins,method:'frequency polygon',density,domain,selected:selected.length,wins,probability:selected.length?wins/selected.length:null};
}
