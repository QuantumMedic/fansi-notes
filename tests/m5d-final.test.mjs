import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildWorks} from '../src/lib/classification.mjs';
import {articleImages} from '../src/lib/article-images.mjs';
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const baseline=json('docs/review/m5d/final/approved-baseline.json');
const mapping=json('src/data/podcast-work-map.json');
const episodes=json('src/data/podcast.json');
test('57篇完整來源保持位元一致，25配對有效且原16組未覆蓋，49Vocus與56IG',()=>{
 let ig=0,vocus=0;
 assert.equal(baseline.articles.length,57);
 for(const a of baseline.articles){
  const raw=readFileSync(a.file,'utf8');assert.equal(createHash('sha256').update(raw).digest('hex'),a.sha256,a.work_id);
  const front=raw.split('---',2)[1];const links=JSON.parse(front.match(/^platform_urls: (.+)$/m)[1]);
  ig+=!!links.instagram_url;vocus+=!!links.vocus_url;
  const page=readFileSync(`dist/articles/${a.slug}/index.html`,'utf8');assert.ok(page.includes('在其他平台閱讀'));
  for(const href of Object.values(links).flat())assert.ok(page.includes(href.replaceAll('&','&amp;')),href);
 }
 assert.equal(ig,56);assert.equal(vocus,49);
 assert.deepEqual(mapping,baseline.mapping);assert.equal(mapping.length,25);assert.equal(new Set(mapping.map(m=>m.guid)).size,25);
 for(const m of json('docs/review/m5d/final/original-16-mappings.json'))assert.deepEqual(mapping.find(n=>n.guid===m.guid),m);
 for(const m of mapping){assert.ok(baseline.articles.some(a=>a.work_id===m.work_id));const e=episodes.find(e=>e.guid===m.guid);assert.ok(e);const page=readFileSync(`dist/podcast/${e.slug}/index.html`,'utf8');for(const href of [e.spotify_episode_url,e.apple_episode_url])assert.ok(page.includes(href.replaceAll('&','&amp;')));}
 const works=buildWorks(baseline.articles.map(a=>({data:{...a,title:a.work_id,content_type:a.series,keywords:[],published_at:'2026-01-01'}})),episodes.map(e=>({...e,work_id:mapping.find(m=>m.guid===e.guid).work_id})));
 assert.equal(works.length,57);assert.equal(works.reduce((n,w)=>n+w.episodes.length,0),25);
});
test('56個正式IG順位、1個null；Podcast原始順位保持不變',()=>{
 const p=json('src/data/popularity.json');assert.deepEqual(p,baseline.popularity);
 assert.equal(p.articles.length,57);assert.equal(p.articles.filter(a=>a.rank!==null).length,56);
 const original=json('docs/review/m5d/inputs/podcast_order_PUBLIC.json');
 for(const row of original.rows)assert.equal(p.podcast.find(e=>e.id===row.guid).rank,row.popularity_rank);
});
test('11張圖片只回填指定原始位置，無圖不插圖，原始標記保留',()=>{
 const images=json('src/data/article-images.json');assert.equal(images.length,11);
 for(const i of images){const marker=`<span hidden data-source-image-position="${i.source_position}"></span>`;const rendered=articleImages(`before${marker}after`,i.work_id);assert.ok(rendered.startsWith('before'+marker));assert.ok(rendered.endsWith('after'));assert.ok(rendered.includes(i.original_url));assert.equal(articleImages(marker,'unknown'),marker);}
});
