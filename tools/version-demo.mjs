import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const version=createHash('sha256').update(readFileSync('dist/demo.bundle.js')).digest('hex').slice(0,12);
for(const file of ['dist/index.html','dist/demo.html']){
 const html=readFileSync(file,'utf8').replace(/demo\.bundle\.js(?:\?v=[a-f0-9]+)?/g,'demo.bundle.js?v='+version);
 writeFileSync(file,html);
}
