import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {publicSeries,seriesName,matchesSeries} from '../src/lib/taxonomy.mjs';
import {prepareSearch,matchesPrepared} from '../src/lib/search.mjs';
const audit=JSON.parse(readFileSync('docs/review/m5b-first-articles/source-verification.json','utf8'));
const html=p=>readFileSync(`dist/${p}/index.html`,'utf8');
const text=s=>s.replace(/<[^>]*>/g,'').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n])).replace(/\s/g,'');
test('三篇授權來源的完整文字逐字雜湊一致，無圖片或自動播放器',()=>{
 assert.equal(audit.length,3);
 for(const a of audit){
  const page=html(`articles/${a.slug}`);const body=page.match(/<div class="imported-original">([\s\S]*?)<\/div>/)?.[1];assert.ok(body);
  assert.equal(createHash('sha256').update(text(body)).digest('hex'),a.normalized_text_sha256,a.slug);
  assert.equal((body.match(/class="image-position"/g)||[]).length,a.image_positions);
  assert.doesNotMatch(body,/<img|<iframe|<script|<picture/);assert.doesNotMatch(page,/data-spotify-id|封面插畫示意/);
  assert.ok(page.includes(a.source));assert.ok(page.includes(a.title));assert.ok(page.includes('凡思筆記'));
 }
 const real=readdirSync('src/content/articles').filter(f=>/synthetic: false/.test(readFileSync(`src/content/articles/${f}`,'utf8')));assert.equal(real.length,3);
 assert.deepEqual(JSON.parse(readFileSync('src/data/podcast-work-map.json','utf8')),[]);
});
test('兩個前台系列不重複，文章與故事收錄longform與special並保留舊路由',()=>{
 assert.deepEqual(publicSeries.map(s=>s.name),['凡思維','文章與故事']);
 assert.equal(seriesName('special'),'文章與故事');assert.ok(matchesSeries('longform','stories'));assert.ok(matchesSeries('special','stories'));assert.ok(!matchesSeries('fansiwei','stories'));
 const stories=html('series/stories');assert.match(stories,/articles\/antifragile-life\//);assert.match(stories,/articles\/talking-shadow\//);assert.doesNotMatch(stories,/articles\/willpower-and-habits\//);
 const fansiwei=html('series/fansiwei');assert.match(fansiwei,/articles\/willpower-and-habits\//);assert.doesNotMatch(fansiwei,/articles\/talking-shadow\//);
 for(const old of ['longform','special']) assert.match(html(`series/${old}`),/http-equiv="refresh"[^>]*series\/stories\//);
 for(const page of ['articles','podcast'])assert.equal((html(page).match(/<option value="stories">/g)||[]).length,1);
 assert.doesNotMatch(html('articles/talking-shadow'),/特別篇/);assert.doesNotMatch(html('works'),/會說話的影子/);
});
test('合併系列可與正文搜尋及主要／次要主題交叉篩選',()=>{
 const r=prepareSearch('影子的邊界',['creation','psychology'],'special');assert.ok(matchesPrepared(r,{contentType:'stories',q:'邊界',topic:'psychology'}));assert.ok(!matchesPrepared(r,{contentType:'fansiwei'}));assert.ok(!matchesPrepared(r,{topic:'science'}));
});
