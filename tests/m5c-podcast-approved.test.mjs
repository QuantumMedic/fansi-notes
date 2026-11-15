import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapSchema } from '../src/lib/model.mjs';
import { standaloneSchema } from '../src/lib/classification.mjs';
const load=(path)=>JSON.parse(readFileSync(path,'utf8'));
const episodes=load('src/data/podcast.json');
const raw=load('src/data/podcast-classifications.json');
const mapping=load('src/data/podcast-work-map.json');
const index=load('docs/review/m5c/INPUT_GAPS.json');
const articles=new Map(index.articles.map(a=>[a.work_id,a]));
const byGuid=new Map(episodes.map(e=>[e.guid,e]));
const byClass=new Map(raw.map(r=>[r.guid,r]));

test('25集分類均已按作者委託核准，保留穩定GUID且有有效的系列及主次主題',()=>{
 assert.equal(raw.length,25);
 assert.equal(byGuid.size,25);
 assert.equal(byClass.size,25);
 for(const r of raw){
  assert.ok(byGuid.has(r.guid));
  standaloneSchema.parse(r);
  assert.equal(r.status,'confirmed');
  assert.equal(r.reviewed_by,'author-delegated-editorial-review');
  assert.ok(r.reviewed_at);
  assert.ok(r.topics.length>=1 && r.topics.length<=2);
 }
});
test('16集有正式文章身分；其他9集保持Podcast-only且不創造虛構文章',()=>{
 mapSchema.parse(mapping);
 assert.equal(mapping.length,16);
 assert.equal(new Set(mapping.map(x=>x.guid)).size,16);
 assert.equal(new Set(mapping.map(x=>x.work_id)).size,16);
 for(const m of mapping){
  assert.ok(m.approved);
  assert.ok(byGuid.has(m.guid));
  const a=articles.get(m.work_id);
  assert.ok(a,m.work_id);
  const classified=byClass.get(m.guid);
  assert.equal(classified.work_id,m.work_id);
  assert.equal(classified.content_type,a.series);
  assert.deepEqual(classified.topics,a.topics);
 }
 const uniqueWorkIds=new Set([...articles.keys(),...raw.map(x=>x.work_id)]);
 assert.equal(articles.size,48);
 assert.equal(uniqueWorkIds.size,57);
 const linked=new Set(mapping.map(x=>x.guid));
 for(const c of raw.filter(x=>!linked.has(x.guid)))assert.equal(c.work_id,`podcast-${c.guid}`);
});
test('鬼滅單集僅一筆正式映射，兩篇已核准文章不會因去重而消失',()=>{
 const guid='05b69613-4296-4c7a-a205-5937639fb559';
 assert.deepEqual(mapping.filter(x=>x.guid===guid),[
  {guid,work_id:'vocus-68aaa583fd89780001779778',approved:true}
 ]);
 assert.ok(articles.has('vocus-68b1cc52fd89780001138a4f'));
 assert.ok(articles.has('vocus-68aaa583fd89780001779778'));
});
test('兩個以相同敘事核對的主題候選已經明確定義作品身分，不以節目首頁URL冒充單集證據',()=>{
 const refs=[
  {guid:'d3f5858d-d8f6-45a1-804a-57d28d3fdbbe',work_id:'vocus-69340950fd89780001659d42'},
  {guid:'1f20def0-6228-4434-80fb-a33ddaf06745',work_id:'vocus-69189f7afd89780001197b3c'}
 ];
 for(const r of refs)assert.ok(mapping.some(x=>x.guid===r.guid && x.work_id===r.work_id));
});
