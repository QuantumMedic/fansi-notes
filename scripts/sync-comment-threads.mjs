import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {parse} from 'yaml';
import {makeThreads} from '../src/lib/comment-threads.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
export function currentThreads(){
 const articles=readdirSync('src/content/articles').filter(f=>f.endsWith('.md')).map(f=>parse(readFileSync(`src/content/articles/${f}`,'utf8').split(/^---\s*$/m)[1]));
 return makeThreads(articles,json('src/data/podcast.json'),json('src/data/podcast-work-map.json'),json('src/data/publications.json'));
}
const result=JSON.stringify(currentThreads(),null,2)+'\n';
const path='services/comments/generated/threads.json';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==result)throw Error('Run npm run sync:threads before building Workers');}
else writeFileSync(path,result);
console.log('Public thread manifest verified; no private comment data.');
