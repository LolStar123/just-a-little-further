let sources = [];
let category = 'All';
const list = document.querySelector('#source-list');
const query = document.querySelector('#source-query');
const count = document.querySelector('#source-count');
const filters = [...document.querySelectorAll('[data-filter]')];
function el(tag, text, className) {
  const node = document.createElement(tag);
  if(text) node.textContent = text;
  if(className) node.className = className;
  return node;
}
function external(label, url, className) {
  const link=el('a',label,className);link.href=url;link.target='_blank';link.rel='noopener noreferrer';return link;
}
function card(source) {
  const item=el('details',null,'source-entry'+(source.status==='Unavailable'?' unavailable':''));
  item.id='source-'+source.id;
  const summary=el('summary');
  summary.append(el('span',source.category==='Unresolved'?'Unavailable':source.category,'source-type'));
  const heading=el('div');heading.append(el('h2',source.title),el('p',source.summary),el('div','@'+source.author,'source-byline'));
  const plus=el('span','+','source-plus');plus.setAttribute('aria-hidden','true');summary.append(heading,plus);item.append(summary);
  const body=el('div',null,'source-details');
  body.append(el('p',source.detail),el('h3','Replies & continuation'),el('p',source.replies));
  const assessment=el('div',null,'source-assessment');assessment.append(el('h3','What to keep in mind'),el('p',source.assessment));body.append(assessment);
  body.append(external('Open the original ↗',source.url,'source-original'));
  if(source.links.length){const links=el('ul',null,'source-links');source.links.forEach(link=>{const li=el('li');li.append(external(link.label+' ↗',link.url));links.append(li);});body.append(links);}
  item.append(body);return item;
}
function render() {
  const term=query.value.toLocaleLowerCase().trim();
  const matches=sources.filter(source=>(category==='All'||source.category===category)&&[source.title,source.author,source.summary,source.detail,source.replies,source.assessment].join(' ').toLocaleLowerCase().includes(term));
  list.replaceChildren(...matches.map(card));
  count.textContent=`${matches.length} ${matches.length===1?'source':'sources'}${category==='All'?'':' in '+category.toLocaleLowerCase()}`;
  document.querySelector('#empty-results').hidden=matches.length>0;
}
filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render();}));
query.addEventListener('input',render);
function galleryLink([name,url,note]){const link=external('',url,'gallery-link');const strong=el('strong',name);const arrow=el('span','↗');arrow.setAttribute('aria-hidden','true');strong.append(arrow);link.append(strong,el('p',note));return link;}
async function load(){
  try{const response=await fetch('sources.json');if(!response.ok)throw new Error('Source collection unavailable');sources=await response.json();render();}catch{count.textContent='The collection could not load. The downloadable notes above are still available.';}
  try{const response=await fetch('design-links.json');if(!response.ok)throw new Error('Design links unavailable');const data=await response.json();document.querySelector('#gallery-list').replaceChildren(...data.galleries.map(galleryLink));document.querySelector('#reference-list').replaceChildren(...data.references.map(galleryLink));}catch{document.querySelector('#gallery-list').textContent='The full design reference list is in the downloadable notes.';}
}
load();
