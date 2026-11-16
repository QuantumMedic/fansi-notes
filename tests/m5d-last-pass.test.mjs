import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildWorks } from '../src/lib/classification.mjs';
import { articleBrowseWorks, articleBrowseRank } from '../src/lib/article-browser.mjs';
import { prepareSearch, matchesPrepared } from '../src/lib/search.mjs';
import { compareBrowse } from '../src/lib/browse-sort.mjs';
import { articleImages } from '../src/lib/article-images.mjs';
import { collapseArticleImage } from '../src/lib/article-image-state.mjs';
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const marker = n => `<span hidden data-source-image-position="${n}"></span>`;
test('凡思維完整作品集合：純音訊、配對去重、confirmed限制及文章榜口徑', () => {
 const a={data:{work_id:'written',slug:'written',title:'書面植物',summary:'摘要',content_type:'fansiwei',topics:['psychology'],keywords:[],published_at:'2025-01-01'},body:'可搜尋正文'};
 const classification={content_type:'fansiwei',topics:['psychology'],keywords:[],status:'confirmed'};
 const e={guid:'audio',work_id:'audio',slug:'audio',title:'聲音植物',description:'草地介紹',published_at:'2026-01-01',classification};
 const works=buildWorks([a],[e,{...e,guid:'other',work_id:'other',classification:{...classification,content_type:'longform'}},{...e,guid:'proposed',work_id:'proposed',classification:{...classification,status:'proposed'}}]);
 const scope=articleBrowseWorks({articles:[a],works},'fansiwei');assert.equal(scope.length,2);
 assert.equal(scope.filter(w=>matchesPrepared(prepareSearch(`${w.title} ${w.summary}`,w.classification.topics,w.classification.content_type),{q:'草地',contentType:'fansiwei'})).length,1);
 assert.equal(articleBrowseWorks({articles:[a],works}).length,1);
 const audio=scope.find(w=>!w.article);assert.equal(articleBrowseRank(audio),null);
 const rows=scope.map(w=>({id:w.work_id,date:Date.parse(w.published_at),rank:w.article?1:articleBrowseRank(w)}));
 assert.equal([...rows].sort((a,b)=>compareBrowse(a,b,'popular'))[0].id,'written');
 assert.equal([...rows].sort((a,b)=>compareBrowse(a,b,'newest'))[0].id,'audio');
 assert.equal([...rows].sort((a,b)=>compareBrowse(a,b,'oldest'))[0].id,'written');
 const paired=buildWorks([a],[{...e,work_id:'written'}]);assert.equal(paired.length,1);assert.ok(paired[0].article);assert.equal(paired[0].episodes.length,1);
 assert.equal(articleBrowseWorks({articles:[a],works:paired},'fansiwei').length,1);
});
test('151筆逐位置處置可追溯，採用圖一對一原標記，重跑不重複', () => {
 const tri=json('docs/review/m5c/IMAGE_TRIAGE.json').images;
 const ledger=json('docs/review/m5c/IMAGE_ACTION_LEDGER_2026-11-15.json');
 const images=json('src/data/article-images.json');
 assert.equal(ledger.action_records.length,151);assert.equal(new Set(ledger.action_records.map(r=>`${r.work_id}:${r.source_position}`)).size,151);
 assert.equal(ledger.original_3_pending.reduce((n,r)=>n+r.positions,0),8);
 assert.equal(images.length,ledger.totals.integrated);assert.equal(ledger.totals.integrated+ledger.totals.omitted,151);
 for(const record of ledger.action_records){
  const original=tri.find(i=>i.work_id===record.work_id&&i.source_position===record.source_position);assert.ok(original);assert.equal(record.original_url,original.original_url);
  assert.ok(['integrated','omitted'].includes(record.result));assert.ok(record.reason);assert.ok(record.visual_observation);assert.equal(record.check.http_status,200);
  const image=images.find(i=>i.work_id===record.work_id&&i.source_position===record.source_position);assert.equal(!!image,record.result==='integrated');
  const raw=readFileSync(`src/content/articles/${record.work_id}.md`,'utf8');assert.equal(raw.split(marker(record.source_position)).length-1,1);
  if(image){assert.equal(image.original_url,original.original_url);assert.ok(image.alt);assert.ok(image.width>0&&image.height>0);const rendered=articleImages(raw,record.work_id);assert.equal(articleImages(rendered,record.work_id),rendered);assert.equal((rendered.match(/data-article-image /g)||[]).length,images.filter(i=>i.work_id===record.work_id).length);}
 }
 const sample=images[0],m=marker(sample.source_position);assert.equal((articleImages(m+m,sample.work_id).match(/data-article-image /g)||[]).length,1);
});
test('失效圖只收合圖像與圖說，必要來源及正文不變；省略圖無空框', () => {
 const image={work_id:'fixture',source_position:1,original_url:'https://example.com/test.jpg',alt:'合成圖',width:100,height:50};
 const wrapper=caption=>`正文前<div><div><picture>${marker(1)}</picture></div><div>${caption}</div></div>研究正文後`;
 const rendered=articleImages(wrapper('<p>圖說</p>'),'fixture',[image]);assert.match(rendered,/<figure data-image-visual>/);assert.match(rendered,/<figcaption><p>圖說<\/p><\/figcaption>/);assert.match(rendered,/正文前/);assert.match(rendered,/研究正文後/);
 const cited=articleImages(wrapper('<a href="https://example.com/paper">研究來源</a>'),'fixture',[image]);assert.match(cited,/<\/figure><div data-image-source><a/);
 const visual={hidden:false};const block={hidden:false,querySelector:()=>({})};const img={closest:s=>s==='[data-image-visual]'?visual:block};collapseArticleImage(img);assert.equal(visual.hidden,true);assert.equal(block.hidden,false);
 block.querySelector=()=>null;collapseArticleImage(img);assert.equal(block.hidden,true);
 const omitted=articleImages(wrapper('<p>圖說</p>'),'none',[]);assert.equal(omitted,`正文前${marker(1)}研究正文後`);
 const omittedSource=articleImages(wrapper('<a href="https://example.com/paper">研究來源</a>'),'none',[]);assert.ok(omittedSource.includes('href="https://example.com/paper"'));
});
